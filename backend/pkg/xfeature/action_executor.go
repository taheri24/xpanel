package xfeature

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// ActionExecutor handles execution of INSERT/UPDATE/DELETE actions
type ActionExecutor struct {
	logger           *slog.Logger
	mockFileLocation string
}

// NewActionExecutor creates a new action executor
func NewActionExecutor(logger *slog.Logger) *ActionExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	return &ActionExecutor{logger: logger, mockFileLocation: "specs/mock/"}
}

// NewActionExecutorWithLocation creates a new action executor with a custom mock file location
func NewActionExecutorWithLocation(logger *slog.Logger, mockFileLocation string) *ActionExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	if mockFileLocation == "" {
		mockFileLocation = "specs/mock/"
	}
	return &ActionExecutor{logger: logger, mockFileLocation: mockFileLocation}
}

// Execute runs an INSERT/UPDATE/DELETE action
func (ae *ActionExecutor) Execute(
	ctx context.Context,
	db *sqlx.DB,
	action *ActionQuery,
	params map[string]interface{},
) (sql.Result, error) {
	startTime := time.Now()

	// Check if MockFile is specified and exists
	if action.MockFile != "" {
		if mockResult, err := ae.loadMockFile(action.MockFile); err == nil {
			rowsAffected, _ := mockResult.RowsAffected()
			ae.logger.Debug("Mock action executed successfully",
				"actionId", action.Id,
				"mockFile", action.MockFile,
				"rowsAffected", rowsAffected,
				"duration_ms", time.Since(startTime).Milliseconds(),
			)
			return mockResult, nil
		} else if !os.IsNotExist(err) {
			ae.logger.Warn("Mock file error, falling back to database action",
				"actionId", action.Id,
				"mockFile", action.MockFile,
				"error", err,
			)
		}
	}

	// Extract expected parameters from SQL
	expectedParams := ExtractParameters(action.SQL)

	// Validate that all required parameters are provided
	if err := ae.validateParameters(expectedParams, params); err != nil {
		ae.logger.Error("Parameter validation failed", "actionId", action.Id, "error", err)
		return nil, err
	}

	// Convert parameters for the database driver
	sql := action.SQL
	driverName := db.DriverName()
	sql = ConvertParametersForDriver(sql, driverName)

	// Build args slice in the order of parameters used in SQL
	args := ae.buildArgs(sql, params, driverName)

	// Execute action
	result, err := db.ExecContext(ctx, sql, args...)
	if err != nil {
		ae.logger.Error("Action execution failed",
			"actionId", action.Id,
			"actionType", action.Type,
			"error", err,
			"duration_ms", time.Since(startTime).Milliseconds(),
		)
		return nil, fmt.Errorf("failed to execute action %s: %w", action.Id, err)
	}

	// Log execution details
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		ae.logger.Warn("Could not determine rows affected",
			"actionId", action.Id,
			"actionType", action.Type,
		)
		rowsAffected = -1
	}

	ae.logger.Debug("Action executed successfully",
		"actionId", action.Id,
		"actionType", action.Type,
		"rowsAffected", rowsAffected,
		"duration_ms", time.Since(startTime).Milliseconds(),
		"params", ae.sanitizeParams(params),
	)

	return result, nil
}

// validateParameters checks that all required parameters are provided
func (ae *ActionExecutor) validateParameters(required []string, provided map[string]interface{}) error {
	for _, param := range required {
		if _, ok := provided[param]; !ok {
			return fmt.Errorf("missing required parameter: %s", param)
		}
	}
	return nil
}

// buildArgs constructs the arguments slice for the action based on parameter order
func (ae *ActionExecutor) buildArgs(sql string, params map[string]interface{}, driverName string) []interface{} {
	var args []interface{}

	switch driverName {
	case "sqlserver":
		// For SQL Server, extract @param names in order
		paramRegex := regexp.MustCompile(`@(\w+)`)
		matches := paramRegex.FindAllStringSubmatch(sql, -1)

		seen := make(map[string]bool)
		for _, match := range matches {
			paramName := match[1]
			if !seen[paramName] {
				if val, ok := params[paramName]; ok {
					args = append(args, val)
					seen[paramName] = true
				}
			}
		}

	case "sqlite3", "sqlite":
		// For SQLite, extract :param names in order
		paramRegex := regexp.MustCompile(`:(\w+)`)
		matches := paramRegex.FindAllStringSubmatch(sql, -1)

		seen := make(map[string]bool)
		for _, match := range matches {
			paramName := match[1]
			if !seen[paramName] {
				if val, ok := params[paramName]; ok {
					args = append(args, val)
					seen[paramName] = true
				}
			}
		}

	default:
		// Generic approach: extract all named parameters
		paramRegex := regexp.MustCompile(`:\w+`)
		matches := paramRegex.FindAllString(sql, -1)

		seen := make(map[string]bool)
		for _, match := range matches {
			paramName := strings.TrimPrefix(match, ":")
			if !seen[paramName] {
				if val, ok := params[paramName]; ok {
					args = append(args, val)
					seen[paramName] = true
				}
			}
		}
	}

	return args
}

// sanitizeParams removes sensitive information from logs (e.g., passwords)
func (ae *ActionExecutor) sanitizeParams(params map[string]interface{}) map[string]interface{} {
	sensitiveKeys := []string{"password", "password_hash", "token", "secret", "api_key"}
	sanitized := make(map[string]interface{})

	for key, value := range params {
		keyLower := strings.ToLower(key)
		isSensitive := false
		for _, sensitiveKey := range sensitiveKeys {
			if strings.Contains(keyLower, sensitiveKey) {
				isSensitive = true
				break
			}
		}

		if isSensitive {
			sanitized[key] = "***REDACTED***"
		} else {
			sanitized[key] = value
		}
	}

	return sanitized
}

// MockResult implements sql.Result for mock action execution
type MockResult struct {
	rowsAffected int64
	lastInsertId int64
}

func (mr *MockResult) LastInsertId() (int64, error) {
	return mr.lastInsertId, nil
}

func (mr *MockResult) RowsAffected() (int64, error) {
	return mr.rowsAffected, nil
}

// MockActionResponse represents the structure of mock action response
type MockActionResponse struct {
	RowsAffected int64 `json:"rowsAffected"`
	LastInsertId int64 `json:"lastInsertId"`
}

// loadMockFile loads mock action response from a JSON file
func (ae *ActionExecutor) loadMockFile(filePath string) (*MockResult, error) {
	// If the path doesn't contain path separators, use the configured location
	if !strings.Contains(filePath, "/") && !strings.Contains(filePath, "\\") {
		filePath = ae.mockFileLocation + filePath
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read mock file %s: %w", filePath, err)
	}

	var mockResponse MockActionResponse
	if err := json.Unmarshal(data, &mockResponse); err != nil {
		return nil, fmt.Errorf("failed to parse mock file %s as JSON: %w", filePath, err)
	}

	return &MockResult{
		rowsAffected: mockResponse.RowsAffected,
		lastInsertId: mockResponse.LastInsertId,
	}, nil
}
