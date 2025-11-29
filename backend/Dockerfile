# Development Dockerfile for Go Backend
FROM golang:1.24-alpine

# Install build dependencies
RUN apk add --no-cache git make ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies with cache mount for faster rebuilds
# Using --mount=type=cache for go mod cache
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# Copy entire backend source
COPY . .

# Expose the server port
EXPOSE 8080

# Default command (can be overridden in docker-compose)
CMD ["go", "run", "main.go"]
