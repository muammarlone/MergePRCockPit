import React, { useState, useEffect } from 'react';
import { PullRequest, ConflictPrediction, RemediationSuggestion } from '../types';
import { conflictPredictionService } from '../services/conflictPredictionService';
import '../styles/RemediationDashboard.css';

interface RemediationDashboardProps {
  pullRequests: PullRequest[];
  repository: { owner: string; name: string };
}

export const RemediationDashboard: React.FC<RemediationDashboardProps> = ({ 
  pullRequests
}) => {
  const [predictions, setPredictions] = useState<ConflictPrediction[]>([]);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [remediations, setRemediations] = useState<RemediationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAIAvailable] = useState(false);

  useEffect(() => {
    checkAIAvailability();
    if (pullRequests.length > 0) {
      analyzePullRequests();
    }
  }, [pullRequests]);

  const checkAIAvailability = async () => {
    const available = await conflictPredictionService.testConnection();
    setAIAvailable(available);
  };

  const analyzePullRequests = async () => {
    setLoading(true);
    try {
      // Analyze high-risk PRs (with conflicts or large changes)
      const highRiskPRs = pullRequests.filter(
        pr => pr.mergeable === false || pr.changed_files > 10
      );

      const predictionPromises = highRiskPRs.slice(0, 10).map(pr =>
        conflictPredictionService.predictConflicts(pr)
      );

      const results = await Promise.all(predictionPromises);
      setPredictions(results.filter(p => p.probability > 20)); // Show predictions > 20%
    } catch (error) {
      console.error('Failed to analyze PRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRemediations = async (prNumber: number) => {
    setLoading(true);
    setSelectedPR(prNumber);
    
    try {
      const prediction = predictions.find(p => p.prNumber === prNumber);
      if (!prediction) return;

      const pr = pullRequests.find(p => p.number === prNumber);
      const context = pr ? `PR #${pr.number}: ${pr.title}\n${pr.body}` : '';

      const suggestions = await conflictPredictionService.generateRemediationSuggestions(
        prNumber,
        prediction.conflictingFiles,
        context
      );

      setRemediations(suggestions);
    } catch (error) {
      console.error('Failed to load remediations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRemediation = async (remediation: RemediationSuggestion) => {
    // In production, this would apply the suggested fix
    console.log('Applying remediation:', remediation);
    
    // Mark as applied
    setRemediations(prev => 
      prev.map(r => r.id === remediation.id ? { ...r, applied: true } : r)
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="remediation-dashboard">
      <div className="dashboard-header">
        <h2>🔧 Merge Remediation Dashboard</h2>
        {!aiAvailable && (
          <div className="ai-warning">
            ⚠️ AI service not available. Install Ollama for predictive analysis.
          </div>
        )}
      </div>

      <div className="dashboard-content">
        <div className="predictions-panel">
          <h3>Conflict Predictions</h3>
          {loading && predictions.length === 0 ? (
            <div className="loading">Analyzing pull requests...</div>
          ) : predictions.length === 0 ? (
            <div className="empty-state">
              <p>No high-risk conflicts detected</p>
              <p className="subtitle">All PRs appear to be in good shape!</p>
            </div>
          ) : (
            <div className="predictions-list">
              {predictions.map(prediction => {
                const pr = pullRequests.find(p => p.number === prediction.prNumber);
                return (
                  <div 
                    key={prediction.prNumber} 
                    className={`prediction-card ${selectedPR === prediction.prNumber ? 'selected' : ''}`}
                    onClick={() => loadRemediations(prediction.prNumber)}
                  >
                    <div className="prediction-header">
                      <span className="pr-number">PR #{prediction.prNumber}</span>
                      <span 
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(prediction.riskLevel) }}
                      >
                        {prediction.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="prediction-title">{pr?.title || 'Unknown PR'}</div>
                    <div className="prediction-meta">
                      <div className="meta-item">
                        <span className="label">Conflict Probability:</span>
                        <span className="value">{prediction.probability}%</span>
                      </div>
                      {prediction.conflictingFiles.length > 0 && (
                        <div className="meta-item">
                          <span className="label">Conflicting Files:</span>
                          <span className="value">{prediction.conflictingFiles.length}</span>
                        </div>
                      )}
                      {prediction.autoFixable && (
                        <span className="auto-fix-badge">✨ Auto-fixable</span>
                      )}
                    </div>
                    {prediction.suggestedActions.length > 0 && (
                      <div className="quick-actions">
                        <strong>Suggested Actions:</strong>
                        <ul>
                          {prediction.suggestedActions.slice(0, 2).map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="remediations-panel">
          <h3>Remediation Suggestions</h3>
          {selectedPR === null ? (
            <div className="empty-state">
              <p>Select a PR to view remediation suggestions</p>
            </div>
          ) : loading ? (
            <div className="loading">Generating remediation suggestions...</div>
          ) : remediations.length === 0 ? (
            <div className="empty-state">
              <p>No remediations available</p>
            </div>
          ) : (
            <div className="remediations-list">
              {remediations.map(remediation => (
                <div key={remediation.id} className={`remediation-card ${remediation.applied ? 'applied' : ''}`}>
                  <div className="remediation-header">
                    <span className={`type-badge type-${remediation.type}`}>
                      {remediation.type.toUpperCase()}
                    </span>
                    <span className="confidence">
                      Confidence: {remediation.confidence}%
                    </span>
                  </div>
                  <div className="remediation-file">
                    📄 {remediation.conflictFile}
                  </div>
                  <div className="remediation-description">
                    {remediation.description}
                  </div>
                  <div className="remediation-resolution">
                    <strong>Suggested Resolution:</strong>
                    <pre>{remediation.suggestedResolution}</pre>
                  </div>
                  <div className="remediation-actions">
                    {!remediation.applied ? (
                      <>
                        {remediation.type === 'auto-resolve' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => applyRemediation(remediation)}
                          >
                            Auto-Resolve
                          </button>
                        )}
                        {remediation.type === 'fix' && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => applyRemediation(remediation)}
                          >
                            Apply Fix
                          </button>
                        )}
                        {remediation.type === 'suggest' && (
                          <button className="btn btn-tertiary">
                            View Details
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="applied-badge">✓ Applied</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
