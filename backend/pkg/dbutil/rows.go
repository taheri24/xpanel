package dbutil

import (
	"database/sql"
	"time"
)

// rowsToMaps converts *sql.Rows -> []map[string]any
func RowsToMaps(rows *sql.Rows) ([]map[string]any, error) {
	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var result []map[string]any

	for rows.Next() {
		// Create a slice of pointers to empty interfaces to scan into
		rawValues := make([]any, len(cols))
		dest := make([]any, len(cols))
		for i := range rawValues {
			dest[i] = &rawValues[i]
		}

		if err := rows.Scan(dest...); err != nil {
			return nil, err
		}

		rowMap := make(map[string]any, len(cols))

		for i, colName := range cols {
			val := rawValues[i]

			switch v := val.(type) {
			case []byte:
				// Most drivers return TEXT/VARCHAR/etc as []byte
				rowMap[colName] = string(v)
			case time.Time:
				// Convert time to RFC3339 string (or whatever format you want)
				rowMap[colName] = v.Format(time.RFC3339)
			default:
				// int64, float64, bool, nil, etc. go as-is.
				rowMap[colName] = v
			}
		}

		result = append(result, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}
