# Development Dockerfile for Go Backend
FROM golang:1.24.7-alpine

# Install build dependencies
RUN apk add --no-cache git make ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies (this layer is cached unless go.mod/sum change)
RUN go mod download

# Copy entire backend source
COPY . .

# Expose the server port
EXPOSE 8080

# Default command (can be overridden in docker-compose)
CMD ["go", "run", "main.go"]
