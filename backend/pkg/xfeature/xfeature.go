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
	Name                 string              `xml:"Name,attr" json:"name"`
	Version              string              `xml:"Version,attr" json:"version"`
	Backend              Backend             `xml:"Backend" json:"backend"`
	Frontend             Frontend            `xml:"Frontend" json:"frontend"`
	Mappings             []*Mapping `xml:"Mapping" json:"mappings"`
	Logger               *slog.Logger        `json:"-"`
}

// Backend contains all backend queries and actions
type Backend struct {
	Queries       []*Query       `xml:"Query" json:"queries"`
	ActionQueries []*ActionQuery `xml:"ActionQuery" json:"actionQueries"`
}

// Frontend contains all frontend forms and tables
type Frontend struct {
	Forms      []*Form      `xml:"Form" json:"forms"`
	DataTables []*DataTable `xml:"DataTable" json:"dataTables"`
}

// Query represents a SELECT operation
type Query struct {
	Id          string `xml:"Id,attr" json:"id"`
	Type        string `xml:"Type,attr" json:"type"`
	Description string `xml:"Description,attr" json:"description"`
	SQL         string `xml:",chardata" json:"sql"`
}

// ActionQuery represents an INSERT/UPDATE/DELETE operation
type ActionQuery struct {
	Id          string `xml:"Id,attr" json:"id"`
	Type        string `xml:"Type,attr" json:"type"`
	Description string `xml:"Description,attr" json:"description"`
	SQL         string `xml:",chardata" json:"sql"`
}

// DataTable represents a frontend data table
type DataTable struct {
	Id          string    `xml:"Id,attr" json:"id"`
	QueryRef    string    `xml:"QueryRef,attr" json:"queryRef"`
	Title       string    `xml:"Title,attr" json:"title"`
	Pagination  *bool     `xml:"Pagination,attr" json:"pagination"`
	PageSize    *int      `xml:"PageSize,attr" json:"pageSize"`
	Sortable    *bool     `xml:"Sortable,attr" json:"sortable"`
	Filterable  *bool     `xml:"Filterable,attr" json:"filterable"`
	Searchable  *bool     `xml:"Searchable,attr" json:"searchable"`
	FormActions string    `xml:"FormActions,attr" json:"formActions"`
	Columns     []*Column `xml:"Column" json:"columns"`
}

// Column represents a table column definition
type Column struct {
	Name       string `xml:"Name,attr" json:"name"`
	Label      string `xml:"Label,attr" json:"label"`
	Type       string `xml:"Type,attr" json:"type"`
	Sortable   *bool  `xml:"Sortable,attr" json:"sortable"`
	Filterable *bool  `xml:"Filterable,attr" json:"filterable"`
	Width      string `xml:"Width,attr" json:"width"`
	Format     string `xml:"Format,attr" json:"format"`
	Align      string `xml:"Align,attr" json:"align"`
}

// Form represents a frontend form
type Form struct {
	Id        string     `xml:"Id,attr" json:"id"`
	Mode      string     `xml:"Mode,attr" json:"mode"`
	Dialog    bool       `xml:"Dialog,attr" json:"dialog"`
	Title     string     `xml:"Title,attr" json:"title"`
	ActionRef string     `xml:"ActionRef,attr" json:"actionRef"`
	QueryRef  string     `xml:"QueryRef,attr" json:"queryRef"`
	Fields    []*Field   `xml:"Field" json:"fields"`
	Buttons   []*Button  `xml:"Button" json:"buttons"`
	Messages  []*Message `xml:"Message" json:"messages"`
}

// Field represents a form field
type Field struct {
	Name         string    `xml:"Name,attr" json:"name"`
	Label        string    `xml:"Label,attr" json:"label"`
	Type         string    `xml:"Type,attr" json:"type"`
	Required     *bool     `xml:"Required,attr" json:"required"`
	Readonly     *bool     `xml:"Readonly,attr" json:"readonly"`
	Placeholder  string    `xml:"Placeholder,attr" json:"placeholder"`
	Validation   string    `xml:"Validation,attr" json:"validation"`
	Format       string    `xml:"Format,attr" json:"format"`
	DefaultValue string    `xml:"DefaultValue,attr" json:"defaultValue"`
	Options      []*Option `xml:"Option" json:"options"`
}

// Option represents a select field option
type Option struct {
	Value string `xml:"Value,attr" json:"value"`
	Label string `xml:"Label,attr" json:"label"`
}

// Button represents a form button
type Button struct {
	Type      string `xml:"Type,attr" json:"type"`
	Label     string `xml:"Label,attr" json:"label"`
	Style     string `xml:"Style,attr" json:"style"`
	ActionRef string `xml:"ActionRef,attr" json:"actionRef"`
}

// Message represents a form message
type Message struct {
	Type    string `xml:"Type,attr" json:"type"`
	Content string `xml:",chardata" json:"content"`
}

// Mapping represents a parameter mapping configuration
type Mapping struct {
	Name      string     `xml:"Name,attr" json:"name"`
	DataType  string     `xml:"DataType,attr" json:"dataType"`
	Label     string     `xml:"Label,attr" json:"label"`
	ListQuery *ListQuery `xml:"ListQuery" json:"listQuery,omitempty"`
	Options   *Options   `xml:"Options" json:"options,omitempty"`
}

// ListQuery represents a query for populating parameter values
type ListQuery struct {
	Id          string `xml:"Id,attr" json:"id"`
	Type        string `xml:"Type,attr" json:"type"`
	Description string `xml:"Description,attr" json:"description"`
	SQL         string `xml:",chardata" json:"sql"`
}

// Options represents a collection of mapping options
type Options struct {
	Items []*MappingOption `xml:"Option" json:"items"`
}

// MappingOption represents an option for a mapping
type MappingOption struct {
	Label string `xml:"Label,attr" json:"label"`
	Value string `xml:"Value,attr" json:"value"`
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

// ExtractMappingsFromSQL extracts SQL parameters and returns them as Mapping objects
// It extracts parameter names from the SQL using regex and creates Mapping stubs
func ExtractMappingsFromSQL(sqlStr string) []*Mapping {
	paramNames := ExtractParameters(sqlStr)
	var mappings []*Mapping

	for _, paramName := range paramNames {
		mappings = append(mappings, &Mapping{
			Name: paramName,
		})
	}

	return mappings
}

// GetMappingsForSQL extracts SQL parameters and returns matching Mapping objects
// It looks for Mapping objects in the XFeature that correspond to SQL parameters
func (xf *XFeature) GetMappingsForSQL(sqlStr string) []*Mapping {
	paramNames := ExtractParameters(sqlStr)
	var mappings []*Mapping

	// Match extracted parameters with existing Mappings
	for _, paramName := range paramNames {
		for _, pm := range xf.Mappings {
			if pm.Name == paramName {
				mappings = append(mappings, pm)
				break
			}
		}
	}

	return mappings
}

// ExecuteListQueryToOptions executes a ListQuery and converts the results to MappingOptions
// It takes the first column from the query result and uses it as both Label and Value
func (xf *XFeature) ExecuteListQueryToOptions(ctx context.Context, db *sqlx.DB, listQuery *ListQuery) ([]*MappingOption, error) {
	if listQuery == nil || db == nil {
		return nil, fmt.Errorf("listQuery and db cannot be nil")
	}

	executor := NewQueryExecutor(xf.Logger)
	query := &Query{
		Id:          listQuery.Id,
		Type:        listQuery.Type,
		Description: listQuery.Description,
		SQL:         listQuery.SQL,
	}

	results, err := executor.Execute(ctx, db, query, make(map[string]interface{}))
	if err != nil {
		return nil, fmt.Errorf("failed to execute ListQuery %s: %w", listQuery.Id, err)
	}

	var options []*MappingOption
	for _, result := range results {
		// Get the first value from the result map
		var value string
		for _, v := range result {
			if v != nil {
				value = fmt.Sprintf("%v", v)
				break
			}
		}
		if value != "" {
			options = append(options, &MappingOption{
				Label: value,
				Value: value,
			})
		}
	}

	return options, nil
}

// ResolveMappings resolves all Mappings by executing ListQuery and converting to Options
// It iterates through all Mappings in the XFeature and executes any ListQuery to populate Options
func (xf *XFeature) ResolveMappings(ctx context.Context, db *sqlx.DB) []*Mapping {
	var mappings []*Mapping

	for _, pm := range xf.Mappings {
		// Create a copy to avoid modifying the original
		pmCopy := &Mapping{
			Name:      pm.Name,
			DataType:  pm.DataType,
			Label:     pm.Label,
			ListQuery: pm.ListQuery,
			Options:   pm.Options,
		}

		// If there's a ListQuery, execute it and convert to Options
		if pmCopy.ListQuery != nil && db != nil {
			options, err := xf.ExecuteListQueryToOptions(ctx, db, pmCopy.ListQuery)
			if err == nil && len(options) > 0 {
				pmCopy.Options = &Options{Items: options}
				pmCopy.ListQuery = nil // Clear ListQuery since we've resolved it to Options
			} else if err != nil {
				xf.Logger.Error("failed to execute ListQuery", "paramName", pmCopy.Name, "error", err)
			}
		}

		mappings = append(mappings, pmCopy)
	}

	return mappings
}
