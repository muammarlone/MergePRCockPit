# Merge Cockpit - Git PR Management Tool

A modern, elegant desktop application for managing GitHub pull requests with complete visibility and streamlined workflow automation.

## Features

✨ **Complete PR Visibility**
- Real-time PR dashboard with filtering and sorting
- Detailed PR view with reviews, checks, and comments
- Author and reviewer information at a glance

🚀 **Workflow Automation**
- One-click PR merging with customizable merge strategies
- Batch operations and smart filtering
- Quick access to PR URLs and repository links

🔄 **Smart Integration**
- Direct GitHub API integration with OAuth
- Real-time status updates
- Review tracking and progress visibility

💻 **Desktop-First Experience**
- Native Electron app for Windows, macOS, and Linux
- Offline-capable with sync
- System notifications for PR updates

## Requirements

- **Node.js** v18 or higher
- **npm** v8 or higher
- **GitHub Personal Access Token** (with `repo` and `workflow` scopes)

## Quick Start

### Installation

```bash
# Extract the installer
unzip merge-cockpit-installer.zip
cd merge-cockpit-installer

# Run the installer
bash install.sh  # macOS/Linux
# or
npm install      # Windows/Manual
```

### Configuration

1. Edit `.env` file with your GitHub credentials:
```env
GITHUB_TOKEN=your_github_personal_access_token_here
REACT_APP_GITHUB_CLIENT_ID=your_oauth_client_id
```

2. Get a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Create new token with `repo` scope
   - Copy and paste into `.env`

### Running the App

**Development Mode:**
```bash
npm run dev
```

**Desktop App (Electron):**
```bash
npm run desktop
```

**Build Installers:**
```bash
npm run dist
```

## Project Structure

```
merge-cockpit-installer/
├── src/
│   ├── main.js                 # Electron main process
│   ├── preload.js              # IPC bridge
│   ├── App.js                  # React root component
│   ├── index.js                # React entry point
│   ├── services/
│   │   └── github.js           # GitHub API integration
│   └── components/
│       ├── Dashboard.js        # PR filters & stats
│       ├── PRList.js           # PR listing
│       ├── PRDetails.js        # Detailed PR view
│       └── RepositorySelector.js # Repository picker
├── public/
│   └── index.html              # HTML entry point
├── package.json                # Dependencies
├── install.sh                  # Installation script
└── .env.example                # Environment template
```

## Architecture

### Frontend (React)
- **Components**: Modular, self-contained UI elements
- **State Management**: React hooks with IPC communication
- **Styling**: CSS modules for isolated styles
- **Real-time Updates**: Auto-refresh with configurable intervals

### Backend (Node.js/Electron)
- **IPC Handlers**: Secure inter-process communication
- **GitHub API**: Octokit integration for all GitHub operations
- **Data Flow**: Service-based architecture

### Data Flow
```
React Components → IPC → Main Process → GitHub Service → GitHub API
                                      ↓
                            Response Data
```

## Features in Detail

### Repository Selection
- Enter owner and repository name
- Loads all open pull requests
- Persists selection for quick access

### PR Dashboard
- Filter by state (open/closed)
- Sort by updated, created, or comments
- Real-time PR count
- Review statistics

### PR List
- Author and date information
- Addition/deletion metrics
- Review status indicators
- Click to view details

### PR Details
- Full description and metadata
- Review status with reviewer details
- Change statistics (files, additions, deletions)
- Build/check status
- One-click merge

## Development

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server + electron |
| `npm run start` | Start React dev server |
| `npm run desktop` | Run Electron app |
| `npm run build` | Build React production bundle |
| `npm run dist` | Create distributable installers |
| `npm test` | Run test suite |

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `GITHUB_TOKEN` | GitHub API authentication | `ghp_xxxx...` |
| `REACT_APP_GITHUB_CLIENT_ID` | OAuth client ID | `Xxxxxx` |
| `REACT_APP_GITHUB_CLIENT_SECRET` | OAuth secret | `Xxxxxx` |
| `REACT_APP_ENABLE_AUTO_SYNC` | Enable background sync | `true` |
| `REACT_APP_SYNC_INTERVAL_MS` | Sync interval (ms) | `30000` |
| `REACT_APP_OLLAMA_ENABLED` | Enable local LLM | `false` |
| `REACT_APP_OLLAMA_URL` | Ollama server URL | `http://localhost:11434` |

## Building for Distribution

### Windows
```bash
npm run dist
# Creates: dist/Merge Cockpit Setup 1.0.0.exe
```

### macOS
```bash
npm run dist
# Creates: dist/Merge Cockpit-1.0.0.dmg
```

### Linux
```bash
npm run dist
# Creates: dist/merge-cockpit-1.0.0.AppImage
```

## Troubleshooting

### Node.js Not Found
- Install from https://nodejs.org (v18+)
- Verify: `node --version`

### GitHub Token Issues
- Token must have `repo` scope
- Check expiration at https://github.com/settings/tokens
- Regenerate if needed

### PRs Not Loading
- Verify GitHub token in `.env`
- Check internet connection
- Review GitHub API rate limits
- Check browser console for errors

### Build Failures
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js v18+

## Performance

- **PR Listing Load**: ~500ms (typical)
- **PR Details Load**: ~1s (with reviews & checks)
- **Merge Operation**: ~2s (typical)
- **Refresh Cycle**: 30s (default, configurable)

## Security

- ✅ GitHub token stored in local `.env` file
- ✅ IPC communication with context isolation
- ✅ No external telemetry or tracking
- ✅ All API calls direct to GitHub
- ⚠️ Keep `.env` file private and secure

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create Pull Request

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## Roadmap

- [ ] Multi-account support
- [ ] PR templates and drafts
- [ ] Automated labeling with ML
- [ ] Integration with CI/CD
- [ ] Team collaboration features
- [ ] Custom notification rules
- [ ] PR analytics dashboard
- [ ] Dark mode theme

---

**Made with ❤️ for developers who care about PR hygiene**
