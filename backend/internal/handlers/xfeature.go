package handlers

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/internal/database"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"github.com/taheri24/xpanel/backend/pkg/xfeature"
	"go.uber.org/fx"
)

type XFeatureHandler struct {
	db  *database.DB
	cfg *config.Config
}

func NewXFeatureHandler(db *database.DB, cfg *config.Config) *XFeatureHandler {
	return &XFeatureHandler{db: db, cfg: cfg}
}

// getFeatureFilePath constructs the file path for a feature definition
func getFeatureFilePath(featureName, fileLocation string) string {
	return fileLocation + featureName + ".xml"
}

// @Summary Get feature metadata
// @Description Retrieve metadata for a specific feature including backend and frontend structure
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Success 200 {object} map[string]interface{} "Feature metadata"
// @Failure 404 {object} map[string]interface{} "Feature not found"
// @Router /api/v1/xfeatures/{name} [get]
func (h *XFeatureHandler) GetFeature(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found", "filePath": filePath})
		return
	}

	// Return feature metadata (structure only, not data)
	response := gin.H{
		"name":    xf.Name,
		"version": xf.Version,
		"backend": gin.H{
			"queries": len(xf.Backend.Queries),
			"actions": len(xf.Backend.ActionQueries),
		},
		"frontend": gin.H{
			"forms":      len(xf.Frontend.Forms),
			"dataTables": len(xf.Frontend.DataTables),
		},
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Get feature checksum
// @Description Calculate the MD5 checksum of a feature's XML definition file
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Success 200 {object} map[string]interface{} "Feature checksum"
// @Failure 404 {object} map[string]interface{} "Feature file not found"
// @Failure 500 {object} map[string]interface{} "Checksum calculation failed"
// @Router /api/v1/xfeatures/{name}/checksum [get]
func (h *XFeatureHandler) GetFeatureChecksum(c *gin.Context) {
	featureName := c.Param("name")
	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)

	file, err := os.Open(filePath)
	if err != nil {
		slog.Warn("Failed to open feature file for checksum", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature file not found"})
		return
	}
	defer file.Close()

	hasher := md5.New()
	if _, err := io.Copy(hasher, file); err != nil {
		slog.Error("Failed to calculate feature checksum", "feature", featureName, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate checksum"})
		return
	}

	checksum := hex.EncodeToString(hasher.Sum(nil))

	c.JSON(http.StatusOK, gin.H{
		"feature":   featureName,
		"checksum":  checksum,
		"algorithm": "md5",
	})
}

// @Summary Execute a feature query
// @Description Execute a SELECT query from a feature definition with parameters
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Param queryId path string true "Query ID"
// @Param params body map[string]interface{} false "Query parameters"
// @Success 200 {object} map[string]interface{} "Query results"
// @Failure 400 {object} map[string]interface{} "Invalid request body"
// @Failure 404 {object} map[string]interface{} "Feature or query not found"
// @Failure 500 {object} map[string]interface{} "Query execution failed"
// @Router /api/v1/xfeatures/{name}/queries/{queryId} [post]
func (h *XFeatureHandler) ExecuteQuery(c *gin.Context) {
	featureName := c.Param("name")
	queryID := c.Param("queryId")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Get the query definition
	query, err := xf.GetQuery(queryID)
	if err != nil {
		slog.Warn("Query not found", "feature", featureName, "query", queryID, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Query not found"})
		return
	}

	// Parse request body for parameters
	var params map[string]interface{}
	if err := c.ShouldBindJSON(&params); err != nil {
		// Allow empty body for queries without parameters
		if c.Request.ContentLength > 0 {
			slog.Warn("Invalid request body", "error", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}
		params = make(map[string]interface{})
	}

	// Execute the query
	queryExecutor := xfeature.NewQueryExecutorWithConfig(
		slog.Default(),
		h.cfg.Feature.MockDataSetLocation,
		h.cfg.Feature.CaptureMockDataSet,
	)
	results, err := queryExecutor.Execute(c.Request.Context(), h.db.DB, query, params)
	if err != nil {
		slog.Error("Query execution failed", "feature", featureName, "query", queryID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed: " + err.Error()})
		return
	}

	// Build gridColDefs from Mappings + DataTable + actual results
	// Step 1: Get actual column names from query results
	var resultColumns map[string]bool = make(map[string]bool)
	var resultColumnOrder []string
	if len(results) > 0 {
		// Get keys from first result (results are []map[string]interface{})
		// Note: We iterate over the map to maintain a column order list
		for key := range results[0] {
			if !resultColumns[key] {
				resultColumns[key] = true
				resultColumnOrder = append(resultColumnOrder, key)
			}
		}
	}

	// Step 2: Build lookup maps from Mappings and DataTable
	mappingsByName := make(map[string]*xfeature.Mapping)
	for _, mapping := range xf.Mappings {
		mappingsByName[mapping.Name] = mapping
	}

	var dataTableColumns []*xfeature.Column
	dataTableColsByName := make(map[string]*xfeature.Column)
	for _, dt := range xf.Frontend.DataTables {
		if dt.QueryRef == queryID {
			dataTableColumns = dt.Columns
			break
		}
	}
	for _, col := range dataTableColumns {
		dataTableColsByName[col.Name] = col
	}

	// Step 3: Build final column list - DataTable order first, then unmatched results
	var gridColDefs []interface{} = []interface{}{}
	processedCols := make(map[string]bool)

	// First, process columns in DataTable order (if defined)
	for _, dtCol := range dataTableColumns {
		if resultColumns[dtCol.Name] {
			colDef := gin.H{
				"field":      dtCol.Name,
				"headerName": dtCol.Label,
				"width":      parseWidth(dtCol.Width),
			}
			if dtCol.Sortable != nil {
				colDef["sortable"] = *dtCol.Sortable
			} else {
				colDef["sortable"] = true
			}
			if dtCol.Align != "" {
				colDef["align"] = dtCol.Align
				colDef["headerAlign"] = dtCol.Align
			}
			if dtCol.Type != "" {
				colDef["type"] = mapColumnType(dtCol.Type)
			}
			gridColDefs = append(gridColDefs, colDef)
			processedCols[dtCol.Name] = true
		}
	}

	// If no DataTable defined, use Mappings order for defined columns
	if len(dataTableColumns) == 0 {
		for _, mapping := range xf.Mappings {
			if resultColumns[mapping.Name] {
				colDef := gin.H{
					"field":      mapping.Name,
					"headerName": mapping.Label,
					"width":      150,
					"sortable":   true,
				}
				gridColDefs = append(gridColDefs, colDef)
				processedCols[mapping.Name] = true
			}
		}
	}

	// Step 4: Add any remaining columns from results as plain string columns
	for _, colName := range resultColumnOrder {
		if !processedCols[colName] {
			colDef := gin.H{
				"field":      colName,
				"headerName": colName,
				"width":      150,
				"sortable":   true,
				"type":       "string",
			}
			// Check if there's a Mapping for this column (for label)
			if mapping, exists := mappingsByName[colName]; exists {
				colDef["headerName"] = mapping.Label
			}
			gridColDefs = append(gridColDefs, colDef)
			processedCols[colName] = true
		}
	}

	// Return results
	c.JSON(http.StatusOK, gin.H{
		"feature":     featureName,
		"query":       queryID,
		"resultCount": len(results),
		"results":     results,
		"mockDataSet": queryExecutor.LastMockDataSet,
		"gridColDefs": gridColDefs,
	})
}

// @Summary Execute a feature action
// @Description Execute an INSERT/UPDATE/DELETE action from a feature definition
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Param actionId path string true "Action ID"
// @Param params body map[string]interface{} true "Action parameters"
// @Success 200 {object} map[string]interface{} "Action execution result"
// @Failure 400 {object} map[string]interface{} "Invalid request body"
// @Failure 404 {object} map[string]interface{} "Feature or action not found"
// @Failure 500 {object} map[string]interface{} "Action execution failed"
// @Router /api/v1/xfeatures/{name}/actions/{actionId} [post]
func (h *XFeatureHandler) ExecuteAction(c *gin.Context) {
	featureName := c.Param("name")
	actionID := c.Param("actionId")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Get the action definition
	action, err := xf.GetActionQuery(actionID)
	if err != nil {
		slog.Warn("Action not found", "feature", featureName, "action", actionID, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Action not found"})
		return
	}

	// Parse request body for parameters
	var params map[string]interface{}
	if err := c.ShouldBindJSON(&params); err != nil {
		slog.Warn("Invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Execute the action
	actionExecutor := xfeature.NewActionExecutorWithLocation(slog.Default(), h.cfg.Feature.MockDataSetLocation)
	result, err := actionExecutor.Execute(c.Request.Context(), h.db.DB, action, params)
	if err != nil {
		slog.Error("Action execution failed", "feature", featureName, "action", actionID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Action execution failed: " + err.Error()})
		return
	}

	// Get result details
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		rowsAffected = -1
	}

	lastInsertID, err := result.LastInsertId()
	if err != nil {
		lastInsertID = -1
	}

	c.JSON(http.StatusOK, gin.H{
		"feature":      featureName,
		"action":       actionID,
		"rowsAffected": rowsAffected,
		"lastInsertId": lastInsertID,
		"success":      true,
	})
}

// @Summary Get backend information
// @Description Retrieve all backend queries and actions with their parameters for a feature
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Success 200 {object} map[string]interface{} "Backend information"
// @Failure 404 {object} map[string]interface{} "Feature not found"
// @Router /api/v1/xfeatures/{name}/backend [get]
func (h *XFeatureHandler) GetBackendInfo(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Build response with detailed backend information
	response := gin.H{
		"feature": featureName,
		"version": xf.Version,
		"queries": xf.Backend.Queries,
		"actions": xf.Backend.ActionQueries,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Get frontend elements
// @Description Retrieve all frontend elements (DataTables and Forms) for a feature
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Success 200 {object} map[string]interface{} "Frontend elements"
// @Failure 404 {object} map[string]interface{} "Feature not found"
// @Router /api/v1/xfeatures/{name}/frontend [get]
func (h *XFeatureHandler) GetFrontendElements(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Build response with all frontend elements
	response := gin.H{
		"feature":    featureName,
		"version":    xf.Version,
		"dataTables": xf.Frontend.DataTables,
		"forms":      xf.Frontend.Forms,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary List available features
// @Description Get information about available features
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Success 200 {object} map[string]interface{} "Available features"
// @Router /api/v1/xfeatures [get]
func (h *XFeatureHandler) ListFeatures(c *gin.Context) {
	// This would typically scan the specs/xfeature directory
	// For now, return a placeholder response
	c.JSON(http.StatusOK, gin.H{
		"features": []string{
			"user-management-sample",
		},
		"message": "Feature definitions can be loaded from specs/xfeature/ directory",
	})
}

// @Summary Resolve feature mappings
// @Description Resolve all mappings by executing ListQuery and converting to options
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Param name path string true "Feature name"
// @Success 200 {object} map[string]interface{} "Resolved mappings"
// @Failure 404 {object} map[string]interface{} "Feature not found"
// @Router /api/v1/xfeatures/{name}/mappings [get]
func (h *XFeatureHandler) ResolveMappings(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName, h.cfg.Feature.XFeatureFileLocation)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Check if there are any Mappings defined
	if len(xf.Mappings) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"feature":       featureName,
			"version":       xf.Version,
			"mappings":      []*xfeature.Mapping{},
			"resolvedCount": 0,
		})
		return
	}

	// Resolve all Mappings
	resolvedMappings := xf.ResolveMappings(c.Request.Context(), h.db.DB)

	// Build response
	response := gin.H{
		"feature":       featureName,
		"version":       xf.Version,
		"mappings":      resolvedMappings,
		"resolvedCount": len(resolvedMappings),
	}

	c.JSON(http.StatusOK, response)
}

// parseWidth converts width string to integer, defaults to 150 if not valid
func parseWidth(width string) int {
	if width == "" {
		return 150
	}
	// Remove non-numeric characters (px, %, etc.)
	numStr := strings.TrimSpace(width)
	numStr = strings.TrimSuffix(numStr, "px")
	numStr = strings.TrimSuffix(numStr, "%")

	if val, err := strconv.Atoi(numStr); err == nil {
		return val
	}
	return 150
}

// mapColumnType converts XFeature column types to MUI GridColDef types
func mapColumnType(colType string) string {
	switch strings.ToLower(colType) {
	case "number", "currency", "percentage":
		return "number"
	case "date":
		return "date"
	case "datetime":
		return "dateTime"
	case "boolean":
		return "boolean"
	case "text", "string", "email", "phone", "url", "link", "badge", "image":
		return "string"
	default:
		return "string"
	}
}

// XFeatureModule exports the xfeature handler module for fx
var XFeatureModule = fx.Options(
	fx.Provide(NewXFeatureHandler),
)
