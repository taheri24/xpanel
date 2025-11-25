# xpanel Backend

Backend service for xpanel built with Go and Gin framework.

## Tech Stack

- **Language**: Go 1.25
- **Framework**: Gin Web Framework
- **ORM**: sqlx
- **Database**: Microsoft SQL Server
- **Logging**: log/slog (standard library)

## Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point
├── internal/
│   ├── database/             # Database connection
│   ├── handlers/             # HTTP handlers
│   ├── middleware/           # HTTP middleware
│   └── models/               # Data models and repositories
├── pkg/
│   └── config/               # Configuration management
├── migrations/               # Database migrations
├── .env.example              # Environment variables example
├── Makefile                  # Build and development commands
└── go.mod                    # Go dependencies
```

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
go run cmd/api/main.go
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

### Health Check

- `GET /health` - Database health check
- `GET /ready` - Readiness check

### Users

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

## Development

### Adding a New Endpoint

1. Create a handler in `internal/handlers/`
2. Create a repository (if needed) in `internal/models/`
3. Register the route in `cmd/api/main.go`

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
go build -o bin/api cmd/api/main.go

# Run the production binary
./bin/api
```

## License

Copyright © 2025 xpanel. All rights reserved.
