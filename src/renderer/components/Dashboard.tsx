import React, { useState, useEffect } from 'react';
import { Repository, PullRequest, RepositoryMetrics } from '../types';
import { githubService } from '../services/githubService';
import { authService } from '../services/authService';
import { RepositorySelector } from './RepositorySelector';
import { PullRequestList } from './PullRequestList';
import { Analytics } from './Analytics';
import { EnhancedAnalytics } from './EnhancedAnalytics';
import { RemediationDashboard } from './RemediationDashboard';
import { FileOperations } from './FileOperations';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const user = authService.getCurrentUser();
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [metrics, setMetrics] = useState<RepositoryMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prs' | 'analytics' | 'enhanced' | 'remediation' | 'files'>('prs');

  useEffect(() => {
    if (selectedRepo) {
      loadPullRequests();
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  const loadPullRequests = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    try {
      const prs = await githubService.getPullRequests(
        selectedRepo.owner.login,
        selectedRepo.name
      );
      setPullRequests(prs);
    } catch (error) {
      console.error('Failed to load PRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    if (!selectedRepo) return;
    
    try {
      const repoMetrics = await githubService.getRepositoryMetrics(
        selectedRepo.owner.login,
        selectedRepo.name
      );
      setMetrics(repoMetrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>MergePR Cockpit</h1>
        <div className="user-info">
          <span>{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <RepositorySelector
          selectedOwner={selectedOwner}
          selectedRepo={selectedRepo}
          onOwnerChange={setSelectedOwner}
          onRepoChange={setSelectedRepo}
        />

        {selectedRepo && (
          <>
            <div className="tabs">
              <button
                className={activeTab === 'prs' ? 'active' : ''}
                onClick={() => setActiveTab('prs')}
              >
                Pull Requests ({pullRequests.length})
              </button>
              <button
                className={activeTab === 'analytics' ? 'active' : ''}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button
                className={activeTab === 'enhanced' ? 'active' : ''}
                onClick={() => setActiveTab('enhanced')}
              >
                📊 Enhanced Analytics
              </button>
              <button
                className={activeTab === 'remediation' ? 'active' : ''}
                onClick={() => setActiveTab('remediation')}
              >
                🔧 Remediation
              </button>
              <button
                className={activeTab === 'files' ? 'active' : ''}
                onClick={() => setActiveTab('files')}
              >
                📁 File Ops
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'prs' && (
                <PullRequestList
                  pullRequests={pullRequests}
                  repository={selectedRepo}
                  loading={loading}
                  onRefresh={loadPullRequests}
                />
              )}
              {activeTab === 'analytics' && metrics && (
                <Analytics metrics={metrics} repository={selectedRepo} />
              )}
              {activeTab === 'enhanced' && (
                <EnhancedAnalytics 
                  repository={selectedRepo} 
                  pullRequests={pullRequests}
                />
              )}
              {activeTab === 'remediation' && (
                <RemediationDashboard 
                  repository={selectedRepo} 
                  pullRequests={pullRequests}
                />
              )}
              {activeTab === 'files' && (
                <FileOperations repository={selectedRepo} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
