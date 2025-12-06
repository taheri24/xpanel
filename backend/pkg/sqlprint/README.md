# SQL Printer - Colored SQL for Terminal

A lightweight Go utility for printing colored SQL statements to the terminal with support for Windows, Linux, and macOS.

## Features

- ✅ **Syntax Highlighting**: Colors for keywords, strings, numbers, operators, comments, and functions
- ✅ **Cross-Platform**: Works on Windows (10+), Linux, and macOS
- ✅ **Windows Terminal Support**: Auto-detects and enables ANSI color support
- ✅ **Zero Dependencies**: Uses only Go standard library
- ✅ **Configurable**: Enable/disable colors, customize color schemes
- ✅ **Format Support**: Handles various SQL dialects (MySQL, PostgreSQL, SQL Server, SQLite)
- ✅ **Query Formatting**: Optional automatic query formatting with newlines

## Installation

This package is part of the xpanel backend. Import it directly:

```go
import "github.com/taheri24/xpanel/backend/pkg/sqlprint"
```

## Quick Start

### Basic Usage

```go
package main

import (
    "fmt"
    "github.com/taheri24/xpanel/backend/pkg/sqlprint"
)

func main() {
    sql := "SELECT * FROM users WHERE id = 1"
    fmt.Println(sqlprint.Colorize(sql))
}
```

### With Formatting

```go
sql := `
    SELECT u.id, u.name, COUNT(o.id) as order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.created_at > '2024-01-01'
    GROUP BY u.id, u.name
`

fmt.Println(sqlprint.ColorizeFormatted(sql))
```

## API Reference

### Main Functions

#### `Colorize(sql string) string`
Colorizes SQL with default configuration and style.

```go
result := sqlprint.Colorize("SELECT * FROM users")
fmt.Println(result)
```

#### `ColorizeWith(sql string, cfg Config) string`
Colorizes SQL with custom configuration.

```go
cfg := sqlprint.GetConfig()
cfg.Enabled = true
result := sqlprint.ColorizeWith(sql, cfg)
```

#### `ColorizeFormatted(sql string) string`
Colorizes SQL with automatic formatting (adds newlines before main keywords).

```go
formatted := sqlprint.ColorizeFormatted(sql)
fmt.Println(formatted)
```

### Configuration Functions

#### `EnableColorOutput(enabled bool)`
Globally enable or disable color output.

```go
sqlprint.EnableColorOutput(false)  // Disable colors
sqlprint.EnableColorOutput(true)   // Enable colors
```

#### `SetColorStyle(style Style)`
Customize the color scheme.

```go
customStyle := sqlprint.Style{
    Keyword:   "\033[38;5;33m",  // Blue
    String:    "\033[38;5;40m",  // Green
    Number:    "\033[38;5;208m", // Orange
    Operator:  "\033[38;5;226m", // Yellow
    Comment:   "\033[38;5;8m",   // Gray
    Function:  "\033[38;5;135m", // Magenta
    Reset:     "\033[0m",
}
sqlprint.SetColorStyle(customStyle)
```

#### `GetConfig() Config`
Get the current global configuration.

```go
cfg := sqlprint.GetConfig()
fmt.Printf("Colors enabled: %v\n", cfg.Enabled)
```

## Supported SQL Features

The utility properly colorizes:

### Keywords
SELECT, FROM, WHERE, JOIN, INNER, LEFT, RIGHT, FULL, OUTER, GROUP, HAVING, ORDER, UNION, WITH, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, and many more.

### Functions
- Aggregate: COUNT, SUM, AVG, MIN, MAX
- String: UPPER, LOWER, TRIM, SUBSTRING, CONCAT
- Numeric: ROUND, FLOOR, CEIL, ABS
- Date/Time: DATE, TIME, TIMESTAMP, EXTRACT, DATEADD
- Window: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, LAST_VALUE

### Parameters
- **SQL Server format**: `@parameter_name`
- **PostgreSQL/MySQL format**: `:parameter_name`
- Supports parameters with underscores and numbers

### Literals
- Strings: Single quotes `'`, double quotes `"`, backticks `` ` ``
- Numbers: Integers and decimals (123, 99.99)
- Comments: Single-line `--` and multi-line `/* */`

### Operators
All standard SQL operators: =, <, >, <=, >=, <>, !=, +, -, *, /, %, ||

## Color Support

The utility automatically detects color support based on:

1. **NO_COLOR** environment variable (disables colors if set)
2. **CI** environment variable (disables colors in CI/CD)
3. **Terminal Type**:
   - Windows Terminal (Windows 10+)
   - ConEmu
   - Standard TTY on Linux/macOS

### Forcing Color Output

```go
// Enable colors even in CI environment
sqlprint.EnableColorOutput(true)
```

### Disabling Colors

```go
// Disable colors for non-TTY output or log files
sqlprint.EnableColorOutput(false)
```

## Supported SQL Features

The utility properly colorizes:

### Keywords
SELECT, FROM, WHERE, JOIN, INNER, LEFT, RIGHT, FULL, OUTER, GROUP, HAVING, ORDER, UNION, WITH, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, and many more.

### Functions
- Aggregate: COUNT, SUM, AVG, MIN, MAX
- String: UPPER, LOWER, TRIM, SUBSTRING, CONCAT
- Numeric: ROUND, FLOOR, CEIL, ABS
- Date/Time: DATE, TIME, TIMESTAMP, EXTRACT, DATEADD
- Window: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, LAST_VALUE

### Literals
- Strings: Single quotes `'`, double quotes `"`, backticks `` ` ``
- Numbers: Integers and decimals (123, 99.99)
- Comments: Single-line `--` and multi-line `/* */`

### Operators
All standard SQL operators: =, <, >, <=, >=, <>, !=, +, -, *, /, %, ||

## Usage Examples

### Example 1: Basic SELECT

```go
sql := "SELECT id, name, email FROM users WHERE status = 'active'"
fmt.Println(sqlprint.Colorize(sql))
```

Output:
```
SELECT id, name, email FROM users WHERE status = 'active'
(with color highlighting on supported terminals)
```

### Example 1b: SELECT with Parameters

```go
sql := "SELECT id, name, email FROM users WHERE user_id = @user_id AND status = :status"
fmt.Println(sqlprint.Colorize(sql))
```

Output:
```
SELECT id, name, email FROM users WHERE user_id = @user_id AND status = :status
(with color highlighting - parameters shown in cyan)
```

### Example 2: Complex JOIN with Aggregation

```go
sql := `
    SELECT
        u.id,
        u.name,
        COUNT(o.id) as order_count,
        SUM(o.total) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.created_at > '2024-01-01'
    GROUP BY u.id, u.name
    HAVING COUNT(o.id) > 5
    ORDER BY total_spent DESC
`
fmt.Println(sqlprint.Colorize(sql))
```

### Example 3: CTE with Window Functions

```go
sql := `
    WITH user_stats AS (
        SELECT
            user_id,
            COUNT(*) as order_count,
            SUM(amount) as total
        FROM orders
        WHERE created_at >= '2024-01-01'
        GROUP BY user_id
    )
    SELECT
        u.id,
        u.name,
        us.order_count,
        ROW_NUMBER() OVER (ORDER BY us.total DESC) as rank
    FROM users u
    JOIN user_stats us ON u.id = us.user_id
`
fmt.Println(sqlprint.ColorizeFormatted(sql))
```

### Example 4: INSERT/UPDATE with Parameters

```go
sql := `INSERT INTO users (name, email, status)
VALUES (@name, @email, @status)`
fmt.Println(sqlprint.Colorize(sql))

updateSQL := `UPDATE users
SET status = @status, updated_at = NOW()
WHERE user_id = @user_id`
fmt.Println(sqlprint.Colorize(updateSQL))
```

Output shows:
- Keywords in blue (INSERT, INTO, UPDATE, SET, WHERE)
- Parameters in cyan (@name, @email, @status, @user_id)
- Strings in green ('users', column names)

### Example 5: Integration with Database Query Logging

```go
import (
    "log"
    "github.com/taheri24/xpanel/backend/pkg/sqlprint"
)

func logQuery(sql string, args ...interface{}) {
    log.Println("Executing query:")
    log.Println(sqlprint.Colorize(sql))
}
```

### Example 6: Disabling Colors for Log Files

```go
// When logging to file, disable colors
sqlprint.EnableColorOutput(false)
fmt.Fprintf(logFile, "%s\n", sqlprint.Colorize(sql))

// Re-enable for terminal output
sqlprint.EnableColorOutput(true)
```

## Testing

Run the comprehensive test suite:

```bash
cd backend
go test ./pkg/sqlprint -v
```

Test coverage includes:
- **3 Basic Tests**: SELECT, JOIN, Windows terminal support
- **5 Complex Tests**: Comments, strings, numbers, functions, CTEs, window functions

Run benchmarks:

```bash
go test ./pkg/sqlprint -bench=. -benchmem
```

## Compatibility

- **Go Version**: 1.24.7+
- **Platforms**: Windows 10+, Linux, macOS
- **SQL Dialects**: MySQL, PostgreSQL, SQL Server, SQLite

## Windows Support

The utility includes special handling for Windows terminals:

1. **Windows Terminal** - Full ANSI support
2. **ConEmu** - Full ANSI support
3. **Modern PowerShell** - VT100 emulation enabled
4. **Legacy cmd.exe** - Falls back to plain text

## Performance

The colorizer is optimized for high performance:

```go
// Handles 1000+ queries/second on typical hardware
for i := 0; i < 1000; i++ {
    result := sqlprint.Colorize(sql)
}
```

## Contributing

When adding features:
1. Add tests in `colorizer_test.go`
2. Update color definitions in `styles.go`
3. Update this README with examples

## License

Part of the xpanel project. See main LICENSE file.

## Troubleshooting

### Colors Not Showing

1. Check `NO_COLOR` environment variable is not set
2. Verify terminal supports ANSI colors
3. Try: `sqlprint.EnableColorOutput(true)`
4. Check Windows version (10+ required for native support)

### Wrong Colors in Some Terminals

- Some terminals override ANSI colors
- Create a custom color scheme with `SetColorStyle()`
- Try the terminal's preferences for color scheme

### Performance Issues

- Colors are computed on-demand, no caching
- For batch operations, consider disabling colors: `EnableColorOutput(false)`

## Examples

See `example_usage.go` for complete working examples.
