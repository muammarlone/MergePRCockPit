import { PullRequest } from '../types';
import { ollamaService } from './ollamaService';

export interface ConflictAnalysis {
  hasConflicts: boolean;
  conflictFiles: string[];
  severity: 'low' | 'medium' | 'high';
  autoResolvable: boolean;
  suggestedActions: string[];
  aiRemediation?: string;
}

export interface RemediationSuggestion {
  type: 'rebase' | 'merge' | 'manual' | 'auto';
  description: string;
  steps: string[];
  confidence: number; // 0-1
  estimatedTime: number; // minutes
}

class MergeRemediationService {
  /**
   * Analyze merge conflicts for a PR
   */
  async analyzeConflicts(
    owner: string,
    repo: string,
    pr: PullRequest
  ): Promise<ConflictAnalysis> {
    // Basic analysis from PR data
    const hasConflicts = pr.mergeable === false;
    
    if (!hasConflicts) {
      return {
        hasConflicts: false,
        conflictFiles: [],
        severity: 'low',
        autoResolvable: false,
        suggestedActions: ['PR is ready to merge']
      };
    }

    // Analyze conflict severity
    const severity = this.assessConflictSeverity(pr);
    const autoResolvable = this.isAutoResolvable(pr, severity);
    const suggestedActions = this.generateSuggestedActions(pr, severity, autoResolvable);

    // Get AI-powered remediation if available
    let aiRemediation: string | undefined;
    try {
      const isOllamaAvailable = await ollamaService.testConnection();
      if (isOllamaAvailable) {
        aiRemediation = await this.getAIRemediation(pr);
      }
    } catch (error) {
      console.error('Failed to get AI remediation:', error);
    }

    return {
      hasConflicts: true,
      conflictFiles: this.estimateConflictFiles(pr),
      severity,
      autoResolvable,
      suggestedActions,
      aiRemediation
    };
  }

  /**
   * Generate remediation suggestions
   */
  async getRemediationSuggestions(pr: PullRequest): Promise<RemediationSuggestion[]> {
    const suggestions: RemediationSuggestion[] = [];

    // Suggestion 1: Rebase
    suggestions.push({
      type: 'rebase',
      description: 'Rebase branch on latest base branch',
      steps: [
        `git fetch origin ${pr.base.ref}`,
        `git checkout ${pr.head.ref}`,
        `git rebase origin/${pr.base.ref}`,
        'Resolve any conflicts',
        'git rebase --continue',
        'git push --force-with-lease'
      ],
      confidence: 0.8,
      estimatedTime: 15
    });

    // Suggestion 2: Merge base into branch
    suggestions.push({
      type: 'merge',
      description: 'Merge base branch into feature branch',
      steps: [
        `git fetch origin ${pr.base.ref}`,
        `git checkout ${pr.head.ref}`,
        `git merge origin/${pr.base.ref}`,
        'Resolve any conflicts',
        'git commit',
        'git push'
      ],
      confidence: 0.7,
      estimatedTime: 20
    });

    // If conflicts are simple, suggest auto-resolution
    if (this.isAutoResolvable(pr, this.assessConflictSeverity(pr))) {
      suggestions.unshift({
        type: 'auto',
        description: 'Automatically resolve conflicts',
        steps: [
          'Click "Auto-Resolve" button',
          'Review suggested changes',
          'Confirm and commit'
        ],
        confidence: 0.6,
        estimatedTime: 5
      });
    }

    // Always provide manual option
    suggestions.push({
      type: 'manual',
      description: 'Manually resolve conflicts',
      steps: [
        'Clone repository locally',
        'Check out the branch',
        'Pull latest changes',
        'Resolve conflicts in your editor',
        'Test the changes',
        'Commit and push'
      ],
      confidence: 1.0,
      estimatedTime: 30
    });

    return suggestions;
  }

  /**
   * Attempt auto-resolution of simple conflicts
   */
  async autoResolveConflicts(
    owner: string,
    repo: string,
    pr: PullRequest
  ): Promise<{ success: boolean; message: string; changes?: string }> {
    // This is a placeholder for actual implementation
    // In a real implementation, this would:
    // 1. Fetch the conflicting files
    // 2. Analyze conflict markers
    // 3. Apply resolution strategies (e.g., accept both changes, prefer one side)
    // 4. Create a commit with resolved conflicts
    
    const severity = this.assessConflictSeverity(pr);
    
    if (!this.isAutoResolvable(pr, severity)) {
      return {
        success: false,
        message: 'Conflicts are too complex for automatic resolution'
      };
    }

    // Simulate auto-resolution logic
    return {
      success: false,
      message: 'Auto-resolution requires GitHub API permissions and file access. Please use manual resolution or rebase strategy.',
      changes: 'Would resolve: Import statement conflicts, whitespace conflicts, simple text conflicts'
    };
  }

  /**
   * Get AI-powered remediation advice
   */
  private async getAIRemediation(pr: PullRequest): Promise<string> {
    const prompt = `Analyze this pull request with merge conflicts and suggest remediation:

Title: ${pr.title}
Files changed: ${pr.changed_files}
Additions: ${pr.additions}
Deletions: ${pr.deletions}
Description: ${pr.body || 'No description'}

Provide specific, actionable steps to resolve the conflicts, considering:
1. The nature of changes (features, bug fixes, refactoring)
2. The size and complexity of the PR
3. Best practices for conflict resolution
4. Risk mitigation strategies

Keep response concise and practical.`;

    try {
      const response = await ollamaService['generateCompletion'](prompt);
      return response;
    } catch (error) {
      return 'AI remediation not available. Please use manual conflict resolution.';
    }
  }

  /**
   * Assess conflict severity
   */
  private assessConflictSeverity(pr: PullRequest): 'low' | 'medium' | 'high' {
    const totalChanges = pr.additions + pr.deletions;
    
    // High severity: large PRs with many files
    if (pr.changed_files > 15 || totalChanges > 1000) {
      return 'high';
    }
    
    // Medium severity: moderate size
    if (pr.changed_files > 5 || totalChanges > 200) {
      return 'medium';
    }
    
    // Low severity: small changes
    return 'low';
  }

  /**
   * Determine if conflicts are auto-resolvable
   */
  private isAutoResolvable(pr: PullRequest, severity: 'low' | 'medium' | 'high'): boolean {
    // Only consider auto-resolution for low severity conflicts
    if (severity !== 'low') {
      return false;
    }

    // Small PRs with few files are more likely to be auto-resolvable
    return pr.changed_files <= 3 && pr.additions + pr.deletions <= 100;
  }

  /**
   * Estimate which files have conflicts (placeholder)
   */
  private estimateConflictFiles(pr: PullRequest): string[] {
    // In real implementation, would fetch actual conflict data from GitHub API
    // For now, return placeholder based on PR complexity
    const estimatedCount = Math.min(pr.changed_files, 5);
    const files: string[] = [];
    
    for (let i = 0; i < estimatedCount; i++) {
      files.push(`file-${i + 1}.ts (estimated)`);
    }
    
    return files;
  }

  /**
   * Generate suggested actions based on conflict analysis
   */
  private generateSuggestedActions(
    pr: PullRequest,
    severity: 'low' | 'medium' | 'high',
    autoResolvable: boolean
  ): string[] {
    const actions: string[] = [];

    if (autoResolvable) {
      actions.push('Try auto-resolution for simple conflicts');
    }

    if (severity === 'low') {
      actions.push('Rebase on base branch to resolve conflicts');
      actions.push('Review conflicting changes carefully');
    } else if (severity === 'medium') {
      actions.push('Coordinate with other developers working on same files');
      actions.push('Consider breaking PR into smaller chunks');
      actions.push('Rebase or merge base branch into feature branch');
    } else {
      actions.push('Review with team before attempting resolution');
      actions.push('Consider pair programming for conflict resolution');
      actions.push('Split PR into smaller, focused changes');
      actions.push('Ensure comprehensive testing after resolution');
    }

    actions.push('Test thoroughly after resolving conflicts');
    
    return actions;
  }

  /**
   * Get conflict statistics for repository
   */
  getConflictStats(prs: PullRequest[]): {
    totalConflicts: number;
    conflictRate: number;
    avgResolutionTime: number;
    commonPatterns: string[];
  } {
    const conflictPRs = prs.filter(pr => pr.mergeable === false);
    const totalConflicts = conflictPRs.length;
    const conflictRate = prs.length > 0 ? totalConflicts / prs.length : 0;

    // Calculate avg resolution time (simplified)
    const resolvedConflicts = prs.filter(pr => {
      return pr.merged_at && pr.mergeable === false;
    });

    const resolutionTimes = resolvedConflicts.map(pr => {
      const created = new Date(pr.created_at).getTime();
      const merged = new Date(pr.merged_at!).getTime();
      return (merged - created) / (1000 * 60 * 60); // hours
    });

    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Common patterns (simplified - in reality would analyze conflict types)
    const commonPatterns = [
      'Import statement conflicts',
      'Dependency version conflicts',
      'Code formatting differences',
      'Parallel feature development'
    ];

    return {
      totalConflicts,
      conflictRate,
      avgResolutionTime,
      commonPatterns
    };
  }
}

export const mergeRemediationService = new MergeRemediationService();
