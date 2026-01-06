import React, { useState, useEffect } from 'react';
import { PullRequest, Repository, OllamaAnalysis } from '../types';
import { ollamaService } from '../services/ollamaService';
import { githubService } from '../services/githubService';
import '../styles/PullRequestDetail.css';

interface PullRequestDetailProps {
  pullRequest: PullRequest;
  repository: Repository;
  onBack: () => void;
}

export const PullRequestDetail: React.FC<PullRequestDetailProps> = ({
  pullRequest,
  repository,
  onBack
}) => {
  const [analysis, setAnalysis] = useState<OllamaAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [pullRequest]);

  const loadAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await ollamaService.analyzePullRequest(pullRequest);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze PR:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMerge = async () => {
    if (!confirm('Are you sure you want to merge this pull request?')) return;
    
    setMerging(true);
    try {
      const success = await githubService.mergePullRequest(
        repository.owner.login,
        repository.name,
        pullRequest.number
      );
      if (success) {
        alert('Pull request merged successfully!');
        onBack();
      } else {
        alert('Failed to merge pull request');
      }
    } catch (error) {
      alert('Error merging pull request');
    } finally {
      setMerging(false);
    }
  };

  const handleExportToGPT = async () => {
    const context = `Pull Request #${pullRequest.number}: ${pullRequest.title}\n\n${pullRequest.body}`;
    const exported = await ollamaService.exportToGPT(context);
    navigator.clipboard.writeText(exported);
    alert('Context copied to clipboard! Paste it into your GPT conversation.');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#4caf50';
      case 'high': return '#f44336';
      default: return '#ff9800';
    }
  };

  return (
    <div className="pull-request-detail">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <h2>#{pullRequest.number}: {pullRequest.title}</h2>
      </div>

      <div className="detail-content">
        <div className="pr-info-section">
          <div className="pr-metadata">
            <div className="metadata-item">
              <strong>Author:</strong>
              <span>
                <img src={pullRequest.user.avatar_url} alt={pullRequest.user.login} />
                {pullRequest.user.login}
              </span>
            </div>
            <div className="metadata-item">
              <strong>State:</strong>
              <span className={`state-badge ${pullRequest.state}`}>
                {pullRequest.merged_at ? 'Merged' : pullRequest.state}
              </span>
            </div>
            <div className="metadata-item">
              <strong>Branch:</strong>
              <span>{pullRequest.head.ref} → {pullRequest.base.ref}</span>
            </div>
            <div className="metadata-item">
              <strong>Changes:</strong>
              <span>
                +{pullRequest.additions} -{pullRequest.deletions} | {pullRequest.changed_files} files
              </span>
            </div>
          </div>

          <div className="pr-description">
            <h3>Description</h3>
            <p>{pullRequest.body || 'No description provided'}</p>
          </div>

          {pullRequest.state === 'open' && (
            <div className="pr-actions">
              <button onClick={handleMerge} disabled={merging || !pullRequest.mergeable}>
                {merging ? 'Merging...' : 'Merge Pull Request'}
              </button>
              {pullRequest.mergeable === false && (
                <span className="warning">⚠️ Has merge conflicts</span>
              )}
            </div>
          )}
        </div>

        <div className="ai-analysis-section">
          <div className="section-header">
            <h3>AI Analysis (Ollama)</h3>
            <div className="ai-actions">
              <button onClick={loadAnalysis} disabled={analyzing}>
                {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
              <button onClick={handleExportToGPT}>
                Export to GPT
              </button>
            </div>
          </div>

          {analyzing && <div className="loading">Analyzing with Ollama...</div>}

          {!analyzing && analysis && (
            <div className="analysis-results">
              <div className="analysis-item">
                <h4>Summary</h4>
                <p>{analysis.summary}</p>
              </div>

              <div className="analysis-item">
                <h4>Risk Assessment</h4>
                <span 
                  className="risk-badge" 
                  style={{ backgroundColor: getRiskColor(analysis.riskAssessment) }}
                >
                  {analysis.riskAssessment.toUpperCase()}
                </span>
              </div>

              {analysis.suggestedReviewers.length > 0 && (
                <div className="analysis-item">
                  <h4>Suggested Reviewers</h4>
                  <ul>
                    {analysis.suggestedReviewers.map((reviewer, idx) => (
                      <li key={idx}>{reviewer}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.potentialIssues.length > 0 && (
                <div className="analysis-item">
                  <h4>Potential Issues</h4>
                  <ul>
                    {analysis.potentialIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.suggestions.length > 0 && (
                <div className="analysis-item">
                  <h4>Suggestions</h4>
                  <ul>
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
