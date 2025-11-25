#!/bin/bash

# Script to rename the default branch to 'main'
# This script helps automate the process of renaming the default branch

set -e

echo "=== Renaming Default Branch to 'main' ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Fetch all branches
echo "Step 1: Fetching latest changes from remote..."
git fetch origin

# Step 2: Find current default branch
echo
echo "Step 2: Identifying current default branch..."
CURRENT_DEFAULT=$(git remote show origin | grep 'HEAD branch' | cut -d' ' -f5)
echo "Current default branch: ${YELLOW}${CURRENT_DEFAULT}${NC}"

# Step 3: Check if main already exists
if git show-ref --verify --quiet refs/heads/main; then
    echo
    echo -e "${YELLOW}Warning: 'main' branch already exists locally${NC}"
    read -p "Do you want to delete it and recreate from ${CURRENT_DEFAULT}? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D main
    else
        echo "Aborting..."
        exit 1
    fi
fi

# Step 4: Create main branch from current default
echo
echo "Step 3: Creating 'main' branch from '${CURRENT_DEFAULT}'..."
git checkout -b main origin/${CURRENT_DEFAULT}

# Step 5: Provide instructions for GitHub settings
echo
echo -e "${GREEN}✓ Local 'main' branch created successfully!${NC}"
echo
echo "=== MANUAL STEPS REQUIRED ==="
echo
echo "To complete the process, please follow these steps:"
echo
echo "1. Go to your GitHub repository settings:"
echo "   https://github.com/taheri24/xpanel/settings/branches"
echo
echo "2. In the 'Default branch' section, click the switch icon"
echo
echo "3. Select 'main' from the dropdown and confirm the change"
echo
echo "4. After changing the default branch on GitHub, run:"
echo "   ${YELLOW}git push origin main${NC}"
echo
echo "5. Once confirmed working, you can delete the old default branch:"
echo "   ${YELLOW}git push origin --delete ${CURRENT_DEFAULT}${NC}"
echo
echo "6. Update your local repository:"
echo "   ${YELLOW}git remote set-head origin main${NC}"
echo
echo -e "${GREEN}Done!${NC} Your default branch will be 'main'"
echo
