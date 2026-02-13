#!/bin/bash
# Caddy Manager - Release Tagging Utility
# Usage: ./create-release.sh v1.0.0

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: No version provided."
    echo "Usage: ./create-release.sh v1.0.0"
    exit 1
fi

# Ensure version starts with 'v'
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "⚠️ Warning: Version should typically follow vX.Y.Z format (e.g., v1.0.0)"
    read -p "Do you want to proceed with '$VERSION'? (y/n): " PROCEED
    if [[ "$PROCEED" != "y" ]]; then
        exit 1
    fi
fi

echo "🚀 Preparing release $VERSION..."

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "❌ Error: Tag $VERSION already exists."
    exit 1
fi

# Create the tag
echo "🏷 Creating git tag $VERSION..."
if ! git tag -a "$VERSION" -m "Release $VERSION"; then
    echo "❌ Error: Failed to create tag. Make sure your git identity is set."
    exit 1
fi

# Ask if user wants to push
read -p "📡 Push tag to origin now? (y/n): " PUSH_NOW
if [[ "$PUSH_NOW" == "y" ]]; then
    if git push origin "$VERSION"; then
        echo "✅ Success! Version $VERSION has been tagged and pushed."
        echo "📦 GitHub Actions will now build and package the release."
        echo "🔗 View progress at: https://github.com/$(git remote get-url origin | sed -E 's/.*github.com[:\/](.*).git/\1/')/actions"
    else
        echo "❌ Error: Failed to push tag to origin."
        echo "You can try pushing manually: git push origin $VERSION"
        exit 1
    fi
else
    echo "✅ Success! Version $VERSION has been tagged locally."
    echo "👉 To trigger the release, run: git push origin $VERSION"
fi
