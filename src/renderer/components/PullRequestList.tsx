import React, { useState } from 'react';
import { PullRequest, Repository } from '../types';
import { PullRequestDetail } from './PullRequestDetail';
import '../styles/PullRequestList.css';

interface PullRequestListProps {
  pullRequests: PullRequest[];
  repository: Repository;
  loading: boolean;
  onRefresh: () => void;
}

export const PullRequestList: React.FC<PullRequestListProps> = ({
  pullRequests,
  repository,
  loading,
  onRefresh
}) => {
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');

  const filteredPRs = pullRequests.filter(pr => {
    if (filter === 'all') return true;
    if (filter === 'open') return pr.state === 'open';
    if (filter === 'closed') return pr.state === 'closed' || pr.merged_at;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (selectedPR) {
    return (
      <PullRequestDetail
        pullRequest={selectedPR}
        repository={repository}
        onBack={() => setSelectedPR(null)}
      />
    );
  }

  return (
    <div className="pull-request-list">
      <div className="list-header">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'open' ? 'active' : ''}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            className={filter === 'closed' ? 'active' : ''}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>
        <button onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <div className="loading">Loading pull requests...</div>}

      {!loading && filteredPRs.length === 0 && (
        <div className="empty-state">
          No pull requests found
        </div>
      )}

      {!loading && filteredPRs.length > 0 && (
        <div className="pr-items">
          {filteredPRs.map(pr => (
            <div
              key={pr.id}
              className={`pr-item ${pr.state}`}
              onClick={() => setSelectedPR(pr)}
            >
              <div className="pr-item-header">
                <span className="pr-number">#{pr.number}</span>
                <span className="pr-title">{pr.title}</span>
                <span className={`pr-state ${pr.state}`}>
                  {pr.merged_at ? 'merged' : pr.state}
                </span>
              </div>
              <div className="pr-item-meta">
                <span className="pr-author">
                  <img src={pr.user.avatar_url} alt={pr.user.login} />
                  {pr.user.login}
                </span>
                <span className="pr-date">
                  Updated: {formatDate(pr.updated_at)}
                </span>
                <span className="pr-stats">
                  +{pr.additions} -{pr.deletions} | {pr.changed_files} files
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
