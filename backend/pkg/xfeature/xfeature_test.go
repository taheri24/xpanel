package xfeature

import (
	"context"
	"log/slog"
	"os"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	"github.com/jmoiron/sqlx"
)

var testLogger = slog.Default()

// setupTestDB creates an in-memory SQLite database with test schema
func setupTestDB(t *testing.T) *sqlx.DB {
	db, err := sqlx.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Create test table
	schema := `
	CREATE TABLE users (
		user_id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		first_name TEXT,
		last_name TEXT,
		role TEXT,
		status TEXT DEFAULT 'active',
		phone TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	if _, err := db.Exec(schema); err != nil {
		t.Fatalf("Failed to create test schema: %v", err)
	}

	return db
}

// TestLoadFromFile tests loading XML file
func TestLoadFromFile(t *testing.T) {
	xf := NewXFeature(testLogger)

	// Create a temporary XML file
	xmlContent := `<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="TestFeature" Version="1.0">
  <Backend>
    <Query Id="GetUser" Type="Select">
      <![CDATA[SELECT user_id, username FROM users WHERE user_id = :user_id]]>
    </Query>
    <ActionQuery Id="CreateUser" Type="Insert">
      <![CDATA[INSERT INTO users (username, email) VALUES (:username, :email)]]>
    </ActionQuery>
  </Backend>
  <Frontend>
    <DataTable Id="UsersTable" QueryRef="GetUser" Title="Users"/>
    <Form Id="UserForm" Mode="Create" Dialog="true" ActionRef="CreateUser" Title="Create User"/>
  </Frontend>
</Feature>`

	tmpFile, err := os.CreateTemp("", "test_*.xml")
	if err != nil {
		t.Fatalf("Failed to create temp file: %v", err)
	}
	defer os.Remove(tmpFile.Name())

	if _, err := tmpFile.WriteString(xmlContent); err != nil {
		t.Fatalf("Failed to write to temp file: %v", err)
	}
	tmpFile.Close()

	// Load the file
	if err := xf.LoadFromFile(tmpFile.Name()); err != nil {
		t.Fatalf("Failed to load XML file: %v", err)
	}

	// Verify loaded data
	if xf.Name != "TestFeature" {
		t.Errorf("Expected Name 'TestFeature', got '%s'", xf.Name)
	}

	if xf.Version != "1.0" {
		t.Errorf("Expected Version '1.0', got '%s'", xf.Version)
	}

	if len(xf.Backend.Queries) != 1 {
		t.Errorf("Expected 1 query, got %d", len(xf.Backend.Queries))
	}

	if len(xf.Backend.ActionQueries) != 1 {
		t.Errorf("Expected 1 action query, got %d", len(xf.Backend.ActionQueries))
	}
}

// TestGetQuery tests finding a query by ID
func TestGetQuery(t *testing.T) {
	xf := NewXFeature(testLogger)
	xf.Backend.Queries = []*Query{
		{Id: "GetUser", Type: "Select", SQL: "SELECT * FROM users"},
		{Id: "ListUsers", Type: "Select", SQL: "SELECT * FROM users"},
	}

	// Test finding existing query
	query, err := xf.GetQuery("GetUser")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if query.Id != "GetUser" {
		t.Errorf("Expected query ID 'GetUser', got '%s'", query.Id)
	}

	// Test finding non-existent query
	_, err = xf.GetQuery("NonExistent")
	if err == nil {
		t.Error("Expected error for non-existent query")
	}
}

// TestGetActionQuery tests finding an action query by ID
func TestGetActionQuery(t *testing.T) {
	xf := NewXFeature(testLogger)
	xf.Backend.ActionQueries = []*ActionQuery{
		{Id: "CreateUser", Type: "Insert", SQL: "INSERT INTO users ..."},
		{Id: "UpdateUser", Type: "Update", SQL: "UPDATE users ..."},
	}

	// Test finding existing action
	action, err := xf.GetActionQuery("CreateUser")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if action.Id != "CreateUser" {
		t.Errorf("Expected action ID 'CreateUser', got '%s'", action.Id)
	}

	// Test finding non-existent action
	_, err = xf.GetActionQuery("NonExistent")
	if err == nil {
		t.Error("Expected error for non-existent action")
	}
}

// TestExtractParameters tests parameter extraction from SQL
func TestExtractParameters(t *testing.T) {
	tests := []struct {
		name     string
		sql      string
		expected []string
	}{
		{
			name:     "Single parameter",
			sql:      "SELECT * FROM users WHERE id = :user_id",
			expected: []string{"user_id"},
		},
		{
			name:     "Multiple parameters",
			sql:      "SELECT * FROM users WHERE id = :user_id AND status = :status",
			expected: []string{"user_id", "status"},
		},
		{
			name:     "Duplicate parameters",
			sql:      "SELECT * FROM users WHERE id = :user_id AND created = :user_id",
			expected: []string{"user_id"},
		},
		{
			name:     "No parameters",
			sql:      "SELECT * FROM users",
			expected: []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			params := ExtractParameters(tt.sql)
			if len(params) != len(tt.expected) {
				t.Errorf("Expected %d parameters, got %d", len(tt.expected), len(params))
				return
			}

			paramMap := make(map[string]bool)
			for _, p := range params {
				paramMap[p] = true
			}

			for _, expected := range tt.expected {
				if !paramMap[expected] {
					t.Errorf("Expected parameter '%s' not found", expected)
				}
			}
		})
	}
}

// TestExecuteQuery tests executing SELECT queries
func TestExecuteQuery(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Insert test data
	_, err := db.Exec("INSERT INTO users (username, email, first_name, last_name) VALUES (?, ?, ?, ?)",
		"john", "john@example.com", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	xf := NewXFeature(testLogger)
	xf.Backend.Queries = []*Query{
		{
			Id:   "GetUser",
			Type: "Select",
			SQL:  "SELECT user_id, username, email, first_name, last_name FROM users WHERE username = :username",
		},
	}

	ctx := context.Background()
	params := map[string]interface{}{"username": "john"}

	results, err := xf.ExecuteQuery(ctx, db, "GetUser", params)
	if err != nil {
		t.Fatalf("Failed to execute query: %v", err)
	}

	if len(results) != 1 {
		t.Errorf("Expected 1 result, got %d", len(results))
	}

	if results[0]["username"] != "john" {
		t.Errorf("Expected username 'john', got %v", results[0]["username"])
	}
}

// TestExecuteQueryMissingParameter tests parameter validation in query execution
func TestExecuteQueryMissingParameter(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	xf := NewXFeature(testLogger)
	xf.Backend.Queries = []*Query{
		{
			Id:   "GetUser",
			Type: "Select",
			SQL:  "SELECT * FROM users WHERE username = :username",
		},
	}

	ctx := context.Background()
	params := map[string]interface{}{} // Missing username parameter

	_, err := xf.ExecuteQuery(ctx, db, "GetUser", params)
	if err == nil {
		t.Error("Expected error for missing parameter")
	}
}

// TestExecuteAction tests executing INSERT action
func TestExecuteAction(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	xf := NewXFeature(testLogger)
	xf.Backend.ActionQueries = []*ActionQuery{
		{
			Id:   "CreateUser",
			Type: "Insert",
			SQL:  "INSERT INTO users (username, email, first_name, last_name) VALUES (:username, :email, :first_name, :last_name)",
		},
	}

	ctx := context.Background()
	params := map[string]interface{}{
		"username":   "jane",
		"email":      "jane@example.com",
		"first_name": "Jane",
		"last_name":  "Smith",
	}

	result, err := xf.ExecuteAction(ctx, db, "CreateUser", params)
	if err != nil {
		t.Fatalf("Failed to execute action: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		t.Fatalf("Failed to get rows affected: %v", err)
	}

	if rowsAffected != 1 {
		t.Errorf("Expected 1 row affected, got %d", rowsAffected)
	}

	// Verify the data was inserted
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", "jane").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to verify insert: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 user to be inserted, got %d", count)
	}
}

// TestExecuteActionUpdate tests executing UPDATE action
func TestExecuteActionUpdate(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Insert test data
	_, err := db.Exec("INSERT INTO users (username, email, first_name) VALUES (?, ?, ?)",
		"john", "john@example.com", "John")
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	xf := NewXFeature(testLogger)
	xf.Backend.ActionQueries = []*ActionQuery{
		{
			Id:   "UpdateUser",
			Type: "Update",
			SQL:  "UPDATE users SET first_name = :first_name, email = :email WHERE username = :username",
		},
	}

	ctx := context.Background()
	params := map[string]interface{}{
		"username":   "john",
		"email":      "newemail@example.com",
		"first_name": "Johnny",
	}

	result, err := xf.ExecuteAction(ctx, db, "UpdateUser", params)
	if err != nil {
		t.Fatalf("Failed to execute action: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		t.Fatalf("Failed to get rows affected: %v", err)
	}

	if rowsAffected != 1 {
		t.Errorf("Expected 1 row affected, got %d", rowsAffected)
	}

	// Verify the update
	var firstName string
	err = db.QueryRow("SELECT first_name FROM users WHERE username = ?", "john").Scan(&firstName)
	if err != nil {
		t.Fatalf("Failed to verify update: %v", err)
	}

	if firstName != "Johnny" {
		t.Errorf("Expected first_name 'Johnny', got '%s'", firstName)
	}
}

// TestExecuteActionDelete tests executing DELETE action
func TestExecuteActionDelete(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Insert test data
	_, err := db.Exec("INSERT INTO users (username, email) VALUES (?, ?)",
		"john", "john@example.com")
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	xf := NewXFeature(testLogger)
	xf.Backend.ActionQueries = []*ActionQuery{
		{
			Id:   "DeleteUser",
			Type: "Delete",
			SQL:  "UPDATE users SET status = 'inactive' WHERE username = :username",
		},
	}

	ctx := context.Background()
	params := map[string]interface{}{"username": "john"}

	result, err := xf.ExecuteAction(ctx, db, "DeleteUser", params)
	if err != nil {
		t.Fatalf("Failed to execute action: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		t.Fatalf("Failed to get rows affected: %v", err)
	}

	if rowsAffected != 1 {
		t.Errorf("Expected 1 row affected, got %d", rowsAffected)
	}

	// Verify the soft delete
	var status string
	err = db.QueryRow("SELECT status FROM users WHERE username = ?", "john").Scan(&status)
	if err != nil {
		t.Fatalf("Failed to verify delete: %v", err)
	}

	if status != "inactive" {
		t.Errorf("Expected status 'inactive', got '%s'", status)
	}
}

// TestExecuteActionMissingParameter tests parameter validation in action execution
func TestExecuteActionMissingParameter(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	xf := NewXFeature(testLogger)
	xf.Backend.ActionQueries = []*ActionQuery{
		{
			Id:   "CreateUser",
			Type: "Insert",
			SQL:  "INSERT INTO users (username, email) VALUES (:username, :email)",
		},
	}

	ctx := context.Background()
	params := map[string]interface{}{"username": "john"} // Missing email

	_, err := xf.ExecuteAction(ctx, db, "CreateUser", params)
	if err == nil {
		t.Error("Expected error for missing parameter")
	}
}

// TestGetAllQueries tests retrieving all queries
func TestGetAllQueries(t *testing.T) {
	xf := NewXFeature(testLogger)
	xf.Backend.Queries = []*Query{
		{Id: "Query1", Type: "Select"},
		{Id: "Query2", Type: "Select"},
		{Id: "Query3", Type: "Select"},
	}

	queries := xf.GetAllQueries()
	if len(queries) != 3 {
		t.Errorf("Expected 3 queries, got %d", len(queries))
	}
}

// TestGetAllActionQueries tests retrieving all action queries
func TestGetAllActionQueries(t *testing.T) {
	xf := NewXFeature(testLogger)
	xf.Backend.ActionQueries = []*ActionQuery{
		{Id: "Action1", Type: "Insert"},
		{Id: "Action2", Type: "Update"},
		{Id: "Action3", Type: "Delete"},
	}

	actions := xf.GetAllActionQueries()
	if len(actions) != 3 {
		t.Errorf("Expected 3 action queries, got %d", len(actions))
	}
}

// TestGetAllDataTables tests retrieving all data tables
func TestGetAllDataTables(t *testing.T) {
	xf := NewXFeature(testLogger)
	xf.Frontend.DataTables = []*DataTable{
		{Id: "Table1", QueryRef: "Query1"},
		{Id: "Table2", QueryRef: "Query2"},
	}

	tables := xf.GetAllDataTables()
	if len(tables) != 2 {
		t.Errorf("Expected 2 data tables, got %d", len(tables))
	}
}

// TestGetAllForms tests retrieving all forms
func TestGetAllForms(t *testing.T) {
	xf := NewXFeature(testLogger)
	xf.Frontend.Forms = []*Form{
		{Id: "Form1", Mode: "Create"},
		{Id: "Form2", Mode: "Edit"},
		{Id: "Form3", Mode: "Delete"},
	}

	forms := xf.GetAllForms()
	if len(forms) != 3 {
		t.Errorf("Expected 3 forms, got %d", len(forms))
	}
}

// TestConvertParametersForDriver tests parameter conversion for different drivers
func TestConvertParametersForDriver(t *testing.T) {
	tests := []struct {
		name       string
		sql        string
		driver     string
		expected   string
	}{
		{
			name:     "SQLite keeps :param",
			sql:      "SELECT * FROM users WHERE id = :user_id",
			driver:   "sqlite3",
			expected: "SELECT * FROM users WHERE id = :user_id",
		},
		{
			name:     "SQL Server converts to @param",
			sql:      "SELECT * FROM users WHERE id = :user_id",
			driver:   "sqlserver",
			expected: "SELECT * FROM users WHERE id = @user_id",
		},
		{
			name:     "Multiple parameters for SQL Server",
			sql:      "INSERT INTO users (id, name) VALUES (:user_id, :user_name)",
			driver:   "sqlserver",
			expected: "INSERT INTO users (id, name) VALUES (@user_id, @user_name)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ConvertParametersForDriver(tt.sql, tt.driver)
			if result != tt.expected {
				t.Errorf("Expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}
