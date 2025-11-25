package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"go.uber.org/fx"
)

// NewHTTPServer creates a new HTTP server
func NewHTTPServer(lc fx.Lifecycle, cfg *config.Config, router *gin.Engine) *http.Server {
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)

	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				slog.Info("Starting server",
					"address", addr,
					"env", cfg.Server.Env,
				)
				if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					slog.Error("Server failed to start", "error", err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			slog.Info("Shutting down server...")
			return srv.Shutdown(ctx)
		},
	})

	return srv
}

// Module exports the server module for fx
var Module = fx.Options(
	fx.Provide(NewHTTPServer),
)
