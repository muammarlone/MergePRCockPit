import React, { useEffect, useState } from 'react';
import { Repository, PullRequest, ConflictAnalysis, RemediationSuggestion } from '../types';
import { mergeRemediationService } from '../services/mergeRemediationService';
import '../styles/RemediationDashboard.css';

interface RemediationDashboardProps {
  repository: Repository;
  pullRequests: PullRequest[];
}

interface ConflictStats {
  totalConflicts: number;
  conflictRate: number;
  avgResolutionTime: number;
  commonPatterns: string[];
}

export const RemediationDashboard: React.FC<RemediationDashboardProps> = ({ 
  repository, 
  pullRequests 
}) => {
  const [conflictPRs, setConflictPRs] = useState<PullRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [analysis, setAnalysis] = useState<ConflictAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<RemediationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ConflictStats | null>(null);

  useEffect(() => {
    // Filter PRs with conflicts
    const prsWithConflicts = pullRequests.filter(pr => pr.mergeable === false);
    setConflictPRs(prsWithConflicts);

    // Get conflict statistics
    const conflictStats = mergeRemediationService.getConflictStats(pullRequests);
    setStats(conflictStats);
  }, [pullRequests]);

  const analyzePR = async (pr: PullRequest) => {
    setSelectedPR(pr);
    setLoading(true);

    try {
      const conflictAnalysis = await mergeRemediationService.analyzeConflicts(
        repository.owner.login,
        repository.name,
        pr
      );
      setAnalysis(conflictAnalysis);

      const remediationSuggestions = await mergeRemediationService.getRemediationSuggestions(pr);
      setSuggestions(remediationSuggestions);
    } catch (error) {
      console.error('Failed to analyze PR:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity: string): string => {
    if (severity === 'high') return 'severity-high';
    if (severity === 'medium') return 'severity-medium';
    return 'severity-low';
  };

  const getConfidenceClass = (confidence: number): string => {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <div className="remediation-dashboard">
      <h2>🔧 Merge Conflict Remediation Dashboard</h2>

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Conflicts</h3>
            <div className="stat-value">{stats.totalConflicts}</div>
          </div>
          <div className="stat-card">
            <h3>Conflict Rate</h3>
            <div className="stat-value">{(stats.conflictRate * 100).toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <h3>Avg Resolution Time</h3>
            <div className="stat-value">{stats.avgResolutionTime.toFixed(1)}h</div>
          </div>
        </div>
      )}

      {/* Common Patterns */}
      {stats && stats.commonPatterns.length > 0 && (
        <div className="patterns-section">
          <h3>🔍 Common Conflict Patterns</h3>
          <ul className="patterns-list">
            {stats.commonPatterns.map((pattern, index) => (
              <li key={index}>{pattern}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Conflict PRs List */}
      <div className="conflict-prs-section">
        <h3>Pull Requests with Conflicts ({conflictPRs.length})</h3>
        
        {conflictPRs.length === 0 ? (
          <div className="no-conflicts">
            ✅ No merge conflicts detected! All PRs are ready for review.
          </div>
        ) : (
          <div className="pr-list">
            {conflictPRs.map(pr => (
              <div 
                key={pr.id} 
                className={`pr-item ${selectedPR?.id === pr.id ? 'selected' : ''}`}
                onClick={() => analyzePR(pr)}
              >
                <div className="pr-header">
                  <span className="pr-number">#{pr.number}</span>
                  <span className="pr-title">{pr.title}</span>
                </div>
                <div className="pr-meta">
                  <span>{pr.changed_files} files</span>
                  <span>+{pr.additions} -{pr.deletions}</span>
                  <span>{pr.user.login}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Section */}
      {selectedPR && (
        <div className="analysis-section">
          <h3>Analysis for PR #{selectedPR.number}</h3>
          
          {loading ? (
            <div className="loading">Analyzing conflicts...</div>
          ) : analysis ? (
            <>
              <div className="analysis-summary">
                <div className={`severity-badge ${getSeverityClass(analysis.severity)}`}>
                  Severity: {analysis.severity.toUpperCase()}
                </div>
                {analysis.autoResolvable && (
                  <div className="auto-resolve-badge">Auto-resolvable</div>
                )}
              </div>

              {analysis.conflictFiles.length > 0 && (
                <div className="conflict-files">
                  <h4>Conflicting Files:</h4>
                  <ul>
                    {analysis.conflictFiles.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="suggested-actions">
                <h4>Suggested Actions:</h4>
                <ul>
                  {analysis.suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              {analysis.aiRemediation && (
                <div className="ai-remediation">
                  <h4>🤖 AI-Powered Remediation Advice:</h4>
                  <p>{analysis.aiRemediation}</p>
                </div>
              )}

              {/* Remediation Suggestions */}
              {suggestions.length > 0 && (
                <div className="remediation-suggestions">
                  <h4>Remediation Strategies:</h4>
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-card">
                      <div className="suggestion-header">
                        <h5>{suggestion.description}</h5>
                        <div className="suggestion-meta">
                          <span className={`confidence-badge ${getConfidenceClass(suggestion.confidence)}`}>
                            {(suggestion.confidence * 100).toFixed(0)}% confidence
                          </span>
                          <span className="time-estimate">~{suggestion.estimatedTime} min</span>
                        </div>
                      </div>
                      <div className="suggestion-steps">
                        <strong>Steps:</strong>
                        <ol>
                          {suggestion.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="error">Failed to analyze PR</div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <h3>💡 Tips for Preventing Conflicts</h3>
        <ul>
          <li>Keep feature branches up to date with base branch</li>
          <li>Break large changes into smaller, focused PRs</li>
          <li>Communicate with team about overlapping work</li>
          <li>Use the predictive analytics to identify high-risk PRs early</li>
          <li>Establish clear code ownership and review guidelines</li>
        </ul>
      </div>
    </div>
  );
};
