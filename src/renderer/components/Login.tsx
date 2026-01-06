import React, { useState } from 'react';
import { authService } from '../services/authService';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.loginWithGoogle();
      onLoginSuccess();
    } catch (err) {
      setError('Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.loginWithGitHub();
      onLoginSuccess();
    } catch (err) {
      setError('Failed to login with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.loginWithEmail(email, password);
      onLoginSuccess();
    } catch (err) {
      setError('Failed to login with email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>MergePR Cockpit</h1>
        <p className="subtitle">GitOps Management Platform</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="oauth-buttons">
          <button 
            className="oauth-button google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="oauth-icon">G</span>
            Sign in with Google
          </button>
          
          <button 
            className="oauth-button github"
            onClick={handleGitHubLogin}
            disabled={loading}
          >
            <span className="oauth-icon">⚡</span>
            Sign in with GitHub
          </button>
        </div>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <form onSubmit={handleEmailLogin} className="email-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>
      </div>
    </div>
  );
};
