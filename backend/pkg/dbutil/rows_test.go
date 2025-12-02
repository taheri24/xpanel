package dbutil

import (
	"database/sql"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func TestRowsToMaps(t *testing.T) {
	// Create in-memory SQLite database
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Create test table
	createTableSQL := `
	CREATE TABLE users (
		id INTEGER PRIMARY KEY,
		name TEXT,
		email TEXT,
		age INTEGER,
		created_at DATETIME,
		is_active BOOLEAN
	)
	`
	if _, err := db.Exec(createTableSQL); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}

	// Insert test data
	now := time.Now().UTC()
	insertSQL := `
	INSERT INTO users (name, email, age, created_at, is_active) VALUES
	(?, ?, ?, ?, ?),
	(?, ?, ?, ?, ?)
	`
	_, err = db.Exec(insertSQL,
		"Alice", "alice@example.com", 30, now.Format(time.RFC3339), 1,
		"Bob", "bob@example.com", 25, now.Format(time.RFC3339), 0,
	)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	// Query data
	rows, err := db.Query("SELECT id, name, email, age, created_at, is_active FROM users ORDER BY id")
	if err != nil {
		t.Fatalf("Failed to query data: %v", err)
	}
	defer rows.Close()

	// Convert rows to maps
	results, err := RowsToMaps(rows)
	if err != nil {
		t.Fatalf("RowsToMaps failed: %v", err)
	}

	// Validate results
	if len(results) != 2 {
		t.Errorf("Expected 2 rows, got %d", len(results))
	}

	// Check first row
	firstRow := results[0]
	if id, ok := firstRow["id"].(int64); !ok || id != 1 {
		t.Errorf("Expected id=1, got %v", firstRow["id"])
	}
	if name, ok := firstRow["name"].(string); !ok || name != "Alice" {
		t.Errorf("Expected name='Alice', got %v", firstRow["name"])
	}
	if email, ok := firstRow["email"].(string); !ok || email != "alice@example.com" {
		t.Errorf("Expected email='alice@example.com', got %v", firstRow["email"])
	}
	if age, ok := firstRow["age"].(int64); !ok || age != 30 {
		t.Errorf("Expected age=30, got %v", firstRow["age"])
	}
	// SQLite can return booleans as true/false or 1/0 depending on the driver
	isActive := firstRow["is_active"]
	if boolVal, ok := isActive.(bool); ok {
		if !boolVal {
			t.Errorf("Expected is_active=true, got %v", isActive)
		}
	} else if intVal, ok := isActive.(int64); ok {
		if intVal != 1 {
			t.Errorf("Expected is_active=1, got %v", isActive)
		}
	} else {
		t.Errorf("Expected is_active to be bool or int64, got %T", isActive)
	}

	// Check second row
	secondRow := results[1]
	if id, ok := secondRow["id"].(int64); !ok || id != 2 {
		t.Errorf("Expected id=2, got %v", secondRow["id"])
	}
	if name, ok := secondRow["name"].(string); !ok || name != "Bob" {
		t.Errorf("Expected name='Bob', got %v", secondRow["name"])
	}
}

func TestRowsToMapsWithByteData(t *testing.T) {
	// Create in-memory SQLite database
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Create test table with BLOB
	createTableSQL := `
	CREATE TABLE files (
		id INTEGER PRIMARY KEY,
		name TEXT,
		content BLOB
	)
	`
	if _, err := db.Exec(createTableSQL); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}

	// Insert test data with binary content
	binaryData := []byte("test binary content")
	_, err = db.Exec("INSERT INTO files (name, content) VALUES (?, ?)", "test.bin", binaryData)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	// Query data
	rows, err := db.Query("SELECT id, name, content FROM files")
	if err != nil {
		t.Fatalf("Failed to query data: %v", err)
	}
	defer rows.Close()

	// Convert rows to maps
	results, err := RowsToMaps(rows)
	if err != nil {
		t.Fatalf("RowsToMaps failed: %v", err)
	}

	// Validate results
	if len(results) != 1 {
		t.Errorf("Expected 1 row, got %d", len(results))
	}

	row := results[0]
	if name, ok := row["name"].(string); !ok || name != "test.bin" {
		t.Errorf("Expected name='test.bin', got %v", row["name"])
	}

	// Check that []byte is converted to string
	content, ok := row["content"].(string)
	if !ok {
		t.Errorf("Expected content to be converted to string, got type %T", row["content"])
	}
	if content != string(binaryData) {
		t.Errorf("Expected content='%s', got '%s'", string(binaryData), content)
	}
}

func TestRowsToMapsEmptyResult(t *testing.T) {
	// Create in-memory SQLite database
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Create test table
	createTableSQL := `CREATE TABLE empty_table (id INTEGER PRIMARY KEY, name TEXT)`
	if _, err := db.Exec(createTableSQL); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}

	// Query empty table
	rows, err := db.Query("SELECT id, name FROM empty_table")
	if err != nil {
		t.Fatalf("Failed to query data: %v", err)
	}
	defer rows.Close()

	// Convert rows to maps
	results, err := RowsToMaps(rows)
	if err != nil {
		t.Fatalf("RowsToMaps failed: %v", err)
	}

	// Validate empty result
	if len(results) != 0 {
		t.Errorf("Expected 0 rows, got %d", len(results))
	}
}

func TestRowsToMapsWithNullValues(t *testing.T) {
	// Create in-memory SQLite database
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Create test table
	createTableSQL := `
	CREATE TABLE nullable_data (
		id INTEGER PRIMARY KEY,
		name TEXT,
		email TEXT
	)
	`
	if _, err := db.Exec(createTableSQL); err != nil {
		t.Fatalf("Failed to create table: %v", err)
	}

	// Insert test data with NULL values
	_, err = db.Exec(
		"INSERT INTO nullable_data (name, email) VALUES (?, ?)",
		"Charlie", nil,
	)
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	// Query data
	rows, err := db.Query("SELECT id, name, email FROM nullable_data")
	if err != nil {
		t.Fatalf("Failed to query data: %v", err)
	}
	defer rows.Close()

	// Convert rows to maps
	results, err := RowsToMaps(rows)
	if err != nil {
		t.Fatalf("RowsToMaps failed: %v", err)
	}

	// Validate results
	if len(results) != 1 {
		t.Errorf("Expected 1 row, got %d", len(results))
	}

	row := results[0]
	if name, ok := row["name"].(string); !ok || name != "Charlie" {
		t.Errorf("Expected name='Charlie', got %v", row["name"])
	}

	// Check that NULL is converted to nil
	if row["email"] != nil {
		t.Errorf("Expected email to be nil, got %v", row["email"])
	}
}
