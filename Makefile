.PHONY: help build-siamak clean-siamak

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build-siamak: ## Build Windows backend, copy sage-app files, build frontend, and create deployment zip
	@echo "=== Starting build-siamak process ==="
	@echo ""
	@echo "[1/4] Building Windows backend..."
	@SAVED_PWD=$$(pwd); cd backend && make build-win; cd $$SAVED_PWD
	@echo "✓ Windows backend built successfully"
	@echo ""
	@echo "[2/4] Copying sage-app/x to backend/bin/x..."
	@mkdir -p backend/bin
	@rm -rf backend/bin/x
	@cp -r sage-app/x backend/bin/x
	@echo "✓ sage-app/x copied successfully"
	@echo ""
	@echo "[3/4] Building frontend and copying to backend/bin/www..."
	@SAVED_PWD=$$(pwd); cd sage-app/frontend && npm run build; cd $$SAVED_PWD
	@mkdir -p backend/bin/www
	@rm -rf backend/bin/www/*
	@cp -r sage-app/frontend/dist/* backend/bin/www/
	@echo "✓ Frontend built and copied successfully"
	@echo ""
	@echo "[4/4] Creating deployment zip file..."
	@SAVED_PWD=$$(pwd); cd backend/bin && zip -r -q xpanel-build.zip xserver.exe x www; cd $$SAVED_PWD
	@echo "✓ Deployment zip created: backend/bin/xpanel-build.zip"
	@echo ""
	@echo "=== build-siamak completed successfully ==="
	@ls -lh backend/bin/xpanel-build.zip

clean-siamak: ## Clean build artifacts created by build-siamak
	@echo "Cleaning build artifacts..."
	rm -rf backend/bin/x
	rm -rf backend/bin/www
	rm -f backend/bin/xpanel-build.zip
	@echo "✓ Cleanup completed"

.DEFAULT_GOAL := help
