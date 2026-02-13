#!/bin/bash
# Caddy Manager - Local Release Packager
# Usage: ./create-release.sh v1.0.0

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: No version provided."
    echo "Usage: ./create-release.sh v1.0.0"
    exit 1
fi

echo "📦 Packaging Caddy Manager $VERSION locally..."

# Create releases directory if it doesn't exist
mkdir -p releases

OUTPUT_FILE="releases/caddy-manager-$VERSION.tar.gz"

# Package the project, excluding unnecessary files
tar -czf "$OUTPUT_FILE" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='CaddyServer-backend/node_modules' \
    --exclude='CaddyServer-frontend/node_modules' \
    --exclude='CaddyServer-mobile' \
    --exclude='*.db' \
    --exclude='*.log' \
    --exclude='releases' \
    .

if [ $? -eq 0 ]; then
    echo "✅ Success! Local release package created."
    echo "� File: $OUTPUT_FILE"
    echo "⚖️  Size: $(du -sh "$OUTPUT_FILE" | cut -f1)"
    echo "📦 You can now manually upload this file to GitHub Releases or distribute it."
else
    echo "❌ Error: Failed to create package."
    exit 1
fi
