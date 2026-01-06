#!/usr/bin/env bash
set -e

echo "========================================"
echo " Merge Cockpit - One-Click Installer"
echo "========================================"
echo ""

OS="$(uname -s)"
if [[ "$OS" == "Linux" || "$OS" == "Darwin" ]]; then
  echo "✅ Detected OS: $OS"
else
  echo "❌ Unsupported OS: $OS"
  echo "   This installer supports Linux and macOS only."
  exit 1
fi

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found."
  echo "   Please install Node.js v18+ from https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js detected: $NODE_VERSION"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm not found."
  echo "   Please ensure npm is installed with Node.js."
  exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm detected: $NPM_VERSION"

# Check source code exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "   Are you in the correct directory?"
  exit 1
fi

echo ""
echo "Installing dependencies..."
npm install

# Create .env from template if it doesn't exist
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Edit .env and add GitHub OAuth credentials before first run."
  else
    echo "⚠️  Warning: .env.example not found. Creating empty .env."
    touch .env
  fi
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure GitHub credentials:"
echo "   Edit .env and add your GITHUB_TOKEN"
echo ""
echo "2. Run the desktop app:"
echo "   npm run desktop"
echo ""
echo "3. Build installers (Windows/Mac/Linux):"
echo "   npm run dist"
echo ""
echo "For more information, visit:"
echo "   https://github.com/yourusername/merge-cockpit"
echo ""
