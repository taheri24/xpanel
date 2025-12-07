package cli

import (
	"crypto/sha256"
	"fmt"
	"io"
	"os"
)

// HashManager handles file hashing operations
type HashManager struct {
	filePath string
}

// NewHashManager creates a new HashManager instance
func NewHashManager(filePath string) *HashManager {
	return &HashManager{
		filePath: filePath,
	}
}

// ComputeSHA256 calculates the SHA256 hash of a file and returns it as hex string
func (hm *HashManager) ComputeSHA256() (string, error) {
	// Check if file exists
	if _, err := os.Stat(hm.filePath); err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("file not found: %s", hm.filePath)
		}
		return "", fmt.Errorf("error accessing file: %w", err)
	}

	// Open the file
	file, err := os.Open(hm.filePath)
	if err != nil {
		return "", fmt.Errorf("error opening file: %w", err)
	}
	defer file.Close()

	// Create SHA256 hash
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", fmt.Errorf("error reading file: %w", err)
	}

	// Return hash as hex string
	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}
