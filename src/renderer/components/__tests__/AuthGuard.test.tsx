import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthGuard } from '../AuthGuard';
import { authService } from '../../services/authService';

// Mock the authService
jest.mock('../../services/authService', () => ({
  authService: {
    isAuthenticated: jest.fn(),
    loginWithEmail: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show login page when not authenticated', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('MergePR Cockpit')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('should show protected content when authenticated', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('MergePR Cockpit')).not.toBeInTheDocument();
  });

  test('should re-check authentication on mount', () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(authService.isAuthenticated).toHaveBeenCalled();
  });
});
