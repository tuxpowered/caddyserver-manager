#!/bin/bash
# tag-release.sh - Automate Caddy Manager version updates and git releases
# Usage: ./tag-release.sh 2.0.1

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: No version provided."
    echo "Usage: ./tag-release.sh 2.0.1"
    exit 1
fi

# Normalize version (remove leading v if present)
VERSION="${VERSION#v}"

echo "🚀 Updating Caddy Manager to v$VERSION..."

# 1. Update Backend package.json
sed -i "3s/\"version\": \".*\"/\"version\": \"$VERSION\"/" CaddyServer-backend/package.json

# 2. Update Frontend package.json
sed -i "4s/\"version\": \".*\"/\"version\": \"$VERSION\"/" CaddyServer-frontend/package.json

# 3. Update server.js discovery and status versions
sed -i "s/version: '[0-9.]*',/version: '$VERSION',/g" CaddyServer-backend/server.js

# 4. Update App.jsx build version
# Specific match for the footer version string to avoid corrupting other lines
sed -i "s/>v[0-9.]* Build<\/p>/>v$VERSION Build<\/p>/" CaddyServer-frontend/src/App.jsx

echo "✅ File versions updated to v$VERSION."

# 5. Git Commands
echo "📦 Running Git commands..."
git add .
git commit -m "fix linux build and update to v$VERSION"
git push -u origin main
git tag "v$VERSION"
git push origin "v$VERSION"

echo "🎉 Successfully tagged and pushed v$VERSION!"
