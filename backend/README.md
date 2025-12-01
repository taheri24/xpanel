# xpanel Backend

Backend service for xpanel built with Go and Gin framework.

## Tech Stack

- **Language**: Go 1.25
- **Framework**: Gin Web Framework
- **DI Framework**: Uber FX (Dependency Injection)
- **ORM**: sqlx
- **Database**: Microsoft SQL Server
- **Logging**: log/slog (standard library)

## Project Structure

```
backend/
├── main.go                   # Application entry point with FX setup
├── embed.go                  # Embedded frontend assets
├── internal/
│   ├── database/             # Database connection (FX module)
│   ├── handlers/             # HTTP handlers (FX modules)
│   ├── middleware/           # HTTP middleware
│   ├── models/               # Data models and repositories (FX modules)
│   ├── router/               # Router setup (FX module)
│   └── server/               # HTTP server (FX module)
├── pkg/
│   ├── config/               # Configuration management (FX module)
│   └── xfeature/             # XFeature execution engines (Query & Action)
├── specs/
│   └── xfeature/             # Feature XML definitions
├── migrations/               # Database migrations
├── .env.example              # Environment variables example
└── go.mod                    # Go dependencies
```

### Architecture Overview

This backend uses **Uber FX** for dependency injection and lifecycle management:

- **FX Modules**: Each package exports a `Module` that provides its components
- **Automatic Wiring**: Dependencies are automatically injected by FX
- **Lifecycle Hooks**: Resources (DB, server) managed with OnStart/OnStop hooks
- **Type Safety**: Compile-time dependency validation
- **Testability**: Easy to mock components for testing

## Prerequisites

- Go 1.25 or higher
- Microsoft SQL Server
- Make (optional, for using Makefile commands)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xpanel/backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   - Create a database named `xpanel` in SQL Server
   - Run the migration script:
   ```sql
   -- Execute the SQL in migrations/001_create_users_table.sql
   ```

## Running the Application

### Using Go directly

```bash
go run main.go
```

### Using Makefile

```bash
make run        # Run the application
make build      # Build the application
make dev        # Run with hot reload (requires air)
make test       # Run tests
make clean      # Clean build artifacts
```

## Environment Variables

| Variable      | Description                | Default     |
|---------------|----------------------------|-------------|
| SERVER_PORT   | Server port                | 8080        |
| SERVER_HOST   | Server host                | localhost   |
| ENV           | Environment (dev/prod)     | development |
| DB_HOST       | Database host              | localhost   |
| DB_PORT       | Database port              | 1433        |
| DB_USER       | Database username          | sa          |
| DB_PASSWORD   | Database password          | -           |
| DB_NAME       | Database name              | xpanel      |

## API Endpoints

All API endpoints return JSON responses and support CORS for frontend requests. The frontend uses **ky.js** for making HTTP requests to these endpoints.

### Health Check

- `GET /health` - Database health check
- `GET /ready` - Readiness check

### Users

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create a new user with JSON body
- `PUT /api/v1/users/:id` - Update a user with JSON body
- `DELETE /api/v1/users/:id` - Delete a user

### XFeature (Dynamic Queries & Actions)

XFeature is a system for defining backend queries and actions via XML schema. It supports mock data for development and testing.

- `GET /api/v1/xfeatures` - List available features
- `GET /api/v1/xfeatures/{name}` - Get feature metadata
- `GET /api/v1/xfeatures/{name}/backend` - Get all queries and actions
- `GET /api/v1/xfeatures/{name}/frontend` - Get frontend forms and data tables
- `POST /api/v1/xfeatures/{name}/queries/{queryId}` - Execute a SELECT query
- `POST /api/v1/xfeatures/{name}/actions/{actionId}` - Execute an INSERT/UPDATE/DELETE action
- `GET /api/v1/xfeatures/{name}/mappings` - Resolve feature mappings

### Frontend HTTP Client

The frontend uses **ky.js** for making HTTP requests. All error responses should follow this JSON structure for proper error handling:

```json
{
  "error": "Error message describing what went wrong"
}
```

Example error response:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Username is required"
}
```

## API Documentation

The API is fully documented using **Swagger/OpenAPI** with interactive UI:

- **Swagger UI**: Access at `http://localhost:8080/swagger/index.html` (when running)
- **OpenAPI Spec**: Available at `/docs/swagger.json` and `/docs/swagger.yaml`
- **Documentation Format**: Swagger comments in Go code (see CLAUDE.md for details)

To regenerate API documentation after adding/modifying endpoints:
```bash
go install github.com/swaggo/swag/cmd/swag@latest
swag init -g main.go
```

## XFeature System

XFeature enables declarative definition of database queries and actions through XML configuration files. Features are located in `specs/xfeature/` directory.

### MockFile Support

The MockFile attribute allows you to serve mock JSON data instead of executing actual database queries or actions. This is useful for:

- **Development**: Work with the frontend before the database is ready
- **Testing**: Provide consistent test data without database setup
- **Mocking**: Create realistic mock responses for different scenarios

### Defining Queries with MockFile

Create an XML feature file at `specs/xfeature/feature-name.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Feature Name="users-feature" Version="1.0">
  <Backend>
    <!-- Query with mock data -->
    <Query Id="GetUsers" Type="Select" MockFile="./mocks/users.json">
      SELECT id, name, email FROM users
    </Query>

    <!-- Query without mock data (uses database) -->
    <Query Id="GetActiveUsers" Type="Select">
      SELECT id, name, email FROM users WHERE active = 1
    </Query>
  </Backend>

  <Frontend>
    <!-- Frontend definitions omitted for brevity -->
  </Frontend>
</Feature>
```

### Mock Data Format for Queries

Create a JSON file containing an array of objects (one per row):

**`mocks/users.json`:**
```json
[
  {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": "2",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]
```

### Defining Actions with MockFile

Actions (INSERT/UPDATE/DELETE) also support mock responses:

```xml
<Backend>
  <ActionQuery Id="CreateUser" Type="Insert" MockFile="./mocks/create-user.json">
    INSERT INTO users (name, email) VALUES (:name, :email)
  </ActionQuery>

  <ActionQuery Id="UpdateUser" Type="Update" MockFile="./mocks/update-user.json">
    UPDATE users SET name = :name, email = :email WHERE id = :id
  </ActionQuery>
</Backend>
```

### Mock Response Format for Actions

Create a JSON file with action result metadata:

**`mocks/create-user.json`:**
```json
{
  "rowsAffected": 1,
  "lastInsertId": 42
}
```

**`mocks/update-user.json`:**
```json
{
  "rowsAffected": 1,
  "lastInsertId": 0
}
```

### Fallback Behavior

If a MockFile is specified but doesn't exist or can't be read, the system automatically falls back to the actual database query/action with a warning log. This ensures graceful degradation:

```
WARN Mock file error, falling back to database query queryId=GetUsers mockFile=./mocks/users.json error=...
```

### Using MockFile in Development

1. **Create mock JSON files** alongside your feature definitions
2. **Set MockFile attribute** on queries/actions you want to mock
3. **Test API endpoints** without database dependencies
4. **Switch to real database** by removing MockFile attributes or deleting mock files

The system handles the transition seamlessly without code changes.

## Development

### Adding a New Endpoint with FX

1. **Create a handler** in `internal/handlers/`:
   ```go
   type ProductHandler struct {
       productRepo *models.ProductRepository
   }

   func NewProductHandler(productRepo *models.ProductRepository) *ProductHandler {
       return &ProductHandler{productRepo: productRepo}
   }

   // Export FX module
   var ProductModule = fx.Options(
       fx.Provide(NewProductHandler),
   )
   ```

2. **Create a repository** (if needed) in `internal/models/`:
   ```go
   type ProductRepository struct {
       db *database.DB
   }

   func NewProductRepository(db *database.DB) *ProductRepository {
       return &ProductRepository{db: db}
   }

   // Add to existing Module
   var Module = fx.Options(
       fx.Provide(
           NewUserRepository,
           NewProductRepository,
       ),
   )
   ```

3. **Register in main.go**:
   ```go
   app := fx.New(
       // ... existing modules
       handlers.ProductModule,
       // ...
   )
   ```

4. **Add routes in router**:
   Update `internal/router/router.go` to include the new handler

### Logging

The application uses `log/slog` for structured logging. Use the following methods:

```go
slog.Info("message", "key", value)
slog.Warn("warning message", "key", value)
slog.Error("error message", "error", err)
```

### Database Migrations

Database migrations are located in the `migrations/` directory. Execute them manually in SQL Server Management Studio or using a migration tool.

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with verbose output
go test -v ./...
```

## Building for Production

```bash
# Build the binary
go build -o bin/xpanel main.go

# Run the production binary
./bin/xpanel
```

## License

Copyright © 2025 xpanel. All rights reserved.
