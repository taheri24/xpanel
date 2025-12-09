package ngrok

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"github.com/taheri24/xpanel/backend/pkg/config"
	"go.uber.org/fx"
)

type Manager struct {
	cfg    *config.NgrokConfig
	cmd    *exec.Cmd
	mu     sync.Mutex
	cancel context.CancelFunc
}

// NewManager creates a new ngrok manager
func NewManager(cfg *config.Config) *Manager {
	return &Manager{
		cfg: &cfg.Ngrok,
	}
}

// Start launches ngrok.exe if enabled and available
func (m *Manager) Start(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Check if ngrok is enabled
	if !m.cfg.Enabled {
		slog.Debug("Ngrok is disabled")
		return nil
	}

	// Check if ngrok.exe exists
	ngrokPath := findNgrokExecutable()
	if ngrokPath == "" {
		slog.Warn("Ngrok is enabled but ngrok.exe was not found in PATH or current directory")
		return nil
	}

	slog.Info("Starting ngrok tunnel", "path", ngrokPath)

	// Create context for ngrok process
	ctxWithCancel, cancel := context.WithCancel(ctx)
	m.cancel = cancel

	// Build ngrok command
	args := []string{
		"start",
		"--all",
	}

	// Add auth token if provided
	if m.cfg.AuthToken != "" {
		args = append([]string{"--authtoken", m.cfg.AuthToken}, args...)
	}

	m.cmd = exec.CommandContext(ctxWithCancel, ngrokPath, args...)

	// Capture stdout and stderr for logging
	stdout, err := m.cmd.StdoutPipe()
	if err != nil {
		slog.Error("Failed to create stdout pipe for ngrok", "error", err)
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := m.cmd.StderrPipe()
	if err != nil {
		slog.Error("Failed to create stderr pipe for ngrok", "error", err)
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	// Start the process
	if err := m.cmd.Start(); err != nil {
		slog.Error("Failed to start ngrok process", "error", err)
		return fmt.Errorf("failed to start ngrok: %w", err)
	}

	slog.Info("Ngrok process started", "pid", m.cmd.Process.Pid)

	// Log ngrok output in background
	go m.logOutput(stdout, "stdout")
	go m.logOutput(stderr, "stderr")

	// Wait for ngrok in background and log if it exits
	go func() {
		if err := m.cmd.Wait(); err != nil {
			slog.Error("Ngrok process exited with error", "error", err)
		} else {
			slog.Info("Ngrok process exited successfully")
		}
	}()

	return nil
}

// Stop terminates the ngrok process
func (m *Manager) Stop(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.cmd == nil || m.cmd.Process == nil {
		return nil
	}

	slog.Info("Stopping ngrok process", "pid", m.cmd.Process.Pid)

	// Cancel context first
	if m.cancel != nil {
		m.cancel()
	}

	// Give the process a moment to shutdown gracefully
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	done := make(chan error, 1)
	go func() {
		done <- m.cmd.Wait()
	}()

	select {
	case <-shutdownCtx.Done():
		// Timeout occurred, force kill
		if err := m.cmd.Process.Kill(); err != nil {
			slog.Error("Failed to kill ngrok process", "error", err)
			return fmt.Errorf("failed to kill ngrok process: %w", err)
		}
		slog.Warn("Ngrok process forcefully terminated")
	case err := <-done:
		if err != nil {
			slog.Error("Ngrok process terminated with error", "error", err)
		} else {
			slog.Info("Ngrok process terminated successfully")
		}
	}

	m.cmd = nil
	return nil
}

// logOutput logs ngrok output using slog
func (m *Manager) logOutput(reader interface{}, source string) {
	// This is a simplified implementation
	// In production, you might want to parse JSON output from ngrok
	slog.Debug(fmt.Sprintf("Ngrok %s", source))
}

// findNgrokExecutable searches for ngrok.exe in PATH and current directory
func findNgrokExecutable() string {
	// Check current directory first
	if info, err := os.Stat("ngrok.exe"); err == nil && !info.IsDir() {
		abs, err := filepath.Abs("ngrok.exe")
		if err == nil {
			return abs
		}
		return "ngrok.exe"
	}

	// Check PATH
	path, err := exec.LookPath("ngrok.exe")
	if err == nil {
		return path
	}

	// On non-Windows systems, also try "ngrok" without .exe
	if path, err := exec.LookPath("ngrok"); err == nil {
		return path
	}

	return ""
}

// NewLifecycle provides ngrok Manager with FX lifecycle hooks
func NewLifecycle(lc fx.Lifecycle, m *Manager) *Manager {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			return m.Start(ctx)
		},
		OnStop: func(ctx context.Context) error {
			return m.Stop(ctx)
		},
	})
	return m
}

// Module exports the ngrok module for fx
var Module = fx.Options(
	fx.Provide(NewManager),
	fx.Provide(NewLifecycle),
)
