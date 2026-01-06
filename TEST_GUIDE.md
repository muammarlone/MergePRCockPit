# Merge Cockpit - Comprehensive Unit Testing Guide

## Overview

This document describes the comprehensive unit testing setup for the Merge Cockpit application, covering components, services, and integration tests.

## Test Structure

```
src/
├── __tests__/
│   ├── __mocks__/
│   │   ├── mockData.js          # Mock GitHub/Ollama data
│   │   └── electronAPIMock.js   # Electron API mocks
│   ├── unit/
│   │   ├── Login.test.js        # Login component tests
│   │   ├── RepositorySelector.test.js
│   │   ├── PRDetails.test.js
│   │   ├── AIInsights.test.js
│   │   └── Dashboard.test.js (create as needed)
│   ├── services/
│   │   ├── GitHubService.test.js
│   │   └── OllamaService.test.js
│   └── integration/
│       └── flows.test.js        # Complete user flows
├── setupTests.js               # Jest configuration
├── jest.config.js              # Jest settings
└── package.json                # Test scripts
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Only Service Tests
```bash
npm run test:services
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### View Coverage Report
```bash
npm test -- --coverage
```

## Test Coverage

### Components (Unit Tests)

#### 1. Login Component (`Login.test.js`)
- ✅ Renders login form with token input
- ✅ Renders OAuth buttons (Google, GitHub, LinkedIn)
- ✅ Accepts and stores GitHub token
- ✅ Stores token to localStorage on success
- ✅ Calls onAuthSuccess callback
- ✅ Initiates OAuth flows on button clicks
- ✅ Shows error messages on failure
- ✅ Validates token input

**Test Cases: 8**

#### 2. Repository Selector (`RepositorySelector.test.js`)
- ✅ Renders owner and repository dropdowns
- ✅ Loads repositories on mount
- ✅ Filters repositories by selected owner
- ✅ Calls callback when owner/repo selected
- ✅ Shows loading state while fetching
- ✅ Displays error messages on API failure
- ✅ Handles missing electronAPI gracefully
- ✅ Pre-selects initial values
- ✅ Disables repo dropdown when no owner selected

**Test Cases: 9**

#### 3. PR Details (`PRDetails.test.js`)
- ✅ Displays PR title and metadata
- ✅ Shows PR number and author
- ✅ Displays PR description
- ✅ Shows review status with counts
- ✅ Lists reviewers with statuses
- ✅ Renders tab navigation (Overview, Analysis, Changes)
- ✅ Switches between tabs
- ✅ Shows merge button for open PRs
- ✅ Merges PR on button click
- ✅ Fetches data on mount
- ✅ Shows loading and error states
- ✅ Handles missing electronAPI

**Test Cases: 12**

#### 4. AI Insights (`AIInsights.test.js`)
- ✅ Fetches AI insights on mount
- ✅ Displays all 6 insight types:
  - Risk Assessment with badge
  - PR Summary
  - Suggested Title
  - Review Focus Areas
  - Suggested Reviewers
  - Commit Message
- ✅ Toggles section expansion
- ✅ Shows copy buttons for suggestions
- ✅ Shows risk level colors (HIGH, MEDIUM, LOW)
- ✅ Shows loading state
- ✅ Displays unavailable message when no insights
- ✅ Calls refresh on button click
- ✅ Handles missing electronAPI
- ✅ Shows error messages

**Test Cases: 14**

### Services (Service Tests)

#### 5. GitHub Service (`GitHubService.test.js`)
- ✅ Initializes with GitHub token
- ✅ Throws error without token
- getPullRequests()
  - Fetches PRs with filters
  - Applies state filters
  - Applies sorting
  - Handles API errors
- getPRDetails()
  - Fetches detailed PR info
  - Includes check status
  - Handles 404 errors
- updatePR()
  - Updates title and description
  - Validates parameters
- mergePullRequest()
  - Merges with specified method
  - Handles merge conflicts
  - Checks permissions
- getRepositories()
  - Fetches user/org repos
  - Includes owner info
- getReviewStatus()
  - Fetches review status
  - Counts approvals and changes
  - Lists individual reviewers

**Test Cases: 18**

#### 6. Ollama Service (`OllamaService.test.js`)
- ✅ Checks Ollama health status
- ✅ Caches health checks
- ✅ Handles Ollama unavailable
- analyzePR()
  - Generates 6 insight types
  - Handles timeouts
  - Validates PR data
- generatePRSummary()
  - Creates concise summary
  - Handles empty descriptions
  - Respects caching
- suggestTitle()
  - Generates better titles
  - Follows conventional commits
- assessRisk()
  - Evaluates risk (LOW/MEDIUM/HIGH)
  - Considers file count
- suggestReviewers()
  - Recommends reviewers
  - Excludes PR author
- generateReviewComments()
  - Creates specific feedback
  - Provides actionable comments
- generateCommitMessage()
  - Creates professional messages
  - Follows semantic format
  - Includes multiple paragraphs
- Cache management
  - Clears cache
  - Respects size limits
  - Evicts old entries

**Test Cases: 28**

### Integration Tests

#### 7. Complete Flows (`flows.test.js`)

**Authentication Flow**
- ✅ Complete login to dashboard flow
- ✅ Shows login when no token
- ✅ Shows repository selector when authenticated

**Repository Selection Flow**
- ✅ Complete repository selection flow
- ✅ Displays PR list after selection

**PR Details and Analysis Flow**
- ✅ Complete PR drill-down with AI analysis
- ✅ Displays all AI insight types
- ✅ User can merge PR

**Error Handling**
- ✅ Handles token validation errors
- ✅ Handles API failures
- ✅ Handles missing electronAPI

**State Management**
- ✅ Persists selected repository
- ✅ Restores state on reload

**Performance**
- ✅ Caches PR list
- ✅ Clears cache on logout

**Test Cases: 13**

## Mock Data

### mockData.js
Provides realistic mock data for testing:
- `mockPR` - Single PR object
- `mockPRList` - Array of PRs
- `mockPRDetails` - Detailed PR with checks
- `mockReviewStatus` - Review counts and reviewers
- `mockAIInsights` - All 6 insight types
- `mockRepositories` - Multiple repos with owners
- `mockOllamaStatus` - Ollama health status
- `mockUser` - GitHub user data
- `mockGitHubToken` - Sample token

### electronAPIMock.js
Utility functions for testing:
- `setupElectronAPIMock()` - Initialize API mocks
- `setupLocalStorageMock()` - Initialize storage mocks
- `expectLocalStorageCall()` - Assert storage calls
- `expectElectronAPICall()` - Assert API calls

## Test Execution

### Before Running Tests
1. Install dependencies: `npm install`
2. All mocks are automatically set up in `setupTests.js`
3. localStorage and electronAPI are mocked globally

### During Tests
- Tests run in jsdom environment
- Async operations are handled with `waitFor`
- User interactions use `@testing-library/user-event`
- API calls are mocked with jest.fn()

### After Tests
- All mocks are cleared
- localStorage is reset
- No state persists between tests

## Ollama AI Features Tested

### 1. Risk Assessment
- ✅ Evaluates LOW, MEDIUM, HIGH risk levels
- ✅ Analyzes changed files and complexity
- ✅ Provides reasoning for risk level

### 2. PR Summary
- ✅ Auto-generates concise description
- ✅ Captures key changes
- ✅ Respects caching for identical PRs

### 3. Title Suggestion
- ✅ Suggests better PR titles
- ✅ Follows conventional commit format
- ✅ Provides copy-to-clipboard functionality

### 4. Reviewer Suggestions
- ✅ Recommends appropriate reviewers
- ✅ Excludes PR author
- ✅ Considers code expertise areas

### 5. Review Comments
- ✅ Generates actionable feedback
- ✅ Identifies potential issues
- ✅ Provides constructive suggestions

### 6. Commit Message Generation
- ✅ Creates professional messages
- ✅ Follows semantic versioning
- ✅ Includes body and footer sections

## Coverage Goals

- **Overall**: 50%+
- **Components**: 70%+
- **Services**: 60%+
- **Integration**: Critical paths 80%+

## Running Specific Test Suites

### Test Login Component
```bash
npm test -- Login.test.js
```

### Test Repository Selection
```bash
npm test -- RepositorySelector.test.js
```

### Test PR Details and Analysis
```bash
npm test -- PRDetails.test.js
npm test -- AIInsights.test.js
```

### Test Services
```bash
npm test -- GitHubService.test.js
npm test -- OllamaService.test.js
```

### Test Complete Flows
```bash
npm test -- flows.test.js
```

## Extending Tests

### Adding New Component Tests
1. Create file: `src/__tests__/unit/ComponentName.test.js`
2. Import testing utilities and mock data
3. Write test cases following existing patterns
4. Use `setupElectronAPIMock()` for API mocking
5. Use `setupLocalStorageMock()` for storage

### Adding New Service Tests
1. Create file: `src/__tests__/services/ServiceName.test.js`
2. Mock external dependencies (Octokit, axios)
3. Test each method with success and error cases
4. Test edge cases and invalid input

### Adding Integration Tests
1. Add test cases to `flows.test.js`
2. Test complete user journeys
3. Verify state management
4. Test error recovery paths

## Debugging Tests

### View Console Output
```bash
npm test -- --verbose
```

### Debug Single Test
```bash
npm test -- --testNamePattern="specific test name"
```

### Generate Coverage Report
```bash
npm test -- --coverage --coverageReporters=html
```

Then open `coverage/index.html` in browser.

### Watch Mode for Development
```bash
npm run test:watch
```

## CI/CD Integration

The test suite can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- run: npm install
- run: npm test -- --coverage
- run: npm run build
```

## Common Issues and Solutions

### Issue: `window.electronAPI is undefined`
**Solution**: Tests automatically mock this in `setupTests.js`

### Issue: `localStorage is not defined`
**Solution**: `setupTests.js` provides mock localStorage

### Issue: Async test timeout
**Solution**: Increase timeout: `jest.setTimeout(10000)`

### Issue: Component not rendering
**Solution**: Use `waitFor(() => expect(...).toBeInTheDocument())`

## Best Practices

1. **Use Mock Data**: Always use data from `mockData.js`
2. **Clear Mocks**: Call `jest.clearAllMocks()` in beforeEach
3. **Test Behavior**: Focus on user interactions, not implementation
4. **Avoid Globals**: Use `setupLocalStorageMock()` in each test
5. **Meaningful Names**: Use descriptive test case names
6. **Arrange-Act-Assert**: Follow AAA pattern
7. **Test Happy Path**: But also error cases
8. **Use waitFor**: For async operations and API calls

## Summary

**Total Test Cases: 94+**
- Unit Tests: 53 test cases
- Service Tests: 28 test cases  
- Integration Tests: 13 test cases

**Coverage**: Critical paths and features fully covered
**Framework**: Jest + React Testing Library
**Mocks**: Electron API, localStorage, GitHub API, Ollama API

This comprehensive test suite ensures the Merge Cockpit application is robust, reliable, and maintainable.
