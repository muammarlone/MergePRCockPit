import { User, AuthToken } from '../types';

const AUTH_STORAGE_KEY = 'mergePR_auth';
const TOKEN_STORAGE_KEY = 'mergePR_token';

class AuthService {
  private user: User | null = null;
  private token: AuthToken | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
      if (storedToken) {
        this.token = JSON.parse(storedToken);
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      if (this.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      
      if (this.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(this.token));
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      // Check if running in Electron with OAuth support
      if (window.electronAPI?.oauthGoogle) {
        const tokenResponse = await window.electronAPI.oauthGoogle();
        
        // Get user info from Google
        let userInfo;
        try {
          userInfo = await window.electronAPI.getUserInfo(
            tokenResponse.access_token,
            'google'
          );
        } catch (error) {
          // Fallback to mock user info if real API fails
          userInfo = {
            id: 'google-' + Date.now(),
            email: 'user@gmail.com',
            name: 'Google User',
          };
        }
        
        const user: User = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
          provider: 'google',
        };
        
        const token: AuthToken = {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
        };
        
        this.user = user;
        this.token = token;
        this.saveToStorage();
        
        return user;
      }
      
      // Fallback to mock implementation for web/testing
      return this.mockGoogleLogin();
    } catch (error) {
      console.error('Google login error:', error);
      // Fallback to mock on error
      return this.mockGoogleLogin();
    }
  }

  private mockGoogleLogin(): Promise<User> {
    return new Promise((resolve) => {
      const mockUser: User = {
        id: 'google-' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        provider: 'google'
      };
      
      const mockToken: AuthToken = {
        accessToken: 'mock-google-token-' + Date.now(),
        expiresAt: Date.now() + 3600000
      };
      
      this.user = mockUser;
      this.token = mockToken;
      this.saveToStorage();
      
      setTimeout(() => resolve(mockUser), 1000);
    });
  }

  async loginWithGitHub(): Promise<User> {
    try {
      // Check if running in Electron with OAuth support
      if (window.electronAPI?.oauthGitHub) {
        const tokenResponse = await window.electronAPI.oauthGitHub();
        
        // Get user info from GitHub
        let userInfo;
        try {
          userInfo = await window.electronAPI.getUserInfo(
            tokenResponse.access_token,
            'github'
          );
        } catch (error) {
          // Fallback to mock user info if real API fails
          userInfo = {
            id: 'github-' + Date.now(),
            email: 'user@github.com',
            name: 'GitHub User',
          };
        }
        
        const user: User = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
          provider: 'github',
        };
        
        const token: AuthToken = {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
        };
        
        this.user = user;
        this.token = token;
        this.saveToStorage();
        
        return user;
      }
      
      // Fallback to mock implementation for web/testing
      return this.mockGitHubLogin();
    } catch (error) {
      console.error('GitHub login error:', error);
      // Fallback to mock on error
      return this.mockGitHubLogin();
    }
  }

  private mockGitHubLogin(): Promise<User> {
    return new Promise((resolve) => {
      const mockUser: User = {
        id: 'github-' + Date.now(),
        email: 'user@github.com',
        name: 'GitHub User',
        provider: 'github'
      };
      
      const mockToken: AuthToken = {
        accessToken: 'mock-github-token-' + Date.now(),
        expiresAt: Date.now() + 3600000
      };
      
      this.user = mockUser;
      this.token = mockToken;
      this.saveToStorage();
      
      setTimeout(() => resolve(mockUser), 1000);
    });
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    // In a real implementation, this would call backend API
    return new Promise((resolve, reject) => {
      if (!email || !password) {
        reject(new Error('Email and password are required'));
        return;
      }
      
      const mockUser: User = {
        id: 'email-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        provider: 'email'
      };
      
      const mockToken: AuthToken = {
        accessToken: 'mock-email-token-' + Date.now(),
        expiresAt: Date.now() + 3600000
      };
      
      this.user = mockUser;
      this.token = mockToken;
      this.saveToStorage();
      
      setTimeout(() => resolve(mockUser), 1000);
    });
  }

  async logout(): Promise<void> {
    this.user = null;
    this.token = null;
    this.saveToStorage();
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): AuthToken | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    if (!this.token) return false;
    return this.token.expiresAt > Date.now();
  }

  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return this.token?.accessToken || null;
  }
}

export const authService = new AuthService();
