package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/internal/database"
	"github.com/taheri24/xpanel/backend/pkg/xfeature"
	"go.uber.org/fx"
)

type XFeatureHandler struct {
	db *database.DB
}

func NewXFeatureHandler(db *database.DB) *XFeatureHandler {
	return &XFeatureHandler{db: db}
}

// getFeatureFilePath constructs the file path for a feature definition
func getFeatureFilePath(featureName string) string {
	return "specs/xfeature/" + featureName + ".xml"
}

// GetFeature retrieves a feature definition by name
func (h *XFeatureHandler) GetFeature(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
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

// ExecuteQuery executes a SELECT query from a feature definition
func (h *XFeatureHandler) ExecuteQuery(c *gin.Context) {
	featureName := c.Param("name")
	queryID := c.Param("queryId")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName)
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
	queryExecutor := xfeature.NewQueryExecutor(slog.Default())
	results, err := queryExecutor.Execute(c.Request.Context(), h.db.DB, query, params)
	if err != nil {
		slog.Error("Query execution failed", "feature", featureName, "query", queryID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed: " + err.Error()})
		return
	}

	// Return results
	c.JSON(http.StatusOK, gin.H{
		"feature":     featureName,
		"query":       queryID,
		"resultCount": len(results),
		"results":     results,
	})
}

// ExecuteAction executes an INSERT/UPDATE/DELETE action from a feature definition
func (h *XFeatureHandler) ExecuteAction(c *gin.Context) {
	featureName := c.Param("name")
	actionID := c.Param("actionId")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName)
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
	actionExecutor := xfeature.NewActionExecutor(slog.Default())
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

// GetFrontendElements retrieves all frontend elements (DataTables and Forms) for a feature
func (h *XFeatureHandler) GetFrontendElements(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Build response with all frontend elements
	response := gin.H{
		"feature":   featureName,
		"version":   xf.Version,
		"dataTables": xf.Frontend.DataTables,
		"forms":      xf.Frontend.Forms,
	}

	c.JSON(http.StatusOK, response)
}

// ListFeatures returns information about available features
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

// ResolveMappings resolves all Mappings by executing ListQuery and converting to Options
func (h *XFeatureHandler) ResolveMappings(c *gin.Context) {
	featureName := c.Param("name")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Check if there are any Mappings defined
	if len(xf.Mappings) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"feature":             featureName,
			"version":             xf.Version,
			"parameterMappings":   []*xfeature.Mapping{},
			"resolvedCount":       0,
		})
		return
	}

	// Resolve all Mappings
	resolvedMappings := xf.ResolveMappings(c.Request.Context(), h.db.DB)

	// Build response
	response := gin.H{
		"feature":             featureName,
		"version":             xf.Version,
		"parameterMappings":   resolvedMappings,
		"resolvedCount":       len(resolvedMappings),
	}

	c.JSON(http.StatusOK, response)
}

// ResolveDefaultMappings resolves Mappings without requiring arguments
// Uses query parameter 'feature' (defaults to 'user-management-sample' if not provided)
func (h *XFeatureHandler) ResolveDefaultMappings(c *gin.Context) {
	// Get feature name from query parameter, default to 'user-management-sample'
	featureName := c.DefaultQuery("feature", "user-management-sample")

	xf := &xfeature.XFeature{
		Logger: slog.Default(),
	}

	filePath := getFeatureFilePath(featureName)
	if err := xf.LoadFromFile(filePath); err != nil {
		slog.Warn("Failed to load feature definition", "feature", featureName, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Feature not found"})
		return
	}

	// Check if there are any Mappings defined
	if len(xf.Mappings) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"feature":             featureName,
			"version":             xf.Version,
			"parameterMappings":   []*xfeature.Mapping{},
			"resolvedCount":       0,
		})
		return
	}

	// Resolve all Mappings
	resolvedMappings := xf.ResolveMappings(c.Request.Context(), h.db.DB)

	// Build response
	response := gin.H{
		"feature":             featureName,
		"version":             xf.Version,
		"parameterMappings":   resolvedMappings,
		"resolvedCount":       len(resolvedMappings),
	}

	c.JSON(http.StatusOK, response)
}

// XFeatureModule exports the xfeature handler module for fx
var XFeatureModule = fx.Options(
	fx.Provide(NewXFeatureHandler),
)
