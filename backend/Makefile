.PHONY: help run build test clean dev

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Run the application
	go run cmd/api/main.go

build: ## Build the application
	go build -o bin/api cmd/api/main.go

dev: ## Run the application in development mode with hot reload
	air

test: ## Run tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

clean: ## Clean build artifacts
	rm -rf bin/
	rm -f coverage.out coverage.html

deps: ## Download dependencies
	go mod download
	go mod tidy

fmt: ## Format code
	go fmt ./...

lint: ## Run linter
	golangci-lint run

migrate-up: ## Run database migrations up
	@echo "Database migrations not implemented yet"

migrate-down: ## Run database migrations down
	@echo "Database migrations not implemented yet"

.DEFAULT_GOAL := help
