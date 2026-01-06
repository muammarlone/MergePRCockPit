import React, { useState, useEffect } from 'react';
import './PRDetails.css';
import AIInsights from './AIInsights';

function PRDetails({ owner, repo, pr, onUpdate, onMerge }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [mergeInProgress, setMergeInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Safety check for electronAPI
        if (!window.electronAPI) {
          console.error('electronAPI not available');
          setApiAvailable(false);
          return;
        }

        const token = localStorage.getItem('github_token');
        const prDetails = await window.electronAPI.getPRDetails(owner, repo, pr.number, token);
        const reviews = await window.electronAPI.getReviewStatus(owner, repo, pr.number, token);
        setDetails(prDetails);
        setReviewStatus(reviews);
      } catch (error) {
        console.error('Error fetching PR details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [owner, repo, pr.number]);

  const handleMerge = async () => {
    setMergeInProgress(true);
    try {
      await onMerge('squash');
    } catch (error) {
      console.error('Error merging PR:', error);
    } finally {
      setMergeInProgress(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="pr-details loading">Loading PR details...</div>;
  }

  if (!apiAvailable) {
    return (
      <div className="pr-details error">
        <div className="error-message">
          <h3>Unable to Load PR Details</h3>
          <p>The Electron API is not available. Please ensure the desktop application is running properly.</p>
          <p className="error-detail">Check the developer console for more information.</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return <div className="pr-details error">Failed to load PR details</div>;
  }

  return (
    <div className="pr-details">
      <div className="pr-details-header">
        <div className="header-info">
          <h2>{details.title}</h2>
          <p className="pr-subtitle">
            #{details.number} opened by <strong>@{details.user.login}</strong> on{' '}
            {formatDate(details.created_at)}
          </p>
          <div className="pr-meta">
            <span className={`pr-status ${details.state}`}>{details.state.toUpperCase()}</span>
            <span className="pr-branch">{details.head.ref} → {details.base.ref}</span>
          </div>
        </div>
        <div className="pr-details-actions">
          {details.state === 'open' && (
            <button
              className="btn-merge"
              onClick={handleMerge}
              disabled={mergeInProgress}
            >
              {mergeInProgress ? 'Merging...' : 'Merge PR'}
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="pr-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          AI Analysis
        </button>
        <button
          className={`tab ${activeTab === 'changes' ? 'active' : ''}`}
          onClick={() => setActiveTab('changes')}
        >
          Changes
        </button>
      </div>

      <div className="pr-details-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="section">
              <h3>Description</h3>
              <div className="description">
                {details.body ? (
                  <p>{details.body}</p>
                ) : (
                  <p className="empty">No description provided</p>
                )}
              </div>
            </div>

            {reviewStatus && (
              <div className="section">
                <h3>Reviews</h3>
                <div className="review-summary">
                  <div className="review-stat">
                    <span className="review-count approved">{reviewStatus.approved}</span>
                    <span className="review-label">Approved</span>
                  </div>
                  <div className="review-stat">
                    <span className="review-count requested">{reviewStatus.changesRequested}</span>
                    <span className="review-label">Changes Requested</span>
                  </div>
                  {Object.keys(reviewStatus.reviewers).length > 0 && (
                    <div className="reviewers-list">
                      <h4>Reviewers</h4>
                      {Object.entries(reviewStatus.reviewers).map(([reviewer, status]) => (
                        <div key={reviewer} className="reviewer">
                          <span className={`reviewer-status ${status.status}`}>
                            {status.status === 'approved' ? '✓' : '○'}
                          </span>
                          <span className="reviewer-name">@{reviewer}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {details.checks && details.checks.length > 0 && (
              <div className="section">
                <h3>Checks</h3>
                <div className="checks-list">
                  {details.checks.map((check) => (
                    <div key={check.id} className={`check-item ${check.conclusion}`}>
                      <span className="check-status">
                        {check.conclusion === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="check-name">{check.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-section">
            <AIInsights owner={owner} repo={repo} pr={details} />
          </div>
        )}

        {/* Changes Tab */}
        {activeTab === 'changes' && (
          <div className="section">
            <h3>Code Changes</h3>
            <div className="changes-summary">
              <div className="change-stat">
                <span className="stat-label">Files Changed</span>
                <span className="stat-value">{details.changed_files}</span>
              </div>
              <div className="change-stat">
                <span className="stat-label">Additions</span>
                <span className="stat-value additions">+{details.additions}</span>
              </div>
              <div className="change-stat">
                <span className="stat-label">Deletions</span>
                <span className="stat-value deletions">-{details.deletions}</span>
              </div>
            </div>
            <p className="changes-note">
              Click "View on GitHub" to see the full diff and detailed code changes.
            </p>
            <a
              href={details.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-github"
            >
              View on GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default PRDetails;
