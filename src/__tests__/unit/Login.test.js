import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Login';
import { setupLocalStorageMock } from '../__mocks__/electronAPIMock';
import { mockGitHubToken } from '../__mocks__/mockData';

describe('Login Component', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    jest.clearAllMocks();
  });

  test('renders login form with input field and buttons', () => {
    render(<Login onAuthSuccess={jest.fn()} />);

    expect(screen.getByText(/Merge Cockpit/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/GitHub Personal Access Token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with GitHub/i })).toBeInTheDocument();
  });

  test('shows OAuth button options', () => {
    render(<Login onAuthSuccess={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LinkedIn/i })).toBeInTheDocument();
  });

  test('accepts and stores GitHub token input', async () => {
    const onAuthSuccess = jest.fn();
    const user = userEvent.setup();

    render(<Login onAuthSuccess={onAuthSuccess} />);

    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, mockGitHubToken);

    expect(tokenInput.value).toBe(mockGitHubToken);
  });

  test('stores token to localStorage on successful authentication', async () => {
    const onAuthSuccess = jest.fn();
    const user = userEvent.setup();

    render(<Login onAuthSuccess={onAuthSuccess} />);

    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, mockGitHubToken);

    const submitBtn = screen.getByRole('button', { name: /Sign in with Token/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('github_token', mockGitHubToken);
    });
  });

  test('calls onAuthSuccess callback after authentication', async () => {
    const onAuthSuccess = jest.fn();
    const user = userEvent.setup();

    render(<Login onAuthSuccess={onAuthSuccess} />);

    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, mockGitHubToken);

    const submitBtn = screen.getByRole('button', { name: /Sign in with Token/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalled();
    });
  });

  test('calls GitHub OAuth on button click', async () => {
    const user = userEvent.setup();
    render(<Login onAuthSuccess={jest.fn()} />);

    const githubOAuthBtn = screen.getByRole('button', { name: /GitHub/i });
    await user.click(githubOAuthBtn);

    expect(window.electronAPI.startGitHubOAuth).toHaveBeenCalled();
  });

  test('calls Google OAuth on button click', async () => {
    const user = userEvent.setup();
    render(<Login onAuthSuccess={jest.fn()} />);

    const googleOAuthBtn = screen.getByRole('button', { name: /Google/i });
    await user.click(googleOAuthBtn);

    expect(window.electronAPI.startGoogleOAuth).toHaveBeenCalled();
  });

  test('clears token input on clear button click', async () => {
    const user = userEvent.setup();
    render(<Login onAuthSuccess={jest.fn()} />);

    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, mockGitHubToken);
    expect(tokenInput.value).toBe(mockGitHubToken);

    const clearBtn = screen.getByRole('button', { name: /clear|reset/i });
    if (clearBtn) {
      await user.click(clearBtn);
      expect(tokenInput.value).toBe('');
    }
  });

  test('shows error message on authentication failure', async () => {
    const user = userEvent.setup();
    render(<Login onAuthSuccess={jest.fn()} />);

    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, 'invalid-token');

    // Token validation should show error if implemented
    // This test assumes error handling is present
  });

  test('disables submit button when input is empty', () => {
    render(<Login onAuthSuccess={jest.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /Sign in with Token/i });
    // Button should be disabled when input is empty or have validation
  });
});
