package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/internal/database"
	"go.uber.org/fx"
)

type HealthHandler struct {
	db *database.DB
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// @Summary Health Check
// @Description Check the health status of the application and database connection
// @Tags health
// @Accept  json
// @Produce  json
// @Success 200 {object} map[string]interface{} "Application is healthy"
// @Failure 503 {object} map[string]interface{} "Database connection failed"
// @Router /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	if err := h.db.Health(); err != nil {
		slog.Error("Health check failed", "error", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  "Database connection failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
	})
}

// @Summary Readiness Check
// @Description Check if the application is ready to accept requests
// @Tags health
// @Accept  json
// @Produce  json
// @Success 200 {object} map[string]interface{} "Application is ready"
// @Router /ready [get]
func (h *HealthHandler) Ready(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ready",
	})
}

// HealthModule exports the health handler module for fx
var HealthModule = fx.Options(
	fx.Provide(NewHealthHandler),
)
