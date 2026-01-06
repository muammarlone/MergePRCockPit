import { Octokit } from '@octokit/rest';
import { Repository, PullRequest, RepositoryMetrics } from '../types';
import { authService } from './authService';

class GitHubService {
  private octokit: Octokit | null = null;

  constructor() {
    this.initializeOctokit();
  }

  private initializeOctokit(): void {
    const token = authService.getAccessToken();
    if (token && token.startsWith('github-')) {
      // In real implementation, use actual GitHub token
      this.octokit = new Octokit({
        auth: token
      });
    } else {
      // For demo, initialize without auth
      this.octokit = new Octokit();
    }
  }

  async getRepositories(owner: string): Promise<Repository[]> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      const response = await this.octokit!.repos.listForUser({
        username: owner,
        per_page: 100,
        sort: 'updated'
      });
      
      return response.data as Repository[];
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      return [];
    }
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<PullRequest[]> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      const response = await this.octokit!.pulls.list({
        owner,
        repo,
        state,
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      });
      
      // Map API response to our PullRequest type
      // Note: list endpoint doesn't include all details, those require individual PR fetch
      return response.data.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        head: pr.head,
        base: pr.base,
        body: pr.body || '',
        html_url: pr.html_url,
        mergeable: pr.mergeable,
        comments: 0, // Not available in list endpoint
        commits: 0, // Not available in list endpoint
        additions: 0, // Not available in list endpoint
        deletions: 0, // Not available in list endpoint
        changed_files: 0 // Not available in list endpoint
      } as PullRequest));
    } catch (error) {
      console.error('Failed to fetch pull requests:', error);
      return [];
    }
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequest | null> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      const response = await this.octokit!.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });
      
      const pr = response.data as any; // Use any to access all fields
      return {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        head: pr.head,
        base: pr.base,
        body: pr.body || '',
        html_url: pr.html_url,
        mergeable: pr.mergeable,
        comments: pr.comments || 0,
        commits: pr.commits || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changed_files: pr.changed_files || 0
      } as PullRequest;
    } catch (error) {
      console.error('Failed to fetch pull request:', error);
      return null;
    }
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number, commitMessage?: string): Promise<boolean> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      await this.octokit!.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        commit_message: commitMessage
      });
      
      return true;
    } catch (error) {
      console.error('Failed to merge pull request:', error);
      return false;
    }
  }

  async getRepositoryMetrics(owner: string, repo: string): Promise<RepositoryMetrics> {
    const allPRs = await this.getPullRequests(owner, repo, 'all');
    
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
}

export const githubService = new GitHubService();
