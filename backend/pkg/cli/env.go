package cli

import (
	"fmt"
	"os"
	"strings"
)

// EnvManager handles reading and writing .env files
type EnvManager struct {
	filePath string
	entries  map[string]string
}

// NewEnvManager creates a new EnvManager instance
func NewEnvManager(filePath string) *EnvManager {
	return &EnvManager{
		filePath: filePath,
		entries:  make(map[string]string),
	}
}

// Load reads the .env file and populates entries
func (em *EnvManager) Load() error {
	content, err := os.ReadFile(em.filePath)
	if err != nil {
		// If file doesn't exist, that's okay - we'll create it on save
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to read .env file: %w", err)
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			em.entries[key] = value
		}
	}

	return nil
}

// Save writes the entries back to the .env file
func (em *EnvManager) Save() error {
	var content strings.Builder
	for key, value := range em.entries {
		content.WriteString(fmt.Sprintf("%s=%s\n", key, value))
	}

	err := os.WriteFile(em.filePath, []byte(content.String()), 0644)
	if err != nil {
		return fmt.Errorf("failed to write .env file: %w", err)
	}

	return nil
}

// Add adds or updates a key-value pair
func (em *EnvManager) Add(key, value string) error {
	if key == "" {
		return fmt.Errorf("key cannot be empty")
	}
	em.entries[key] = value
	return nil
}

// Delete removes a key from the entries
func (em *EnvManager) Delete(key string) error {
	if _, exists := em.entries[key]; !exists {
		return fmt.Errorf("key '%s' not found", key)
	}
	delete(em.entries, key)
	return nil
}

// Get retrieves a value by key
func (em *EnvManager) Get(key string) (string, error) {
	value, exists := em.entries[key]
	if !exists {
		return "", fmt.Errorf("key '%s' not found", key)
	}
	return value, nil
}

// List returns all key-value pairs
func (em *EnvManager) List() map[string]string {
	return em.entries
}

// Update updates an existing key
func (em *EnvManager) Update(key, value string) error {
	if _, exists := em.entries[key]; !exists {
		return fmt.Errorf("key '%s' not found", key)
	}
	em.entries[key] = value
	return nil
}
