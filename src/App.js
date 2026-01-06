import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import PRList from './components/PRList';
import PRDetails from './components/PRDetails';
import RepositorySelector from './components/RepositorySelector';
import Login from './components/Login';
import Onboarding from './components/Onboarding';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [prs, setPrs] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ state: 'open', sort: 'updated' });

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
    
    if (token) {
      setIsAuthenticated(true);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const loadPRs = useCallback(async () => {
    if (!owner || !repo) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('github_token');
      const prList = await window.electronAPI.getPRs(owner, repo, filters, token);
      setPrs(prList);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load PRs:', err);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, filters]);

  useEffect(() => {
    loadPRs();
  }, [owner, repo, filters]);

  const handleSelectRepository = (selectedOwner, selectedRepo) => {
    setOwner(selectedOwner);
    setRepo(selectedRepo);
    setSelectedPR(null);
  };

  const handleSelectPR = async (pr) => {
    setSelectedPR(pr);
  };

  const handleUpdatePR = async (updates) => {
    if (!owner || !repo || !selectedPR) return;

    try {
      const token = localStorage.getItem('github_token');
      const updated = await window.electronAPI.updatePR(
        owner,
        repo,
        selectedPR.number,
        updates,
        token
      );
      setSelectedPR(updated);
      loadPRs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMergePR = async (mergeMethod = 'squash') => {
    if (!owner || !repo || !selectedPR) return;

    try {
      const token = localStorage.getItem('github_token');
      await window.electronAPI.mergePR(owner, repo, selectedPR.number, mergeMethod, token);
      loadPRs();
      setSelectedPR(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
    setOwner('');
    setRepo('');
    setSelectedPR(null);
    setPrs([]);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!owner || !repo) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="header-left">
            <h1>🚀 Merge Cockpit</h1>
            <p>Complete visibility and control over your GitHub pull requests</p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <div className="app-container">
          <RepositorySelector onSelect={handleSelectRepository} />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>🚀 Merge Cockpit</h1>
          <p>{owner}/{repo}</p>
        </div>
        <button 
          className="btn-change-repo" 
          onClick={() => {
            setOwner('');
            setRepo('');
          }}
        >
          Change Repository
        </button>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="app-container">
        <div className="main-content">
          <div className="sidebar">
            <Dashboard
              owner={owner}
              repo={repo}
              prCount={prs.length}
              onFilterChange={handleFilterChange}
            />
            <PRList
              prs={prs}
              loading={loading}
              selectedPR={selectedPR}
              onSelectPR={handleSelectPR}
              onRefresh={loadPRs}
            />
          </div>

          <div className="content">
            {selectedPR ? (
              <PRDetails
                owner={owner}
                repo={repo}
                pr={selectedPR}
                onUpdate={handleUpdatePR}
                onMerge={handleMergePR}
              />
            ) : (
              <div className="no-selection">
                <p>Select a pull request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </div>
  );
}

export default App;
