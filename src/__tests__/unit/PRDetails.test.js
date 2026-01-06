import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PRDetails from '../../components/PRDetails';
import { mockPRDetails, mockReviewStatus } from '../__mocks__/mockData';
import { setupLocalStorageMock } from '../__mocks__/electronAPIMock';

describe('PRDetails Component', () => {
  const mockPR = { number: 42 };
  const mockOnUpdate = jest.fn();
  const mockOnMerge = jest.fn();

  beforeEach(() => {
    setupLocalStorageMock({ github_token: 'test-token' });
    window.electronAPI.getPRDetails.mockResolvedValue(mockPRDetails);
    window.electronAPI.getReviewStatus.mockResolvedValue(mockReviewStatus);
    jest.clearAllMocks();
  });

  test('renders PR details with title and metadata', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockPRDetails.title)).toBeInTheDocument();
    });
  });

  test('displays PR number and author', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/john-doe/)).toBeInTheDocument();
      expect(screen.getByText(/#42/)).toBeInTheDocument();
    });
  });

  test('shows PR description from API response', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/This PR adds a new dashboard/)).toBeInTheDocument();
    });
  });

  test('displays review status with counts', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Approved/)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('shows list of reviewers with their statuses', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/@alice/)).toBeInTheDocument();
      expect(screen.getByText(/@bob/)).toBeInTheDocument();
    });
  });

  test('renders tab navigation for Overview, Analysis, and Changes', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analysis/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Changes/i })).toBeInTheDocument();
    });
  });

  test('switches to AI Analysis tab when clicked', async () => {
    const user = userEvent.setup();
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Analysis/i })).toBeInTheDocument();
    });

    const analysisTab = screen.getByRole('button', { name: /Analysis/i });
    await user.click(analysisTab);

    await waitFor(() => {
      expect(analysisTab).toHaveClass('active');
    });
  });

  test('switches to Changes tab and shows stats', async () => {
    const user = userEvent.setup();
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Changes/i })).toBeInTheDocument();
    });

    const changesTab = screen.getByRole('button', { name: /Changes/i });
    await user.click(changesTab);

    await waitFor(() => {
      expect(screen.getByText(/250/)).toBeInTheDocument(); // additions
      expect(screen.getByText(/75/)).toBeInTheDocument(); // deletions
    });
  });

  test('shows Merge button when PR is open', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Merge PR/i })).toBeInTheDocument();
    });
  });

  test('calls onMerge callback when merge button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Merge PR/i })).toBeInTheDocument();
    });

    const mergeBtn = screen.getByRole('button', { name: /Merge PR/i });
    await user.click(mergeBtn);

    await waitFor(() => {
      expect(mockOnMerge).toHaveBeenCalled();
    });
  });

  test('fetches PR details and review status on mount', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(window.electronAPI.getPRDetails).toHaveBeenCalledWith(
        'myteam',
        'merge-cockpit',
        42,
        'test-token'
      );
      expect(window.electronAPI.getReviewStatus).toHaveBeenCalledWith(
        'myteam',
        'merge-cockpit',
        42,
        'test-token'
      );
    });
  });

  test('displays check status when available', async () => {
    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Tests \(Node 16\)/)).toBeInTheDocument();
      expect(screen.getByText(/Lint \(ESLint\)/)).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching details', () => {
    window.electronAPI.getPRDetails.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockPRDetails), 100))
    );

    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    expect(screen.getByText(/Loading PR details/i)).toBeInTheDocument();
  });

  test('displays error message on API failure', async () => {
    window.electronAPI.getPRDetails.mockRejectedValue(new Error('API Error'));

    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load PR details|Error/i)).toBeInTheDocument();
    });
  });

  test('handles missing electronAPI gracefully', async () => {
    const originalAPI = window.electronAPI;
    window.electronAPI = undefined;

    render(
      <PRDetails
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPR}
        onUpdate={mockOnUpdate}
        onMerge={mockOnMerge}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Electron API|not available/i)).toBeInTheDocument();
    });

    window.electronAPI = originalAPI;
  });
});
