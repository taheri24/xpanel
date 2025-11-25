package router

import (
	"io/fs"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/internal/handlers"
	"github.com/taheri24/xpanel/backend/internal/middleware"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"go.uber.org/fx"
)

// RouterParams defines the dependencies for the router
type RouterParams struct {
	fx.In

	Config        *config.Config
	HealthHandler *handlers.HealthHandler
	UserHandler   *handlers.UserHandler
}

// NewRouter creates a new Gin router with all routes configured
func NewRouter(params RouterParams) *gin.Engine {
	// Set gin mode based on environment
	if params.Config.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Health check routes
	router.GET("/health", params.HealthHandler.Health)
	router.GET("/ready", params.HealthHandler.Ready)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		users := v1.Group("/users")
		{
			users.GET("", params.UserHandler.GetAll)
			users.GET("/:id", params.UserHandler.GetByID)
			users.POST("", params.UserHandler.Create)
			users.PUT("/:id", params.UserHandler.Update)
			users.DELETE("/:id", params.UserHandler.Delete)
		}
	}

	// Serve embedded frontend static files
	setupStaticFiles(router)

	return router
}

// setupStaticFiles configures the router to serve embedded frontend files
func setupStaticFiles(router *gin.Engine) {
	// Get the frontend dist directory from the embedded filesystem
	distFS, err := fs.Sub(FS, "frontend/dist")
	if err != nil {
		slog.Warn("Failed to access embedded frontend files", "error", err)
		return
	}

	// Create HTTP file system
	httpFS := http.FS(distFS)

	// SPA fallback - serve static files or index.html for all non-API routes
	router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Don't serve static files for API routes or health check routes
		if len(path) >= 4 && path[:4] == "/api" {
			c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
			return
		}
		if path == "/health" || path == "/ready" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Endpoint not found"})
			return
		}

		// Try to serve the requested file from embedded filesystem
		file, err := distFS.Open(path[1:]) // Remove leading slash
		if err == nil {
			defer file.Close()
			stat, err := file.Stat()
			if err == nil && !stat.IsDir() {
				// File exists and is not a directory - serve it
				http.FileServer(httpFS).ServeHTTP(c.Writer, c.Request)
				return
			}
			file.Close()
		}

		// File not found or is a directory - serve index.html for SPA routing
		indexHTML, err := distFS.Open("index.html")
		if err != nil {
			slog.Error("Failed to open index.html", "error", err)
			c.String(http.StatusInternalServerError, "Internal server error")
			return
		}
		defer indexHTML.Close()

		stat, err := indexHTML.Stat()
		if err != nil {
			slog.Error("Failed to stat index.html", "error", err)
			c.String(http.StatusInternalServerError, "Internal server error")
			return
		}

		c.DataFromReader(http.StatusOK, stat.Size(), "text/html; charset=utf-8", indexHTML, nil)
	})
}

// Module exports the router module for fx
var Module = fx.Options(
	fx.Provide(NewRouter),
)
