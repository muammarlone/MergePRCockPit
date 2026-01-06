const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_DEV === 'true' || !app.isPackaged;
const { GitHubService } = require('./services/github');
const { OllamaService } = require('./services/ollama');
const { OAuthHandler } = require('./services/oauth-handler');

let mainWindow;
let githubService;
let ollamaService;
let oauthHandler;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  const startUrl = isDev
    ? 'http://localhost:7000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            console.log('Merge Cockpit v1.0.0 - GitHub PR Management Tool');
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// IPC Handlers
ipcMain.handle('get-prs', async (event, { owner, repo, filters, token }) => {
  try {
    const service = new GitHubService(token);
    return await service.getPullRequests(owner, repo, filters);
  } catch (error) {
    console.error('Error fetching PRs:', error);
    throw error;
  }
});

ipcMain.handle('get-pr-details', async (event, { owner, repo, prNumber, token }) => {
  try {
    const service = new GitHubService(token);
    return await service.getPRDetails(owner, repo, prNumber);
  } catch (error) {
    console.error('Error fetching PR details:', error);
    throw error;
  }
});

ipcMain.handle('update-pr', async (event, { owner, repo, prNumber, updates, token }) => {
  try {
    const service = new GitHubService(token);
    return await service.updatePR(owner, repo, prNumber, updates);
  } catch (error) {
    console.error('Error updating PR:', error);
    throw error;
  }
});

ipcMain.handle('get-review-status', async (event, { owner, repo, prNumber, token }) => {
  try {
    const service = new GitHubService(token);
    return await service.getReviewStatus(owner, repo, prNumber);
  } catch (error) {
    console.error('Error fetching review status:', error);
    throw error;
  }
});

ipcMain.handle('merge-pr', async (event, { owner, repo, prNumber, mergeMethod, token }) => {
  try {
    const service = new GitHubService(token);
    return await service.mergePR(owner, repo, prNumber, mergeMethod);
  } catch (error) {
    console.error('Error merging PR:', error);
    throw error;
  }
});

ipcMain.handle('get-ai-insights', async (event, { owner, repo, prNumber, token }) => {
  try {
    // Get PR details for AI analysis
    const service = new GitHubService(token);
    const pr = await service.getPRDetails(owner, repo, prNumber);
    if (!pr) return null;

    // Generate insights in parallel
    const insights = {
      summary: null,
      suggestedTitle: null,
      reviewerSuggestions: null,
      risk: null,
      reviewComments: null,
      commitMessage: null
    };

    // Run all AI operations in parallel
    const [summary, title, reviewers, risk, comments, commit] = await Promise.all([
      ollamaService.generatePRSummary(pr),
      ollamaService.suggestPRTitle(pr.title, pr.body),
      ollamaService.suggestReviewers(pr),
      ollamaService.assessPRRisk(pr),
      ollamaService.generateReviewComments(pr),
      ollamaService.generateCommitMessage(pr.title, pr.body, pr.additions, pr.deletions)
    ]);

    insights.summary = summary;
    insights.suggestedTitle = title;
    insights.reviewerSuggestions = reviewers;
    insights.risk = risk;
    insights.reviewComments = comments;
    insights.commitMessage = commit;

    // Only return insights if at least one was generated
    const hasInsights = Object.values(insights).some(v => v !== null);
    return hasInsights ? insights : null;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return null;
  }
});

ipcMain.handle('get-ollama-status', async () => {
  return await ollamaService.healthCheck();
});

ipcMain.handle('clear-ollama-cache', async () => {
  ollamaService.clearCache();
  return { success: true };
});

ipcMain.handle('get-repositories', async (event, { token }) => {
  try {
    const service = new GitHubService(token);
    return await service.getRepositories();
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
});

app.on('ready', () => {
  require('dotenv').config();
  githubService = new GitHubService(process.env.GITHUB_TOKEN);
  ollamaService = new OllamaService({
    enabled: process.env.REACT_APP_OLLAMA_ENABLED === 'true',
    ollamaUrl: process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434',
    model: process.env.REACT_APP_OLLAMA_MODEL || 'mistral'
  });
  oauthHandler = new OAuthHandler();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

module.exports = { mainWindow };
