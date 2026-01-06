import React, { useEffect, useState } from 'react';
import { Repository, PullRequest, EnhancedMetrics } from '../types';
import { analyticsService } from '../services/analyticsService';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/EnhancedAnalytics.css';

interface EnhancedAnalyticsProps {
  repository: Repository;
  pullRequests: PullRequest[];
}

export const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({ repository, pullRequests }) => {
  const [metrics, setMetrics] = useState<EnhancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const enhancedMetrics = await analyticsService.getEnhancedMetrics(
          repository.owner.login,
          repository.name,
          pullRequests
        );
        setMetrics(enhancedMetrics);
      } catch (error) {
        console.error('Failed to load enhanced metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [repository, pullRequests]);

  if (loading) {
    return <div className="enhanced-analytics loading">Loading enhanced analytics...</div>;
  }

  if (!metrics) {
    return <div className="enhanced-analytics error">Failed to load analytics</div>;
  }

  const getHealthScoreClass = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const getTrendIcon = (trend: string): string => {
    if (trend === 'increasing' || trend === 'improving') return '📈';
    if (trend === 'decreasing' || trend === 'declining') return '📉';
    return '➡️';
  };

  return (
    <div className="enhanced-analytics">
      <h2>Enhanced Analytics - {repository.name}</h2>

      {/* Health Score Section */}
      <div className="health-score-section">
        <div className={`health-score ${getHealthScoreClass(metrics.healthScore)}`}>
          <div className="score-label">Repository Health Score</div>
          <div className="score-value">{metrics.healthScore.toFixed(0)}</div>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ width: `${metrics.healthScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total PRs</h3>
          <div className="metric-value">{metrics.totalPRs}</div>
        </div>
        <div className="metric-card">
          <h3>Open PRs</h3>
          <div className="metric-value open">{metrics.openPRs}</div>
        </div>
        <div className="metric-card">
          <h3>Merged PRs</h3>
          <div className="metric-value merged">{metrics.mergedPRs}</div>
        </div>
        <div className="metric-card">
          <h3>Merge Conflicts</h3>
          <div className="metric-value warning">{metrics.mergeConflicts}</div>
        </div>
        <div className="metric-card">
          <h3>Avg Merge Time</h3>
          <div className="metric-value">{metrics.avgMergeTime.toFixed(1)}h</div>
        </div>
        <div className="metric-card">
          <h3>Merge Rate</h3>
          <div className="metric-value">
            {metrics.totalPRs > 0 
              ? ((metrics.mergedPRs / metrics.totalPRs) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div className="trends-section">
        <div className="trend-indicator">
          <span className="trend-icon">{getTrendIcon(metrics.conflictTrend)}</span>
          <span className="trend-label">Conflict Trend:</span>
          <span className={`trend-value ${metrics.conflictTrend}`}>
            {metrics.conflictTrend}
          </span>
        </div>
        <div className="trend-indicator">
          <span className="trend-icon">{getTrendIcon(metrics.velocityTrend)}</span>
          <span className="trend-label">Velocity Trend:</span>
          <span className={`trend-value ${metrics.velocityTrend}`}>
            {metrics.velocityTrend}
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>PR Activity Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="openPRs" stroke="#2196f3" name="Open PRs" strokeWidth={2} />
              <Line type="monotone" dataKey="mergedPRs" stroke="#4caf50" name="Merged PRs" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Conflict Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Area type="monotone" dataKey="conflictPRs" stroke="#f44336" fill="#f4433644" name="Conflicts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>📊 Key Insights</h3>
        <ul className="insights-list">
          <li>
            <strong>Repository Health:</strong> {
              metrics.healthScore >= 80 ? 'Excellent - Repository is well maintained' :
              metrics.healthScore >= 60 ? 'Good - Minor improvements recommended' :
              metrics.healthScore >= 40 ? 'Fair - Several areas need attention' :
              'Poor - Immediate action required'
            }
          </li>
          {metrics.conflictTrend === 'increasing' && (
            <li className="warning">
              ⚠️ Merge conflicts are increasing. Consider reviewing branching strategy and team coordination.
            </li>
          )}
          {metrics.velocityTrend === 'declining' && (
            <li className="warning">
              ⚠️ Merge velocity is declining. Review PR review process and bottlenecks.
            </li>
          )}
          {metrics.openPRs > 15 && (
            <li className="warning">
              ℹ️ High number of open PRs ({metrics.openPRs}). Consider prioritizing PR reviews.
            </li>
          )}
          {metrics.avgMergeTime > 48 && (
            <li className="info">
              ℹ️ Average merge time is {metrics.avgMergeTime.toFixed(1)} hours. Consider streamlining review process.
            </li>
          )}
          {metrics.conflictTrend === 'decreasing' && metrics.velocityTrend === 'improving' && (
            <li className="success">
              ✅ Great progress! Conflicts are decreasing and velocity is improving.
            </li>
          )}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Recommendations</h3>
        <ul className="recommendations-list">
          {metrics.healthScore < 60 && (
            <li>Focus on reducing open PR count and resolving conflicts promptly</li>
          )}
          {metrics.conflictTrend === 'increasing' && (
            <li>Implement pre-merge conflict detection and coordinate feature development</li>
          )}
          {metrics.avgMergeTime > 72 && (
            <li>Set up automated reviews and establish SLAs for PR reviews</li>
          )}
          {metrics.openPRs > 20 && (
            <li>Close or merge stale PRs and improve PR prioritization</li>
          )}
          <li>Use the Remediation Dashboard to proactively address merge conflicts</li>
        </ul>
      </div>
    </div>
  );
};
