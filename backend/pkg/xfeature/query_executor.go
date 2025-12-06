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
	"github.com/taheri24/xpanel/backend/pkg/dbutil"
	"github.com/taheri24/xpanel/backend/pkg/sqlprint"
)

// QueryExecutor handles execution of SELECT queries
type QueryExecutor struct {
	logger              *slog.Logger
	mockDataSetLocation string
	captureEnabled      bool
	LastMockDataSet     string
}

// NewQueryExecutor creates a new query executor
func NewQueryExecutor(logger *slog.Logger) *QueryExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	return &QueryExecutor{logger: logger, mockDataSetLocation: "specs/mock/"}
}

// NewQueryExecutorWithLocation creates a new query executor with a custom mock data set location
func NewQueryExecutorWithLocation(logger *slog.Logger, mockDataSetLocation string) *QueryExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	if mockDataSetLocation == "" {
		mockDataSetLocation = "specs/mock/"
	}
	return &QueryExecutor{logger: logger, mockDataSetLocation: mockDataSetLocation, captureEnabled: false}
}

// NewQueryExecutorWithConfig creates a new query executor with config options
func NewQueryExecutorWithConfig(logger *slog.Logger, mockDataSetLocation string, captureEnabled bool) *QueryExecutor {
	if logger == nil {
		logger = slog.Default()
	}
	if mockDataSetLocation == "" {
		mockDataSetLocation = "specs/mock/"
	}
	return &QueryExecutor{
		logger:              logger,
		mockDataSetLocation: mockDataSetLocation,
		captureEnabled:      captureEnabled,
	}
}

// Execute runs a SELECT query and returns results as slice of maps
func (qe *QueryExecutor) Execute(
	ctx context.Context,
	db *sqlx.DB,
	query *Query,
	params map[string]interface{},
) ([]map[string]interface{}, error) {
	startTime := time.Now()
	qe.LastMockDataSet = ""
	// Check if MockDataSet is specified and exists
	if query.MockDataSet != "" {
		if mockData, err := qe.loadMockDataSet(query.MockDataSet); err == nil {
			qe.logger.Debug("Mock data loaded successfully",
				"queryId", query.Id,
				"mockDataSet", query.MockDataSet,
				"rowCount", len(mockData),
				"duration_ms", time.Since(startTime).Milliseconds(),
			)
			return mockData, nil
		} else if os.IsExist(os.ErrNotExist) || !os.IsNotExist(err) {
			qe.logger.Warn("Mock data set error, falling back to database query",
				"queryId", query.Id,
				"mockDataSet", query.MockDataSet,
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
	sql, args := qe.buildArgs(sql, params, driverName)

	// Log colored SQL for debugging
	qe.logColoredSQL(fmt.Sprintf("%s/%s", query.Parent, query.Id), sql)

	// Execute query
	sqlRows, err := db.QueryContext(ctx, sql, args...)
	if err != nil {
		qe.logger.Error("Query execution failed",
			"queryId", query.Id,
			"error", err,
			"duration_ms", time.Since(startTime).Milliseconds(),
		)
		return nil, fmt.Errorf("failed to execute query %s: %w", query.Id, err)
	}
	defer sqlRows.Close()

	// Convert rows to maps using the utility function
	results, err := dbutil.RowsToMaps(sqlRows)
	if err != nil {
		qe.logger.Error("Failed to convert rows",
			"queryId", query.Id,
			"error", err,
			"duration_ms", time.Since(startTime).Milliseconds(),
		)
		return nil, fmt.Errorf("failed to convert rows: %w", err)
	}

	qe.logger.Debug("Query executed successfully",
		"queryId", query.Id,
		"rowCount", len(results),
		"duration_ms", time.Since(startTime).Milliseconds(),
		"params", params,
		"args", args,
	)

	// Capture mock dataset if enabled
	if qe.captureEnabled && len(results) > 0 {
		if err := qe.saveMockDataSet(query.Id, results); err != nil {
			qe.logger.Warn("Failed to capture mock dataset",
				"queryId", query.Id,
				"error", err,
			)
			// Continue execution even if capture fails, don't return error
		}
	}

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
func (qe *QueryExecutor) buildArgs(sql string, params map[string]interface{}, driverName string) (string, []interface{}) {
	var args []any
	switch driverName {
	case "sqlserver":
		// For SQL Server, extract @param names in order
		paramRegex := regexp.MustCompile(`@(\w+)`)
		matches := paramRegex.FindAllStringSubmatch(sql, -1)

		//seen := make(map[string]bool)
		for _, match := range matches {
			paramName := match[1]
			sql = strings.Replace(sql, match[0], fmt.Sprintf("'%s'", params[match[1]]), 1)
			if val, ok := params[paramName]; ok {
				args = append(args, val)
				//					seen[paramName] = true
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

	return sql, args
}

// loadMockDataSet loads mock data from a JSON file
func (qe *QueryExecutor) loadMockDataSet(filePath string) ([]map[string]interface{}, error) {
	// If the path doesn't contain path separators, use the configured location
	if !strings.Contains(filePath, "/") && !strings.Contains(filePath, "\\") {
		filePath = qe.mockDataSetLocation + filePath
	}
	qe.LastMockDataSet = filePath
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

// saveMockDataSet saves query results as mock data to a JSON file
func (qe *QueryExecutor) saveMockDataSet(queryId string, results []map[string]interface{}) error {
	// Ensure the mock data set location directory exists
	if err := os.MkdirAll(qe.mockDataSetLocation, 0755); err != nil {
		qe.logger.Error("Failed to create mock data set directory",
			"location", qe.mockDataSetLocation,
			"error", err,
		)
		return fmt.Errorf("failed to create directory %s: %w", qe.mockDataSetLocation, err)
	}

	// Generate filename: queryId_timestamp.json
	timestamp := time.Now().Format("20060102_150405")
	fileName := fmt.Sprintf("%s_%s.json", queryId, timestamp)
	filePath := qe.mockDataSetLocation + fileName

	// Marshal results to JSON with indentation for readability
	data, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		qe.logger.Error("Failed to marshal results to JSON",
			"queryId", queryId,
			"error", err,
		)
		return fmt.Errorf("failed to marshal results: %w", err)
	}

	// Write to file
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		qe.logger.Error("Failed to write mock data set file",
			"queryId", queryId,
			"filePath", filePath,
			"error", err,
		)
		return fmt.Errorf("failed to write file %s: %w", filePath, err)
	}

	qe.logger.Info("Mock data set captured successfully",
		"queryId", queryId,
		"filePath", filePath,
		"rowCount", len(results),
	)

	return nil
}

// logColoredSQL logs SQL with syntax highlighting using the sqlprint utility
func (qe *QueryExecutor) logColoredSQL(message string, sql string) {
	if sql == "" {
		return
	}

	// Get colored SQL - colors will be auto-detected based on terminal capabilities
	coloredSQL := sqlprint.Colorize(sql)

	fmt.Printf("\n\r=== %s (%s) ===\n\r%s\n\r", message, "SELECTING", coloredSQL)
}
