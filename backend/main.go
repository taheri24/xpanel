package main

import (
	"net/http"

	"github.com/taheri24/xpanel/backend/internal/database"
	"github.com/taheri24/xpanel/backend/internal/handlers"
	"github.com/taheri24/xpanel/backend/internal/models"
	"github.com/taheri24/xpanel/backend/internal/router"
	"github.com/taheri24/xpanel/backend/internal/server"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"go.uber.org/fx"
)

func main() {
	// Set the embedded FS for the router
	router.FS = FS

	app := fx.New(
		// Provide configuration
		config.Module,

		// Provide database
		database.Module,

		// Provide repositories
		models.Module,

		// Provide handlers
		handlers.HealthModule,
		handlers.UserModule,

		// Provide router
		router.Module,

		// Provide HTTP server
		server.Module,

		// Invoke to ensure server starts
		fx.Invoke(func(*http.Server) {}),
	)

	app.Run()
}
