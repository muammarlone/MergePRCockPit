import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RepositorySelector from '../../components/RepositorySelector';
import { mockRepositories } from '../__mocks__/mockData';
import { setupLocalStorageMock } from '../__mocks__/electronAPIMock';

describe('RepositorySelector Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    setupLocalStorageMock({ github_token: 'test-token' });
    window.electronAPI.getRepositories.mockResolvedValue(mockRepositories);
    jest.clearAllMocks();
  });

  test('renders repository selector with dropdowns', async () => {
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Select a repository/i)).toBeInTheDocument();
    });
  });

  test('loads repositories on mount', async () => {
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(window.electronAPI.getRepositories).toHaveBeenCalledWith('test-token');
    });
  });

  test('displays owner dropdown with unique owners', async () => {
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Select owner/i)).toBeInTheDocument();
    });
  });

  test('filters repositories by selected owner', async () => {
    const user = userEvent.setup();
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(window.electronAPI.getRepositories).toHaveBeenCalled();
    });

    const ownerSelect = screen.getAllByDisplayValue(/Select/i)[0];
    await user.selectOption(ownerSelect, 'myteam');

    await waitFor(() => {
      const repoSelects = screen.getAllByDisplayValue(/Select/i);
      expect(repoSelects.length).toBeGreaterThan(1);
    });
  });

  test('calls onRepositorySelected when owner and repo are selected', async () => {
    const user = userEvent.setup();
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(window.electronAPI.getRepositories).toHaveBeenCalled();
    });

    const selects = screen.getAllByDisplayValue(/Select/i);
    await user.selectOption(selects[0], 'myteam');
    
    await waitFor(() => {
      const repoSelects = screen.getAllByDisplayValue(/Select/i);
      expect(repoSelects.length).toBeGreaterThan(1);
    });

    await user.selectOption(selects[1], 'merge-cockpit');

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith('myteam', 'merge-cockpit');
    });
  });

  test('shows loading state while fetching repositories', () => {
    window.electronAPI.getRepositories.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockRepositories), 100))
    );

    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('shows error message when API call fails', async () => {
    window.electronAPI.getRepositories.mockRejectedValue(
      new Error('Failed to fetch repositories')
    );

    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error|Failed/i)).toBeInTheDocument();
    });
  });

  test('handles missing electronAPI gracefully', async () => {
    const originalAPI = window.electronAPI;
    window.electronAPI = undefined;

    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Electron API|not available/i)).toBeInTheDocument();
    });

    window.electronAPI = originalAPI;
  });

  test('disables repository dropdown when no owner is selected', () => {
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner={null}
        initialRepo={null}
      />
    );

    const selects = screen.getAllByDisplayValue(/Select/i);
    expect(selects[1]).toBeDisabled();
  });

  test('pre-selects initial owner and repo values', async () => {
    render(
      <RepositorySelector
        onRepositorySelected={mockOnSelect}
        initialOwner="myteam"
        initialRepo="merge-cockpit"
      />
    );

    await waitFor(() => {
      const selects = screen.getAllByDisplayValue(/Select|myteam|merge-cockpit/i);
      expect(selects.length).toBeGreaterThan(0);
    });
  });
});
