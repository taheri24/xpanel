package cli

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// ZipManager handles zip file operations
type ZipManager struct {
	zipFile string
	target  string
}

// NewZipManager creates a new ZipManager
func NewZipManager(zipFile, target string) *ZipManager {
	return &ZipManager{
		zipFile: zipFile,
		target:  target,
	}
}

// Extract extracts the zip file to the target directory
func (zm *ZipManager) Extract() error {
	// Validate zip file exists
	if _, err := os.Stat(zm.zipFile); err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("zip file not found: %s", zm.zipFile)
		}
		return fmt.Errorf("error accessing zip file: %w", err)
	}

	// Open the zip file
	reader, err := zip.OpenReader(zm.zipFile)
	if err != nil {
		return fmt.Errorf("error opening zip file: %w", err)
	}
	defer reader.Close()

	// Create target directory if it doesn't exist
	if err := os.MkdirAll(zm.target, 0755); err != nil {
		return fmt.Errorf("error creating target directory: %w", err)
	}

	// Extract all files from the zip
	extractedCount := 0
	for _, file := range reader.File {
		if err := zm.extractFile(file); err != nil {
			return fmt.Errorf("error extracting %s: %w", file.Name, err)
		}
		extractedCount++
	}

	return nil
}

// extractFile extracts a single file from the zip
func (zm *ZipManager) extractFile(file *zip.File) error {
	// Construct the full file path
	fpath := filepath.Join(zm.target, file.Name)

	// Prevent zip slip vulnerability
	if !strings.HasPrefix(filepath.Clean(fpath), filepath.Clean(zm.target)+string(os.PathSeparator)) {
		return fmt.Errorf("invalid file path in zip: %s", file.Name)
	}

	// Create directories if needed
	if file.FileInfo().IsDir() {
		return os.MkdirAll(fpath, file.Mode())
	}

	// Ensure parent directory exists
	if err := os.MkdirAll(filepath.Dir(fpath), 0755); err != nil {
		return err
	}

	// Create the file
	outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
	if err != nil {
		return err
	}
	defer outFile.Close()

	// Open and read the file from the zip
	rc, err := file.Open()
	if err != nil {
		return err
	}
	defer rc.Close()

	// Copy file contents
	if _, err := io.Copy(outFile, rc); err != nil {
		return err
	}

	return nil
}

// List returns the list of files in the zip archive
func (zm *ZipManager) List() ([]string, error) {
	reader, err := zip.OpenReader(zm.zipFile)
	if err != nil {
		return nil, fmt.Errorf("error opening zip file: %w", err)
	}
	defer reader.Close()

	var files []string
	for _, file := range reader.File {
		files = append(files, file.Name)
	}
	return files, nil
}

// Validate checks if the zip file is valid
func (zm *ZipManager) Validate() error {
	reader, err := zip.OpenReader(zm.zipFile)
	if err != nil {
		return fmt.Errorf("error opening zip file: %w", err)
	}
	defer reader.Close()

	// Try to read all files to validate integrity
	for _, file := range reader.File {
		rc, err := file.Open()
		if err != nil {
			return fmt.Errorf("error reading file %s: %w", file.Name, err)
		}
		rc.Close()
	}

	return nil
}
