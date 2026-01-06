import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import Store from 'electron-store';
import { OAuthService } from './oauthService';

let mainWindow: BrowserWindow | null = null;
const store = new Store();
const oauthService = new OAuthService();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'MergePR Cockpit',
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

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

// IPC handlers for authentication and data
ipcMain.handle('get-auth-token', async () => {
  try {
    return store.get('auth_token', null);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
});

ipcMain.handle('set-auth-token', async (_, token: string) => {
  try {
    store.set('auth_token', token);
    return true;
  } catch (error) {
    console.error('Error setting auth token:', error);
    return false;
  }
});

ipcMain.handle('clear-auth-token', async () => {
  try {
    store.delete('auth_token');
    return true;
  } catch (error) {
    console.error('Error clearing auth token:', error);
    return false;
  }
});

// OAuth handlers
ipcMain.handle('oauth-google', async () => {
  try {
    const config = OAuthService.getGoogleConfig();
    
    // Check if credentials are configured
    if (!config.clientId) {
      // Return mock data if OAuth is not configured
      return {
        access_token: 'mock-google-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
      };
    }
    
    return await oauthService.authenticate(config);
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
});

ipcMain.handle('oauth-github', async () => {
  try {
    const config = OAuthService.getGitHubConfig();
    
    // Check if credentials are configured
    if (!config.clientId) {
      // Return mock data if OAuth is not configured
      return {
        access_token: 'mock-github-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
      };
    }
    
    return await oauthService.authenticate(config);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    throw error;
  }
});

// User info handlers
ipcMain.handle('get-user-info', async (_, accessToken: string, provider: string) => {
  try {
    if (provider === 'google') {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    } else if (provider === 'github') {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const data = await response.json();
      return {
        id: data.id.toString(),
        email: data.email,
        name: data.name || data.login,
        picture: data.avatar_url,
      };
    }
    
    throw new Error('Unknown provider');
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
});
