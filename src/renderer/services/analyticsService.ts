import { PullRequest, RepositoryMetrics } from '../types';

export interface TrendData {
  date: string;
  openPRs: number;
  mergedPRs: number;
  conflictPRs: number;
}

export interface PredictiveMetrics {
  conflictProbability: number;
  estimatedMergeTime: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface EnhancedMetrics extends RepositoryMetrics {
  trends: TrendData[];
  conflictTrend: 'increasing' | 'decreasing' | 'stable';
  velocityTrend: 'improving' | 'declining' | 'stable';
  healthScore: number; // 0-100
}

class AnalyticsService {
  /**
   * Calculate enhanced metrics with trends and predictions
   */
  async getEnhancedMetrics(owner: string, repo: string, allPRs: PullRequest[]): Promise<EnhancedMetrics> {
    const baseMetrics = this.calculateBaseMetrics(allPRs);
    const trends = this.calculateTrends(allPRs);
    const conflictTrend = this.analyzeConflictTrend(trends);
    const velocityTrend = this.analyzeVelocityTrend(allPRs);
    const healthScore = this.calculateHealthScore(baseMetrics, conflictTrend, velocityTrend);

    return {
      ...baseMetrics,
      trends,
      conflictTrend,
      velocityTrend,
      healthScore
    };
  }

  /**
   * Predict merge conflict probability for a PR
   */
  predictMergeConflict(pr: PullRequest, repoHistory: PullRequest[]): PredictiveMetrics {
    const riskFactors: string[] = [];
    let conflictProbability = 0;

    // Factor 1: Number of changed files
    if (pr.changed_files > 10) {
      conflictProbability += 0.2;
      riskFactors.push('High number of changed files');
    }

    // Factor 2: Size of changes
    const totalChanges = pr.additions + pr.deletions;
    if (totalChanges > 500) {
      conflictProbability += 0.2;
      riskFactors.push('Large code changes');
    }

    // Factor 3: PR age
    const prAge = Date.now() - new Date(pr.created_at).getTime();
    const daysOld = prAge / (1000 * 60 * 60 * 24);
    if (daysOld > 7) {
      conflictProbability += 0.15;
      riskFactors.push('PR is stale (>7 days old)');
    }

    // Factor 4: Recent conflict history
    const recentConflicts = repoHistory
      .filter(p => p.mergeable === false)
      .filter(p => {
        const age = Date.now() - new Date(p.created_at).getTime();
        return age < 30 * 24 * 60 * 60 * 1000; // Last 30 days
      }).length;

    if (recentConflicts > 3) {
      conflictProbability += 0.15;
      riskFactors.push('Frequent recent merge conflicts in repo');
    }

    // Factor 5: Base branch activity
    // (In real implementation, would check commits to base branch)
    
    // Cap probability at 1.0
    conflictProbability = Math.min(conflictProbability, 1.0);

    // Estimate merge time based on complexity
    const estimatedMergeTime = this.estimateMergeTime(pr, conflictProbability);

    // Generate recommendations
    const recommendations = this.generateRecommendations(pr, riskFactors, conflictProbability);

    return {
      conflictProbability,
      estimatedMergeTime,
      riskFactors,
      recommendations
    };
  }

  /**
   * Analyze trends in PR activity
   */
  private calculateTrends(prs: PullRequest[]): TrendData[] {
    const trends: TrendData[] = [];
    const now = new Date();
    
    // Last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const openPRs = prs.filter(pr => {
        const created = new Date(pr.created_at);
        return created <= dayEnd && (pr.state === 'open' || new Date(pr.updated_at) >= dayStart);
      }).length;

      const mergedPRs = prs.filter(pr => {
        if (!pr.merged_at) return false;
        const merged = new Date(pr.merged_at);
        return merged >= dayStart && merged <= dayEnd;
      }).length;

      const conflictPRs = prs.filter(pr => {
        const created = new Date(pr.created_at);
        return pr.mergeable === false && created <= dayEnd && (pr.state === 'open' || new Date(pr.updated_at) >= dayStart);
      }).length;

      trends.push({
        date: dateStr,
        openPRs,
        mergedPRs,
        conflictPRs
      });
    }

    return trends;
  }

  /**
   * Calculate base repository metrics
   */
  private calculateBaseMetrics(allPRs: PullRequest[]): RepositoryMetrics {
    const openPRs = allPRs.filter(pr => pr.state === 'open');
    const mergedPRs = allPRs.filter(pr => pr.merged_at);
    const closedPRs = allPRs.filter(pr => pr.state === 'closed' && !pr.merged_at);
    
    const mergeTimes = mergedPRs
      .filter(pr => pr.merged_at && pr.created_at)
      .map(pr => {
        const created = new Date(pr.created_at).getTime();
        const merged = new Date(pr.merged_at!).getTime();
        return merged - created;
      });
    
    const avgMergeTime = mergeTimes.length > 0
      ? mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length
      : 0;
    
    const mergeConflicts = allPRs.filter(pr => pr.mergeable === false).length;
    
    return {
      totalPRs: allPRs.length,
      openPRs: openPRs.length,
      mergedPRs: mergedPRs.length,
      closedPRs: closedPRs.length,
      avgMergeTime: avgMergeTime / (1000 * 60 * 60), // Convert to hours
      mergeConflicts
    };
  }

  /**
   * Analyze conflict trend direction
   */
  private analyzeConflictTrend(trends: TrendData[]): 'increasing' | 'decreasing' | 'stable' {
    if (trends.length < 7) return 'stable';

    const recentWeek = trends.slice(-7);
    const previousWeek = trends.slice(-14, -7);

    const recentAvg = recentWeek.reduce((sum, t) => sum + t.conflictPRs, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, t) => sum + t.conflictPRs, 0) / previousWeek.length;

    const changePercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    if (changePercent > 20) return 'increasing';
    if (changePercent < -20) return 'decreasing';
    return 'stable';
  }

  /**
   * Analyze velocity trend
   */
  private analyzeVelocityTrend(prs: PullRequest[]): 'improving' | 'declining' | 'stable' {
    const recentPRs = prs
      .filter(pr => pr.merged_at)
      .filter(pr => {
        const merged = new Date(pr.merged_at!).getTime();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return merged >= thirtyDaysAgo;
      });

    if (recentPRs.length < 5) return 'stable';

    const recentWeek = recentPRs.filter(pr => {
      const merged = new Date(pr.merged_at!).getTime();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return merged >= sevenDaysAgo;
    });

    const previousWeek = recentPRs.filter(pr => {
      const merged = new Date(pr.merged_at!).getTime();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      return merged >= fourteenDaysAgo && merged < sevenDaysAgo;
    });

    const recentCount = recentWeek.length;
    const previousCount = previousWeek.length;

    if (recentCount > previousCount * 1.2) return 'improving';
    if (recentCount < previousCount * 0.8) return 'declining';
    return 'stable';
  }

  /**
   * Calculate repository health score
   */
  private calculateHealthScore(
    metrics: RepositoryMetrics,
    conflictTrend: 'increasing' | 'decreasing' | 'stable',
    velocityTrend: 'improving' | 'declining' | 'stable'
  ): number {
    let score = 100;

    // Deduct for high number of open PRs
    if (metrics.openPRs > 20) score -= 15;
    else if (metrics.openPRs > 10) score -= 10;
    else if (metrics.openPRs > 5) score -= 5;

    // Deduct for merge conflicts
    const conflictRate = metrics.totalPRs > 0 ? metrics.mergeConflicts / metrics.totalPRs : 0;
    if (conflictRate > 0.3) score -= 20;
    else if (conflictRate > 0.15) score -= 10;
    else if (conflictRate > 0.05) score -= 5;

    // Deduct for slow merge times
    if (metrics.avgMergeTime > 72) score -= 15; // > 3 days
    else if (metrics.avgMergeTime > 48) score -= 10; // > 2 days
    else if (metrics.avgMergeTime > 24) score -= 5; // > 1 day

    // Adjust for trends
    if (conflictTrend === 'increasing') score -= 10;
    else if (conflictTrend === 'decreasing') score += 5;

    if (velocityTrend === 'improving') score += 5;
    else if (velocityTrend === 'declining') score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate merge time based on PR complexity
   */
  private estimateMergeTime(pr: PullRequest, conflictProbability: number): number {
    let baseTime = 2; // Base 2 hours for simple PRs

    // Adjust for size
    const totalChanges = pr.additions + pr.deletions;
    if (totalChanges > 1000) baseTime += 8;
    else if (totalChanges > 500) baseTime += 4;
    else if (totalChanges > 100) baseTime += 2;

    // Adjust for file count
    if (pr.changed_files > 20) baseTime += 4;
    else if (pr.changed_files > 10) baseTime += 2;

    // Adjust for conflict probability
    baseTime += conflictProbability * 24; // Up to 24 hours for high conflict risk

    return baseTime;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    pr: PullRequest,
    riskFactors: string[],
    conflictProbability: number
  ): string[] {
    const recommendations: string[] = [];

    if (conflictProbability > 0.5) {
      recommendations.push('High conflict risk - consider rebasing before merge');
    }

    if (pr.changed_files > 10) {
      recommendations.push('Consider splitting into smaller PRs for easier review');
    }

    const prAge = Date.now() - new Date(pr.created_at).getTime();
    const daysOld = prAge / (1000 * 60 * 60 * 24);
    if (daysOld > 7) {
      recommendations.push('Update branch with latest changes from base');
    }

    if (pr.additions + pr.deletions > 500) {
      recommendations.push('Large changeset - ensure comprehensive testing');
    }

    if (pr.comments === 0 && daysOld > 2) {
      recommendations.push('No review comments yet - request reviewers');
    }

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();
