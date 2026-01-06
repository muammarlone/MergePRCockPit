import axios from 'axios';
import { PullRequest, ConflictPrediction, RemediationSuggestion } from '../types';
import { ollamaService } from './ollamaService';

class ConflictPredictionService {
  private baseUrl: string = 'http://localhost:11434';
  private model: string = 'llama2';

  /**
   * Predict potential merge conflicts for a pull request
   */
  async predictConflicts(pr: PullRequest, baseBranch: string = 'main'): Promise<ConflictPrediction> {
    try {
      // Build analysis prompt for conflict prediction
      const prompt = this.buildConflictPredictionPrompt(pr, baseBranch);
      const response = await this.generateCompletion(prompt);
      
      return this.parseConflictPrediction(response, pr.number);
    } catch (error) {
      console.error('Failed to predict conflicts:', error);
      return this.getFallbackPrediction(pr.number);
    }
  }

  /**
   * Generate remediation suggestions for merge conflicts
   */
  async generateRemediationSuggestions(
    prNumber: number,
    conflictingFiles: string[],
    prContext: string
  ): Promise<RemediationSuggestion[]> {
    try {
      const prompt = this.buildRemediationPrompt(prNumber, conflictingFiles, prContext);
      const response = await this.generateCompletion(prompt);
      
      return this.parseRemediationSuggestions(response, prNumber, conflictingFiles);
    } catch (error) {
      console.error('Failed to generate remediation suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze historical conflict patterns
   */
  async analyzeConflictPatterns(prs: PullRequest[]): Promise<{
    commonFiles: string[];
    conflictRate: number;
    avgResolutionTime: number;
  }> {
    const conflictedPRs = prs.filter(pr => pr.mergeable === false);
    const conflictRate = prs.length > 0 ? (conflictedPRs.length / prs.length) * 100 : 0;

    // Extract common file patterns from PR changes
    // In a real implementation, this would analyze commit data
    const commonFiles = this.extractCommonConflictFiles(conflictedPRs);
    
    // Calculate average resolution time
    const resolutionTimes = conflictedPRs
      .filter(pr => pr.merged_at && pr.created_at)
      .map(pr => {
        const created = new Date(pr.created_at).getTime();
        const merged = new Date(pr.merged_at!).getTime();
        return merged - created;
      });
    
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length / (1000 * 60 * 60)
      : 0;

    return {
      commonFiles,
      conflictRate,
      avgResolutionTime
    };
  }

  /**
   * Determine if a conflict is auto-fixable
   */
  async isAutoFixable(
    conflictFile: string,
    conflictContent: string
  ): Promise<{ fixable: boolean; confidence: number; suggestedFix?: string }> {
    try {
      const prompt = `Analyze the following merge conflict and determine if it can be automatically resolved:

File: ${conflictFile}
Conflict Content:
${conflictContent}

Respond with JSON containing:
- fixable: boolean
- confidence: number (0-100)
- suggestedFix: string (if fixable)
- reasoning: string

Only mark as fixable if you are highly confident (>80%) the fix is safe.`;

      const response = await this.generateCompletion(prompt);
      const parsed = this.parseJSON(response);

      return {
        fixable: parsed.fixable || false,
        confidence: parsed.confidence || 0,
        suggestedFix: parsed.suggestedFix
      };
    } catch (error) {
      console.error('Failed to analyze auto-fix potential:', error);
      return { fixable: false, confidence: 0 };
    }
  }

  private buildConflictPredictionPrompt(pr: PullRequest, baseBranch: string): string {
    return `Analyze the following pull request for potential merge conflicts:

Pull Request: #${pr.number}
Title: ${pr.title}
Base Branch: ${baseBranch}
Files Changed: ${pr.changed_files}
Additions: ${pr.additions}
Deletions: ${pr.deletions}
Mergeable Status: ${pr.mergeable === false ? 'Has conflicts' : pr.mergeable === true ? 'No conflicts' : 'Unknown'}

Based on the PR size, complexity, and current mergeable status, provide:
1. Conflict probability (0-100)
2. Risk level (low/medium/high)
3. Likely conflicting areas
4. Suggested preventive actions

Format as JSON: { "probability": number, "riskLevel": string, "conflictingAreas": array, "suggestedActions": array, "autoFixable": boolean }`;
  }

  private buildRemediationPrompt(
    prNumber: number,
    conflictingFiles: string[],
    context: string
  ): string {
    return `Generate remediation suggestions for merge conflicts in PR #${prNumber}:

Conflicting Files:
${conflictingFiles.join('\n')}

Context:
${context}

Provide 3-5 remediation suggestions with:
1. Type (suggest/fix/auto-resolve)
2. Description of the conflict
3. Suggested resolution approach
4. Confidence level (0-100)

Format as JSON array of suggestions.`;
  }

  private async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false
      }, {
        timeout: 30000
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }

  private parseConflictPrediction(response: string, prNumber: number): ConflictPrediction {
    try {
      const parsed = this.parseJSON(response);
      return {
        prNumber,
        probability: parsed.probability || 0,
        riskLevel: parsed.riskLevel || 'low',
        conflictingFiles: parsed.conflictingAreas || [],
        suggestedActions: parsed.suggestedActions || [],
        autoFixable: parsed.autoFixable || false
      };
    } catch (error) {
      return this.getFallbackPrediction(prNumber);
    }
  }

  private parseRemediationSuggestions(
    response: string,
    prNumber: number,
    conflictingFiles: string[]
  ): RemediationSuggestion[] {
    try {
      const parsed = this.parseJSON(response);
      const suggestions = Array.isArray(parsed) ? parsed : [parsed];

      return suggestions.map((s, index) => ({
        id: `rem-${prNumber}-${index}`,
        prNumber,
        type: s.type || 'suggest',
        description: s.description || 'No description',
        conflictFile: conflictingFiles[index % conflictingFiles.length] || 'unknown',
        suggestedResolution: s.suggestedResolution || s.resolution || '',
        confidence: s.confidence || 50,
        applied: false
      }));
    } catch (error) {
      console.error('Failed to parse remediation suggestions:', error);
      return [];
    }
  }

  private parseJSON(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse JSON from response:', error);
    }
    return {};
  }

  private getFallbackPrediction(prNumber: number): ConflictPrediction {
    return {
      prNumber,
      probability: 0,
      riskLevel: 'low',
      conflictingFiles: [],
      suggestedActions: ['AI conflict prediction service not available'],
      autoFixable: false
    };
  }

  private extractCommonConflictFiles(prs: PullRequest[]): string[] {
    // Placeholder implementation - would need actual file change data
    // In production, this would analyze commits and file changes
    return [
      'package.json',
      'package-lock.json',
      'src/config.ts',
      'README.md'
    ].slice(0, Math.min(3, prs.length));
  }

  /**
   * Check if Ollama service is available
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const conflictPredictionService = new ConflictPredictionService();
