// @title XPanel API
// @version 1.0
// @description XPanel is a dynamic feature-based API platform with user management and query/action execution capabilities
// @contact.name Support
// @license.name MIT
// @host localhost:8080
// @BasePath /
// @schemes http https
package main

import (
	"net/http"

	_ "github.com/taheri24/xpanel/backend/docs"
	"github.com/taheri24/xpanel/backend/internal/database"
	"github.com/taheri24/xpanel/backend/internal/handlers"
	"github.com/taheri24/xpanel/backend/internal/models"
	"github.com/taheri24/xpanel/backend/internal/router"
	"github.com/taheri24/xpanel/backend/internal/server"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"github.com/taheri24/xpanel/backend/pkg/dbutil"
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

		// Provide database utilities
		dbutil.Module,

		// Provide repositories
		models.Module,

		// Provide handlers
		handlers.HealthModule,
		handlers.ChecksumModule,
		handlers.UserModule,
		handlers.XFeatureModule,

		// Provide router
		router.Module,

		// Provide HTTP server
		server.Module,

		// Invoke to ensure server starts
		fx.Invoke(func(*http.Server) {}),
	)

	app.Run()
}
