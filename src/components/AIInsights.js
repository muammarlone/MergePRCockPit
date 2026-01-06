import React, { useState, useEffect } from 'react';
import './AIInsights.css';

function AIInsights({ owner, repo, pr, loading = false }) {
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    if (pr) {
      loadInsights();
    }
  }, [pr?.number]);

  const loadInsights = async () => {
    setInsightsLoading(true);
    setError(null);

    try {
      // Safety check for electronAPI
      if (!window.electronAPI) {
        setApiAvailable(false);
        setError('Electron API not available');
        console.error('electronAPI is not available');
        return;
      }

      const token = localStorage.getItem('github_token');
      const response = await window.electronAPI.getAIInsights(owner, repo, pr.number, token);
      
      if (response) {
        setInsights(response);
        // Expand first section by default
        if (Object.keys(expandedSections).length === 0) {
          setExpandedSections({ risk: true });
        }
      } else {
        setInsights(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading AI insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return 'risk-high';
      case 'MEDIUM':
        return 'risk-medium';
      case 'LOW':
        return 'risk-low';
      default:
        return 'risk-unknown';
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading || insightsLoading) {
    return (
      <div className="ai-insights loading">
        <div className="insight-spinner">
          <span className="spinner-animation">⟳</span>
          <span>Analyzing with AI...</span>
        </div>
      </div>
    );
  }

  if (!apiAvailable) {
    return (
      <div className="ai-insights disabled">
        <div className="insight-error">
          <h4>⚠️ AI Analysis Unavailable</h4>
          <p>The Electron API is not available. Check console for details.</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="ai-insights disabled">
        <div className="insight-notice">
          <h4>🤖 AI Insights</h4>
          <p>Not available for this PR</p>
          <small>Configure Ollama for intelligent PR analysis</small>
          <button onClick={loadInsights} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <h3>🤖 AI-Powered Analysis</h3>
        <button 
          className="btn-refresh-insights" 
          onClick={loadInsights} 
          disabled={insightsLoading}
          title="Refresh analysis"
        >
          ⟳
        </button>
      </div>

      {error && (
        <div className="insight-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="insights-grid">
        {/* Risk Assessment */}
        {insights.risk && (
          <div className={`insight-section ${getRiskColor(insights.risk.level)}`}>
            <div
              className="insight-header"
              onClick={() => toggleSection('risk')}
            >
              <div className="insight-title-wrapper">
                <span className="insight-icon">⚠️</span>
                <span className="insight-title">Risk Assessment</span>
              </div>
              <div className="insight-controls">
                <span className={`risk-badge ${getRiskColor(insights.risk.level)}`}>
                  {insights.risk.level}
                </span>
                <span className={`expand-arrow ${expandedSections.risk ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
            </div>
            {expandedSections.risk && (
              <div className="insight-content">
                <p>{insights.risk.reason}</p>
              </div>
            )}
          </div>
        )}

        {/* PR Summary */}
        {insights.summary && (
          <div className="insight-section insight-summary">
            <div
              className="insight-header"
              onClick={() => toggleSection('summary')}
            >
              <div className="insight-title-wrapper">
                <span className="insight-icon">📝</span>
                <span className="insight-title">Summary</span>
              </div>
              <span className={`expand-arrow ${expandedSections.summary ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.summary && (
              <div className="insight-content">
                <p>{insights.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Suggested Title */}
        {insights.suggestedTitle && insights.suggestedTitle !== pr.title && (
          <div className="insight-section insight-title-suggestion">
            <div
              className="insight-header"
              onClick={() => toggleSection('title')}
            >
              <div className="insight-title-wrapper">
                <span className="insight-icon">✏️</span>
                <span className="insight-title">Title Suggestion</span>
              </div>
              <span className={`expand-arrow ${expandedSections.title ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.title && (
              <div className="insight-content">
                <div className="suggestion-comparison">
                  <div className="suggestion-item">
                    <span className="label">Current:</span>
                    <span className="value current">{pr.title}</span>
                  </div>
                  <div className="suggestion-item">
                    <span className="label">Suggested:</span>
                    <span className="value suggested">{insights.suggestedTitle}</span>
                  </div>
                  <button className="btn-copy-suggestion" onClick={() => {
                    navigator.clipboard.writeText(insights.suggestedTitle);
                    alert('Copied to clipboard!');
                  }}>
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Suggestions */}
        {insights.reviewComments && (
          <div className="insight-section insight-comments">
            <div
              className="insight-header"
              onClick={() => toggleSection('comments')}
            >
              <div className="insight-title-wrapper">
                <span className="insight-icon">💬</span>
                <span className="insight-title">Review Focus Areas</span>
              </div>
              <span className={`expand-arrow ${expandedSections.comments ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.comments && (
              <div className="insight-content">
                <p>{insights.reviewComments}</p>
              </div>
            )}
          </div>
        )}

        {/* Reviewer Suggestions */}
        {insights.reviewerSuggestions && (
          <div className="insight-section insight-reviewers">
            <div
              className="insight-header"
              onClick={() => toggleSection('reviewers')}
            >
              <div className="insight-title-wrapper">
                <span className="insight-icon">👥</span>
                <span className="insight-title">Suggested Reviewers</span>
              </div>
              <span className={`expand-arrow ${expandedSections.reviewers ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.reviewers && (
              <div className="insight-content">
                <p>{insights.reviewerSuggestions}</p>
              </div>
            )}
          </div>
        )}

        {/* Commit Message */}
        {insights.commitMessage && (
          <div className="insight-section insight-commit">
            <div
              className="insight-header"
              onClick={() => toggleSection('commit')}
            >
              <div className="insight-title-wrapper">
                <span className="insight-icon">🔗</span>
                <span className="insight-title">Commit Message</span>
              </div>
              <span className={`expand-arrow ${expandedSections.commit ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.commit && (
              <div className="insight-content">
                <code className="commit-message">{insights.commitMessage}</code>
                <button className="btn-copy-suggestion" onClick={() => {
                  navigator.clipboard.writeText(insights.commitMessage);
                  alert('Copied to clipboard!');
                }}>
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!insights.summary && !insights.risk && !insights.reviewComments && (
        <div className="insight-notice">
          <p>No AI insights available at this time</p>
        </div>
      )}
    </div>
  );
}

export default AIInsights;
