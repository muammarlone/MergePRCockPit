import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIInsights from '../../components/AIInsights';
import { mockPRDetails, mockAIInsights } from '../__mocks__/mockData';
import { setupLocalStorageMock } from '../__mocks__/electronAPIMock';

describe('AIInsights Component', () => {
  beforeEach(() => {
    setupLocalStorageMock({ github_token: 'test-token' });
    window.electronAPI.getAIInsights.mockResolvedValue(mockAIInsights);
    jest.clearAllMocks();
  });

  test('renders AI Insights header', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/AI-Powered Analysis/i)).toBeInTheDocument();
    });
  });

  test('fetches AI insights on mount', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(window.electronAPI.getAIInsights).toHaveBeenCalledWith(
        'myteam',
        'merge-cockpit',
        42,
        'test-token'
      );
    });
  });

  test('displays risk assessment section with level badge', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Risk Assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/LOW/i)).toBeInTheDocument();
    });
  });

  test('displays PR summary section', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/new dashboard component/i)).toBeInTheDocument();
    });
  });

  test('displays suggested title section', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Title Suggestion/i)).toBeInTheDocument();
      expect(screen.getByText(/feat\(ui\): Add new dashboard/i)).toBeInTheDocument();
    });
  });

  test('displays review focus areas section', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Review Focus Areas/i)).toBeInTheDocument();
      expect(screen.getByText(/error boundary/i)).toBeInTheDocument();
    });
  });

  test('displays suggested reviewers section', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Suggested Reviewers/i)).toBeInTheDocument();
    });
  });

  test('displays commit message section', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Commit Message/i)).toBeInTheDocument();
      expect(screen.getByText(/feat\(ui\): Add new dashboard component/i)).toBeInTheDocument();
    });
  });

  test('toggles section expansion on header click', async () => {
    const user = userEvent.setup();
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Risk Assessment/i)).toBeInTheDocument();
    });

    const riskHeader = screen.getByText(/Risk Assessment/i).closest('.insight-header');
    await user.click(riskHeader);

    // Content should be visible after clicking
    await waitFor(() => {
      expect(screen.getByText(/isolated to new component/i)).toBeInTheDocument();
    });
  });

  test('shows copy button for commit message', async () => {
    const user = userEvent.setup();
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Commit Message/i)).toBeInTheDocument();
    });

    const commitHeader = screen.getByText(/Commit Message/i).closest('.insight-header');
    await user.click(commitHeader);

    // Look for copy button
    const copyButtons = screen.getAllByRole('button', { name: /Copy/i });
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  test('shows risk badge with appropriate color for HIGH risk', async () => {
    window.electronAPI.getAIInsights.mockResolvedValue({
      ...mockAIInsights,
      risk: { level: 'HIGH', reason: 'Critical changes detected' },
    });

    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching insights', () => {
    window.electronAPI.getAIInsights.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockAIInsights), 100))
    );

    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
        loading={true}
      />
    );

    expect(screen.getByText(/Analyzing with AI/i)).toBeInTheDocument();
  });

  test('shows message when insights are not available', async () => {
    window.electronAPI.getAIInsights.mockResolvedValue(null);

    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Insights|not available/i)).toBeInTheDocument();
    });
  });

  test('calls refresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(window.electronAPI.getAIInsights).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByRole('button', { name: /⟳/i });
    await user.click(refreshBtn);

    await waitFor(() => {
      expect(window.electronAPI.getAIInsights).toHaveBeenCalledTimes(2);
    });
  });

  test('handles missing electronAPI gracefully', async () => {
    const originalAPI = window.electronAPI;
    window.electronAPI = undefined;

    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Electron API|not available/i)).toBeInTheDocument();
    });

    window.electronAPI = originalAPI;
  });

  test('displays all 6 insight types when available', async () => {
    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Risk Assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Title Suggestion/i)).toBeInTheDocument();
      expect(screen.getByText(/Review Focus Areas/i)).toBeInTheDocument();
      expect(screen.getByText(/Suggested Reviewers/i)).toBeInTheDocument();
      expect(screen.getByText(/Commit Message/i)).toBeInTheDocument();
    });
  });

  test('displays error message on API failure', async () => {
    window.electronAPI.getAIInsights.mockRejectedValue(new Error('API Error'));

    render(
      <AIInsights
        owner="myteam"
        repo="merge-cockpit"
        pr={mockPRDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/API Error|Error/i)).toBeInTheDocument();
    });
  });
});
