package cli

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
)

// DownloadManager handles file download operations
type DownloadManager struct {
	downloadURL string
	target      string
}

// NewDownloadManager creates a new DownloadManager
func NewDownloadManager(downloadURL, target string) *DownloadManager {
	return &DownloadManager{
		downloadURL: downloadURL,
		target:      target,
	}
}

// Download downloads a file from the URL to the target location
func (dm *DownloadManager) Download() error {
	// Validate URL
	if dm.downloadURL == "" {
		return fmt.Errorf("download URL cannot be empty")
	}

	// Parse URL to extract filename if target is not provided
	target := dm.target
	if target == "" {
		parsedURL, err := url.Parse(dm.downloadURL)
		if err != nil {
			return fmt.Errorf("invalid URL: %w", err)
		}

		// Extract filename from URL path
		path := parsedURL.Path
		if path == "" || path == "/" {
			return fmt.Errorf("cannot extract filename from URL: %s", dm.downloadURL)
		}

		// Get the last component of the path
		target = filepath.Base(path)
		if target == "" || target == "." {
			return fmt.Errorf("cannot extract filename from URL: %s", dm.downloadURL)
		}
	}

	// Download the file
	resp, err := http.Get(dm.downloadURL)
	if err != nil {
		return fmt.Errorf("error downloading file: %w", err)
	}
	defer resp.Body.Close()

	// Check HTTP status code
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status code %d: %s", resp.StatusCode, resp.Status)
	}

	// Create parent directory if it doesn't exist
	targetDir := filepath.Dir(target)
	if targetDir != "." && targetDir != "" {
		if err := os.MkdirAll(targetDir, 0755); err != nil {
			return fmt.Errorf("error creating target directory: %w", err)
		}
	}

	// Create the target file
	file, err := os.Create(target)
	if err != nil {
		return fmt.Errorf("error creating target file: %w", err)
	}
	defer file.Close()

	// Copy the downloaded content to the file
	if _, err := io.Copy(file, resp.Body); err != nil {
		// Clean up the file if download fails
		os.Remove(target)
		return fmt.Errorf("error writing to file: %w", err)
	}

	// Store the final target for external use
	dm.target = target

	return nil
}

// GetTarget returns the target file path
func (dm *DownloadManager) GetTarget() string {
	return dm.target
}
