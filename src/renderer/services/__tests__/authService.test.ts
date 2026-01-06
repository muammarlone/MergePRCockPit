import { authService } from '../authService';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the auth service state by logging out
    authService.logout();
  });

  test('should not be authenticated initially', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  test('should login with Google', async () => {
    const user = await authService.loginWithGoogle();
    expect(user).toBeDefined();
    expect(user.provider).toBe('google');
    expect(authService.isAuthenticated()).toBe(true);
  });

  test('should login with GitHub', async () => {
    const user = await authService.loginWithGitHub();
    expect(user).toBeDefined();
    expect(user.provider).toBe('github');
    expect(authService.isAuthenticated()).toBe(true);
  });

  test('should login with email', async () => {
    const user = await authService.loginWithEmail('test@example.com', 'password');
    expect(user).toBeDefined();
    expect(user.provider).toBe('email');
    expect(user.email).toBe('test@example.com');
    expect(authService.isAuthenticated()).toBe(true);
  });

  test('should logout', async () => {
    await authService.loginWithEmail('test@example.com', 'password');
    expect(authService.isAuthenticated()).toBe(true);
    
    await authService.logout();
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
  });

  test('should persist authentication in localStorage', async () => {
    await authService.loginWithEmail('test@example.com', 'password');
    
    const storedUser = localStorage.getItem('mergePR_auth');
    const storedToken = localStorage.getItem('mergePR_token');
    
    expect(storedUser).toBeDefined();
    expect(storedToken).toBeDefined();
  });

  test('should get access token when authenticated', async () => {
    await authService.loginWithEmail('test@example.com', 'password');
    const token = authService.getAccessToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should return null for access token when not authenticated', async () => {
    // Ensure we're logged out
    await authService.logout();
    const token = authService.getAccessToken();
    expect(token).toBeNull();
  });
});
