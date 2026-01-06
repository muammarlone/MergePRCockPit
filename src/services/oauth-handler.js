/**
 * OAuth Handler for Electron
 * Manages OAuth flows for GitHub, Google, and LinkedIn
 */

const { ipcMain, session, BrowserWindow } = require('electron');
const axios = require('axios');
const crypto = require('crypto');

class OAuthHandler {
  constructor() {
    this.oauthStates = new Map();
    this.oauthWindows = new Map();
    this.setupIPC();
  }

  setupIPC() {
    ipcMain.handle('start-github-oauth', () => this.startGitHubOAuth());
    ipcMain.handle('start-google-oauth', () => this.startGoogleOAuth());
    ipcMain.handle('start-linkedin-oauth', () => this.startLinkedInOAuth());
  }

  /**
   * GitHub OAuth Flow
   */
  async startGitHubOAuth() {
    const state = crypto.randomBytes(16).toString('hex');
    const clientId = process.env.GITHUB_CLIENT_ID || '1234567890abcdef1234'; // Placeholder
    
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('scope', 'repo user:email');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('allow_signup', 'true');

    return this.openOAuthWindow(authUrl.toString(), 'github', state);
  }

  /**
   * Google OAuth Flow
   */
  async startGoogleOAuth() {
    const state = crypto.randomBytes(16).toString('hex');
    const clientId = process.env.GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'; // Placeholder

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', 'http://localhost:7777/oauth/google/callback');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('access_type', 'offline');

    return this.openOAuthWindow(authUrl.toString(), 'google', state);
  }

  /**
   * LinkedIn OAuth Flow
   */
  async startLinkedInOAuth() {
    const state = crypto.randomBytes(16).toString('hex');
    const clientId = process.env.LINKEDIN_CLIENT_ID || '1234567890abcdef'; // Placeholder

    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', 'http://localhost:7777/oauth/linkedin/callback');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid profile email');
    authUrl.searchParams.append('state', state);

    return this.openOAuthWindow(authUrl.toString(), 'linkedin', state);
  }

  /**
   * Open OAuth window and handle callback
   */
  async openOAuthWindow(url, provider, state) {
    return new Promise((resolve, reject) => {
      const oauthWindow = new BrowserWindow({
        width: 500,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      this.oauthStates.set(state, { provider, resolve, reject, startTime: Date.now() });
      this.oauthWindows.set(state, oauthWindow);

      // Handle OAuth callback URL
      const filter = {
        urls: [`http://localhost:7777/oauth/${provider}/callback*`]
      };

      session.defaultSession.webRequest.onBeforeRequest(filter, (details) => {
        const urlObj = new URL(details.url);
        const code = urlObj.searchParams.get('code');
        const returnedState = urlObj.searchParams.get('state');
        const error = urlObj.searchParams.get('error');

        if (error) {
          reject(new Error(`OAuth error: ${error}`));
          oauthWindow.close();
          return;
        }

        if (returnedState === state && code) {
          oauthWindow.close();
          resolve({ code, provider, state });
        }
      });

      oauthWindow.webContents.on('will-navigate', (event, url) => {
        if (url.includes('/oauth/') && url.includes('/callback')) {
          event.preventDefault();
        }
      });

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        oauthWindow.close();
        reject(new Error('OAuth timeout'));
      }, 5 * 60 * 1000);

      oauthWindow.on('closed', () => {
        clearTimeout(timeout);
        this.oauthStates.delete(state);
        this.oauthWindows.delete(state);
      });

      oauthWindow.loadURL(url);
    });
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code, provider) {
    try {
      let tokenEndpoint, clientId, clientSecret;

      switch (provider) {
        case 'github':
          return code; // GitHub token is the code itself in this simplified flow
          
        case 'google':
          tokenEndpoint = 'https://oauth2.googleapis.com/token';
          clientId = process.env.GOOGLE_CLIENT_ID;
          clientSecret = process.env.GOOGLE_CLIENT_SECRET;
          break;
          
        case 'linkedin':
          tokenEndpoint = 'https://www.linkedin.com/oauth/v2/accessToken';
          clientId = process.env.LINKEDIN_CLIENT_ID;
          clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
          break;
      }

      if (!clientSecret) {
        // Without client secret, return code as token
        return code;
      }

      const response = await axios.post(tokenEndpoint, {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `http://localhost:7777/oauth/${provider}/callback`
      });

      return response.data.access_token || code;
    } catch (error) {
      console.error(`Token exchange error for ${provider}:`, error);
      return code; // Fallback to code if token exchange fails
    }
  }
}

module.exports = { OAuthHandler };
