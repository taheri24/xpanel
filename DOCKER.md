# XPanel Docker Development Guide

This guide explains how to set up and run the XPanel development environment using Docker Compose.

## Overview

The Docker Compose setup includes:

- **Backend**: Go application with Gin framework
- **Frontend**: React application with Vite
- **Database**: Microsoft SQL Server
- **Logging**: Grafana Loki for log aggregation
- **Log Shipping**: Promtail for collecting logs from Docker containers
- **Monitoring**: Grafana for visualizing logs and metrics

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+
- Git
- Docker BuildKit (enabled by default in Docker Desktop and Docker Engine 20.10+)

## Build Optimization with Docker BuildKit & Persistent Caching

The Dockerfiles are configured to use Docker BuildKit caching combined with persistent Docker volumes for ultra-fast rebuilds:

**Go Backend** (`backend/Dockerfile`):
- Caches Go modules in `/go/pkg/mod` → Volume: `go_mod_cache` - avoids re-downloading dependencies
- Caches build artifacts in `/root/.cache/go-build` → Volume: `go_build_cache` - speeds up go run compilation

**Node.js Frontend** (`frontend/Dockerfile`):
- Caches npm packages in `/root/.npm` → Volume: `npm_cache` - reuses cached node modules
- Uses `--prefer-offline` flag - prioritizes cached packages

**How It Works:**
- BuildKit layer caching + Docker volumes create a two-tier caching system
- First build: Downloads all dependencies
- Subsequent builds: Uses cached volumes, **only downloads new/changed packages**
- Volumes persist even after `docker compose down`, so you only download once
- Clean rebuild: `docker compose down -v` removes all cached volumes

**Enabling BuildKit explicitly:**

```bash
export DOCKER_BUILDKIT=1
docker compose up
```

BuildKit is automatically enabled in Docker Desktop. For Docker Engine, ensure you're on version 20.10+ (default since 2021).

**Cache Persistence:**
All module caches are stored in named Docker volumes:
```bash
docker volume ls | grep xpanel
# go_mod_cache - Go modules cache
# go_build_cache - Go build artifacts cache
# npm_cache - npm packages cache
```

## Quick Start

### 1. Start All Services

```bash
docker compose up
```

This command will:
- Build Docker images for backend and frontend
- Start all services (MSSQL, Backend, Frontend, Logging stack, Grafana)
- Automatically wait for the database to be healthy before starting the backend

### 2. Access the Application

Once all services are running, access them at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api/v1
- **Backend Health**: http://localhost:8080/health
- **Grafana Dashboards**: http://localhost:3000 (admin/admin)
- **Loki API**: http://localhost:3100

### 3. Stop All Services

```bash
docker compose down
```

To also remove volumes (database data):
```bash
docker compose down -v
```

## Service Details

### Backend Service

- **Container Name**: `xpanel-backend`
- **Port**: 8080
- **Environment**: Development mode with live hot-reload
- **Database**: Connected to MSSQL service
- **Logging**: All logs shipped to Loki

**Features:**
- Auto-reloads on code changes
- Databases migrations run automatically on container startup
- Structured logging with JSON output

### Frontend Service

- **Container Name**: `xpanel-frontend`
- **Port**: 5173
- **Environment**: Development with Vite HMR (Hot Module Replacement)
- **API Base URL**: `http://localhost:8080/api/v1`

**Features:**
- Hot reload on file changes
- Access via http://localhost:5173
- Logs shipped to Loki

### Database (MSSQL)

- **Container Name**: `xpanel-mssql`
- **Port**: 1433
- **Username**: sa
- **Password**: YourStrong@Passw0rd
- **Database**: xpanel

**Features:**
- Persistent storage with Docker volume
- Health checks before backend startup
- Automatic migration script execution

### Loki (Log Aggregation)

- **Container Name**: `xpanel-loki`
- **Port**: 3100
- **Configuration**: `docker/loki-config.yml`

**Features:**
- Aggregates logs from all containers
- Supports label-based filtering
- Efficient log storage with BoltDB

### Promtail (Log Shipper)

- **Container Name**: `xpanel-promtail`
- **Configuration**: `docker/promtail-config.yml`

**Features:**
- Automatically discovers Docker containers
- Ships logs to Loki with metadata labels
- Monitors for new containers in real-time

### Grafana (Monitoring & Visualization)

- **Container Name**: `xpanel-grafana`
- **Port**: 3000
- **Default Credentials**: admin / admin
- **Datasource**: Loki (pre-configured)

**Features:**
- Pre-configured Loki datasource
- Sample dashboards for service logs
- Interactive log exploration

## Logging & Monitoring

### Viewing Logs in Grafana

1. Open Grafana at http://localhost:3000
2. Log in with `admin/admin`
3. Go to **Explore** tab
4. Select **Loki** as datasource
5. Use log queries like:
   - `{service="backend"}` - Backend logs only
   - `{service="frontend"}` - Frontend logs only
   - `{service="mssql"}` - Database logs only
   - `{env="development"}` - All development logs

### Pre-built Dashboards

A sample dashboard "XPanel Development Logs" is available in Grafana with:
- All service logs view
- Backend logs panel
- Frontend logs panel
- Real-time log streaming

### Log Labels

All logs include metadata labels:
- `service`: Service name (backend, frontend, mssql, grafana, loki, promtail)
- `env`: Environment (development)
- `container`: Container name
- `stream`: Log stream (stdout, stderr)

## Development Workflows

### Making Code Changes

**Backend Changes:**
```bash
# Edit Go files in ./backend
# Changes automatically reload in the container
```

**Frontend Changes:**
```bash
# Edit React/TypeScript files in ./frontend
# Vite hot reload automatically updates in browser
```

**Database Schema Changes:**
```bash
# Add new migration scripts to ./backend/migrations/
# Restart the database container:
docker compose down && docker compose up
```

### Running Tests

**Backend Tests:**
```bash
docker compose exec backend go test ./...
```

**Frontend Tests:**
```bash
docker compose exec frontend npm test
```

### Building for Production

```bash
# Stop development environment
docker compose down

# Build production images
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up
```

## Troubleshooting

### Backend Can't Connect to Database

**Symptoms:** Backend shows "database connection error"

**Solutions:**
1. Check MSSQL health: `docker compose logs mssql`
2. Verify database is ready: `docker compose ps` (mssql should show "healthy")
3. Wait a few more seconds and check again - initial startup takes time

```bash
# Force restart the backend after DB is healthy
docker compose restart backend
```

### Frontend Can't Reach Backend API

**Symptoms:** CORS errors or API calls failing

**Check:**
1. Backend is running: `docker compose logs backend`
2. API is responding: `curl http://localhost:8080/health`
3. Frontend has correct API URL: http://localhost:8080/api/v1

### Loki/Grafana Not Receiving Logs

**Symptoms:** Grafana shows no logs

**Solutions:**
```bash
# Check Loki is running
docker compose logs loki

# Check Promtail is connected
docker compose logs promtail

# Restart Promtail
docker compose restart promtail
```

### Out of Disk Space

If Docker containers are consuming too much disk:

```bash
# Remove old volumes and images
docker compose down -v
docker system prune -a

# Restart
docker compose up
```

## Performance Optimization

### Reduce Log Verbosity in Development

Edit `docker-compose.yml` and set `LOG_LEVEL: "warn"` for the backend service.

### Limit Resource Usage

Edit `docker-compose.yml` and add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Common Commands

```bash
# View logs for a specific service
docker compose logs backend
docker compose logs -f frontend  # Follow mode

# Execute command in running container
docker compose exec backend go run main.go
docker compose exec frontend npm run build

# View container status
docker compose ps

# Check service health
docker compose ps
docker inspect xpanel-mssql

# View network information
docker network inspect xpanel_xpanel-network
```

## Network Topology

All services communicate through the `xpanel-network` bridge:

```
┌─────────────────────────────────────────────────┐
│          xpanel-network (Docker)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Backend   │  │  Frontend  │  │  MSSQL   │ │
│  │ :8080      │  │ :5173      │  │ :1433    │ │
│  └────────────┘  └────────────┘  └──────────┘ │
│         │               │              │       │
│         └───────────────┼──────────────┘       │
│                         │                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Loki     │  │ Promtail   │  │ Grafana  │ │
│  │ :3100      │  │            │  │ :3000    │ │
│  └────────────┘  └────────────┘  └──────────┘ │
│         │              │              │       │
│         └──────────────┴──────────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Advanced Configuration

### Custom Environment Variables

Create a `.env.docker` file in the project root:

```env
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
ENV=development
DB_PASSWORD=YourStrong@Passw0rd
LOG_LEVEL=info
```

Then use it:
```bash
docker compose --env-file .env.docker up
```

### Persist Grafana Configuration

Add to `docker-compose.yml`:
```yaml
  grafana:
    volumes:
      - ./docker/grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
```

## Cleanup

Remove all Docker artifacts:

```bash
# Stop and remove containers, volumes, networks (includes cache volumes)
docker compose down -v

# Remove dangling images
docker image prune -a

# Full cleanup (use with caution)
docker system prune -a --volumes
```

**Cache Volume Cleanup:**
```bash
# Remove only cache volumes (preserves database and Grafana data)
docker volume rm xpanel_go_mod_cache xpanel_go_build_cache xpanel_npm_cache

# View all xpanel volumes
docker volume ls | grep xpanel

# Remove a specific cache to force re-download
docker volume rm xpanel_npm_cache  # Rebuilds npm cache on next start
docker volume rm xpanel_go_mod_cache  # Rebuilds Go modules on next start
```

**Important:**
- Use `docker compose down -v` for complete cleanup (removes ALL volumes including database)
- Use individual `docker volume rm` to selectively clean only cache volumes
- Cache volumes are automatically created on first build if they don't exist

## Security Notes for Development

⚠️ **The default credentials and configuration are for development only:**
- Default database password: `YourStrong@Passw0rd`
- Grafana default credentials: `admin/admin`
- No TLS/SSL configured
- All services accessible on localhost

**For production**, use:
- Strong, unique passwords
- Environment variable secrets management
- TLS/SSL certificates
- Network isolation
- Container security scanning

See `docker-compose.prod.yml` template for production recommendations.

## Support

For issues or questions:
1. Check logs: `docker compose logs <service-name>`
2. Review Docker Compose documentation: https://docs.docker.com/compose/
3. Check XPanel README: `README.md`
