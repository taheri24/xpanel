#!/bin/bash

# GitHub Token Push Script
# Handles pushing commits to GitHub using GITHUB_TOKEN from environment
# Detects current origin and uses it for authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN is not set${NC}"
    echo "Please export GITHUB_TOKEN in your ~/.bashrc:"
    echo "  export GITHUB_TOKEN='your_token_here'"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ -z "$CURRENT_BRANCH" ]; then
    echo -e "${RED}Error: Could not determine current branch${NC}"
    exit 1
fi

# Get current origin URL
ORIGIN_URL=$(git remote get-url origin)
if [ -z "$ORIGIN_URL" ]; then
    echo -e "${RED}Error: Could not determine origin URL${NC}"
    exit 1
fi

echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
echo -e "${YELLOW}Origin URL: ${ORIGIN_URL}${NC}"

# Parse origin URL to extract repository info
# Handle both HTTPS and SSH formats
if [[ $ORIGIN_URL == https://* ]]; then
    # HTTPS format: https://github.com/username/repo.git
    REPO_PATH=$(echo "$ORIGIN_URL" | sed 's|https://github.com/||' | sed 's|\.git$||')
elif [[ $ORIGIN_URL == git@github.com:* ]]; then
    # SSH format: git@github.com:username/repo.git
    REPO_PATH=$(echo "$ORIGIN_URL" | sed 's|git@github.com:||' | sed 's|\.git$||')
else
    echo -e "${RED}Error: Unsupported origin URL format${NC}"
    exit 1
fi

# Create authenticated HTTPS URL with token
AUTH_URL="https://oauth2:${GITHUB_TOKEN}@github.com/${REPO_PATH}.git"

echo -e "${YELLOW}Pushing to: github.com/${REPO_PATH}${NC}"

# Push to origin with token authentication
if git push -u "$AUTH_URL" "$CURRENT_BRANCH"; then
    echo -e "${GREEN}Successfully pushed to origin${NC}"
else
    echo -e "${RED}Push failed${NC}"
    exit 1
fi
