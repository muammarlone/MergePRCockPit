import React, { useState, useEffect } from 'react';
import { Repository } from '../types';
import { githubService } from '../services/githubService';
import { workspaceService } from '../services/workspaceService';
import '../styles/RepositorySelector.css';

interface RepositorySelectorProps {
  selectedOwner: string;
  selectedRepo: Repository | null;
  onOwnerChange: (owner: string) => void;
  onRepoChange: (repo: Repository | null) => void;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  selectedOwner,
  selectedRepo,
  onOwnerChange,
  onRepoChange
}) => {
  const [owner, setOwner] = useState(selectedOwner);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(true);
  
  // Memoize recent repos to avoid unnecessary localStorage reads
  const [recentRepos, setRecentRepos] = useState(workspaceService.getRecentRepositories());
  
  // Update recent repos when a new repo is selected
  useEffect(() => {
    setRecentRepos(workspaceService.getRecentRepositories());
  }, [selectedRepo]);

  const handleLoadRepos = async () => {
    if (!owner.trim()) return;
    
    setLoading(true);
    try {
      const repos = await githubService.getRepositories(owner);
      setRepositories(repos);
      onOwnerChange(owner);
      if (repos.length > 0 && !selectedRepo) {
        onRepoChange(repos[0]);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelect = (repoName: string) => {
    const repo = repositories.find(r => r.name === repoName);
    onRepoChange(repo || null);
  };

  const handleSelectRecent = (recentOwner: string, recentRepo: Repository) => {
    setOwner(recentOwner);
    onOwnerChange(recentOwner);
    onRepoChange(recentRepo);
    setShowRecent(false);
  };

  return (
    <div className="repository-selector">
      {showRecent && recentRepos.length > 0 && (
        <div className="recent-repositories">
          <h3>Recent Repositories</h3>
          <div className="recent-list">
            {recentRepos.map((recent, index) => (
              <button
                key={index}
                className="recent-repo-button"
                onClick={() => handleSelectRecent(recent.owner, recent.repo)}
              >
                <span className="repo-name">{recent.owner}/{recent.repo.name}</span>
                <span className="repo-meta">{new Date(recent.lastAccessed).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
          <button 
            className="browse-new-button"
            onClick={() => setShowRecent(false)}
          >
            Browse New Repository
          </button>
        </div>
      )}

      {(!showRecent || recentRepos.length === 0) && (
        <>
          <div className="selector-row">
            <div className="input-group">
              <label>Repository Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Enter GitHub username or org"
                onKeyPress={(e) => e.key === 'Enter' && handleLoadRepos()}
              />
            </div>
            <button onClick={handleLoadRepos} disabled={loading || !owner.trim()}>
              {loading ? 'Loading...' : 'Load Repositories'}
            </button>
          </div>

          {repositories.length > 0 && (
            <div className="selector-row">
              <div className="input-group">
                <label>Repository</label>
                <select
                  value={selectedRepo?.name || ''}
                  onChange={(e) => handleRepoSelect(e.target.value)}
                >
                  <option value="">Select a repository</option>
                  {repositories.map(repo => (
                    <option key={repo.id} value={repo.name}>
                      {repo.name} {repo.private ? '(Private)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {recentRepos.length > 0 && (
            <button 
              className="show-recent-button"
              onClick={() => setShowRecent(true)}
            >
              ← Back to Recent Repositories
            </button>
          )}
        </>
      )}
    </div>
  );
};
