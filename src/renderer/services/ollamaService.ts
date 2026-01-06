import axios from 'axios';
import { OllamaAnalysis, PullRequest } from '../types';

class OllamaService {
  private baseUrl: string = 'http://localhost:11434';
  private model: string = 'llama2';

  async analyzePullRequest(pr: PullRequest): Promise<OllamaAnalysis> {
    try {
      const prompt = this.buildPRAnalysisPrompt(pr);
      const response = await this.generateCompletion(prompt);
      
      return this.parseAnalysis(response);
    } catch (error) {
      console.error('Failed to analyze PR with Ollama:', error);
      return this.getFallbackAnalysis();
    }
  }

  private buildPRAnalysisPrompt(pr: PullRequest): string {
    return `Analyze the following pull request and provide insights:
    
Title: ${pr.title}
Description: ${pr.body || 'No description provided'}
Files Changed: ${pr.changed_files}
Additions: ${pr.additions}
Deletions: ${pr.deletions}
Comments: ${pr.comments}
Mergeable: ${pr.mergeable === false ? 'Has conflicts' : pr.mergeable === true ? 'Clean' : 'Unknown'}

Please provide:
1. A brief summary of the changes
2. Risk assessment (low/medium/high)
3. Suggested reviewers (if any patterns detected)
4. Potential issues to watch for
5. General suggestions for improvement
6. Conflict probability (0-100)
7. Likely conflict areas
8. Remediation steps if conflicts exist

Format your response as JSON with keys: summary, riskAssessment, suggestedReviewers (array), potentialIssues (array), suggestions (array), conflictProbability (number), conflictAreas (array), remediationSteps (array)`;
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

  private parseAnalysis(response: string): OllamaAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || response,
          riskAssessment: parsed.riskAssessment || 'medium',
          suggestedReviewers: parsed.suggestedReviewers || [],
          potentialIssues: parsed.potentialIssues || [],
          suggestions: parsed.suggestions || [],
          conflictProbability: parsed.conflictProbability || 0,
          conflictAreas: parsed.conflictAreas || [],
          remediationSteps: parsed.remediationSteps || []
        };
      }
    } catch (error) {
      console.error('Failed to parse Ollama response:', error);
    }
    
    return {
      summary: response,
      riskAssessment: 'medium',
      suggestedReviewers: [],
      potentialIssues: [],
      suggestions: [],
      conflictProbability: 0,
      conflictAreas: [],
      remediationSteps: []
    };
  }

  private getFallbackAnalysis(): OllamaAnalysis {
    return {
      summary: 'Ollama service not available. Install Ollama locally and ensure it is running on port 11434.',
      riskAssessment: 'medium',
      suggestedReviewers: [],
      potentialIssues: ['AI analysis unavailable'],
      suggestions: ['Install Ollama to enable AI-powered PR analysis'],
      conflictProbability: 0,
      conflictAreas: [],
      remediationSteps: []
    };
  }

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

  async exportToGPT(context: string): Promise<string> {
    // This would integrate with OpenAI API
    // For now, return formatted context for manual export
    return `Context for GPT Analysis:\n\n${context}\n\nPlease analyze the above pull request and provide detailed insights.`;
  }
}

export const ollamaService = new OllamaService();
