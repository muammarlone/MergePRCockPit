#!/usr/bin/env bash
# Merge Cockpit - Build Production Installers
# This script builds platform-specific installers for distribution

set -e

echo "🔨 Building Merge Cockpit for distribution..."
echo ""

# Check prerequisites
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found. Please install Node.js v18+"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm not found."
  exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf build dist

# Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build React app
echo "Building React application..."
npm run build

# Build installers
echo "Building platform-specific installers..."
echo "  - Creating Windows setup (NSIS)"
echo "  - Creating portable executable"
npm run dist

echo ""
echo "✅ Build complete!"
echo ""
echo "Distribution files created in dist/ directory:"
ls -lh dist/ | tail -n +2

echo ""
echo "Next steps:"
echo "  Windows: dist/Merge Cockpit Setup 1.0.0.exe"
echo "  macOS:   dist/Merge Cockpit-1.0.0.dmg (if on macOS)"
echo "  Linux:   dist/merge-cockpit-1.0.0.AppImage (if on Linux)"
