import { mergeRemediationService } from '../mergeRemediationService';
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

describe('MergeRemediationService', () => {
  describe('analyzeConflicts', () => {
    test('should return no conflicts for mergeable PR', async () => {
      const pr = createMockPR({ mergeable: true });

      const analysis = await mergeRemediationService.analyzeConflicts('owner', 'repo', pr);

      expect(analysis.hasConflicts).toBe(false);
      expect(analysis.severity).toBe('low');
      expect(analysis.autoResolvable).toBe(false);
      expect(analysis.suggestedActions).toContain('PR is ready to merge');
    });

    test('should detect conflicts for non-mergeable PR', async () => {
      const pr = createMockPR({ mergeable: false });

      const analysis = await mergeRemediationService.analyzeConflicts('owner', 'repo', pr);

      expect(analysis.hasConflicts).toBe(true);
      expect(analysis.conflictFiles).toBeDefined();
      expect(analysis.suggestedActions.length).toBeGreaterThan(0);
    });

    test('should assess low severity for small PRs', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 2,
        additions: 50,
        deletions: 20,
      });

      const analysis = await mergeRemediationService.analyzeConflicts('owner', 'repo', pr);

      expect(analysis.severity).toBe('low');
    });

    test('should assess medium severity for moderate PRs', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 8,
        additions: 300,
        deletions: 100,
      });

      const analysis = await mergeRemediationService.analyzeConflicts('owner', 'repo', pr);

      expect(analysis.severity).toBe('medium');
    });

    test('should assess high severity for large PRs', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 20,
        additions: 1500,
        deletions: 500,
      });

      const analysis = await mergeRemediationService.analyzeConflicts('owner', 'repo', pr);

      expect(analysis.severity).toBe('high');
    });

    test('should mark low severity conflicts as potentially auto-resolvable', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 2,
        additions: 50,
        deletions: 30,
      });

      const analysis = await mergeRemediationService.analyzeConflicts('owner', 'repo', pr);

      expect(analysis.autoResolvable).toBe(true);
    });
  });

  describe('getRemediationSuggestions', () => {
    test('should provide multiple remediation strategies', async () => {
      const pr = createMockPR({ mergeable: false });

      const suggestions = await mergeRemediationService.getRemediationSuggestions(pr);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'rebase' }),
          expect.objectContaining({ type: 'merge' }),
          expect.objectContaining({ type: 'manual' }),
        ])
      );
    });

    test('should include auto-resolve for simple conflicts', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 2,
        additions: 40,
        deletions: 20,
      });

      const suggestions = await mergeRemediationService.getRemediationSuggestions(pr);

      const autoSuggestion = suggestions.find(s => s.type === 'auto');
      expect(autoSuggestion).toBeDefined();
      expect(autoSuggestion?.confidence).toBeLessThanOrEqual(1);
    });

    test('should provide steps for each suggestion', async () => {
      const pr = createMockPR({ mergeable: false });

      const suggestions = await mergeRemediationService.getRemediationSuggestions(pr);

      suggestions.forEach(suggestion => {
        expect(suggestion.steps).toBeDefined();
        expect(suggestion.steps.length).toBeGreaterThan(0);
        expect(suggestion.description).toBeDefined();
        expect(suggestion.estimatedTime).toBeGreaterThan(0);
      });
    });
  });

  describe('autoResolveConflicts', () => {
    test('should reject auto-resolution for complex conflicts', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 15,
        additions: 500,
      });

      const result = await mergeRemediationService.autoResolveConflicts('owner', 'repo', pr);

      expect(result.success).toBe(false);
      expect(result.message).toContain('too complex');
    });

    test('should provide message for simple conflicts', async () => {
      const pr = createMockPR({
        mergeable: false,
        changed_files: 2,
        additions: 50,
      });

      const result = await mergeRemediationService.autoResolveConflicts('owner', 'repo', pr);

      expect(result.message).toBeDefined();
      expect(result.success).toBe(false); // Currently not implemented
    });
  });

  describe('getConflictStats', () => {
    test('should calculate conflict statistics', () => {
      const prs: PullRequest[] = [
        createMockPR({ mergeable: true }),
        createMockPR({ mergeable: false, number: 2 }),
        createMockPR({ mergeable: false, number: 3 }),
        createMockPR({ mergeable: true, number: 4 }),
      ];

      const stats = mergeRemediationService.getConflictStats(prs);

      expect(stats.totalConflicts).toBe(2);
      expect(stats.conflictRate).toBe(0.5);
      expect(stats.avgResolutionTime).toBeGreaterThanOrEqual(0);
      expect(stats.commonPatterns).toBeDefined();
      expect(stats.commonPatterns.length).toBeGreaterThan(0);
    });

    test('should handle empty PR list', () => {
      const stats = mergeRemediationService.getConflictStats([]);

      expect(stats.totalConflicts).toBe(0);
      expect(stats.conflictRate).toBe(0);
      expect(stats.avgResolutionTime).toBe(0);
    });

    test('should handle all mergeable PRs', () => {
      const prs: PullRequest[] = [
        createMockPR({ mergeable: true }),
        createMockPR({ mergeable: true, number: 2 }),
      ];

      const stats = mergeRemediationService.getConflictStats(prs);

      expect(stats.totalConflicts).toBe(0);
      expect(stats.conflictRate).toBe(0);
    });
  });
});
