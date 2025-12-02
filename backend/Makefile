.PHONY: help run build build-frontend build-full test clean dev

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Run the application
	go run .

build: ## Build the backend only
	go build -o bin/api .

build-win: ## Build the backend only
	GOOS=windows GOARCH=amd64 go build -ldflags  "-s -w" -gcflags="all=-N -l" -o bin/xserver.exe .

build-frontend: ## Build the frontend
	@echo "Building frontend..."
	cd ../frontend && npm run build
	@echo "Copying frontend dist to backend..."
	rm -rf frontend/dist
	mkdir -p frontend
	cp -r ../frontend/dist frontend/

build-full: build-frontend build ## Build frontend and backend (full application with embedded static files)

dev: ## Run the application in development mode with hot reload
	air

test: ## Run tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

clean: ## Clean build artifacts
	rm -rf bin/
	rm -rf frontend/dist/
	rm -f coverage.out coverage.html

deps: ## Download dependencies
	go mod download
	go mod tidy

migrate-up: ## Run database migrations up
	@echo "Database migrations not implemented yet"

migrate-down: ## Run database migrations down
	@echo "Database migrations not implemented yet"

.DEFAULT_GOAL := help
