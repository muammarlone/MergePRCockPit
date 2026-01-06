# MergePR Cockpit - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying MergePR Cockpit on Windows, macOS, and Linux platforms.

## Prerequisites

### For Building from Source
- Node.js 20.x or higher
- npm 10.x or higher
- Git
- Platform-specific build tools (detailed below)

### For End Users
- No prerequisites - installers are self-contained

## Building the Application

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/muammarlone/MergePRCockPit.git
cd MergePRCockPit

# Install dependencies
npm install

# Verify installation
npm test
```

### 2. Build for Development

```bash
# Start development server
npm start

# This will:
# - Start React dev server on port 3000
# - Launch Electron application
# - Enable hot reload
```

### 3. Build for Production

```bash
# Build all components
npm run build

# This creates:
# - dist/renderer/ - React application
# - dist/electron/ - Electron main process
```

### 4. Create Installers

#### All Platforms
```bash
npm run build:all
```

#### Windows Only
```bash
npm run build:win
```

#### macOS Only
```bash
npm run build:mac
```

#### Linux Only
```bash
npm run build:linux
```

Installers will be created in the `release/` directory.

## Platform-Specific Installation

### Windows Installation

#### Building on Windows

**Prerequisites**:
- Windows 10 or later
- Node.js 20.x+
- Visual Studio Build Tools (or Visual Studio with C++ support)

**Build Steps**:
```powershell
# Install dependencies
npm install

# Build Windows installer
npm run build:win
```

**Output**: `release/MergePR Cockpit Setup X.X.X.exe`

#### Installing on Windows

1. **Download the Installer**
   - Locate `MergePR Cockpit Setup.exe` in the release folder
   
2. **Run the Installer**
   - Double-click the installer
   - Windows SmartScreen may appear - click "More info" then "Run anyway"
   
3. **Installation Wizard**
   - Accept the license agreement
   - Choose installation directory (default: `C:\Program Files\MergePR Cockpit`)
   - Select Start Menu folder
   - Choose whether to create desktop shortcut
   - Click "Install"

4. **First Launch**
   - Launch from Start Menu or desktop shortcut
   - Windows Firewall may prompt - allow access

5. **Uninstall**
   - Use Windows "Add or Remove Programs"
   - Or run uninstaller from installation directory

### macOS Installation

#### Building on macOS

**Prerequisites**:
- macOS 10.15 (Catalina) or later
- Xcode Command Line Tools: `xcode-select --install`
- Node.js 20.x+

**Build Steps**:
```bash
# Install dependencies
npm install

# Build macOS DMG
npm run build:mac
```

**Output**: `release/MergePR Cockpit-X.X.X.dmg`

#### Installing on macOS

1. **Download the DMG**
   - Locate the `.dmg` file in the release folder

2. **Open the DMG**
   - Double-click the DMG file
   - A Finder window will open

3. **Install the Application**
   - Drag "MergePR Cockpit" to the Applications folder
   - Eject the DMG

4. **First Launch**
   - Open Applications folder
   - Right-click "MergePR Cockpit" and select "Open"
   - macOS Gatekeeper will prompt - click "Open"
   - This is only needed on first launch

5. **Uninstall**
   - Drag "MergePR Cockpit" from Applications to Trash
   - Empty Trash

### Linux Installation

#### Building on Linux

**Prerequisites**:
- Ubuntu 20.04+ / Debian 11+ / Fedora 35+ / Other modern distributions
- Node.js 20.x+
- Build essentials: `sudo apt-get install build-essential`

**Build Steps**:
```bash
# Install dependencies
npm install

# Build Linux packages
npm run build:linux
```

**Output**: 
- `release/MergePR Cockpit-X.X.X.AppImage`
- `release/mergeprcockpit_X.X.X_amd64.deb`

#### Installing on Linux

**AppImage (All Distributions)**:

1. **Download AppImage**
   - Locate the `.AppImage` file

2. **Make Executable**
   ```bash
   chmod +x MergePR-Cockpit-*.AppImage
   ```

3. **Run**
   ```bash
   ./MergePR-Cockpit-*.AppImage
   ```

4. **Optional: Integrate with System**
   - First run will offer to integrate with your desktop environment
   - Creates menu entry and file associations

**DEB Package (Debian/Ubuntu)**:

1. **Install Package**
   ```bash
   sudo dpkg -i mergeprcockpit_*.deb
   
   # If dependencies are missing:
   sudo apt-get install -f
   ```

2. **Launch**
   - From application menu
   - Or run `mergeprcockpit` in terminal

3. **Uninstall**
   ```bash
   sudo apt-get remove mergeprcockpit
   ```

## Configuration

### Environment Variables

Create a `.env` file in the application directory (optional):

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# GitHub Configuration (for future OAuth)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Google OAuth (for future)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Ollama Setup (For AI Features)

1. **Install Ollama**
   - Visit https://ollama.ai
   - Download for your platform
   - Install following platform instructions

2. **Install AI Model**
   ```bash
   ollama pull llama2
   ```

3. **Verify Installation**
   ```bash
   ollama list
   ```

4. **Start Ollama** (if not running)
   ```bash
   ollama serve
   ```

5. **Test in MergePR Cockpit**
   - Open any PR detail view
   - AI analysis should load automatically
   - If unavailable, a fallback message appears

## Troubleshooting

### Common Issues

#### Windows

**Issue**: "Windows protected your PC" message
- **Solution**: Click "More info" → "Run anyway"

**Issue**: Application won't start
- **Solution**: Check Windows Event Viewer for errors
- Ensure Visual C++ Redistributable is installed

**Issue**: Blank white screen
- **Solution**: Clear app data at `%APPDATA%\merge-pr-cockpit`

#### macOS

**Issue**: "App can't be opened because it is from an unidentified developer"
- **Solution**: Right-click app → "Open" → Click "Open" in dialog

**Issue**: Application crashes on startup
- **Solution**: Check Console app for crash logs
- Remove app preferences: `~/Library/Application Support/merge-pr-cockpit`

**Issue**: Notarization issues
- **Solution**: Ensure app is properly signed (for distribution)

#### Linux

**Issue**: AppImage won't run
- **Solution**: Ensure FUSE is installed: `sudo apt-get install fuse`
- Make executable: `chmod +x *.AppImage`

**Issue**: Missing dependencies
- **Solution**: Install missing libraries:
  ```bash
  sudo apt-get install libgtk-3-0 libnotify4 libnss3 \
    libxss1 libxtst6 xdg-utils libatspi2.0-0 libsecret-1-0
  ```

**Issue**: Cannot connect to GitHub
- **Solution**: Check network/proxy settings

### Application Issues

#### Authentication Issues

**Problem**: Cannot log in with Google/GitHub
- **Current Status**: OAuth providers are simulated in this version
- **Solution**: Use the login flow which will create a session
- **Future**: Real OAuth integration requires client credentials

**Problem**: Session expires immediately
- **Solution**: Check system clock is correct
- Clear application data and re-authenticate

#### GitHub Integration Issues

**Problem**: Cannot load repositories
- **Solution**: 
  - Verify GitHub username is correct
  - Check internet connection
  - GitHub may rate-limit unauthenticated requests

**Problem**: API rate limit reached
- **Solution**: 
  - Wait for rate limit reset (1 hour)
  - Use GitHub authentication (future enhancement)
  - Current limit: 60 requests/hour unauthenticated

#### Ollama Integration Issues

**Problem**: AI analysis shows fallback message
- **Solution**:
  - Verify Ollama is installed and running
  - Check Ollama is accessible at http://localhost:11434
  - Run `ollama serve` to start the service

**Problem**: Analysis is very slow
- **Solution**:
  - Large models take time to process
  - Consider using a smaller model
  - Ensure adequate RAM (8GB+ recommended)

## Performance Tuning

### System Requirements

**Minimum**:
- 4GB RAM
- Dual-core processor
- 200MB disk space

**Recommended**:
- 8GB RAM
- Quad-core processor
- 500MB disk space
- SSD storage

**For Ollama AI**:
- Additional 4GB RAM
- 10GB disk space for models

### Optimization Tips

1. **Reduce PR List Size**: Filter to show only recent PRs
2. **Disable AI Analysis**: Skip Ollama for faster PR loading
3. **Close Unused Tabs**: Keep only necessary tabs open
4. **Clear Cache**: Periodically clear application cache

## Security Best Practices

### Production Deployment

1. **Use HTTPS**: Always access GitHub over HTTPS
2. **Keep Updated**: Regularly update to latest version
3. **Token Security**: Never share authentication tokens
4. **Network Security**: Use behind corporate firewall if needed
5. **Access Control**: Limit who can install/use the application

### Data Privacy

- Authentication tokens stored locally encrypted
- No data sent to external servers (except GitHub/Ollama)
- All communication over encrypted channels
- No telemetry or tracking

## Updating the Application

### Auto-Update (Future Feature)

Auto-update will be implemented in a future version.

### Manual Update

1. **Download New Version**: Get latest installer
2. **Backup Data**: Application data preserved automatically
3. **Install**: Run new installer (overwrites old version)
4. **Verify**: Launch and test functionality

## Rollback

If issues occur after update:

1. **Uninstall Current Version**
2. **Install Previous Version**: From archived installers
3. **Restore Data**: From backup if needed

## Logs and Debugging

### Log Locations

**Windows**: `%APPDATA%\merge-pr-cockpit\logs`
**macOS**: `~/Library/Logs/merge-pr-cockpit`
**Linux**: `~/.config/merge-pr-cockpit/logs`

### Enable Debug Mode

Set environment variable before starting:
```bash
# Windows
set DEBUG=mergePR:*

# macOS/Linux
export DEBUG=mergePR:*
```

### Collect Debug Info

For bug reports, include:
1. Application version
2. Operating system and version
3. Error message or screenshot
4. Log files
5. Steps to reproduce

## Support

### Getting Help

- **GitHub Issues**: https://github.com/muammarlone/MergePRCockPit/issues
- **Documentation**: See README.md and ARCHITECTURE.md
- **Community**: GitHub Discussions (coming soon)

### Reporting Bugs

When reporting bugs, please include:
1. Detailed description
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots if applicable
5. System information
6. Log files

## Appendix

### Build Configuration

The build process is configured in:
- `package.json` - Build scripts and Electron Builder config
- `webpack.renderer.config.js` - React build configuration
- `tsconfig.json` - TypeScript compilation

### Installer Customization

Modify `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.mergeprcockpit.app",
    "productName": "MergePR Cockpit",
    "win": { /* Windows options */ },
    "mac": { /* macOS options */ },
    "linux": { /* Linux options */ }
  }
}
```

### License

See LICENSE file for licensing information.

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
