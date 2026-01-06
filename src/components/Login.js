import React, { useState } from 'react';
import './Login.css';
import { AuthService } from '../services/auth';

function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const authService = new AuthService();

  const handleGitHubOAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.startGitHubOAuth();
      if (result && result.code) {
        authService.authenticateWithToken(result.code);
        onLoginSuccess(result.code);
      }
    } catch (err) {
      setError(`GitHub sign-in failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.startGoogleOAuth();
      if (result && result.code) {
        authService.authenticateWithToken(result.code);
        onLoginSuccess(result.code);
      }
    } catch (err) {
      setError(`Google sign-in failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleLinkedInOAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.startLinkedInOAuth();
      if (result && result.code) {
        authService.authenticateWithToken(result.code);
        onLoginSuccess(result.code);
      }
    } catch (err) {
      setError(`LinkedIn sign-in failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleTokenLogin = (e) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    try {
      authService.authenticateWithToken(token);
      onLoginSuccess(token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🚀 Merge Cockpit</h1>
          <p>GitHub PR Management Tool</p>
        </div>

        <div className="login-content">
          <h2>Sign In</h2>
          <p className="login-subtitle">Choose your preferred sign-in method</p>

          {error && <div className="error-message">{error}</div>}

          <div className="oauth-buttons">
            <button
              className="oauth-button github-btn"
              onClick={handleGitHubOAuth}
              disabled={loading}
            >
              <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {loading ? 'Signing in...' : 'Sign in with GitHub'}
            </button>

            <button
              className="oauth-button google-btn"
              onClick={handleGoogleOAuth}
              disabled={loading}
            >
              <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <button
              className="oauth-button linkedin-btn"
              onClick={handleLinkedInOAuth}
              disabled={loading}
            >
              <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.735-2.004 1.442-.103.248-.129.595-.129.943v5.42h-3.554s.047-8.733 0-9.635h3.554v1.366c.43-.664 1.198-1.608 2.913-1.608 2.122 0 3.714 1.388 3.714 4.37v5.507zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.707 0-.955.768-1.708 1.959-1.708 1.188 0 1.914.753 1.939 1.708 0 .949-.751 1.707-1.983 1.707zm1.946 11.597H3.392V9.817h3.891v10.635zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with LinkedIn'}
            </button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          {!showTokenInput ? (
            <button
              className="btn-token-input"
              onClick={() => setShowTokenInput(true)}
            >
              Use GitHub Token Instead
            </button>
          ) : (
            <form onSubmit={handleTokenLogin} className="token-form">
              <div className="form-group">
                <label htmlFor="token">GitHub Personal Access Token</label>
                <input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="token-input"
                />
                <p className="token-help">
                  <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer">Create token</a>
                </p>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        <div className="login-footer">
          <p>🔒 Your credentials are secure. Tokens are never stored on our servers.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
