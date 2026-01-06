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

### OAuth Setup (Required for Authentication)

MergePR Cockpit supports OAuth 2.0 authentication with Google and GitHub. Follow these steps to configure OAuth providers:

#### Google OAuth Setup

1. **Create OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select an existing one
   - Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   
2. **Configure OAuth Consent Screen**
   - Go to "OAuth consent screen"
   - Select "External" user type
   - Fill in application name: "MergePR Cockpit"
   - Add scopes: `openid`, `profile`, `email`
   - Save and continue

3. **Create OAuth Client ID**
   - Application type: "Desktop app"
   - Name: "MergePR Cockpit"
   - Click "Create"
   
4. **Configure Redirect URI**
   - Add authorized redirect URI: `http://localhost:3000/oauth/callback`
   - Save changes

5. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Keep these secure - never commit them to source control

#### GitHub OAuth Setup

1. **Register OAuth App**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the form:
     - Application name: "MergePR Cockpit"
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/oauth/callback`
   - Click "Register application"

2. **Generate Client Secret**
   - Click "Generate a new client secret"
   - Copy the client secret immediately (it won't be shown again)

3. **Copy Credentials**
   - Copy the Client ID
   - Keep both Client ID and Client Secret secure

#### Configure Environment Variables

Create a `.env` file in the application root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your OAuth credentials:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth App Credentials
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Ollama Configuration (Optional)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Important Security Notes:**
- Never commit `.env` file to version control (it's in `.gitignore`)
- Keep your client secrets secure
- Rotate credentials if they are ever exposed
- For production deployments, use environment-specific credentials

#### Testing OAuth Configuration

1. Start the application:
   ```bash
   npm start
   ```

2. Click "Sign in with Google" or "Sign in with GitHub"
3. You should see an OAuth consent screen
4. After authorizing, you'll be redirected back to the application
5. Check the developer console for any errors

#### Fallback Mode

If OAuth is not configured, the application will fall back to a mock authentication mode for development/testing purposes. This mode:
- Allows login without real OAuth providers
- Creates mock user sessions
- Useful for development without OAuth setup
- **Not suitable for production use**

### Ollama Setup (For AI Features)

AI-powered features require Ollama to be installed and running locally.

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

## Screenshots and Visual Guide

This section provides visual guidance for installation, configuration, and usage.

### Installation Screenshots

#### Windows Installation

**Step 1: Download Installer**
<!-- TODO: Add screenshot of Windows installer download -->
- Locate the `.exe` installer in the release folder
- File name: `MergePR Cockpit Setup X.X.X.exe`

**Step 2: Windows SmartScreen**
<!-- TODO: Add screenshot of SmartScreen warning -->
- If prompted, click "More info" then "Run anyway"
- This is normal for new applications

**Step 3: Installation Wizard**
<!-- TODO: Add screenshot of installation wizard -->
- Accept license agreement
- Choose installation directory
- Select Start Menu folder
- Create desktop shortcut (optional)

**Step 4: Completed Installation**
<!-- TODO: Add screenshot of successful installation -->
- Application installed successfully
- Ready to launch

#### macOS Installation

**Step 1: Open DMG**
<!-- TODO: Add screenshot of DMG window -->
- Double-click the `.dmg` file
- Finder window opens with application

**Step 2: Drag to Applications**
<!-- TODO: Add screenshot of drag-and-drop -->
- Drag "MergePR Cockpit" icon to Applications folder
- Wait for copy to complete

**Step 3: Gatekeeper Prompt**
<!-- TODO: Add screenshot of Gatekeeper dialog -->
- Right-click app → Open
- Click "Open" in the Gatekeeper dialog

**Step 4: Application Running**
<!-- TODO: Add screenshot of app on macOS -->
- Application successfully launched

#### Linux Installation

**AppImage Method**
<!-- TODO: Add screenshot of AppImage execution -->
```bash
chmod +x MergePR-Cockpit-*.AppImage
./MergePR-Cockpit-*.AppImage
```

**DEB Package Method**
<!-- TODO: Add screenshot of terminal installation -->
```bash
sudo dpkg -i mergeprcockpit_*.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### OAuth Configuration Screenshots

#### Google OAuth Setup

**Step 1: Google Cloud Console**
<!-- TODO: Add screenshot of Google Cloud Console credentials page -->
- Navigate to APIs & Services → Credentials
- Click "Create Credentials" → "OAuth 2.0 Client ID"

**Step 2: OAuth Consent Screen**
<!-- TODO: Add screenshot of consent screen configuration -->
- Configure application name and details
- Add required scopes

**Step 3: Create Client ID**
<!-- TODO: Add screenshot of client ID creation -->
- Select "Desktop app" as application type
- Note down Client ID and Client Secret

#### GitHub OAuth Setup

**Step 1: GitHub Developer Settings**
<!-- TODO: Add screenshot of GitHub OAuth Apps page -->
- Go to Settings → Developer settings → OAuth Apps
- Click "New OAuth App"

**Step 2: Register Application**
<!-- TODO: Add screenshot of OAuth app registration form -->
- Fill in application details
- Set callback URL to `http://localhost:3000/oauth/callback`

**Step 3: Client Credentials**
<!-- TODO: Add screenshot of client ID and secret -->
- Copy Client ID
- Generate and copy Client Secret

### Application Usage Screenshots

#### Login Screen

**Main Login Interface**
<!-- TODO: Add screenshot of login screen -->
- Google OAuth button
- GitHub OAuth button
- Email/Password form
- All authentication options available

**OAuth Flow**
<!-- TODO: Add screenshot of OAuth consent screen -->
- User authorizes application
- Redirected back to MergePR Cockpit
- Logged in successfully

#### Main Dashboard

**Repository Selection**
<!-- TODO: Add screenshot of repository selector -->
- Enter GitHub username or organization
- Select repository from dropdown
- Load pull requests

**Pull Request List**
<!-- TODO: Add screenshot of PR list view -->
- View all open/closed/merged PRs
- Filter and sort options
- Click to view details

#### Pull Request Details

**PR Detail View**
<!-- TODO: Add screenshot of PR detail page -->
- PR metadata and description
- File changes summary
- Merge options

**AI Analysis**
<!-- TODO: Add screenshot of Ollama analysis results -->
- Risk assessment
- Suggested reviewers
- Potential issues
- Remediation suggestions

#### Analytics Dashboard

**Repository Metrics**
<!-- TODO: Add screenshot of analytics view -->
- PR statistics
- Merge time charts
- Conflict trends
- Activity graphs

### Troubleshooting Screenshots

#### Common Error Messages

**OAuth Configuration Error**
<!-- TODO: Add screenshot of OAuth error -->
- Missing or invalid credentials
- Check .env file configuration

**GitHub API Rate Limit**
<!-- TODO: Add screenshot of rate limit message -->
- 60 requests/hour limit reached
- Wait or configure authentication

**Ollama Connection Error**
<!-- TODO: Add screenshot of Ollama offline message -->
- Ollama service not running
- Start Ollama with `ollama serve`

### Video Tutorials (Future)

Future releases will include video tutorials for:
- Complete installation walkthrough
- OAuth setup guide
- First-time user onboarding
- Advanced features demonstration

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
