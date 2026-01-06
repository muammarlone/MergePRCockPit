import { BrowserWindow } from 'electron';

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scope: string[];
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export class OAuthService {
  private authWindow: BrowserWindow | null = null;

  /**
   * Initiates OAuth flow by opening a browser window
   */
  async authenticate(config: OAuthConfig): Promise<OAuthTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.buildAuthUrl(config);
      
      this.authWindow = new BrowserWindow({
        width: 500,
        height: 700,
        show: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      this.authWindow.loadURL(authUrl);

      // Handle navigation to redirect URI
      this.authWindow.webContents.on('will-redirect', async (event, url) => {
        await this.handleCallback(url, config, resolve, reject);
      });

      // Handle successful navigation (some providers use navigation instead of redirect)
      this.authWindow.webContents.on('did-navigate', async (event, url) => {
        await this.handleCallback(url, config, resolve, reject);
      });

      // Handle window close
      this.authWindow.on('closed', () => {
        this.authWindow = null;
        reject(new Error('OAuth window was closed by user'));
      });
    });
  }

  private buildAuthUrl(config: OAuthConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope.join(' '),
      state: this.generateState(),
    });

    return `${config.authorizationUrl}?${params.toString()}`;
  }

  private async handleCallback(
    url: string,
    config: OAuthConfig,
    resolve: (value: OAuthTokenResponse) => void,
    reject: (reason: Error) => void
  ): Promise<void> {
    if (url.startsWith(config.redirectUri)) {
      const urlParams = new URL(url);
      const code = urlParams.searchParams.get('code');
      const error = urlParams.searchParams.get('error');

      if (error) {
        this.closeAuthWindow();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (code) {
        try {
          const token = await this.exchangeCodeForToken(code, config);
          this.closeAuthWindow();
          resolve(token);
        } catch (err) {
          this.closeAuthWindow();
          reject(err as Error);
        }
      }
    }
  }

  private async exchangeCodeForToken(
    code: string,
    config: OAuthConfig
  ): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
    });

    if (config.clientSecret) {
      params.append('client_secret', config.clientSecret);
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    return await response.json();
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private closeAuthWindow(): void {
    if (this.authWindow) {
      this.authWindow.close();
      this.authWindow = null;
    }
  }

  /**
   * Get OAuth configuration for Google
   */
  static getGoogleConfig(): OAuthConfig {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    return {
      clientId,
      clientSecret,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      redirectUri: 'http://localhost:3000/oauth/callback',
      scope: ['openid', 'profile', 'email'],
    };
  }

  /**
   * Get OAuth configuration for GitHub
   */
  static getGitHubConfig(): OAuthConfig {
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';

    return {
      clientId,
      clientSecret,
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      redirectUri: 'http://localhost:3000/oauth/callback',
      scope: ['user:email', 'read:user'],
    };
  }
}
