import React, { useState } from 'react';
import { Repository } from '../types';
import { githubService } from '../services/githubService';
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

  return (
    <div className="repository-selector">
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
    </div>
  );
};
