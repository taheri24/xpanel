package database

import (
	"context"
	"log/slog"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/taheri24/xpanel/backend/pkg/config"
)

type DB struct {
	*sqlx.DB
}

func New(cfg *config.DatabaseConfig) (*DB, error) {
	slog.Info("Connecting to database",
		"host", cfg.Host,
		"port", cfg.Port,
		"database", cfg.Database,
	)

	db, err := sqlx.Connect("sqlserver", cfg.ConnectionString())
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		return nil, err
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		slog.Error("Failed to ping database", "error", err)
		return nil, err
	}

	slog.Info("Database connection established successfully")

	return &DB{db}, nil
}

func (db *DB) Close() error {
	slog.Info("Closing database connection")
	return db.DB.Close()
}

func (db *DB) Health() error {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		slog.Error("Database health check failed", "error", err)
		return err
	}

	return nil
}
