package sqlprint

import (
	"os"
	"runtime"
	"strings"
)

// ColorCode represents ANSI color codes
type ColorCode string

const (
	// ANSI Color Codes
	ColorKeyword   ColorCode = "\033[38;5;33m"   // Blue for SQL keywords
	ColorString    ColorCode = "\033[38;5;40m"   // Green for strings
	ColorNumber    ColorCode = "\033[38;5;208m"  // Orange for numbers
	ColorOperator  ColorCode = "\033[38;5;226m"  // Yellow for operators
	ColorComment   ColorCode = "\033[38;5;8m"    // Gray for comments
	ColorFunction  ColorCode = "\033[38;5;135m"  // Magenta for functions
	ColorParameter ColorCode = "\033[38;5;51m"   // Cyan for parameters (@param, :param)
	ColorReset     ColorCode = "\033[0m"         // Reset to default
)

// Style defines color configuration
type Style struct {
	Keyword   ColorCode
	String    ColorCode
	Number    ColorCode
	Operator  ColorCode
	Comment   ColorCode
	Function  ColorCode
	Parameter ColorCode
	Reset     ColorCode
}

// Config controls colorizer behavior
type Config struct {
	Enabled     bool
	UseVT100    bool
	WindowsMode bool
	Style       Style
}

var (
	globalConfig = Config{
		Enabled:     isColorSupported(),
		UseVT100:    true,
		WindowsMode: runtime.GOOS == "windows",
		Style: Style{
			Keyword:   ColorKeyword,
			String:    ColorString,
			Number:    ColorNumber,
			Operator:  ColorOperator,
			Comment:   ColorComment,
			Function:  ColorFunction,
			Parameter: ColorParameter,
			Reset:     ColorReset,
		},
	}
)

// isColorSupported detects if terminal supports colors
func isColorSupported() bool {
	// Check if NO_COLOR is set
	if os.Getenv("NO_COLOR") != "" {
		return false
	}

	// Check if CI environment
	if os.Getenv("CI") != "" {
		return false
	}

	// Windows detection and support
	if runtime.GOOS == "windows" {
		return supportsWindowsANSI()
	}

	// For Unix-like systems, check if stdout is a TTY
	return isattyFd(1) // stdout
}

// supportsWindowsANSI checks if Windows terminal supports ANSI codes
func supportsWindowsANSI() bool {
	// Check if running in Windows Terminal, ConEmu, or modern Windows PowerShell
	if os.Getenv("WT_SESSION") != "" {
		return true // Windows Terminal
	}
	if os.Getenv("ConEmuANSI") == "ON" {
		return true // ConEmu
	}

	// Try to enable VT100 emulation on Windows 10+
	// This is a best-effort approach
	return enableWindowsVT100()
}

// enableWindowsVT100 attempts to enable VT100 emulation on Windows
func enableWindowsVT100() bool {
	if runtime.GOOS != "windows" {
		return false
	}

	// On Windows 10+, we can try to enable VT100 emulation
	// For now, return true if we're on Windows 10+ (version check would be ideal)
	// This is a simplified approach
	osVersion := os.Getenv("OS")
	return strings.Contains(osVersion, "Windows_NT")
}

// isattyFd checks if a file descriptor is a TTY
// This is a simplified version - in production you'd use cgo or platform-specific code
func isattyFd(fd int) bool {
	// Simplified check - you could use github.com/mattn/go-isatty in production
	// For now, assume TTY if not in a CI environment
	if os.Getenv("CI") != "" || os.Getenv("GITHUB_ACTIONS") != "" {
		return false
	}
	return true
}

// EnableColorOutput sets global color output
func EnableColorOutput(enabled bool) {
	globalConfig.Enabled = enabled
}

// SetColorStyle sets custom color style
func SetColorStyle(style Style) {
	globalConfig.Style = style
}

// GetConfig returns current global config
func GetConfig() Config {
	return globalConfig
}
