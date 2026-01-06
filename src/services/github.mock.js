// Mock GitHub Service for testing
class MockGitHubService {
  constructor() {
    this.prs = [
      {
        id: 1,
        number: 123,
        title: 'Add new feature for PR dashboard',
        author: 'alice',
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        state: 'open',
        url: 'https://github.com/user/repo/pull/123',
        additions: 245,
        deletions: 89,
        changedFiles: 8,
        reviewsRequested: true
      },
      {
        id: 2,
        number: 124,
        title: 'Fix bug in authentication flow',
        author: 'bob',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        state: 'open',
        url: 'https://github.com/user/repo/pull/124',
        additions: 45,
        deletions: 23,
        changedFiles: 3,
        reviewsRequested: false
      },
      {
        id: 3,
        number: 125,
        title: 'Refactor component structure',
        author: 'charlie',
        created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        state: 'closed',
        url: 'https://github.com/user/repo/pull/125',
        additions: 567,
        deletions: 234,
        changedFiles: 15,
        reviewsRequested: false
      }
    ];
  }

  async getPullRequests(owner, repo, filters = {}) {
    const { state = 'open' } = filters;
    return this.prs.filter(pr => pr.state === state);
  }

  async getPRDetails(owner, repo, prNumber) {
    const pr = this.prs.find(p => p.number === prNumber);
    if (!pr) throw new Error('PR not found');
    
    return {
      ...pr,
      body: 'This is a detailed description of the pull request changes.',
      reviews: [
        {
          id: 1,
          user: { login: 'reviewer1' },
          state: 'APPROVED',
          submitted_at: new Date().toISOString()
        },
        {
          id: 2,
          user: { login: 'reviewer2' },
          state: 'COMMENTED',
          submitted_at: new Date().toISOString()
        }
      ],
      comments: [],
      checks: [
        {
          id: 1,
          name: 'Continuous Integration',
          conclusion: 'success',
          status: 'completed'
        },
        {
          id: 2,
          name: 'Code Quality Check',
          conclusion: 'success',
          status: 'completed'
        }
      ]
    };
  }

  async getReviewStatus(owner, repo, prNumber) {
    return {
      approved: 1,
      changesRequested: 0,
      pending: 1,
      reviewers: {
        reviewer1: { status: 'approved', submittedAt: new Date().toISOString() },
        reviewer2: { status: 'commented', submittedAt: new Date().toISOString() }
      }
    };
  }

  async updatePR(owner, repo, prNumber, updates) {
    const pr = this.prs.find(p => p.number === prNumber);
    if (!pr) throw new Error('PR not found');
    return { ...pr, ...updates };
  }

  async mergePR(owner, repo, prNumber, mergeMethod = 'squash') {
    return { 
      message: 'Pull Request successfully merged',
      sha: 'abc123def456'
    };
  }
}

module.exports = { MockGitHubService };
