import { analyticsService } from '../analyticsService';
import { PullRequest } from '../../types';

// Mock pull requests for testing
const createMockPR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  id: 1,
  number: 1,
  title: 'Test PR',
  state: 'open',
  user: { login: 'testuser', avatar_url: '' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  head: { ref: 'feature', sha: 'abc123' },
  base: { ref: 'main', sha: 'def456' },
  body: 'Test description',
  html_url: 'https://github.com/test/test/pull/1',
  mergeable: true,
  comments: 0,
  commits: 1,
  additions: 10,
  deletions: 5,
  changed_files: 2,
  ...overrides
});

describe('AnalyticsService', () => {
  describe('getEnhancedMetrics', () => {
    test('should calculate basic metrics correctly', async () => {
      const prs: PullRequest[] = [
        createMockPR({ state: 'open' }),
        createMockPR({ state: 'open', number: 2 }),
        createMockPR({ state: 'closed', merged_at: new Date().toISOString(), number: 3 }),
      ];

      const metrics = await analyticsService.getEnhancedMetrics('owner', 'repo', prs);

      expect(metrics.totalPRs).toBe(3);
      expect(metrics.openPRs).toBe(2);
      expect(metrics.mergedPRs).toBe(1);
      expect(metrics.closedPRs).toBe(0);
    });

    test('should calculate health score', async () => {
      const prs: PullRequest[] = [
        createMockPR(),
      ];

      const metrics = await analyticsService.getEnhancedMetrics('owner', 'repo', prs);

      expect(metrics.healthScore).toBeGreaterThanOrEqual(0);
      expect(metrics.healthScore).toBeLessThanOrEqual(100);
    });

    test('should generate trend data', async () => {
      const prs: PullRequest[] = [
        createMockPR(),
      ];

      const metrics = await analyticsService.getEnhancedMetrics('owner', 'repo', prs);

      expect(metrics.trends).toBeDefined();
      expect(metrics.trends.length).toBe(30); // 30 days of trends
      expect(metrics.trends[0]).toHaveProperty('date');
      expect(metrics.trends[0]).toHaveProperty('openPRs');
      expect(metrics.trends[0]).toHaveProperty('mergedPRs');
      expect(metrics.trends[0]).toHaveProperty('conflictPRs');
    });

    test('should determine conflict trend', async () => {
      const prs: PullRequest[] = [
        createMockPR(),
      ];

      const metrics = await analyticsService.getEnhancedMetrics('owner', 'repo', prs);

      expect(['increasing', 'decreasing', 'stable']).toContain(metrics.conflictTrend);
    });

    test('should determine velocity trend', async () => {
      const prs: PullRequest[] = [
        createMockPR(),
      ];

      const metrics = await analyticsService.getEnhancedMetrics('owner', 'repo', prs);

      expect(['improving', 'declining', 'stable']).toContain(metrics.velocityTrend);
    });
  });

  describe('predictMergeConflict', () => {
    test('should predict low conflict for simple PRs', () => {
      const pr = createMockPR({
        changed_files: 2,
        additions: 50,
        deletions: 20,
      });

      const prediction = analyticsService.predictMergeConflict(pr, []);

      expect(prediction.conflictProbability).toBeLessThan(0.5);
      expect(prediction.riskFactors).toBeDefined();
      expect(prediction.recommendations).toBeDefined();
    });

    test('should predict high conflict for complex PRs', () => {
      const pr = createMockPR({
        changed_files: 20,
        additions: 1000,
        deletions: 500,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days old
      });

      const prediction = analyticsService.predictMergeConflict(pr, []);

      expect(prediction.conflictProbability).toBeGreaterThan(0.3);
      expect(prediction.riskFactors.length).toBeGreaterThan(0);
    });

    test('should consider repository history', () => {
      const pr = createMockPR();
      const repoHistory: PullRequest[] = [
        createMockPR({ mergeable: false, number: 2 }),
        createMockPR({ mergeable: false, number: 3 }),
        createMockPR({ mergeable: false, number: 4 }),
        createMockPR({ mergeable: false, number: 5 }),
      ];

      const prediction = analyticsService.predictMergeConflict(pr, repoHistory);

      expect(prediction.riskFactors).toContain('Frequent recent merge conflicts in repo');
    });

    test('should provide recommendations', () => {
      const pr = createMockPR({
        changed_files: 15,
        additions: 600,
      });

      const prediction = analyticsService.predictMergeConflict(pr, []);

      expect(prediction.recommendations).toBeDefined();
      expect(prediction.recommendations.length).toBeGreaterThan(0);
    });

    test('should estimate merge time', () => {
      const pr = createMockPR();

      const prediction = analyticsService.predictMergeConflict(pr, []);

      expect(prediction.estimatedMergeTime).toBeGreaterThan(0);
    });
  });
});
