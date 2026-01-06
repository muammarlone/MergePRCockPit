const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPRs: (owner, repo, filters, token) =>
    ipcRenderer.invoke('get-prs', { owner, repo, filters, token }),
  getPRDetails: (owner, repo, prNumber, token) =>
    ipcRenderer.invoke('get-pr-details', { owner, repo, prNumber, token }),
  updatePR: (owner, repo, prNumber, updates, token) =>
    ipcRenderer.invoke('update-pr', { owner, repo, prNumber, updates, token }),
  getReviewStatus: (owner, repo, prNumber, token) =>
    ipcRenderer.invoke('get-review-status', { owner, repo, prNumber, token }),
  mergePR: (owner, repo, prNumber, mergeMethod, token) =>
    ipcRenderer.invoke('merge-pr', { owner, repo, prNumber, mergeMethod, token }),
  getAIInsights: (owner, repo, prNumber, token) =>
    ipcRenderer.invoke('get-ai-insights', { owner, repo, prNumber, token }),
  getOllamaStatus: () =>
    ipcRenderer.invoke('get-ollama-status'),
  clearOllamaCache: () =>
    ipcRenderer.invoke('clear-ollama-cache'),
  getRepositories: (token) =>
    ipcRenderer.invoke('get-repositories', { token }),
  
  // OAuth methods
  startGitHubOAuth: () =>
    ipcRenderer.invoke('start-github-oauth'),
  startGoogleOAuth: () =>
    ipcRenderer.invoke('start-google-oauth'),
  startLinkedInOAuth: () =>
    ipcRenderer.invoke('start-linkedin-oauth')
});
