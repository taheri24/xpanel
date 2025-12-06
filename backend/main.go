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
	"fmt"
	"net/http"
	"os"

	_ "github.com/taheri24/xpanel/backend/docs"
	"github.com/taheri24/xpanel/backend/internal/database"
	"github.com/taheri24/xpanel/backend/internal/handlers"
	"github.com/taheri24/xpanel/backend/internal/models"
	"github.com/taheri24/xpanel/backend/internal/router"
	"github.com/taheri24/xpanel/backend/internal/server"
	"github.com/taheri24/xpanel/backend/pkg/cli"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"github.com/taheri24/xpanel/backend/pkg/dbutil"
	"go.uber.org/fx"
)

func main() {
	// Check if CLI command is provided
	if len(os.Args) > 1 && (os.Args[1] == "env" || os.Args[1] == "unzip" || os.Args[1] == "download") {
		// Handle CLI commands
		envPath := ".env"
		handler := cli.NewCommandHandler(envPath)
		if err := handler.Execute(os.Args); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
		return
	}

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
