package dbutil

import (
	"database/sql"

	"go.uber.org/fx"
)

// RowService provides database row conversion utilities
type RowService struct{}

// NewRowService creates a new RowService
func NewRowService() *RowService {
	return &RowService{}
}

// ConvertRows converts *sql.Rows to []map[string]any
// This wrapper method provides injectable access to the RowsToMaps utility function
func (s *RowService) ConvertRows(rows *sql.Rows) ([]map[string]any, error) {
	return RowsToMaps(rows)
}

// Module exports the RowService as an FX module
var Module = fx.Options(
	fx.Provide(NewRowService),
)
