/**
 * Authentication Service
 * Handles OAuth authentication with GitHub and Google
 */

class AuthService {
  constructor() {
    this.token = localStorage.getItem('github_token');
    this.authProvider = localStorage.getItem('auth_provider');
    this.user = localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')) : null;
  }

  /**
   * GitHub OAuth flow
   * Opens GitHub authorization in browser
   */
  async authenticateWithGitHub() {
    try {
      // Trigger GitHub OAuth flow
      // In a real app, you'd use an OAuth library or custom redirect
      const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
      const redirectUri = `${window.location.origin}/oauth/github/callback`;
      const scope = 'repo,user';
      const state = this.generateState();

      // Store state for verification
      sessionStorage.setItem('oauth_state', state);

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
      
      // For desktop app, open in browser
      if (window.electronAPI && window.electronAPI.openExternal) {
        await window.electronAPI.openExternal(authUrl);
        // In production, you'd handle the callback via IPC
      } else {
        window.location.href = authUrl;
      }

      return { pending: true, provider: 'github' };
    } catch (error) {
      console.error('GitHub auth error:', error);
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  /**
   * Google OAuth flow
   */
  async authenticateWithGoogle() {
    try {
      // Google OAuth flow
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
      const redirectUri = `${window.location.origin}/oauth/google/callback`;
      const scope = 'openid email profile';
      const state = this.generateState();

      sessionStorage.setItem('oauth_state', state);

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('state', state);

      if (window.electronAPI && window.electronAPI.openExternal) {
        await window.electronAPI.openExternal(authUrl.toString());
      } else {
        window.location.href = authUrl.toString();
      }

      return { pending: true, provider: 'google' };
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Token-based authentication (fallback)
   */
  authenticateWithToken(token) {
    if (!token) {
      throw new Error('Token is required');
    }
    this.token = token;
    this.authProvider = 'token';
    localStorage.setItem('github_token', token);
    localStorage.setItem('auth_provider', 'token');
    return { success: true, provider: 'token' };
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code, state, provider) {
    try {
      // Verify state
      const savedState = sessionStorage.getItem('oauth_state');
      if (state !== savedState) {
        throw new Error('OAuth state mismatch - possible CSRF attack');
      }

      // Exchange code for token via backend
      if (window.electronAPI && window.electronAPI.exchangeOAuthCode) {
        const response = await window.electronAPI.exchangeOAuthCode(code, provider);
        if (response.token) {
          this.token = response.token;
          this.authProvider = provider;
          this.user = response.user || null;

          localStorage.setItem('github_token', response.token);
          localStorage.setItem('auth_provider', provider);
          if (response.user) {
            localStorage.setItem('user_info', JSON.stringify(response.user));
          }

          return { success: true, provider, user: response.user };
        }
      }

      throw new Error(`Failed to obtain token from ${provider}`);
    } catch (error) {
      console.error(`OAuth callback error (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Logout
   */
  logout() {
    this.token = null;
    this.authProvider = null;
    this.user = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('user_info');
    sessionStorage.removeItem('oauth_state');
    return { success: true };
  }

  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get current token
   */
  getToken() {
    return this.token;
  }

  /**
   * Get auth provider
   */
  getProvider() {
    return this.authProvider;
  }

  /**
   * Get user info
   */
  getUser() {
    return this.user;
  }

  /**
   * Refresh token (if needed)
   */
  async refreshToken() {
    if (!this.authProvider) {
      throw new Error('No auth provider set');
    }

    try {
      if (window.electronAPI && window.electronAPI.refreshOAuthToken) {
        const response = await window.electronAPI.refreshOAuthToken(this.authProvider);
        if (response.token) {
          this.token = response.token;
          localStorage.setItem('github_token', response.token);
          return { success: true, token: response.token };
        }
      }
      return { success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Generate random state for OAuth
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export { AuthService };
export default AuthService;
