// Mock GitHub PR data
export const mockPR = {
  id: 1,
  number: 42,
  title: 'Add new feature for dashboard',
  state: 'open',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-02T15:30:00Z',
  user: {
    login: 'john-doe',
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
  body: 'This PR adds a new dashboard component with better UX',
  html_url: 'https://github.com/user/repo/pull/42',
  head: {
    ref: 'feature/dashboard',
    sha: 'abc123def456',
  },
  base: {
    ref: 'main',
    sha: 'xyz789abc123',
  },
  changed_files: 5,
  additions: 250,
  deletions: 75,
  commits: 3,
  review_comments: 12,
  comments: 8,
};

export const mockPRList = [
  mockPR,
  {
    ...mockPR,
    number: 43,
    title: 'Fix login bug',
    state: 'open',
    created_at: '2024-01-03T09:00:00Z',
  },
  {
    ...mockPR,
    number: 41,
    title: 'Merge branch release',
    state: 'closed',
    created_at: '2024-01-01T08:00:00Z',
  },
];

export const mockPRDetails = {
  ...mockPR,
  checks: [
    {
      id: 1,
      name: 'Tests (Node 16)',
      conclusion: 'success',
      status: 'completed',
    },
    {
      id: 2,
      name: 'Lint (ESLint)',
      conclusion: 'success',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Build',
      conclusion: 'success',
      status: 'completed',
    },
  ],
};

export const mockReviewStatus = {
  approved: 2,
  changesRequested: 1,
  commented: 3,
  reviewers: {
    'alice': { status: 'approved' },
    'bob': { status: 'changes_requested' },
    'carol': { status: 'commented' },
  },
};

export const mockAIInsights = {
  summary: 'This PR adds a new dashboard component with improved user experience and performance. It includes 5 modified files with 250 additions and 75 deletions.',
  risk: {
    level: 'LOW',
    reason: 'Changes are isolated to new component. Good test coverage. No critical dependencies modified.',
  },
  suggestedTitle: 'feat(ui): Add new dashboard component with enhanced UX',
  reviewComments: [
    'Consider adding error boundary wrapper',
    'Performance looks good but monitor render times',
    'Documentation is clear and helpful',
  ],
  reviewerSuggestions: ['alice', 'bob', 'carol'],
  commitMessage: 'feat(ui): Add new dashboard component\n\n- Implements responsive dashboard layout\n- Improves user experience with real-time updates\n- Adds comprehensive test coverage\n\nCloses #123',
};

export const mockRepositories = [
  {
    id: 1,
    name: 'merge-cockpit',
    fullName: 'myteam/merge-cockpit',
    owner: { login: 'myteam', type: 'Organization' },
    description: 'Git PR management tool',
    url: 'https://github.com/myteam/merge-cockpit',
    isPrivate: false,
    language: 'JavaScript',
    stars: 145,
    watchers: 23,
  },
  {
    id: 2,
    name: 'api-service',
    fullName: 'myteam/api-service',
    owner: { login: 'myteam', type: 'Organization' },
    description: 'REST API service',
    url: 'https://github.com/myteam/api-service',
    isPrivate: true,
    language: 'Python',
    stars: 89,
    watchers: 12,
  },
  {
    id: 3,
    name: 'frontend-app',
    fullName: 'john-doe/frontend-app',
    owner: { login: 'john-doe', type: 'User' },
    description: 'React frontend app',
    url: 'https://github.com/john-doe/frontend-app',
    isPrivate: false,
    language: 'JavaScript',
    stars: 34,
    watchers: 5,
  },
];

export const mockOllamaStatus = {
  available: true,
  model: 'mistral',
  version: '0.1',
  memory_usage: '2.5GB',
};

// Mock user data
export const mockUser = {
  login: 'john-doe',
  id: 12345,
  avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Software Engineer',
  followers: 42,
  following: 15,
};

// Mock GitHub token
export const mockGitHubToken = 'ghp_test1234567890abcdefghijklmnopqr';
