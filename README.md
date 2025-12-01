# xpanel

A modern full-stack application with Go backend and React frontend.

## Overview

xpanel is a full-stack web application built with modern technologies and best practices. The project is organized as a monorepo with separate backend and frontend directories.

## Tech Stack

### Backend
- **Language**: Go 1.25
- **Framework**: Gin Web Framework
- **DI Framework**: Uber FX (Dependency Injection)
- **ORM**: sqlx
- **Database**: Microsoft SQL Server
- **Logging**: log/slog (standard library)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Router**: TanStack Router
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: ky.js
- **Testing**: Vitest + React Testing Library
- **Component Development**: Storybook

## Project Structure

```
xpanel/
├── backend/                 # Go backend application
│   ├── cmd/                 # Application entry points
│   ├── internal/            # Private application code
│   ├── pkg/                 # Public packages
│   ├── migrations/          # Database migrations
│   └── README.md            # Backend documentation
├── frontend/                # React frontend application
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   ├── .storybook/          # Storybook configuration
│   └── README.md            # Frontend documentation
├── CLAUDE.md                # AI assistant guide
└── README.md                # This file
```

## Prerequisites

### Backend
- Go 1.25 or higher
- Microsoft SQL Server

### Frontend
- Node.js 18+ or higher
- pnpm

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd xpanel
```

### 2. Set Up the Backend

```bash
cd backend

# Install dependencies
go mod download

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run the application
go run main.go
```

The backend will be available at `http://localhost:8080`

For detailed backend setup and documentation, see [backend/README.md](backend/README.md)

### 3. Set Up the Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API endpoint

# Run the development server
pnpm run dev
```

The frontend will be available at `http://localhost:5173`

For detailed frontend setup and documentation, see [frontend/README.md](frontend/README.md)

## Development Workflow

### Running Both Services

You can run both the backend and frontend simultaneously in different terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
go run main.go
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
pnpm run dev
```

### Database Setup

1. Create a SQL Server database named `xpanel`
2. Run the migration scripts in `backend/migrations/`:
   ```sql
   -- Execute migrations in order
   -- 001_create_users_table.sql
   ```

### Environment Variables

#### Backend (.env)
```env
SERVER_PORT=8080
SERVER_HOST=localhost
ENV=development
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_NAME=xpanel
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## API Documentation

### Health Check Endpoints

- `GET /health` - Database health check
- `GET /ready` - Application readiness check

### User Management Endpoints

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### XFeature Endpoints (Dynamic Queries & Actions)

- `GET /api/v1/xfeatures` - List available features
- `GET /api/v1/xfeatures/{name}` - Get feature metadata
- `GET /api/v1/xfeatures/{name}/backend` - Get all queries and actions
- `GET /api/v1/xfeatures/{name}/frontend` - Get frontend forms and data tables
- `POST /api/v1/xfeatures/{name}/queries/{queryId}` - Execute a SELECT query
- `POST /api/v1/xfeatures/{name}/actions/{actionId}` - Execute an INSERT/UPDATE/DELETE action
- `GET /api/v1/xfeatures/{name}/mappings` - Resolve feature mappings

**XFeature supports mock data** via the optional `MockFile` attribute. Define mock JSON files to test API endpoints without database dependencies. See [backend/README.md](backend/README.md#xfeature-system) for detailed documentation.

## Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### Frontend Tests

```bash
cd frontend
pnpm run test              # Run tests
pnpm run test:ui           # Run tests with UI
pnpm run test:coverage     # Run tests with coverage
```

## Storybook

The frontend includes Storybook for component development and documentation:

```bash
cd frontend
pnpm run storybook
```

Storybook will be available at `http://localhost:6006`

## Building for Production

### Backend

```bash
cd backend
go build -o bin/xpanel main.go
./bin/xpanel
```

### Frontend

```bash
cd frontend
pnpm run build
pnpm run preview
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the project conventions
3. Write tests for new functionality
4. Run tests and ensure they pass
5. Submit a pull request

For detailed contribution guidelines, see [CLAUDE.md](CLAUDE.md)

## Project Conventions

### Code Style

- **Backend**: Follow standard Go conventions (`gofmt`, `golint`)
- **Frontend**: Use ESLint and Prettier configurations
- **Commits**: Follow conventional commits specification

### Component Guidelines (Frontend)

- All components must use `React.FC` type
- Each component should have:
  - Implementation file (`.tsx`)
  - Story file (`.stories.tsx`)
  - Test file (`.test.tsx`)
  - Index file (`index.ts`)

### Logging (Backend)

Use `log/slog` for all logging:

```go
slog.Info("message", "key", value)
slog.Warn("warning message", "key", value)
slog.Error("error message", "error", err)
```

## Architecture

### Backend Architecture

- **Dependency Injection**: Uses Uber FX for automatic dependency injection and lifecycle management
- **Modular Design**: Each package exports FX modules with providers
- **Layered Architecture**: Handlers → Repositories → Database
- **Lifecycle Management**: Automatic startup/shutdown coordination via FX hooks
- **Clean Architecture**: Clear separation of concerns with explicit dependencies

### Frontend Architecture

- **Component-Based**: Reusable React components
- **Service Layer**: API calls abstracted in services using ky.js
- **HTTP Client**: ky.js for lightweight, type-safe API requests
- **Routing**: File-based routing with TanStack Router
- **State Management**: React hooks for local state

## Documentation

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [AI Assistant Guide](CLAUDE.md)

## License

Copyright © 2025 xpanel. All rights reserved.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Changelog

### 2025-12-01
- **Feature**: Added MockFile attribute to XFeature Query and ActionQuery elements
- **Backend**: Implemented mock data support in QueryExecutor and ActionExecutor
- **Schema**: Updated feature-schema.xsd to include optional MockFile attribute
- **Documentation**: Added comprehensive XFeature MockFile usage guide

### 2025-11-25
- Initial project setup
- Backend: Go with Gin framework and SQL Server
- Frontend: React with TypeScript, Vite, MUI, TanStack Router, Storybook, and Vitest
- Basic CRUD operations for user management
- Comprehensive documentation
