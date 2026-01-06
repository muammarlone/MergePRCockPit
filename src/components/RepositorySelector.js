import React, { useState, useEffect } from 'react';
import './RepositorySelector.css';

function RepositorySelector({ onSelect }) {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [owners, setOwners] = useState(new Set());
  const [reposByOwner, setReposByOwner] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('github_token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
        if (!window.electronAPI || !window.electronAPI.getRepositories) {
          setError('Electron API not available. Please refresh the page.');
          setLoading(false);
          return;
        }
        // Check if electronAPI is available
        if (!window.electronAPI) {
          setError('Electron API not available. Make sure you\'re running this in Electron.');
          setLoading(false);
          return;
        }

        if (!window.electronAPI.getRepositories) {
          setError('getRepositories method not exposed in Electron API');
          setLoading(false);
          return;
        }

        const repos = await window.electronAPI.getRepositories(token);
        setRepositories(repos);

        // Group repos by owner
        const ownerSet = new Set();
        const groupedRepos = {};

        repos.forEach((r) => {
          const ownerName = r.owner.login;
          ownerSet.add(ownerName);
          if (!groupedRepos[ownerName]) {
            groupedRepos[ownerName] = [];
          }
          groupedRepos[ownerName].push(r.name);
        });

        setOwners(ownerSet);
        setReposByOwner(groupedRepos);
        setError(null);
      } catch (err) {
        setError(`Failed to load repositories: ${err.message}`);
        setRepositories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const handleOwnerChange = (e) => {
    const selectedOwner = e.target.value;
    setOwner(selectedOwner);
    setRepo(''); // Reset repo when owner changes
  };

  const handleRepoChange = (e) => {
    setRepo(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (owner && repo) {
      onSelect(owner, repo);
    }
  };

  return (
    <div className="repo-selector">
      <div className="repo-selector-content">
        <h2>📚 Select Repository</h2>
        <p>Choose a repository to manage pull requests</p>

        {loading && <div className="loading">Loading your repositories...</div>}

        {error && <div className="error-message">{error}</div>}

        {!loading && repositories.length === 0 && !error && (
          <div className="no-repos">
            <p>No repositories found. Make sure you have:</p>
            <ul>
              <li>✓ A valid GitHub token with repo access</li>
              <li>✓ At least one repository in your GitHub account</li>
            </ul>
          </div>
        )}

        {!loading && repositories.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="owner">Owner / Organization</label>
              <select
                id="owner"
                value={owner}
                onChange={handleOwnerChange}
                required
                disabled={loading}
              >
                <option value="">-- Select Owner --</option>
                {Array.from(owners).map((ownerName) => (
                  <option key={ownerName} value={ownerName}>
                    {ownerName}
                  </option>
                ))}
              </select>
            </div>

            {owner && (
              <div className="form-group">
                <label htmlFor="repo">Repository</label>
                <select
                  id="repo"
                  value={repo}
                  onChange={handleRepoChange}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select Repository --</option>
                  {reposByOwner[owner]?.map((repoName) => (
                    <option key={repoName} value={repoName}>
                      {repoName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={!owner || !repo || loading}
            >
              Load Repository
            </button>
          </form>
        )}

        {!loading && repositories.length > 0 && (
          <div className="repo-stats">
            <p>
              Found {repositories.length} repositor
{repositories.length === 1 ? 'y' : 'ies'} across {owners.size} owner{owners.size === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepositorySelector;
