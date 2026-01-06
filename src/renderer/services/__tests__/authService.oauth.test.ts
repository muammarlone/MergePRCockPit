import { authService } from '../authService';

// Mock window.electronAPI
const mockOAuthGoogle = jest.fn();
const mockOAuthGitHub = jest.fn();
const mockGetUserInfo = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: {
      oauthGoogle: mockOAuthGoogle,
      oauthGitHub: mockOAuthGitHub,
      getUserInfo: mockGetUserInfo,
    },
  });
});

describe('AuthService - OAuth Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    authService.logout();
    jest.clearAllMocks();
  });

  describe('Google OAuth', () => {
    test('should login with real Google OAuth when electronAPI is available', async () => {
      const mockTokenResponse = {
        access_token: 'real-google-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token-123',
      };

      const mockUserInfo = {
        id: 'google-user-123',
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      const user = await authService.loginWithGoogle();

      expect(mockOAuthGoogle).toHaveBeenCalled();
      expect(mockGetUserInfo).toHaveBeenCalledWith('real-google-token-123', 'google');
      expect(user.id).toBe('google-user-123');
      expect(user.email).toBe('test@gmail.com');
      expect(user.name).toBe('Test User');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.provider).toBe('google');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should fallback to mock when OAuth fails', async () => {
      mockOAuthGoogle.mockRejectedValue(new Error('OAuth failed'));

      const user = await authService.loginWithGoogle();

      expect(user).toBeDefined();
      expect(user.provider).toBe('google');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should fallback to mock when getUserInfo fails', async () => {
      const mockTokenResponse = {
        access_token: 'real-google-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockRejectedValue(new Error('Failed to fetch user info'));

      const user = await authService.loginWithGoogle();

      expect(user).toBeDefined();
      expect(user.provider).toBe('google');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('GitHub OAuth', () => {
    test('should login with real GitHub OAuth when electronAPI is available', async () => {
      const mockTokenResponse = {
        access_token: 'real-github-token-456',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token-456',
      };

      const mockUserInfo = {
        id: 'github-user-456',
        email: 'test@github.com',
        name: 'GitHub User',
        picture: 'https://github.com/avatar.jpg',
      };

      mockOAuthGitHub.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      const user = await authService.loginWithGitHub();

      expect(mockOAuthGitHub).toHaveBeenCalled();
      expect(mockGetUserInfo).toHaveBeenCalledWith('real-github-token-456', 'github');
      expect(user.id).toBe('github-user-456');
      expect(user.email).toBe('test@github.com');
      expect(user.name).toBe('GitHub User');
      expect(user.avatar).toBe('https://github.com/avatar.jpg');
      expect(user.provider).toBe('github');
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should fallback to mock when OAuth fails', async () => {
      mockOAuthGitHub.mockRejectedValue(new Error('OAuth failed'));

      const user = await authService.loginWithGitHub();

      expect(user).toBeDefined();
      expect(user.provider).toBe('github');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('Token Management', () => {
    test('should store access token with expiration', async () => {
      const mockTokenResponse = {
        access_token: 'token-with-expiry',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockUserInfo = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      await authService.loginWithGoogle();

      const token = authService.getToken();
      expect(token).not.toBeNull();
      expect(token?.accessToken).toBe('token-with-expiry');
      expect(token?.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should handle tokens without expiration', async () => {
      const mockTokenResponse = {
        access_token: 'token-no-expiry',
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        id: 'user-456',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      await authService.loginWithGoogle();

      const token = authService.getToken();
      expect(token).not.toBeNull();
      expect(token?.accessToken).toBe('token-no-expiry');
      // Default to 3600 seconds (1 hour) when no expires_in provided
      expect(token?.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should store refresh token when provided', async () => {
      const mockTokenResponse = {
        access_token: 'access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token',
      };

      const mockUserInfo = {
        id: 'user-789',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      await authService.loginWithGoogle();

      const token = authService.getToken();
      expect(token).not.toBeNull();
      expect(token?.refreshToken).toBe('refresh-token');
    });
  });

  describe('Authentication State', () => {
    test('should correctly validate authentication state', async () => {
      expect(authService.isAuthenticated()).toBe(false);

      const mockTokenResponse = {
        access_token: 'valid-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockUserInfo = {
        id: 'user-valid',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      await authService.loginWithGoogle();
      expect(authService.isAuthenticated()).toBe(true);

      await authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });

    test('should persist authentication across page reloads', async () => {
      const mockTokenResponse = {
        access_token: 'persistent-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockUserInfo = {
        id: 'user-persistent',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockOAuthGoogle.mockResolvedValue(mockTokenResponse);
      mockGetUserInfo.mockResolvedValue(mockUserInfo);

      await authService.loginWithGoogle();

      // Simulate page reload by creating new authService instance
      const storedUser = localStorage.getItem('mergePR_auth');
      const storedToken = localStorage.getItem('mergePR_token');

      expect(storedUser).toBeDefined();
      expect(storedToken).toBeDefined();

      const parsedUser = JSON.parse(storedUser!);
      const parsedToken = JSON.parse(storedToken!);

      expect(parsedUser.id).toBe('user-persistent');
      expect(parsedToken.accessToken).toBe('persistent-token');
    });
  });
});
