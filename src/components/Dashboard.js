import React from 'react';
import './Dashboard.css';

function Dashboard({ owner, repo, prCount, onFilterChange }) {
  const handleStateChange = (state) => {
    onFilterChange({ state });
  };

  const handleSortChange = (sort) => {
    onFilterChange({ sort });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h3>{owner}/{repo}</h3>
        <span className="pr-badge">{prCount} PRs</span>
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label>State</label>
          <div className="filter-buttons">
            <button onClick={() => handleStateChange('open')} className="filter-btn active">
              Open
            </button>
            <button onClick={() => handleStateChange('closed')} className="filter-btn">
              Closed
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Sort by</label>
          <select onChange={(e) => handleSortChange(e.target.value)} className="filter-select">
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="comments">Most Comments</option>
          </select>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat">
          <div className="stat-label">Waiting for Review</div>
          <div className="stat-value">-</div>
        </div>
        <div className="stat">
          <div className="stat-label">Approved</div>
          <div className="stat-value">-</div>
        </div>
        <div className="stat">
          <div className="stat-label">Changes Requested</div>
          <div className="stat-value">-</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
