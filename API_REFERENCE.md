# API Reference

Complete reference for Merge Cockpit IPC and service APIs.

## Electron IPC API

### Available IPC Handlers

#### getPRs(owner, repo, filters)
Fetch list of pull requests.

**Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name
- `filters` (object) - Optional filters
  - `state` (string) - 'open' or 'closed', default: 'open'
  - `sort` (string) - 'updated', 'created', or 'comments'
  - `direction` (string) - 'asc' or 'desc'

**Returns:** Array of PR objects

**Example:**
```javascript
const prs = await window.electronAPI.getPRs('microsoft', 'vscode', {
  state: 'open',
  sort: 'updated'
});
```

**PR Object:**
```javascript
{
  id: 1,
  number: 123,
  title: "Add feature",
  author: "username",
  created: "2024-01-01T10:00:00Z",
  updated: "2024-01-02T15:30:00Z",
  state: "open",
  url: "https://github.com/...",
  additions: 245,
  deletions: 89,
  changedFiles: 8,
  reviewsRequested: true
}
```

---

#### getPRDetails(owner, repo, prNumber)
Get detailed information about a single PR.

**Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name
- `prNumber` (number) - Pull request number

**Returns:** PR Detail object

**Example:**
```javascript
const details = await window.electronAPI.getPRDetails(
  'microsoft',
  'vscode',
  1234
);
```

**PR Details Object:**
```javascript
{
  // All PR object properties plus:
  body: "Full PR description...",
  reviews: [
    {
      id: 1,
      user: { login: "reviewer" },
      state: "APPROVED",
      submitted_at: "2024-01-02T14:00:00Z"
    }
  ],
  comments: [...],
  checks: [
    {
      id: 1,
      name: "CI",
      conclusion: "success",
      status: "completed"
    }
  ],
  reviewStatus: {
    approved: 1,
    changesRequested: 0,
    commented: 2
  }
}
```

---

#### updatePR(owner, repo, prNumber, updates)
Update PR properties.

**Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name
- `prNumber` (number) - Pull request number
- `updates` (object) - Fields to update
  - `title` (string)
  - `body` (string)
  - `state` (string) - 'open' or 'closed'
  - `labels` (array)
  - `milestone` (number or null)

**Returns:** Updated PR object

**Example:**
```javascript
const updated = await window.electronAPI.updatePR(
  'microsoft',
  'vscode',
  1234,
  {
    title: "New title",
    labels: ["bug", "critical"]
  }
);
```

---

#### getReviewStatus(owner, repo, prNumber)
Get review information for a PR.

**Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name
- `prNumber` (number) - Pull request number

**Returns:** Review status object

**Example:**
```javascript
const reviews = await window.electronAPI.getReviewStatus(
  'microsoft',
  'vscode',
  1234
);
```

**Review Status Object:**
```javascript
{
  approved: 2,
  changesRequested: 0,
  pending: 1,
  reviewers: {
    "alice": {
      status: "approved",
      submittedAt: "2024-01-02T14:00:00Z"
    },
    "bob": {
      status: "changes_requested",
      submittedAt: "2024-01-02T15:00:00Z"
    }
  }
}
```

---

#### mergePR(owner, repo, prNumber, mergeMethod)
Merge a pull request.

**Parameters:**
- `owner` (string) - Repository owner
- `repo` (string) - Repository name
- `prNumber` (number) - Pull request number
- `mergeMethod` (string) - 'squash', 'merge', or 'rebase'

**Returns:** Merge result object

**Example:**
```javascript
const result = await window.electronAPI.mergePR(
  'microsoft',
  'vscode',
  1234,
  'squash'
);
// { message: "PR merged", sha: "abc123..." }
```

---

## GitHub Service API

### GitHubService Class

#### Constructor(token)
Initialize the service with a GitHub token.

```javascript
const { GitHubService } = require('./services/github');
const service = new GitHubService('ghp_xxxx...');
```

---

#### getPullRequests(owner, repo, filters)
Same as IPC version - see above.

---

#### getPRDetails(owner, repo, prNumber)
Same as IPC version - see above.

---

#### getReviewStatus(owner, repo, prNumber)
Same as IPC version - see above.

---

#### updatePR(owner, repo, prNumber, updates)
Same as IPC version - see above.

---

#### mergePR(owner, repo, prNumber, mergeMethod)
Same as IPC version - see above.

---

## React Hooks

### usePRList(owner, repo, filters)
Hook for loading and managing PR list.

```javascript
const { prs, loading, error, refresh } = usePRList('microsoft', 'vscode');
```

**Returns:**
- `prs` (array) - List of PRs
- `loading` (boolean) - Currently fetching
- `error` (string|null) - Error message if failed
- `refresh` (function) - Refresh the list

---

### usePRDetails(owner, repo, prNumber)
Hook for loading PR details.

```javascript
const { details, loading, error } = usePRDetails('microsoft', 'vscode', 1234);
```

**Returns:**
- `details` (object|null) - PR details
- `loading` (boolean) - Currently fetching
- `error` (string|null) - Error message if failed

---

## Error Handling

### Error Format
```javascript
{
  message: "Human readable message",
  code: "ERROR_CODE",
  details: { /* additional info */ }
}
```

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `GITHUB_TOKEN_INVALID` | Token invalid/expired | Regenerate token |
| `NOT_FOUND` | PR/repo doesn't exist | Verify owner/repo/PR number |
| `RATE_LIMIT_EXCEEDED` | API rate limit hit | Wait 1 hour |
| `NO_PERMISSION` | Insufficient token scope | Add 'repo' scope |
| `NETWORK_ERROR` | No internet connection | Check connection |

---

## Rate Limiting

GitHub API limits: **5,000 requests/hour**

### Merge Cockpit Usage
- List PRs: 1 request
- Get PR details: 3 requests (PR + reviews + checks)
- Merge PR: 1 request
- Default sync: 1 request every 30 seconds = ~120/hour

**Safe to use with:** 40+ syncs per hour

---

## Environment Variables

### Required
```env
GITHUB_TOKEN=ghp_your_token_here
```

### Optional Configuration
```env
REACT_APP_GITHUB_CLIENT_ID=Xxxxxx
REACT_APP_GITHUB_CLIENT_SECRET=Xxxxxx
REACT_APP_ENABLE_AUTO_SYNC=true
REACT_APP_SYNC_INTERVAL_MS=30000
REACT_APP_OLLAMA_ENABLED=false
REACT_APP_OLLAMA_URL=http://localhost:11434
LOG_LEVEL=info
```

---

## Examples

### Load PRs and Watch for Updates
```javascript
const [prs, setPrs] = useState([]);

useEffect(() => {
  const loadPRs = async () => {
    const list = await window.electronAPI.getPRs('microsoft', 'vscode');
    setPrs(list);
  };

  loadPRs();
  
  // Refresh every 30 seconds
  const interval = setInterval(loadPRs, 30000);
  return () => clearInterval(interval);
}, []);
```

### Show PR with Details and Reviews
```javascript
const [pr, setPr] = useState(null);
const [reviews, setReviews] = useState(null);

useEffect(() => {
  const load = async () => {
    const details = await window.electronAPI.getPRDetails(
      'microsoft',
      'vscode',
      1234
    );
    const reviewStatus = await window.electronAPI.getReviewStatus(
      'microsoft',
      'vscode',
      1234
    );
    setPr(details);
    setReviews(reviewStatus);
  };
  load();
}, []);
```

### Merge with Confirmation
```javascript
const handleMerge = async () => {
  if (window.confirm('Merge PR #' + pr.number + '?')) {
    try {
      await window.electronAPI.mergePR(
        'microsoft',
        'vscode',
        pr.number,
        'squash'
      );
      alert('PR merged successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
};
```

---

## Testing

### Mock Service
```javascript
const { MockGitHubService } = require('./services/github.mock');
const service = new MockGitHubService();

// Use like real service
const prs = await service.getPullRequests('user', 'repo');
```

### Mock Data
Test with sample PRs:
```javascript
const testPRs = [
  {
    id: 1,
    number: 123,
    title: 'Test PR',
    state: 'open',
    // ... other fields
  }
];
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- PR listing, details, merging
- Review tracking
- CI/CD status display

### Future (v1.1.0)
- Batch operations
- Custom merge strategies
- Notification system
- Team collaboration

---

For more help, visit the [GitHub Issues](https://github.com/yourusername/merge-cockpit/issues) page.
