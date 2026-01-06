import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  setAuthToken: (token: string) => ipcRenderer.invoke('set-auth-token', token),
  clearAuthToken: () => ipcRenderer.invoke('clear-auth-token'),
  oauthGoogle: () => ipcRenderer.invoke('oauth-google'),
  oauthGitHub: () => ipcRenderer.invoke('oauth-github'),
  getUserInfo: (accessToken: string, provider: string) => 
    ipcRenderer.invoke('get-user-info', accessToken, provider),
});
