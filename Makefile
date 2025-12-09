.PHONY: help build-siamak clean-siamak

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build-siamak: ## Build Windows backend with embedded www, copy sage-app files, and create deployment zip
	@echo "=== Starting build-siamak process ==="
	@echo ""
	@echo "[1/5] Building frontend and copying to backend/www..."
	@SAVED_PWD=$$(pwd); cd sage-app/frontend && npm run build; cd $$SAVED_PWD
	@mkdir -p backend/www
	@rm -rf backend/www/*
	@cp -r sage-app/frontend/dist/* backend/www/
	@echo "✓ Frontend built and copied to backend/www successfully"
	@echo ""
	@echo "[2/5] Building Windows backend with embedded www directory..."
	@SAVED_PWD=$$(pwd); cd backend && make build-win-prod; cd $$SAVED_PWD
	@echo "✓ Windows backend with embedded www built successfully"
	@echo ""
	@echo "[3/5] Copying sage-app/x to backend/bin/x..."
	@mkdir -p backend/bin
	@rm -rf backend/bin/x
	@cp -r sage-app/x backend/bin/x
	@echo "✓ sage-app/x copied successfully"
	@echo ""
	@echo "[4/5] Creating deployment zip file..."
	@SAVED_PWD=$$(pwd); cd backend/bin && zip -r -q xpanel-build.zip xserver.exe x; cd $$SAVED_PWD
	@echo "✓ Deployment zip created: backend/bin/xpanel-build.zip"
	@echo ""
	@echo "=== build-siamak completed successfully ==="
	@ls -lh backend/bin/xpanel-build.zip
	@echo "[5/5] Upload the deployment file to S3 servers..."
	bun s3.ts
	@echo "=== upload successfully ==="

clean-siamak: ## Clean build artifacts created by build-siamak
	@echo "Cleaning build artifacts..."
	rm -rf backend/bin/x
	rm -rf backend/www
	rm -f backend/bin/xpanel-build.zip
	@echo "✓ Cleanup completed"

.DEFAULT_GOAL := help
