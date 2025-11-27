package xfeature

import (
	"context"
	"database/sql"
	"encoding/xml"
	"fmt"
	"log/slog"
	"os"
	"regexp"
	"strings"

	"github.com/jmoiron/sqlx"
)

// XFeature represents the entire XML feature definition
type XFeature struct {
	Name                 string              `xml:"Name,attr"`
	Version              string              `xml:"Version,attr"`
	Backend              Backend             `xml:"Backend"`
	Frontend             Frontend            `xml:"Frontend"`
	ParameterMappings    []*ParameterMapping `xml:"ParameterMapping"`
	Logger               *slog.Logger
}

// Backend contains all backend queries and actions
type Backend struct {
	Queries      []*Query       `xml:"Query"`
	ActionQueries []*ActionQuery `xml:"ActionQuery"`
}

// Frontend contains all frontend forms and tables
type Frontend struct {
	Forms      []*Form      `xml:"Form"`
	DataTables []*DataTable `xml:"DataTable"`
}

// Query represents a SELECT operation
type Query struct {
	Id          string `xml:"Id,attr"`
	Type        string `xml:"Type,attr"`
	Description string `xml:"Description,attr"`
	SQL         string `xml:",chardata"`
}

// ActionQuery represents an INSERT/UPDATE/DELETE operation
type ActionQuery struct {
	Id          string `xml:"Id,attr"`
	Type        string `xml:"Type,attr"`
	Description string `xml:"Description,attr"`
	SQL         string `xml:",chardata"`
}

// DataTable represents a frontend data table
type DataTable struct {
	Id          string    `xml:"Id,attr"`
	QueryRef    string    `xml:"QueryRef,attr"`
	Title       string    `xml:"Title,attr"`
	Pagination  *bool     `xml:"Pagination,attr"`
	PageSize    *int      `xml:"PageSize,attr"`
	Sortable    *bool     `xml:"Sortable,attr"`
	Filterable  *bool     `xml:"Filterable,attr"`
	Searchable  *bool     `xml:"Searchable,attr"`
	FormActions string    `xml:"FormActions,attr"`
	Columns     []*Column `xml:"Column"`
}

// Column represents a table column definition
type Column struct {
	Name       string `xml:"Name,attr"`
	Label      string `xml:"Label,attr"`
	Type       string `xml:"Type,attr"`
	Sortable   *bool  `xml:"Sortable,attr"`
	Filterable *bool  `xml:"Filterable,attr"`
	Width      string `xml:"Width,attr"`
	Format     string `xml:"Format,attr"`
	Align      string `xml:"Align,attr"`
}

// Form represents a frontend form
type Form struct {
	Id        string     `xml:"Id,attr"`
	Mode      string     `xml:"Mode,attr"`
	Dialog    bool       `xml:"Dialog,attr"`
	Title     string     `xml:"Title,attr"`
	ActionRef string     `xml:"ActionRef,attr"`
	QueryRef  string     `xml:"QueryRef,attr"`
	Fields    []*Field   `xml:"Field"`
	Buttons   []*Button  `xml:"Button"`
	Messages  []*Message `xml:"Message"`
}

// Field represents a form field
type Field struct {
	Name         string    `xml:"Name,attr"`
	Label        string    `xml:"Label,attr"`
	Type         string    `xml:"Type,attr"`
	Required     *bool     `xml:"Required,attr"`
	Readonly     *bool     `xml:"Readonly,attr"`
	Placeholder  string    `xml:"Placeholder,attr"`
	Validation   string    `xml:"Validation,attr"`
	Format       string    `xml:"Format,attr"`
	DefaultValue string    `xml:"DefaultValue,attr"`
	Options      []*Option `xml:"Option"`
}

// Option represents a select field option
type Option struct {
	Value string `xml:"Value,attr"`
	Label string `xml:"Label,attr"`
}

// Button represents a form button
type Button struct {
	Type      string `xml:"Type,attr"`
	Label     string `xml:"Label,attr"`
	Style     string `xml:"Style,attr"`
	ActionRef string `xml:"ActionRef,attr"`
}

// Message represents a form message
type Message struct {
	Type    string `xml:"Type,attr"`
	Content string `xml:",chardata"`
}

// ParameterMapping represents a parameter mapping configuration
type ParameterMapping struct {
	Name      string     `xml:"Name,attr"`
	DataType  string     `xml:"DataType,attr"`
	Label     string     `xml:"Label,attr"`
	ListQuery *ListQuery `xml:"ListQuery"`
	Options   *Options   `xml:"Options"`
}

// ListQuery represents a query for populating parameter values
type ListQuery struct {
	Id          string `xml:"Id,attr"`
	Type        string `xml:"Type,attr"`
	Description string `xml:"Description,attr"`
	SQL         string `xml:",chardata"`
}

// Options represents a collection of parameter options
type Options struct {
	Items []*ParameterOption `xml:"Option"`
}

// ParameterOption represents an option for a parameter
type ParameterOption struct {
	Label string `xml:"Label,attr"`
	Value string `xml:"Value,attr"`
}

// NewXFeature creates a new XFeature instance
func NewXFeature(logger *slog.Logger) *XFeature {
	if logger == nil {
		logger = slog.Default()
	}
	return &XFeature{
		Logger: logger,
	}
}

// LoadFromFile loads and parses an XML file
func (xf *XFeature) LoadFromFile(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	if err := xml.Unmarshal(data, xf); err != nil {
		return fmt.Errorf("failed to unmarshal XML: %w", err)
	}

	// Normalize SQL content by trimming whitespace
	for _, query := range xf.Backend.Queries {
		query.SQL = strings.TrimSpace(query.SQL)
	}
	for _, action := range xf.Backend.ActionQueries {
		action.SQL = strings.TrimSpace(action.SQL)
	}

	xf.Logger.Debug("Loaded XFeature from file", "path", path, "name", xf.Name, "version", xf.Version)
	return nil
}

// GetQuery finds a query by ID
func (xf *XFeature) GetQuery(id string) (*Query, error) {
	for _, query := range xf.Backend.Queries {
		if query.Id == id {
			return query, nil
		}
	}
	return nil, fmt.Errorf("query not found: %s", id)
}

// GetActionQuery finds an action query by ID
func (xf *XFeature) GetActionQuery(id string) (*ActionQuery, error) {
	for _, action := range xf.Backend.ActionQueries {
		if action.Id == id {
			return action, nil
		}
	}
	return nil, fmt.Errorf("action query not found: %s", id)
}

// GetDataTable finds a data table by ID
func (xf *XFeature) GetDataTable(id string) (*DataTable, error) {
	for _, table := range xf.Frontend.DataTables {
		if table.Id == id {
			return table, nil
		}
	}
	return nil, fmt.Errorf("data table not found: %s", id)
}

// GetForm finds a form by ID
func (xf *XFeature) GetForm(id string) (*Form, error) {
	for _, form := range xf.Frontend.Forms {
		if form.Id == id {
			return form, nil
		}
	}
	return nil, fmt.Errorf("form not found: %s", id)
}

// GetAllQueries returns all queries
func (xf *XFeature) GetAllQueries() []*Query {
	return xf.Backend.Queries
}

// GetAllActionQueries returns all action queries
func (xf *XFeature) GetAllActionQueries() []*ActionQuery {
	return xf.Backend.ActionQueries
}

// GetAllDataTables returns all data tables
func (xf *XFeature) GetAllDataTables() []*DataTable {
	return xf.Frontend.DataTables
}

// GetAllForms returns all forms
func (xf *XFeature) GetAllForms() []*Form {
	return xf.Frontend.Forms
}

// ExecuteQuery executes a SELECT query
func (xf *XFeature) ExecuteQuery(
	ctx context.Context,
	db *sqlx.DB,
	queryId string,
	params map[string]interface{},
) ([]map[string]interface{}, error) {
	query, err := xf.GetQuery(queryId)
	if err != nil {
		return nil, err
	}

	executor := NewQueryExecutor(xf.Logger)
	return executor.Execute(ctx, db, query, params)
}

// ExecuteAction executes an INSERT/UPDATE/DELETE action
func (xf *XFeature) ExecuteAction(
	ctx context.Context,
	db *sqlx.DB,
	actionId string,
	params map[string]interface{},
) (sql.Result, error) {
	action, err := xf.GetActionQuery(actionId)
	if err != nil {
		return nil, err
	}

	executor := NewActionExecutor(xf.Logger)
	return executor.Execute(ctx, db, action, params)
}

// ExtractParameters extracts parameter names from SQL (e.g., :param_name)
func ExtractParameters(sqlStr string) []string {
	paramRegex := regexp.MustCompile(`:\w+`)
	matches := paramRegex.FindAllString(sqlStr, -1)

	// Remove duplicates
	paramMap := make(map[string]bool)
	var params []string
	for _, match := range matches {
		param := strings.TrimPrefix(match, ":")
		if !paramMap[param] {
			paramMap[param] = true
			params = append(params, param)
		}
	}

	return params
}

// ConvertParametersForDriver converts parameter placeholders for different SQL drivers
// SQLite uses ? or $1, SQL Server uses @param
func ConvertParametersForDriver(sqlStr string, driverName string) string {
	switch driverName {
	case "sqlserver":
		// Convert :param to @param
		paramRegex := regexp.MustCompile(`:\w+`)
		return paramRegex.ReplaceAllStringFunc(sqlStr, func(match string) string {
			return "@" + strings.TrimPrefix(match, ":")
		})
	case "sqlite3", "sqlite":
		// SQLite uses named parameters, so keep :param
		return sqlStr
	default:
		// Default: keep as is
		return sqlStr
	}
}

// ExtractParameterMappingsFromSQL extracts SQL parameters and returns them as ParameterMapping objects
// It extracts parameter names from the SQL using regex and creates ParameterMapping stubs
func ExtractParameterMappingsFromSQL(sqlStr string) []*ParameterMapping {
	paramNames := ExtractParameters(sqlStr)
	var mappings []*ParameterMapping

	for _, paramName := range paramNames {
		mappings = append(mappings, &ParameterMapping{
			Name: paramName,
		})
	}

	return mappings
}

// GetParameterMappingsForSQL extracts SQL parameters and returns matching ParameterMapping objects
// It looks for ParameterMapping objects in the XFeature that correspond to SQL parameters
func (xf *XFeature) GetParameterMappingsForSQL(sqlStr string) []*ParameterMapping {
	paramNames := ExtractParameters(sqlStr)
	var mappings []*ParameterMapping

	// Match extracted parameters with existing ParameterMappings
	for _, paramName := range paramNames {
		for _, pm := range xf.ParameterMappings {
			if pm.Name == paramName {
				mappings = append(mappings, pm)
				break
			}
		}
	}

	return mappings
}
