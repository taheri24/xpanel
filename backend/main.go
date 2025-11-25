package main

import (
	"context"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/internal/database"
	"github.com/taheri24/xpanel/backend/internal/handlers"
	"github.com/taheri24/xpanel/backend/internal/middleware"
	"github.com/taheri24/xpanel/backend/internal/models"
	"github.com/taheri24/xpanel/backend/pkg/config"
	frontendpkg "github.com/taheri24/xpanel/backend"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		slog.Error("Failed to load configuration", "error", err)
		os.Exit(1)
	}

	// Set gin mode based on environment
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	db, err := database.New(&cfg.Database)
	if err != nil {
		slog.Error("Failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := models.NewUserRepository(db)

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(db)
	userHandler := handlers.NewUserHandler(userRepo)

	// Setup router
	router := setupRouter(healthHandler, userHandler)

	// Create server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		slog.Info("Starting server",
			"address", addr,
			"env", cfg.Server.Env,
		)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server failed to start", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}

	slog.Info("Server exited gracefully")
}

func setupRouter(healthHandler *handlers.HealthHandler, userHandler *handlers.UserHandler) *gin.Engine {
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Health check routes
	router.GET("/health", healthHandler.Health)
	router.GET("/ready", healthHandler.Ready)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		users := v1.Group("/users")
		{
			users.GET("", userHandler.GetAll)
			users.GET("/:id", userHandler.GetByID)
			users.POST("", userHandler.Create)
			users.PUT("/:id", userHandler.Update)
			users.DELETE("/:id", userHandler.Delete)
		}
	}

	// Serve embedded frontend static files
	setupStaticFiles(router)

	return router
}

// setupStaticFiles configures the router to serve embedded frontend files
func setupStaticFiles(router *gin.Engine) {
	// Get the frontend dist directory from the embedded filesystem
	distFS, err := fs.Sub(frontendpkg.FS, "frontend/dist")
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
