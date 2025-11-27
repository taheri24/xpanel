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
│   └── config/               # Configuration management (FX module)
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
