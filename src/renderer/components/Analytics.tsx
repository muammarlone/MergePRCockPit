import React from 'react';
import { RepositoryMetrics, Repository } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/Analytics.css';

interface AnalyticsProps {
  metrics: RepositoryMetrics;
  repository: Repository;
}

export const Analytics: React.FC<AnalyticsProps> = ({ metrics, repository }) => {
  const prStateData = [
    { name: 'Open', value: metrics.openPRs, color: '#2196f3' },
    { name: 'Merged', value: metrics.mergedPRs, color: '#4caf50' },
    { name: 'Closed', value: metrics.closedPRs, color: '#f44336' }
  ];

  const chartData = [
    { name: 'Open', count: metrics.openPRs },
    { name: 'Merged', count: metrics.mergedPRs },
    { name: 'Closed', count: metrics.closedPRs }
  ];

  return (
    <div className="analytics">
      <h2>Repository Analytics - {repository.name}</h2>

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
          <h3>Closed PRs</h3>
          <div className="metric-value closed">{metrics.closedPRs}</div>
        </div>
        <div className="metric-card">
          <h3>Avg Merge Time</h3>
          <div className="metric-value">{metrics.avgMergeTime.toFixed(1)}h</div>
        </div>
        <div className="metric-card">
          <h3>Merge Conflicts</h3>
          <div className="metric-value warning">{metrics.mergeConflicts}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>PR Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>PR State Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prStateData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {prStateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insights">
        <h3>Insights</h3>
        <ul>
          <li>
            Merge rate: {metrics.totalPRs > 0 
              ? ((metrics.mergedPRs / metrics.totalPRs) * 100).toFixed(1) 
              : 0}%
          </li>
          <li>
            Average time to merge: {metrics.avgMergeTime.toFixed(1)} hours
          </li>
          {metrics.mergeConflicts > 0 && (
            <li className="warning">
              ⚠️ {metrics.mergeConflicts} pull requests have merge conflicts
            </li>
          )}
          {metrics.openPRs > 10 && (
            <li className="info">
              ℹ️ High number of open PRs ({metrics.openPRs}). Consider reviewing backlog.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
