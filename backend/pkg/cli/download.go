package cli

import (
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// ProgressReader wraps an io.Reader and tracks progress
type ProgressReader struct {
	total      int64
	read       int64
	r          io.Reader
	w          io.Writer
	mu         sync.Mutex
	barLength  int
	lastUpdate int64
}

// NewProgressReader creates a new progress tracking reader
func NewProgressReader(total int64, r io.Reader, w io.Writer) *ProgressReader {
	return &ProgressReader{
		total:     total,
		r:         r,
		w:         w,
		barLength: 40,
	}
}

// Read implements io.Reader and updates progress
func (pr *ProgressReader) Read(p []byte) (n int, err error) {
	n, err = pr.r.Read(p)
	if n > 0 {
		pr.mu.Lock()
		pr.read += int64(n)

		// Only update progress every 50KB to reduce overhead
		if pr.read-pr.lastUpdate > 50*1024 || pr.read == pr.total {
			pr.displayProgress()
			pr.lastUpdate = pr.read
		}
		pr.mu.Unlock()
	}
	return
}

// displayProgress shows the current progress bar
func (pr *ProgressReader) displayProgress() {
	if pr.total <= 0 {
		return
	}

	percent := float64(pr.read) / float64(pr.total) * 100
	filledLength := int(float64(pr.barLength) * float64(pr.read) / float64(pr.total))

	bar := strings.Repeat("=", filledLength) + strings.Repeat("-", pr.barLength-filledLength)

	fmt.Printf("\r[%s] %.1f%% (%d/%d bytes)", bar, percent, pr.read, pr.total)
}

// DownloadManager handles file download operations
type DownloadManager struct {
	downloadURL string
	target      string
	insecure    bool
}

// NewDownloadManager creates a new DownloadManager
func NewDownloadManager(downloadURL, target string) *DownloadManager {
	return &DownloadManager{
		downloadURL: downloadURL,
		target:      target,
		insecure:    true,
	}
}

// SetInsecure sets insecure HTTPS mode (skips certificate verification). Insecure mode is enabled by default.
func (dm *DownloadManager) SetInsecure(insecure bool) *DownloadManager {
	dm.insecure = insecure
	return dm
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

	// Create HTTP client with optional insecure TLS configuration
	client := &http.Client{}
	if dm.insecure {
		client.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		}
	}

	// Download the file
	resp, err := client.Get(dm.downloadURL)
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

	// Copy the downloaded content to the file with progress tracking
	var reader io.Reader = resp.Body
	if resp.ContentLength > 0 {
		fmt.Printf("Downloading %s (%d bytes)...\n", filepath.Base(target), resp.ContentLength)
		reader = NewProgressReader(resp.ContentLength, resp.Body, nil)
	}

	if _, err := io.Copy(file, reader); err != nil {
		// Clean up the file if download fails
		os.Remove(target)
		fmt.Println()
		return fmt.Errorf("error writing to file: %w", err)
	}

	if resp.ContentLength > 0 {
		fmt.Println()
	}

	// Store the final target for external use
	dm.target = target

	return nil
}

// GetTarget returns the target file path
func (dm *DownloadManager) GetTarget() string {
	return dm.target
}
