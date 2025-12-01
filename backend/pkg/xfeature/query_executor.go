package xfeature

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

// QueryExecutor handles execution of SELECT queries
type QueryExecutor struct {
	logger           *slog.Logger
	mockFileLocation string
}

// NewQueryExecutor creates a new query executor
func NewQueryExecutor(logger *slog.Logger) *QueryExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	return &QueryExecutor{logger: logger, mockFileLocation: "specs/mock/"}
}

// NewQueryExecutorWithLocation creates a new query executor with a custom mock file location
func NewQueryExecutorWithLocation(logger *slog.Logger, mockFileLocation string) *QueryExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	if mockFileLocation == "" {
		mockFileLocation = "specs/mock/"
	}
	return &QueryExecutor{logger: logger, mockFileLocation: mockFileLocation}
}

// Execute runs a SELECT query and returns results as slice of maps
func (qe *QueryExecutor) Execute(
	ctx context.Context,
	db *sqlx.DB,
	query *Query,
	params map[string]interface{},
) ([]map[string]interface{}, error) {
	startTime := time.Now()

	// Check if MockFile is specified and exists
	if query.MockFile != "" {
		if mockData, err := qe.loadMockFile(query.MockFile); err == nil {
			qe.logger.Debug("Mock data loaded successfully",
				"queryId", query.Id,
				"mockFile", query.MockFile,
				"rowCount", len(mockData),
				"duration_ms", time.Since(startTime).Milliseconds(),
			)
			return mockData, nil
		} else if os.IsExist(os.ErrNotExist) || !os.IsNotExist(err) {
			qe.logger.Warn("Mock file error, falling back to database query",
				"queryId", query.Id,
				"mockFile", query.MockFile,
				"error", err,
			)
		}
	}

	// Extract expected parameters from SQL
	expectedParams := ExtractParameters(query.SQL)

	// Validate that all required parameters are provided
	if err := qe.validateParameters(expectedParams, params); err != nil {
		qe.logger.Error("Parameter validation failed", "queryId", query.Id, "error", err)
		return nil, err
	}

	// Convert parameters for the database driver
	sql := query.SQL
	driverName := db.DriverName()
	sql = ConvertParametersForDriver(sql, driverName)

	// Build args slice in the order of parameters used in SQL
	args := qe.buildArgs(sql, params, driverName)

	// Execute query
	rows, err := db.QueryxContext(ctx, sql, args...)
	if err != nil {
		qe.logger.Error("Query execution failed",
			"queryId", query.Id,
			"error", err,
			"duration_ms", time.Since(startTime).Milliseconds(),
		)
		return nil, fmt.Errorf("failed to execute query %s: %w", query.Id, err)
	}
	defer rows.Close()

	// Scan rows into maps
	var results []map[string]interface{}
	for rows.Next() {
		rowMap := make(map[string]interface{})
		if err := rows.MapScan(rowMap); err != nil {
			qe.logger.Error("Failed to scan row",
				"queryId", query.Id,
				"error", err,
			)
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Convert []byte values to strings for JSON serialization
		for key, value := range rowMap {
			if b, ok := value.([]byte); ok {
				rowMap[key] = string(b)
			}
		}

		results = append(results, rowMap)
	}

	if err := rows.Err(); err != nil {
		qe.logger.Error("Error iterating rows",
			"queryId", query.Id,
			"error", err,
		)
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	qe.logger.Debug("Query executed successfully",
		"queryId", query.Id,
		"rowCount", len(results),
		"duration_ms", time.Since(startTime).Milliseconds(),
		"params", params,
	)

	return results, nil
}

// validateParameters checks that all required parameters are provided
func (qe *QueryExecutor) validateParameters(required []string, provided map[string]interface{}) error {
	for _, param := range required {
		if _, ok := provided[param]; !ok {
			return fmt.Errorf("missing required parameter: %s", param)
		}
	}
	return nil
}

// buildArgs constructs the arguments slice for the query based on parameter order
func (qe *QueryExecutor) buildArgs(sql string, params map[string]interface{}, driverName string) []interface{} {
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

// loadMockFile loads mock data from a JSON file
func (qe *QueryExecutor) loadMockFile(filePath string) ([]map[string]interface{}, error) {
	// If the path doesn't contain path separators, use the configured location
	if !strings.Contains(filePath, "/") && !strings.Contains(filePath, "\\") {
		filePath = qe.mockFileLocation + filePath
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read mock file %s: %w", filePath, err)
	}

	var mockData []map[string]interface{}
	if err := json.Unmarshal(data, &mockData); err != nil {
		return nil, fmt.Errorf("failed to parse mock file %s as JSON: %w", filePath, err)
	}

	return mockData, nil
}
