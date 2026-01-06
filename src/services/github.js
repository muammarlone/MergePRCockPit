const { Octokit } = require('octokit');

class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  async getPullRequests(owner, repo, filters = {}) {
    try {
      const { state = 'open', sort = 'updated', direction = 'desc' } = filters;

      const response = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state,
        sort,
        direction,
        per_page: 100
      });

      return response.data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        created: pr.created_at,
        updated: pr.updated_at,
        state: pr.state,
        url: pr.html_url,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        reviewsRequested: pr.requested_reviewers.length > 0,
        statusChecks: null
      }));
    } catch (error) {
      console.error('Error fetching PRs:', error);
      throw new Error(`Failed to fetch PRs: ${error.message}`);
    }
  }

  async getPRDetails(owner, repo, prNumber) {
    try {
      const pr = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      const reviewsResponse = await this.octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber
      });

      const commentsResponse = await this.octokit.rest.pulls.listComments({
        owner,
        repo,
        pull_number: prNumber
      });

      const checksResponse = await this.octokit.rest.checks.listForRef({
        owner,
        repo,
        ref: pr.data.head.sha
      });

      return {
        ...pr.data,
        reviews: reviewsResponse.data,
        comments: commentsResponse.data,
        checks: checksResponse.data.check_runs,
        reviewStatus: this._calculateReviewStatus(reviewsResponse.data)
      };
    } catch (error) {
      console.error('Error fetching PR details:', error);
      throw new Error(`Failed to fetch PR details: ${error.message}`);
    }
  }

  async getReviewStatus(owner, repo, prNumber) {
    try {
      const reviews = await this.octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber
      });

      const reviewers = {};
      reviews.data.forEach(review => {
        const reviewer = review.user.login;
        reviewers[reviewer] = {
          status: review.state.toLowerCase(),
          submittedAt: review.submitted_at
        };
      });

      return {
        approved: Object.values(reviewers).filter(r => r.status === 'approved').length,
        changesRequested: Object.values(reviewers).filter(r => r.status === 'changes_requested').length,
        pending: Object.values(reviewers).filter(r => r.status === 'pending').length,
        reviewers
      };
    } catch (error) {
      console.error('Error fetching review status:', error);
      throw new Error(`Failed to fetch review status: ${error.message}`);
    }
  }

  async updatePR(owner, repo, prNumber, updates) {
    try {
      const response = await this.octokit.rest.pulls.update({
        owner,
        repo,
        pull_number: prNumber,
        ...updates
      });
      return response.data;
    } catch (error) {
      console.error('Error updating PR:', error);
      throw new Error(`Failed to update PR: ${error.message}`);
    }
  }

  async mergePR(owner, repo, prNumber, mergeMethod = 'squash') {
    try {
      const response = await this.octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: prNumber,
        merge_method: mergeMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error merging PR:', error);
      throw new Error(`Failed to merge PR: ${error.message}`);
    }
  }

  _calculateReviewStatus(reviews) {
    const statuses = {
      approved: 0,
      changesRequested: 0,
      commented: 0
    };

    reviews.forEach(review => {
      switch (review.state) {
        case 'APPROVED':
          statuses.approved++;
          break;
        case 'CHANGES_REQUESTED':
          statuses.changesRequested++;
          break;
        case 'COMMENTED':
          statuses.commented++;
          break;
      }
    });

    return statuses;
  }

  async getRepositories() {
    try {
      // Get user's repositories
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: {
          login: repo.owner.login,
          type: repo.owner.type
        },
        description: repo.description,
        url: repo.html_url,
        isPrivate: repo.private,
        language: repo.language,
        stars: repo.stargazers_count,
        watchers: repo.watchers_count
      }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }
}

module.exports = { GitHubService };
