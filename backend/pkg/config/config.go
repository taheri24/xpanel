package config

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/joho/godotenv"
	"go.uber.org/fx"
)

type Config struct {
	Server ServerConfig
	Database DatabaseConfig
	Feature FeatureConfig
	Ngrok   NgrokConfig
}

type ServerConfig struct {
	Port string
	Host string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	DSN      string
}

type FeatureConfig struct {
	XFeatureFileLocation  string
	MockDataSetLocation   string
	CaptureMockDataSet    bool
}

type NgrokConfig struct {
	Enabled bool
	AuthToken string
	Tunnel  string
}

func Load() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		slog.Warn("No .env file found, using environment variables")
	}

	cfg := &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "localhost"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "1433"),
			User:     getEnv("DB_USER", "sa"),
			Password: getEnv("DB_PASSWORD", ""),
			Database: getEnv("DB_NAME", "xpanel"),
			DSN:      getEnv("DATABASE_URL", ""),
		},
		Feature: FeatureConfig{
			XFeatureFileLocation: getEnv("XFEATURE_FILE_LOCATION", "specs/xfeature/"),
			MockDataSetLocation:  getEnv("MOCK_DATA_SET_LOCATION", "specs/mock/"),
			CaptureMockDataSet:   getBoolEnv("CAPTURE_MOCK_DATASET", false),
		},
		Ngrok: NgrokConfig{
			Enabled:   getBoolEnv("NGROK_ENABLED", false),
			AuthToken: getEnv("NGROK_AUTH_TOKEN", ""),
			Tunnel:    getEnv("NGROK_TUNNEL", "http://localhost"),
		},
	}

	slog.Info("Configuration loaded successfully",
		"env", cfg.Server.Env,
		"port", cfg.Server.Port,
	)

	return cfg, nil
}

func (c *DatabaseConfig) ConnectionString() string {
	if len(c.DSN) > 0 {
		return c.DSN
	}
	return fmt.Sprintf(
		"sqlserver://%s:%s@%s:%s?database=%s&encrypt=disable&trustServerCertificate=true",
		c.User,
		c.Password,
		c.Host,
		c.Port,
		c.Database,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value == "true" || value == "1" || value == "yes" || value == "True"
}

// Module exports the config module for fx
var Module = fx.Options(
	fx.Provide(Load),
)
