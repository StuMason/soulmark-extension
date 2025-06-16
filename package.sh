#!/bin/bash

# Soulmark Extension Packaging Script
# This script packages the extension for Chrome Web Store submission

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎯 Soulmark Extension Packager${NC}"
echo "================================"

# Check if jq is installed for JSON parsing
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq not installed. Install with: brew install jq${NC}"
    echo "Continuing without automatic version extraction..."
fi

# Get current version from manifest.json
if command -v jq &> /dev/null; then
    CURRENT_VERSION=$(jq -r '.version' manifest.json)
    echo -e "Current version: ${GREEN}${CURRENT_VERSION}${NC}"
else
    echo "Enter current version manually:"
    read CURRENT_VERSION
fi

# Ask if user wants to bump version
echo -e "\nDo you want to bump the version? (y/n)"
read -r BUMP_VERSION

if [[ $BUMP_VERSION == "y" || $BUMP_VERSION == "Y" ]]; then
    echo "Current version: $CURRENT_VERSION"
    echo "Enter new version (e.g., 1.0.2):"
    read NEW_VERSION
    
    # Update manifest.json with new version
    if command -v jq &> /dev/null; then
        jq ".version = \"$NEW_VERSION\"" manifest.json > manifest.tmp && mv manifest.tmp manifest.json
        echo -e "${GREEN}✓ Updated manifest.json to version $NEW_VERSION${NC}"
    else
        echo -e "${YELLOW}Please manually update the version in manifest.json to $NEW_VERSION${NC}"
        echo "Press Enter when done..."
        read
    fi
    
    VERSION=$NEW_VERSION
else
    VERSION=$CURRENT_VERSION
fi

# Clean up old zips
echo -e "\n${YELLOW}Cleaning up old builds...${NC}"
rm -f soulmark-extension-*.zip
rm -rf dist/

# Create dist directory
mkdir -p dist

# Create the zip file
ZIP_NAME="soulmark-extension-v${VERSION}.zip"
echo -e "\n${GREEN}Creating $ZIP_NAME...${NC}"

# List of files and directories to include
FILES_TO_ZIP=(
    "manifest.json"
    "background/"
    "content-scripts/"
    "popup/"
    "options/"
    "styles/"
    "assets/"
    "shared/"
    "config.js"
)

# Create zip, excluding unwanted files
zip -r "$ZIP_NAME" "${FILES_TO_ZIP[@]}" \
    -x "*.DS_Store" \
    -x "*/.DS_Store" \
    -x "*.swp" \
    -x "*~" \
    -x "*.map" \
    -x "*/test/*" \
    -x "*/tests/*" \
    -x "*/__pycache__/*" \
    -x "*.pyc"

# Show package info
echo -e "\n${GREEN}✓ Package created successfully!${NC}"
echo "================================"
echo -e "File: ${GREEN}$ZIP_NAME${NC}"
echo -e "Size: $(ls -lh "$ZIP_NAME" | awk '{print $5}')"
echo -e "\n${YELLOW}Package contents:${NC}"
unzip -l "$ZIP_NAME" | head -20
echo "... (truncated)"

# Move to dist directory
mv "$ZIP_NAME" "dist/"

# Reminder about Chrome Web Store
echo -e "\n${GREEN}Ready to upload to Chrome Web Store!${NC}"
echo "1. Go to https://chrome.google.com/webstore/devconsole"
echo "2. Upload dist/$ZIP_NAME"
echo "3. Submit for review"

echo -e "\n${YELLOW}Package saved to: dist/$ZIP_NAME${NC}"