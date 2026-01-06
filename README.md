# Merge Cockpit – Installer Bundle

## Quick Install
```bash
unzip merge-cockpit-installer.zip
cd merge-cockpit-installer
./install.sh
```

## First Run
1. Edit `.env` with GitHub OAuth credentials
2. Start the app:
```bash
npm run desktop
```

## Build Windows setup.exe (on Windows)
```powershell
npm run dist
```

## Requirements
- Node.js v18+
- Internet for GitHub OAuth
- (Optional) Ollama running at http://localhost:11434
