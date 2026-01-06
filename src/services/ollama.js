const axios = require('axios');

/**
 * Ollama Service - Robust local LLM integration
 * Provides AI-powered analysis with graceful fallback when unavailable
 */
class OllamaService {
  constructor(config = {}) {
    this.baseUrl = config.ollamaUrl || process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434';
    this.model = config.model || 'mistral'; // Fast, capable model
    this.enabled = config.enabled !== false && process.env.REACT_APP_OLLAMA_ENABLED === 'true';
    this.timeout = config.timeout || 30000; // 30 second timeout
    this.cache = new Map(); // Response caching
    this.maxCacheAge = config.maxCacheAge || 24 * 60 * 60 * 1000; // 24 hours
    this.available = false;
    this.lastCheckTime = 0;
    this.checkInterval = config.checkInterval || 60000; // 1 minute

    // Initialize availability check
    if (this.enabled) {
      this._checkAvailability();
    }
  }

  /**
   * Check if Ollama service is available
   */
  async _checkAvailability() {
    if (Date.now() - this.lastCheckTime < this.checkInterval) {
      return this.available;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      this.available = !!response.data;
      this.lastCheckTime = Date.now();
      return this.available;
    } catch (error) {
      this.available = false;
      this.lastCheckTime = Date.now();
      return false;
    }
  }

  /**
   * Get cache key for a prompt
   */
  _getCacheKey(type, data) {
    return `${type}:${JSON.stringify(data).slice(0, 100)}`;
  }

  /**
   * Get cached response if available
   */
  _getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.maxCacheAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached response
   */
  _setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Call Ollama API with error handling
   */
  async _callOllama(prompt, options = {}) {
    if (!this.enabled || !await this._checkAvailability()) {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
          temperature: options.temperature || 0.3, // Lower for more consistent results
          top_p: options.topP || 0.9,
          top_k: options.topK || 40
        },
        { timeout: this.timeout }
      );

      return response.data?.response || null;
    } catch (error) {
      console.warn('Ollama API error:', error.message);
      return null;
    }
  }

  /**
   * Generate PR summary from description and changes
   */
  async generatePRSummary(pr) {
    if (!this.enabled) return null;

    const cacheKey = this._getCacheKey('summary', pr);
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = `Summarize this GitHub pull request in 2-3 sentences:
Title: ${pr.title}
Description: ${pr.body || 'No description provided'}
Files changed: ${pr.changedFiles || 0}
Additions: ${pr.additions || 0}
Deletions: ${pr.deletions || 0}

Provide a brief, actionable summary:`;

    const summary = await this._callOllama(prompt, { temperature: 0.2 });

    if (summary) {
      this._setCached(cacheKey, summary);
      return summary.trim();
    }

    return null;
  }

  /**
   * Suggest PR title improvements
   */
  async suggestPRTitle(currentTitle, description) {
    if (!this.enabled) return null;

    const cacheKey = this._getCacheKey('title', { currentTitle, description });
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = `Suggest a better GitHub PR title that is clear, concise, and follows conventions.
Current title: ${currentTitle}
Description: ${description}

Respond with ONLY the improved title (no quotes, no explanation):`;

    const suggestion = await this._callOllama(prompt, { temperature: 0.3 });

    if (suggestion) {
      const title = suggestion.trim().replace(/^["']|["']$/g, '');
      this._setCached(cacheKey, title);
      return title;
    }

    return null;
  }

  /**
   * Suggest potential reviewers based on code changes
   */
  async suggestReviewers(pr, teamMembers = []) {
    if (!this.enabled) return null;

    const cacheKey = this._getCacheKey('reviewers', pr);
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const teamList = teamMembers.length > 0 
      ? `Available team members: ${teamMembers.join(', ')}`
      : 'No team member list provided';

    const prompt = `Based on this PR, suggest who should review it:
Title: ${pr.title}
Description: ${pr.body || 'No description'}
Files changed: ${pr.changedFiles || 0}
${teamList}

Respond with a brief reason for the suggested reviewers (2-3 sentences):`;

    const suggestion = await this._callOllama(prompt, { temperature: 0.3 });

    if (suggestion) {
      const result = suggestion.trim();
      this._setCached(cacheKey, result);
      return result;
    }

    return null;
  }

  /**
   * Assess risk level of PR changes
   */
  async assessPRRisk(pr) {
    if (!this.enabled) return null;

    const cacheKey = this._getCacheKey('risk', pr);
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = `Assess the risk level of this GitHub PR change:
Title: ${pr.title}
Description: ${pr.body || 'No description'}
Files changed: ${pr.changedFiles || 0}
Additions: ${pr.additions || 0}
Deletions: ${pr.deletions || 0}

Respond with:
RISK_LEVEL: [LOW|MEDIUM|HIGH]
REASON: [Brief explanation]`;

    const assessment = await this._callOllama(prompt, { temperature: 0.2 });

    if (assessment) {
      const result = assessment.trim();
      this._setCached(cacheKey, result);
      
      // Parse response
      const riskMatch = result.match(/RISK_LEVEL:\s*(LOW|MEDIUM|HIGH)/i);
      const reasonMatch = result.match(/REASON:\s*(.+?)(?:\n|$)/i);
      
      return {
        level: riskMatch ? riskMatch[1].toUpperCase() : 'MEDIUM',
        reason: reasonMatch ? reasonMatch[1].trim() : 'Unable to assess'
      };
    }

    return null;
  }

  /**
   * Generate review comments for code patterns
   */
  async generateReviewComments(pr, changedFiles = []) {
    if (!this.enabled) return null;

    const cacheKey = this._getCacheKey('comments', pr);
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const filesText = changedFiles.length > 0 
      ? `Files: ${changedFiles.slice(0, 5).join(', ')}`
      : '';

    const prompt = `Generate a concise code review comment for this PR:
Title: ${pr.title}
Description: ${pr.body || 'No description'}
${filesText}
Changes: +${pr.additions || 0} -${pr.deletions || 0}

Suggest 2-3 key things to check during review:`;

    const comments = await this._callOllama(prompt, { temperature: 0.3 });

    if (comments) {
      const result = comments.trim();
      this._setCached(cacheKey, result);
      return result;
    }

    return null;
  }

  /**
   * Generate a commit message from description
   */
  async generateCommitMessage(prTitle, description, additions, deletions) {
    if (!this.enabled) return null;

    const cacheKey = this._getCacheKey('commit', { prTitle, description });
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = `Generate a concise commit message (50 chars max) for this PR:
Title: ${prTitle}
Description: ${description}

Respond with ONLY the commit message (no quotes):`;

    const message = await this._callOllama(prompt, { temperature: 0.2 });

    if (message) {
      const msg = message.trim().replace(/^["']|["']$/g, '').slice(0, 50);
      this._setCached(cacheKey, msg);
      return msg;
    }

    return null;
  }

  /**
   * Check if specific model is available
   */
  async isModelAvailable(modelName = null) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });

      const models = response.data?.models || [];
      const model = modelName || this.model;
      
      return models.some(m => m.name.includes(model));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      return response.data?.models?.map(m => m.name) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      enabled: this.enabled,
      available: this.available,
      model: this.model,
      baseUrl: this.baseUrl
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    return {
      enabled: this.enabled,
      available: await this._checkAvailability(),
      model: this.model,
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { OllamaService };
