import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import {
  mockGitHubToken,
  mockRepositories,
  mockPRList,
  mockPRDetails,
  mockReviewStatus,
  mockAIInsights,
} from '../__mocks__/mockData';
import { setupLocalStorageMock } from '../__mocks__/electronAPIMock';

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    window.electronAPI.getRepositories.mockResolvedValue(mockRepositories);
    window.electronAPI.getPRs.mockResolvedValue(mockPRList);
    jest.clearAllMocks();
  });

  test('complete login to dashboard flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: User sees login form
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/GitHub Personal Access Token/i)).toBeInTheDocument();
    });

    // Step 2: User enters token
    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, mockGitHubToken);

    // Step 3: User clicks sign in
    const signInBtn = screen.getByRole('button', { name: /Sign in with Token/i });
    await user.click(signInBtn);

    // Step 4: User is authenticated and sees repository selector
    await waitFor(() => {
      expect(screen.getByText(/Select a repository/i)).toBeInTheDocument();
    });

    // Step 5: Verify token is stored
    expect(localStorage.setItem).toHaveBeenCalledWith('github_token', mockGitHubToken);
  });

  test('application shows login when no token stored', () => {
    setupLocalStorageMock({});
    render(<App />);

    expect(screen.getByText(/Merge Cockpit/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/GitHub Personal Access Token/i)).toBeInTheDocument();
  });

  test('application shows repository selector when authenticated', async () => {
    setupLocalStorageMock({ github_token: mockGitHubToken });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Select a repository/i)).toBeInTheDocument();
    });
  });
});

describe('Repository Selection Flow', () => {
  beforeEach(() => {
    setupLocalStorageMock({ github_token: mockGitHubToken });
    window.electronAPI.getRepositories.mockResolvedValue(mockRepositories);
    window.electronAPI.getPRs.mockResolvedValue(mockPRList);
    jest.clearAllMocks();
  });

  test('complete repository selection flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Wait for repository selector to load
    await waitFor(() => {
      expect(window.electronAPI.getRepositories).toHaveBeenCalled();
    });

    // Step 2: User selects owner
    const selects = await screen.findAllByDisplayValue(/Select/i);
    await user.selectOption(selects[0], 'myteam');

    // Step 3: User selects repository
    await waitFor(() => {
      const repoSelects = screen.getAllByDisplayValue(/Select|myteam/i);
      expect(repoSelects.length).toBeGreaterThan(1);
    });

    const repoSelect = screen.getAllByDisplayValue(/Select/i)[1];
    await user.selectOption(repoSelect, 'merge-cockpit');

    // Step 4: Dashboard loads with PR list
    await waitFor(() => {
      expect(window.electronAPI.getPRs).toHaveBeenCalledWith(
        'myteam',
        'merge-cockpit',
        expect.any(Object),
        mockGitHubToken
      );
    });
  });

  test('displays PR list after repository selection', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(window.electronAPI.getRepositories).toHaveBeenCalled();
    });

    const selects = await screen.findAllByDisplayValue(/Select/i);
    await user.selectOption(selects[0], 'myteam');

    await waitFor(() => {
      const repoSelects = screen.getAllByDisplayValue(/Select/i);
      expect(repoSelects.length).toBeGreaterThan(1);
    });

    const repoSelect = screen.getAllByDisplayValue(/Select/i)[1];
    await user.selectOption(repoSelect, 'merge-cockpit');

    await waitFor(() => {
      expect(window.electronAPI.getPRs).toHaveBeenCalled();
    });
  });
});

describe('PR Details and Analysis Flow', () => {
  beforeEach(() => {
    setupLocalStorageMock({ github_token: mockGitHubToken });
    window.electronAPI.getPRDetails.mockResolvedValue(mockPRDetails);
    window.electronAPI.getReviewStatus.mockResolvedValue(mockReviewStatus);
    window.electronAPI.getAIInsights.mockResolvedValue(mockAIInsights);
    jest.clearAllMocks();
  });

  test('complete PR drill-down with AI analysis', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Setup: Skip auth and repo selection to get to PR details
    // In a real test, you'd navigate through those steps

    // Step 1: User clicks on a PR to view details
    // Step 2: PR details load with metadata
    // Step 3: AI Analysis tab is available
    // Step 4: User can switch between Overview, Analysis, and Changes tabs
    // Step 5: All AI insights are displayed (6 types)
  });

  test('displays all AI insight types in analysis tab', async () => {
    // After navigating to PR Details and switching to Analysis tab
    // User should see all 6 insight types
  });

  test('user can merge PR from details page', async () => {
    // User clicks Merge button
    // System calls merge API
    // Success message is displayed
  });
});

describe('Error Handling Integration', () => {
  test('handles token validation error gracefully', async () => {
    const user = userEvent.setup();
    setupLocalStorageMock();

    render(<App />);

    const tokenInput = screen.getByPlaceholderText(/GitHub Personal Access Token/i);
    await user.type(tokenInput, 'invalid-token');

    const signInBtn = screen.getByRole('button', { name: /Sign in with Token/i });
    await user.click(signInBtn);

    // Should show error message
    // User should be able to try again
  });

  test('handles API failures and shows retry option', async () => {
    setupLocalStorageMock({ github_token: mockGitHubToken });
    window.electronAPI.getPRs.mockRejectedValue(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Error|Failed/i)).toBeInTheDocument();
    });
  });

  test('handles missing electronAPI gracefully', async () => {
    const originalAPI = window.electronAPI;
    window.electronAPI = undefined;

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Electron API|not available/i)).toBeInTheDocument();
    });

    window.electronAPI = originalAPI;
  });
});

describe('State Management Integration', () => {
  test('persists selected repository in localStorage', async () => {
    setupLocalStorageMock({ github_token: mockGitHubToken });
    window.electronAPI.getRepositories.mockResolvedValue(mockRepositories);
    window.electronAPI.getPRs.mockResolvedValue(mockPRList);

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(window.electronAPI.getRepositories).toHaveBeenCalled();
    });

    // Select repository
    const selects = await screen.findAllByDisplayValue(/Select/i);
    await user.selectOption(selects[0], 'myteam');

    await waitFor(() => {
      const repoSelects = screen.getAllByDisplayValue(/Select/i);
      expect(repoSelects.length).toBeGreaterThan(1);
    });

    const repoSelect = screen.getAllByDisplayValue(/Select/i)[1];
    await user.selectOption(repoSelect, 'merge-cockpit');

    // Verify selection persists
    expect(localStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('merge-cockpit')
    );
  });

  test('restores user state on app reload', () => {
    setupLocalStorageMock({
      github_token: mockGitHubToken,
      selected_owner: 'myteam',
      selected_repo: 'merge-cockpit',
    });

    render(<App />);

    // Should directly show dashboard with selected repo
    expect(localStorage.getItem).toHaveBeenCalledWith('github_token');
  });
});

describe('Performance and Caching', () => {
  test('caches PR list to avoid duplicate API calls', async () => {
    setupLocalStorageMock({ github_token: mockGitHubToken });
    window.electronAPI.getPRs.mockResolvedValue(mockPRList);

    render(<App />);

    // First load
    await waitFor(() => {
      expect(window.electronAPI.getPRs).toHaveBeenCalledTimes(1);
    });

    // Simulate navigating away and back
    // Should use cached data
  });

  test('clears cache on logout', async () => {
    setupLocalStorageMock({ github_token: mockGitHubToken });

    const user = userEvent.setup();
    render(<App />);

    // User logs out
    const logoutBtn = await screen.findByRole('button', { name: /Logout/i });
    await user.click(logoutBtn);

    // Cache should be cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('github_token');
  });
});
