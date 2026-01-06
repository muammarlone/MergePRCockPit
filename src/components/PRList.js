import React from 'react';
import './PRList.css';

function PRList({ prs, loading, selectedPR, onSelectPR, onRefresh }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStateColor = (state) => {
    return state === 'open' ? 'state-open' : 'state-closed';
  };

  return (
    <div className="pr-list-container">
      <div className="pr-list-header">
        <h4>Pull Requests</h4>
        <button className="btn-refresh" onClick={onRefresh} disabled={loading}>
          {loading ? '⟳ Loading...' : '⟳'}
        </button>
      </div>

      <div className="pr-list">
        {loading && !prs.length && (
          <div className="loading-state">
            <p>Loading pull requests...</p>
          </div>
        )}

        {!loading && !prs.length && (
          <div className="empty-state">
            <p>No pull requests found</p>
          </div>
        )}

        {prs.map((pr) => (
          <div
            key={pr.id}
            className={`pr-item ${selectedPR?.id === pr.id ? 'selected' : ''}`}
            onClick={() => onSelectPR(pr)}
          >
            <div className="pr-item-header">
              <span className={`pr-state ${getStateColor(pr.state)}`}>
                {pr.state === 'open' ? '◯' : '✓'}
              </span>
              <span className="pr-number">#{pr.number}</span>
              <span className="pr-date">{formatDate(pr.updated)}</span>
            </div>
            <h5 className="pr-title">{pr.title}</h5>
            <div className="pr-meta">
              <span className="pr-author">@{pr.author}</span>
              <span className="pr-changes">
                +{pr.additions} -{pr.deletions}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PRList;
