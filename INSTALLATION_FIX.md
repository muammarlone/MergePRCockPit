# Installation Fix Guide

This document provides solutions to common installation issues for MergePRCockPit.

## Common Issues and Solutions

### 1. Dependency Installation Failures

**Problem:** Package installation fails with dependency conflicts.

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### 2. Python Version Compatibility

**Problem:** Installation fails due to Python version mismatch.

**Solution:**
- Ensure you're using Python 3.8 or higher
- Check your Python version:
```bash
python --version
```
- If needed, use a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Permission Errors

**Problem:** Installation fails with EACCES or permission denied errors.

**Solution:**
```bash
# On Linux/Mac, avoid using sudo with npm
# Instead, configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use nvm (Node Version Manager) - recommended
```

### 4. GitHub API Token Issues

**Problem:** Cannot authenticate with GitHub API.

**Solution:**
1. Generate a new Personal Access Token at https://github.com/settings/tokens
2. Required scopes: `repo`, `workflow`, `read:org`
3. Set the token as an environment variable:
```bash
export GITHUB_TOKEN=your_token_here
```

### 5. Port Already in Use

**Problem:** Application fails to start because port is already in use.

**Solution:**
```bash
# Find and kill the process using the port (example for port 3000)
# On Linux/Mac:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or configure a different port in your .env file
PORT=3001
```

### 6. Environment Variables Not Set

**Problem:** Application fails due to missing environment variables.

**Solution:**
1. Copy the example environment file:
```bash
cp .env.example .env
```
2. Fill in the required values:
```
GITHUB_TOKEN=your_github_token
PORT=3000
NODE_ENV=development
```

### 7. Build Failures

**Problem:** Build process fails with compilation errors.

**Solution:**
```bash
# Clear build cache
npm run clean

# Or manually remove build artifacts
rm -rf dist/ build/ .cache/

# Rebuild
npm run build
```

### 8. Webpack Polyfill Errors

**Problem:** Build fails with "Cannot find module 'buffer'" or similar errors for process, util, stream-browserify, path-browserify, or crypto-browserify.

**Solution:**
These polyfill packages should already be in `package.json` devDependencies. If they're missing or you encounter errors:
```bash
# Install polyfill dependencies
npm install --save-dev buffer process util stream-browserify path-browserify crypto-browserify

# Rebuild
npm run build
```

**Note:** The webpack configuration in `webpack.renderer.config.js` already includes the necessary ProvidePlugin and fallback configurations for these polyfills.

### 9. Electron Security CSP Warning

**Problem:** Electron shows "Insecure Content-Security-Policy" warning with "unsafe-eval" enabled.

**Solution:**
The Content Security Policy in `src/renderer/index.html` has been configured to remove `unsafe-eval` and `unsafe-inline` from script-src while maintaining security. The current CSP configuration:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://github.com https://accounts.google.com https://oauth2.googleapis.com http://localhost:11434; font-src 'self' data:;">
```

**What this allows:**
- Scripts: Only from same origin (no inline or eval)
- Styles: Same origin plus inline styles (needed for React)
- Images: Same origin, data URIs, and HTTPS sources
- Network: GitHub API, Google OAuth, and local Ollama server
- Fonts: Same origin and data URIs

**Verification:**
After building and running the app, check the Electron DevTools console. You should see no CSP warnings.

## Platform-Specific Issues

### Windows
- Use Git Bash or WSL2 for better compatibility
- Some scripts may need `npm run <script>` instead of direct execution

### macOS
- If using Apple Silicon (M1/M2), ensure dependencies support ARM64
- You may need to install Rosetta 2: `softwareupdate --install-rosetta`

### Linux
- Ensure build-essential is installed: `sudo apt-get install build-essential`
- Some distributions may require additional libraries

## Getting Help

If you continue to experience issues:

1. Check existing [GitHub Issues](https://github.com/muammarlone/MergePRCockPit/issues)
2. Create a new issue with:
   - Your operating system and version
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Complete error message
   - Steps to reproduce

## Quick Diagnostic

Run this to check your environment:
```bash
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Python version: $(python --version)"
echo "Git version: $(git --version)"
```

---
*Last updated: 2026-01-11*
