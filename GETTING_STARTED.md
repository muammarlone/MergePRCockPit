# Getting Started with Merge Cockpit

## 🚀 Quick Start (5 minutes)

### Step 1: Install
```bash
bash install.sh
```

### Step 2: Configure
Edit `.env`:
```env
GITHUB_TOKEN=ghp_your_token_here
```

Get a token from: https://github.com/settings/tokens/new
- Required scopes: `repo`, `workflow`
- Copy and paste into `.env`

### Step 3: Run
```bash
npm run desktop
```

### Step 4: Use
1. Enter repository owner (e.g., `microsoft`)
2. Enter repository name (e.g., `vscode`)
3. Click "Load Repository"
4. Select any PR to see details

---

## 🎯 Common Tasks

### View All Open PRs
1. Dashboard automatically shows open PRs
2. Filter by "Open" state (default)
3. Sort by "Recently Updated"

### Check PR Details
1. Click any PR in the list
2. View description, reviews, and status
3. See file changes and additions/deletions

### Merge a PR
1. Open the PR details
2. Click "Merge PR" button
3. Confirms merge with squash strategy
4. List refreshes automatically

### Filter PRs
**By State:**
- Click "Open" or "Closed" in Dashboard

**By Sort Order:**
- Select from "Sort by" dropdown:
  - Recently Updated
  - Recently Created
  - Most Comments

---

## 📁 Project Structure

### Key Files
- `src/main.js` - Electron app startup
- `src/App.js` - React main component
- `src/services/github.js` - GitHub API calls
- `package.json` - Dependencies and scripts

### Components
- `RepositorySelector` - Pick owner/repo
- `Dashboard` - Filters and stats
- `PRList` - List of pull requests
- `PRDetails` - Full PR information

---

## ⚙️ Configuration Options

### GitHub API
```env
# Required
GITHUB_TOKEN=ghp_xxxx...

# Optional OAuth
REACT_APP_GITHUB_CLIENT_ID=Xxxxxx
REACT_APP_GITHUB_CLIENT_SECRET=Xxxxxx
```

### Features
```env
# Auto-sync PR list every 30 seconds
REACT_APP_ENABLE_AUTO_SYNC=true
REACT_APP_SYNC_INTERVAL_MS=30000

# Local LLM integration (advanced)
REACT_APP_OLLAMA_ENABLED=false
REACT_APP_OLLAMA_URL=http://localhost:11434
```

### Logging
```env
# Log level: error, warn, info, debug
LOG_LEVEL=info
```

---

## 🐛 Troubleshooting

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org

### "GITHUB_TOKEN not found"
**Solution:** 
1. Create `.env` file
2. Add: `GITHUB_TOKEN=ghp_...`
3. Restart the app

### PRs not loading
**Solution:**
1. Check token has `repo` scope
2. Verify internet connection
3. Check GitHub API status
4. Look at browser console for errors

### "Cannot find module"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Architecture

```
┌─────────────────────────────────────┐
│      Electron Main Process          │
│  (main.js - Window Management)      │
└──────────────┬──────────────────────┘
               │
        ┌──────▼──────────┐
        │   IPC Bridge    │
        │  (preload.js)   │
        └──────┬──────────┘
               │
┌──────────────▼──────────────────────┐
│      React Frontend (Port 3000)     │
│  ┌────────────────────────────────┐ │
│  │  App.js (Root Component)       │ │
│  │  ├─ RepositorySelector         │ │
│  │  ├─ Dashboard                  │ │
│  │  ├─ PRList                     │ │
│  │  └─ PRDetails                  │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   GitHub Service (github.js)        │
│   Uses Octokit library              │
└──────────────┬──────────────────────┘
               │
        ┌──────▼────────────┐
        │  GitHub API v3    │
        │  api.github.com   │
        └───────────────────┘
```

---

## 🔐 Security

### Good Practices
✅ Keep `.env` file private  
✅ Use personal access tokens (not passwords)  
✅ Rotate tokens regularly  
✅ Grant minimum required scopes  

### What's Protected
✅ Context isolation in Electron  
✅ Secure IPC communication  
✅ No tokens logged to console  
✅ No external telemetry  

---

## 📈 Performance Tips

### Faster Loading
- Filter to "Open" PRs only
- Reduce sync interval if many PRs
- Close unused browser dev tools

### API Rate Limits
- GitHub allows 5,000 requests/hour
- Merge Cockpit syncs every 30s by default
- ~120 requests per sync
- **Sufficient for 40+ syncs before rate limit**

---

## 🆘 Getting Help

### Debug Mode
```bash
# Shows detailed logs
npm run dev
```

### Check Logs
```bash
# Linux/macOS
tail -f ~/.local/share/Merge\ Cockpit/logs/main.log

# Windows
%APPDATA%\Merge Cockpit\logs\main.log
```

### Report Issues
1. Open issue on GitHub
2. Include your error message
3. Share OS and Node.js version
4. Attach logs (without tokens!)

---

## 🎓 Learning Resources

### React
- https://react.dev
- https://react.dev/learn

### Electron
- https://www.electronjs.org/docs
- https://www.electronjs.org/docs/tutorial/ipc

### GitHub API
- https://docs.github.com/en/rest
- https://octokit.github.io/rest.js

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Cmd+Q` / `Ctrl+Q` - Quit
- `Cmd+R` / `Ctrl+R` - Refresh PRs
- `F12` - Toggle Developer Tools
- `Cmd+Option+I` / `Ctrl+Shift+I` - Dev Tools

### Hidden Features
- Click PR author to search their profile
- Double-click to open PR in browser
- Drag PR to copy links

### Power User Features
- Batch merge with keyboard
- Custom merge strategies
- PR templates

---

Happy PR reviewing! 🎉
