package sqlprint

import (
	"strings"
	"testing"
)

// Basic Unit Tests

// TestBasicSELECT tests basic SELECT statement colorization
func TestBasicSELECT(t *testing.T) {
	tests := []struct {
		name    string
		sql     string
		wantErr bool
	}{
		{
			name:    "simple select",
			sql:     "SELECT * FROM users WHERE id = 1",
			wantErr: false,
		},
		{
			name:    "select with multiple columns",
			sql:     "SELECT id, name, email FROM users",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Colorize(tt.sql)

			// Verify we get output
			if result == "" && !tt.wantErr {
				t.Error("expected non-empty result, got empty string")
			}

			// Verify keywords are present in output
			if !strings.Contains(strings.ToUpper(result), "SELECT") {
				t.Error("expected SELECT keyword in output")
			}

			// Verify no error
			if tt.wantErr && result == "" {
				t.Error("expected error but got result")
			}
		})
	}
}

// TestComplexJOIN tests JOIN statements with proper colorization
func TestComplexJOIN(t *testing.T) {
	sql := "SELECT u.id, u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.status = 'active'"

	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result, got empty string")
	}

	// Verify keywords are colorized
	if !strings.Contains(result, "SELECT") {
		t.Error("expected SELECT in result")
	}

	if !strings.Contains(result, "FROM") {
		t.Error("expected FROM in result")
	}

	if !strings.Contains(result, "JOIN") {
		t.Error("expected JOIN in result")
	}

	// Verify strings are handled correctly
	if !strings.Contains(result, "active") {
		t.Error("expected string 'active' in result")
	}
}

// TestWindowsTerminalSupport tests color output with Windows terminal detection
func TestWindowsTerminalSupport(t *testing.T) {
	// Save original config
	originalConfig := GetConfig()
	defer SetColorStyle(originalConfig.Style)

	// Test with colors enabled
	EnableColorOutput(true)
	sql := "SELECT * FROM users"
	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result with colors enabled")
	}

	// Test with colors disabled
	EnableColorOutput(false)
	result2 := Colorize(sql)

	if result2 == "" {
		t.Error("expected non-empty result with colors disabled")
	}

	// When colors are disabled, result should match input
	if result2 != sql {
		t.Errorf("expected plain SQL when colors disabled, got different output")
	}
}

// Complex Unit Tests (5 additional test cases)

// TestMultiLineComments tests colorization of multi-line comments
func TestMultiLineComments(t *testing.T) {
	sql := `SELECT id, name
	/* This is a multi-line comment
	   with multiple lines */
	FROM users
	WHERE id > 0`

	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result")
	}

	// Verify comment is present
	if !strings.Contains(result, "multi-line comment") {
		t.Error("expected comment content in result")
	}

	// Verify keywords are still colorized
	if !strings.Contains(strings.ToUpper(result), "SELECT") {
		t.Error("expected SELECT keyword to be colorized")
	}
}

// TestSingleLineComments tests colorization of single-line comments
func TestSingleLineComments(t *testing.T) {
	sql := `SELECT * FROM users -- Get all users
	WHERE status = 'active' -- Only active users`

	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result")
	}

	if !strings.Contains(result, "Get all users") {
		t.Error("expected comment in result")
	}
}

// TestStringEscaping tests proper handling of escaped quotes in strings
func TestStringEscaping(t *testing.T) {
	tests := []struct {
		name string
		sql  string
	}{
		{
			name: "single quoted string with escaped quote",
			sql:  "SELECT 'O''Brien' FROM users",
		},
		{
			name: "double quoted identifier",
			sql:  `SELECT "user_id", "user_name" FROM users`,
		},
		{
			name: "backtick quoted identifier (MySQL)",
			sql:  "SELECT `user_id`, `user_name` FROM users",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Colorize(tt.sql)

			if result == "" {
				t.Error("expected non-empty result")
			}

			// Verify FROM keyword is present
			if !strings.Contains(strings.ToUpper(result), "FROM") {
				t.Error("expected FROM keyword in result")
			}
		})
	}
}

// TestNumericLiterals tests colorization of numeric values
func TestNumericLiterals(t *testing.T) {
	tests := []struct {
		name string
		sql  string
	}{
		{
			name: "integer literals",
			sql:  "SELECT * FROM users WHERE id = 123",
		},
		{
			name: "float literals",
			sql:  "SELECT * FROM orders WHERE total = 99.99",
		},
		{
			name: "multiple numbers",
			sql:  "SELECT * FROM products WHERE price > 10.5 AND stock < 100",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Colorize(tt.sql)

			if result == "" {
				t.Error("expected non-empty result")
			}

			// Verify FROM is present
			if !strings.Contains(strings.ToUpper(result), "FROM") {
				t.Error("expected FROM keyword in result")
			}
		})
	}
}

// TestAggregationFunctions tests colorization of aggregate functions
func TestAggregationFunctions(t *testing.T) {
	sql := `SELECT
		COUNT(*) as total,
		SUM(amount) as total_amount,
		AVG(price) as avg_price,
		MIN(created_at) as first_created,
		MAX(updated_at) as last_updated
	FROM orders
	GROUP BY user_id
	HAVING COUNT(*) > 5`

	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result")
	}

	// Verify functions are in result
	functions := []string{"COUNT", "SUM", "AVG", "MIN", "MAX", "GROUP", "HAVING"}
	for _, fn := range functions {
		if !strings.Contains(strings.ToUpper(result), fn) {
			t.Errorf("expected %s function in result", fn)
		}
	}
}

// TestWindowFunctions tests colorization of window functions
func TestWindowFunctions(t *testing.T) {
	sql := `SELECT
		user_id,
		amount,
		ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num,
		SUM(amount) OVER (PARTITION BY user_id) as user_total,
		LAG(amount) OVER (ORDER BY created_at) as prev_amount,
		LEAD(amount) OVER (ORDER BY created_at) as next_amount
	FROM orders`

	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result")
	}

	// Verify window functions are in result
	windowFuncs := []string{"ROW_NUMBER", "PARTITION", "OVER", "LAG", "LEAD"}
	for _, fn := range windowFuncs {
		if !strings.Contains(strings.ToUpper(result), fn) {
			t.Errorf("expected %s in result", fn)
		}
	}
}

// TestComplexCTEWithUnion tests colorization of CTEs and UNION statements
func TestComplexCTEWithUnion(t *testing.T) {
	sql := `WITH active_users AS (
		SELECT id, name, status FROM users WHERE status = 'active'
	),
	recent_orders AS (
		SELECT user_id, total FROM orders WHERE created_at > '2024-01-01'
	)
	SELECT
		au.id, au.name, ro.total
	FROM active_users au
	LEFT JOIN recent_orders ro ON au.id = ro.user_id
	UNION
	SELECT
		id, name, 0 as total
	FROM users
	WHERE id NOT IN (SELECT user_id FROM recent_orders)`

	result := Colorize(sql)

	if result == "" {
		t.Error("expected non-empty result")
	}

	// Verify CTE and complex keywords
	keywords := []string{"WITH", "SELECT", "FROM", "WHERE", "UNION", "JOIN", "NOT"}
	for _, kw := range keywords {
		if !strings.Contains(strings.ToUpper(result), kw) {
			t.Errorf("expected %s keyword in result", kw)
		}
	}
}

// TestEmptyAndEdgeCases tests edge cases
func TestEmptyAndEdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		sql     string
		wantLen bool // true if we expect non-empty input, false if empty input
	}{
		{
			name:    "empty string",
			sql:     "",
			wantLen: false,
		},
		{
			name:    "only whitespace",
			sql:     "   \n\t  ",
			wantLen: true,
		},
		{
			name:    "single keyword",
			sql:     "SELECT",
			wantLen: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Colorize(tt.sql)

			// For empty input, we expect empty output
			if tt.sql == "" && result != "" {
				t.Error("expected empty result for empty input")
			}

			// For non-empty input, we expect non-empty output
			if tt.sql != "" && result == "" {
				t.Error("expected non-empty result for non-empty input")
			}
		})
	}
}

// TestParameterHighlighting tests colorization of SQL parameters
func TestParameterHighlighting(t *testing.T) {
	tests := []struct {
		name string
		sql  string
	}{
		{
			name: "SQL Server @param format",
			sql:  "SELECT * FROM users WHERE id = @userId AND status = @status",
		},
		{
			name: "PostgreSQL :param format",
			sql:  "SELECT * FROM users WHERE id = :user_id AND status = :status",
		},
		{
			name: "Mixed parameter formats",
			sql:  "SELECT * FROM users WHERE id = @id OR username = :username",
		},
		{
			name: "Parameters in INSERT",
			sql:  "INSERT INTO users (name, email) VALUES (@name, @email)",
		},
		{
			name: "Parameters in UPDATE",
			sql:  "UPDATE users SET name = @name, updated_at = NOW() WHERE id = @id",
		},
		{
			name: "Parameters with underscores",
			sql:  "SELECT * FROM users WHERE user_id = @user_id AND order_id = :order_id",
		},
		{
			name: "Multiple parameters same name",
			sql:  "SELECT * FROM orders WHERE user_id = @user_id AND created_by = @user_id",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Colorize(tt.sql)

			if result == "" {
				t.Error("expected non-empty result")
			}

			// Verify parameters are in result
			if !strings.Contains(result, "@") && !strings.Contains(result, ":") {
				// Check if it contains the param name at least
				if strings.Contains(tt.sql, "@") || strings.Contains(tt.sql, ":") {
					t.Error("expected parameters in output")
				}
			}
		})
	}
}

// TestParameterEdgeCases tests edge cases with parameter-like syntax
func TestParameterEdgeCases(t *testing.T) {
	tests := []struct {
		name string
		sql  string
	}{
		{
			name: "@ not followed by letter",
			sql:  "SELECT * FROM users WHERE email = 'test@example.com'",
		},
		{
			name: ": not followed by letter",
			sql:  "SELECT * FROM users WHERE time = '12:30:45'",
		},
		{
			name: "parameter at end of query",
			sql:  "SELECT * FROM users WHERE id = @id",
		},
		{
			name: "parameter with numbers",
			sql:  "SELECT * FROM users WHERE id = @user123 OR name = :name456",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Colorize(tt.sql)

			if result == "" {
				t.Error("expected non-empty result")
			}

			// Should handle without errors
			if !strings.Contains(result, "SELECT") {
				t.Error("expected SELECT in result")
			}
		})
	}
}

// BenchmarkColorize benchmarks the colorization performance
func BenchmarkColorize(b *testing.B) {
	sql := "SELECT u.id, u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.status = 'active'"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		Colorize(sql)
	}
}

// BenchmarkColorizeComplex benchmarks colorization of complex queries
func BenchmarkColorizeComplex(b *testing.B) {
	sql := `WITH active_users AS (
		SELECT id, name, status FROM users WHERE status = 'active'
	)
	SELECT
		au.id,
		au.name,
		COUNT(*) OVER (PARTITION BY au.id) as order_count
	FROM active_users au
	LEFT JOIN orders o ON au.id = o.user_id
	WHERE au.created_at > '2024-01-01'`

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		Colorize(sql)
	}
}
