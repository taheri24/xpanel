package sqlprint

import (
	"regexp"
	"strings"
	"unicode"
)

// keywords is a set of SQL keywords
var keywords = map[string]bool{
	"SELECT": true, "FROM": true, "WHERE": true, "AND": true, "OR": true,
	"NOT": true, "IN": true, "EXISTS": true, "BETWEEN": true, "LIKE": true,
	"IS": true, "NULL": true, "TRUE": true, "FALSE": true, "AS": true,
	"JOIN": true, "INNER": true, "LEFT": true, "RIGHT": true, "FULL": true,
	"OUTER": true, "CROSS": true, "ON": true, "USING": true, "NATURAL": true,
	"ORDER": true, "BY": true, "GROUP": true, "HAVING": true, "LIMIT": true,
	"OFFSET": true, "DISTINCT": true, "ALL": true, "CASE": true, "WHEN": true,
	"THEN": true, "ELSE": true, "END": true, "WITH": true, "RECURSIVE": true,
	"INSERT": true, "INTO": true, "VALUES": true, "UPDATE": true, "SET": true,
	"DELETE": true, "CREATE": true, "TABLE": true, "DROP": true, "ALTER": true,
	"ADD": true, "COLUMN": true, "MODIFY": true, "CONSTRAINT": true, "PRIMARY": true,
	"KEY": true, "FOREIGN": true, "REFERENCES": true, "UNIQUE": true, "CHECK": true,
	"DEFAULT": true, "INDEX": true, "VIEW": true, "DATABASE": true, "SCHEMA": true,
	"GRANT": true, "REVOKE": true, "TO": true, "CASCADE": true,
	"RESTRICT": true, "TRUNCATE": true, "EXEC": true, "EXECUTE": true,
	"CAST": true, "UNION": true, "EXCEPT": true, "INTERSECT": true,
	"OVER": true, "PARTITION": true, "ROWS": true, "RANGE": true, "UNBOUNDED": true,
	"CURRENT": true, "PRECEDING": true, "FOLLOWING": true, "LATERAL": true,
	"WINDOW": true,
}

// functions is a set of common SQL functions
var functions = map[string]bool{
	"COUNT": true, "SUM": true, "AVG": true, "MIN": true, "MAX": true,
	"UPPER": true, "LOWER": true, "TRIM": true, "LTRIM": true, "RTRIM": true,
	"LENGTH": true, "SUBSTRING": true, "REPLACE": true, "CONCAT": true,
	"COALESCE": true, "NULLIF": true, "IFNULL": true, "CAST": true,
	"ROUND": true, "FLOOR": true, "CEIL": true, "ABS": true,
	"CURRENT_DATE": true, "CURRENT_TIME": true, "CURRENT_TIMESTAMP": true,
	"DATE": true, "TIME": true, "TIMESTAMP": true, "EXTRACT": true,
	"DATEADD": true, "DATEDIFF": true, "GETDATE": true,
	"ROW_NUMBER": true, "RANK": true, "DENSE_RANK": true, "LAG": true, "LEAD": true,
	"FIRST_VALUE": true, "LAST_VALUE": true, "NTH_VALUE": true,
}

// operators are SQL operators
var operators = map[string]bool{
	"=": true, "<": true, ">": true, "<=": true, ">=": true, "<>": true, "!=": true,
	"+": true, "-": true, "*": true, "/": true, "%": true, "||": true,
}

// Colorize colorizes a SQL string with default configuration
func Colorize(sql string) string {
	return ColorizeWith(sql, GetConfig())
}

// ColorizeWith colorizes a SQL string with custom configuration
func ColorizeWith(sql string, cfg Config) string {
	if !cfg.Enabled || sql == "" {
		return sql
	}

	return colorizeSQL(sql, cfg.Style)
}

// colorizeSQL performs the actual colorization
func colorizeSQL(sql string, style Style) string {
	var result strings.Builder
	runes := []rune(sql)
	i := 0

	for i < len(runes) {
		// Handle single-line comments (-- comment)
		if i < len(runes)-1 && runes[i] == '-' && runes[i+1] == '-' {
			start := i
			for i < len(runes) && runes[i] != '\n' {
				i++
			}
			result.WriteString(string(style.Comment))
			result.WriteString(string(runes[start:i]))
			result.WriteString(string(style.Reset))
			continue
		}

		// Handle multi-line comments (/* comment */)
		if i < len(runes)-1 && runes[i] == '/' && runes[i+1] == '*' {
			start := i
			i += 2
			for i < len(runes)-1 {
				if runes[i] == '*' && runes[i+1] == '/' {
					i += 2
					break
				}
				i++
			}
			result.WriteString(string(style.Comment))
			result.WriteString(string(runes[start:i]))
			result.WriteString(string(style.Reset))
			continue
		}

		// Handle single-quoted strings
		if runes[i] == '\'' {
			start := i
			i++
			for i < len(runes) {
				if runes[i] == '\'' {
					if i+1 < len(runes) && runes[i+1] == '\'' {
						// Escaped single quote
						i += 2
					} else {
						// End of string
						i++
						break
					}
				} else {
					i++
				}
			}
			result.WriteString(string(style.String))
			result.WriteString(string(runes[start:i]))
			result.WriteString(string(style.Reset))
			continue
		}

		// Handle double-quoted strings (identifiers in some SQL dialects)
		if runes[i] == '"' {
			start := i
			i++
			for i < len(runes) && runes[i] != '"' {
				i++
			}
			if i < len(runes) {
				i++
			}
			result.WriteString(string(style.String))
			result.WriteString(string(runes[start:i]))
			result.WriteString(string(style.Reset))
			continue
		}

		// Handle backtick-quoted strings (MySQL style)
		if runes[i] == '`' {
			start := i
			i++
			for i < len(runes) && runes[i] != '`' {
				i++
			}
			if i < len(runes) {
				i++
			}
			result.WriteString(string(style.String))
			result.WriteString(string(runes[start:i]))
			result.WriteString(string(style.Reset))
			continue
		}


	// Handle parameters (@param or :param format)
	if (runes[i] == '@' || runes[i] == ':') && i+1 < len(runes) && (unicode.IsLetter(runes[i+1]) || runes[i+1] == '_') {
		start := i
		i++ // Skip @ or :
		for i < len(runes) && (unicode.IsLetter(runes[i]) || unicode.IsDigit(runes[i]) || runes[i] == '_') {
			i++
		}
		result.WriteString(string(style.Parameter))
		result.WriteString(string(runes[start:i]))
		result.WriteString(string(style.Reset))
		continue
	}

		// Handle numbers
		if unicode.IsDigit(runes[i]) {
			start := i
			for i < len(runes) && (unicode.IsDigit(runes[i]) || runes[i] == '.') {
				i++
			}
			result.WriteString(string(style.Number))
			result.WriteString(string(runes[start:i]))
			result.WriteString(string(style.Reset))
			continue
		}

		// Handle identifiers and keywords
		if unicode.IsLetter(runes[i]) || runes[i] == '_' {
			start := i
			for i < len(runes) && (unicode.IsLetter(runes[i]) || unicode.IsDigit(runes[i]) || runes[i] == '_') {
				i++
			}
			word := string(runes[start:i])
			upperWord := strings.ToUpper(word)

			if keywords[upperWord] {
				result.WriteString(string(style.Keyword))
				result.WriteString(word)
				result.WriteString(string(style.Reset))
			} else if functions[upperWord] {
				result.WriteString(string(style.Function))
				result.WriteString(word)
				result.WriteString(string(style.Reset))
			} else {
				result.WriteString(word)
			}
			continue
		}

		// Handle multi-character operators
		if i < len(runes)-1 {
			twoCharOp := string(runes[i : i+2])
			if operators[twoCharOp] {
				result.WriteString(string(style.Operator))
				result.WriteString(twoCharOp)
				result.WriteString(string(style.Reset))
				i += 2
				continue
			}
		}

		// Handle single-character operators
		if operators[string(runes[i])] {
			result.WriteString(string(style.Operator))
			result.WriteRune(runes[i])
			result.WriteString(string(style.Reset))
			i++
			continue
		}

		// Default: just copy the character
		result.WriteRune(runes[i])
		i++
	}

	return result.String()
}

// ColorizeFormatted returns formatted and colorized SQL with nice indentation
func ColorizeFormatted(sql string) string {
	// Basic formatting: indent by SQL clause
	formatted := formatSQL(sql)
	return Colorize(formatted)
}

// formatSQL applies basic formatting to SQL
func formatSQL(sql string) string {
	// This is a simple formatter - adds newlines before major keywords
	mainKeywords := []string{"SELECT", "FROM", "WHERE", "GROUP", "ORDER", "HAVING", "LIMIT", "UNION", "EXCEPT", "INTERSECT"}

	result := sql
	for _, keyword := range mainKeywords {
		// Add newline before these keywords if not already present
		re := regexp.MustCompile(`(?i)\s+` + keyword + `\b`)
		result = re.ReplaceAllString(result, "\n"+keyword)
	}

	return result
}

// PlainSQL returns the SQL string without colors (for when colors are disabled)
func PlainSQL(sql string) string {
	return sql
}
