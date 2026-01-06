import { conflictPredictionService } from '../conflictPredictionService';
import { PullRequest } from '../../types';

// Mock axios
jest.mock('axios');

describe('ConflictPredictionService', () => {
  const mockPR: PullRequest = {
    id: 1,
    number: 123,
    title: 'Test PR',
    state: 'open',
    user: {
      login: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    head: {
      ref: 'feature-branch',
      sha: 'abc123'
    },
    base: {
      ref: 'main',
      sha: 'def456'
    },
    body: 'Test PR body',
    html_url: 'https://github.com/test/repo/pull/123',
    mergeable: false,
    comments: 5,
    commits: 3,
    additions: 100,
    deletions: 50,
    changed_files: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should predict conflicts for a PR', async () => {
    const prediction = await conflictPredictionService.predictConflicts(mockPR);
    
    expect(prediction).toBeDefined();
    expect(prediction.prNumber).toBe(123);
    expect(prediction.riskLevel).toMatch(/low|medium|high/);
    expect(prediction.probability).toBeGreaterThanOrEqual(0);
    expect(prediction.probability).toBeLessThanOrEqual(100);
    expect(Array.isArray(prediction.conflictingFiles)).toBe(true);
    expect(Array.isArray(prediction.suggestedActions)).toBe(true);
    expect(typeof prediction.autoFixable).toBe('boolean');
  });

  test('should generate remediation suggestions', async () => {
    const conflictingFiles = ['src/file1.ts', 'src/file2.ts'];
    const context = 'Test PR context';
    
    const suggestions = await conflictPredictionService.generateRemediationSuggestions(
      123,
      conflictingFiles,
      context
    );
    
    expect(Array.isArray(suggestions)).toBe(true);
    suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('prNumber');
      expect(suggestion).toHaveProperty('type');
      expect(suggestion).toHaveProperty('description');
      expect(suggestion).toHaveProperty('conflictFile');
      expect(suggestion).toHaveProperty('suggestedResolution');
      expect(suggestion).toHaveProperty('confidence');
      expect(suggestion).toHaveProperty('applied');
      expect(suggestion.type).toMatch(/suggest|fix|auto-resolve/);
    });
  });

  test('should analyze conflict patterns', async () => {
    const prs: PullRequest[] = [
      { ...mockPR, id: 1, number: 1, mergeable: false },
      { ...mockPR, id: 2, number: 2, mergeable: true },
      { ...mockPR, id: 3, number: 3, mergeable: false, merged_at: '2024-01-03T00:00:00Z' }
    ];
    
    const patterns = await conflictPredictionService.analyzeConflictPatterns(prs);
    
    expect(patterns).toBeDefined();
    expect(patterns).toHaveProperty('commonFiles');
    expect(patterns).toHaveProperty('conflictRate');
    expect(patterns).toHaveProperty('avgResolutionTime');
    expect(Array.isArray(patterns.commonFiles)).toBe(true);
    expect(typeof patterns.conflictRate).toBe('number');
    expect(typeof patterns.avgResolutionTime).toBe('number');
    expect(patterns.conflictRate).toBeGreaterThanOrEqual(0);
    expect(patterns.conflictRate).toBeLessThanOrEqual(100);
  });

  test('should determine if conflict is auto-fixable', async () => {
    const conflictFile = 'package.json';
    const conflictContent = `
<<<<<<< HEAD
"version": "1.0.0"
=======
"version": "1.0.1"
>>>>>>> feature
    `;
    
    const result = await conflictPredictionService.isAutoFixable(conflictFile, conflictContent);
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('fixable');
    expect(result).toHaveProperty('confidence');
    expect(typeof result.fixable).toBe('boolean');
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  test('should handle service unavailability gracefully', async () => {
    // When Ollama is not available, it should return fallback prediction
    const prediction = await conflictPredictionService.predictConflicts(mockPR);
    
    expect(prediction).toBeDefined();
    expect(prediction.prNumber).toBe(mockPR.number);
  });
});
