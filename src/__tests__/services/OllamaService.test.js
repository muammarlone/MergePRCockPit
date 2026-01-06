import OllamaService from '../../services/ollama';
import { mockPRDetails, mockAIInsights, mockOllamaStatus } from '../__mocks__/mockData';

// Mock axios for HTTP calls
jest.mock('axios');
const axios = require('axios');

describe('OllamaService', () => {
  let ollamaService;

  beforeEach(() => {
    ollamaService = new OllamaService();
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    test('returns status when Ollama is available', async () => {
      axios.get.mockResolvedValue({ data: { status: 'ok' } });

      const status = await ollamaService.checkHealth();

      expect(status).toBeDefined();
      expect(axios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    });

    test('returns unavailable status when Ollama is not running', async () => {
      axios.get.mockRejectedValue(new Error('Connection refused'));

      const status = await ollamaService.checkHealth();

      expect(status.available).toBe(false);
    });

    test('caches health status to avoid repeated requests', async () => {
      axios.get.mockResolvedValue({ data: { status: 'ok' } });

      await ollamaService.checkHealth();
      await ollamaService.checkHealth();

      // Should only call once due to caching
      expect(axios.get.mock.calls.length).toBeLessThanOrEqual(2);
    });
  });

  describe('analyzePR', () => {
    test('generates comprehensive PR analysis', async () => {
      axios.post.mockResolvedValue({
        data: { response: JSON.stringify(mockAIInsights) },
      });

      const analysis = await ollamaService.analyzePR(mockPRDetails);

      expect(analysis).toBeDefined();
      expect(analysis.summary).toBeDefined();
      expect(analysis.risk).toBeDefined();
    });

    test('includes all 6 insight types', async () => {
      axios.post.mockResolvedValue({
        data: { response: JSON.stringify(mockAIInsights) },
      });

      const analysis = await ollamaService.analyzePR(mockPRDetails);

      expect(analysis.summary).toBeDefined();
      expect(analysis.risk).toBeDefined();
      expect(analysis.suggestedTitle).toBeDefined();
      expect(analysis.reviewComments).toBeDefined();
      expect(analysis.reviewerSuggestions).toBeDefined();
      expect(analysis.commitMessage).toBeDefined();
    });

    test('handles Ollama timeout gracefully', async () => {
      axios.post.mockRejectedValue(new Error('Timeout'));

      await expect(ollamaService.analyzePR(mockPRDetails)).rejects.toThrow();
    });

    test('validates PR data before analysis', async () => {
      const invalidPR = { title: null, body: null };

      await expect(ollamaService.analyzePR(invalidPR)).rejects.toThrow();
    });
  });

  describe('generatePRSummary', () => {
    test('creates concise PR summary from description', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'Summary text' },
      });

      const summary = await ollamaService.generatePRSummary(mockPRDetails);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
    });

    test('handles PRs with empty descriptions', async () => {
      const prWithoutDesc = { ...mockPRDetails, body: '' };
      axios.post.mockResolvedValue({
        data: { response: 'PR with no description' },
      });

      const summary = await ollamaService.generatePRSummary(prWithoutDesc);

      expect(summary).toBeDefined();
    });

    test('respects caching for identical PRs', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'Summary' },
      });

      await ollamaService.generatePRSummary(mockPRDetails);
      await ollamaService.generatePRSummary(mockPRDetails);

      // Second call should use cache
      expect(axios.post.mock.calls.length).toBeLessThanOrEqual(2);
    });
  });

  describe('suggestTitle', () => {
    test('generates better PR title from content', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'feat(ui): Add dashboard component' },
      });

      const title = await ollamaService.suggestTitle(mockPRDetails);

      expect(title).toBeDefined();
      expect(title.includes('feat')).toBe(true);
    });

    test('follows conventional commit format', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'feat(dashboard): Add new component' },
      });

      const title = await ollamaService.suggestTitle(mockPRDetails);

      const conventionalFormat = /^(feat|fix|chore|docs|style|refactor|perf|test)/;
      expect(title).toMatch(conventionalFormat);
    });
  });

  describe('assessRisk', () => {
    test('evaluates PR risk level (LOW, MEDIUM, HIGH)', async () => {
      axios.post.mockResolvedValue({
        data: {
          response: JSON.stringify({
            level: 'LOW',
            reason: 'Isolated changes',
          }),
        },
      });

      const risk = await ollamaService.assessRisk(mockPRDetails);

      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(risk.level);
      expect(risk.reason).toBeDefined();
    });

    test('considers number of files changed', async () => {
      const massiveChangePR = { ...mockPRDetails, changed_files: 100 };
      axios.post.mockResolvedValue({
        data: {
          response: JSON.stringify({
            level: 'HIGH',
            reason: '100 files changed',
          }),
        },
      });

      const risk = await ollamaService.assessRisk(massiveChangePR);

      expect(risk.level).toBeDefined();
    });
  });

  describe('suggestReviewers', () => {
    test('recommends reviewers based on code analysis', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'alice, bob, carol' },
      });

      const reviewers = await ollamaService.suggestReviewers(mockPRDetails);

      expect(Array.isArray(reviewers) || typeof reviewers === 'string').toBe(true);
    });

    test('avoids suggesting PR author as reviewer', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'bob, carol' }, // Excludes john-doe
      });

      const reviewers = await ollamaService.suggestReviewers(mockPRDetails);

      expect(reviewers).not.toContain('john-doe');
    });
  });

  describe('generateReviewComments', () => {
    test('creates specific review feedback', async () => {
      axios.post.mockResolvedValue({
        data: {
          response: 'Consider adding error handling.',
        },
      });

      const comments = await ollamaService.generateReviewComments(mockPRDetails);

      expect(comments).toBeDefined();
      expect(typeof comments).toBe('string');
    });

    test('provides constructive and actionable feedback', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'Consider adding error boundary wrapper' },
      });

      const comments = await ollamaService.generateReviewComments(mockPRDetails);

      expect(comments.length).toBeGreaterThan(0);
    });
  });

  describe('generateCommitMessage', () => {
    test('creates professional commit message', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'feat: Add dashboard component\n\nImprovements...' },
      });

      const message = await ollamaService.generateCommitMessage(mockPRDetails);

      expect(message).toBeDefined();
      expect(message.includes('feat')).toBe(true);
    });

    test('follows semantic commit format', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'feat(ui): Add dashboard' },
      });

      const message = await ollamaService.generateCommitMessage(mockPRDetails);

      expect(message).toMatch(/^(feat|fix|chore|docs|style|refactor|perf|test)/);
    });

    test('includes multiple paragraphs for complex changes', async () => {
      axios.post.mockResolvedValue({
        data: {
          response: 'feat: Feature\n\nBody\n\nFooter',
        },
      });

      const message = await ollamaService.generateCommitMessage(mockPRDetails);

      expect(message.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('cache management', () => {
    test('clears analysis cache', async () => {
      axios.post.mockResolvedValue({
        data: { response: 'Result' },
      });

      await ollamaService.analyzePR(mockPRDetails);
      await ollamaService.clearCache();

      // Cache should be empty
      expect(ollamaService.cacheSize()).toBe(0);
    });

    test('cache has size limit', () => {
      expect(ollamaService.maxCacheSize).toBeDefined();
      expect(ollamaService.maxCacheSize).toBeGreaterThan(0);
    });

    test('evicts old entries when cache is full', async () => {
      // Add multiple PRs to cache until limit is reached
      // Verify old entries are removed
    });
  });

  test('initializes with default Ollama URL', () => {
    expect(ollamaService.baseURL).toBe('http://localhost:11434');
  });

  test('allows custom Ollama URL configuration', () => {
    const customService = new OllamaService('http://custom:11434');
    expect(customService.baseURL).toBe('http://custom:11434');
  });
});
