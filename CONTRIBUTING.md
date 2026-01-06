# Contributing to MergePRCockPit

Thank you for your interest in contributing to MergePRCockPit! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Architecture Overview](#architecture-overview)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Pull Request Process](#pull-request-process)
10. [Plugin Development](#plugin-development)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Getting Started

### Prerequisites

- **Git**: Version control system
- **Go**: 1.21+ (for backend services)
- **Node.js**: 18+ (for frontend and plugins)
- **Python**: 3.10+ (for AI/ML components)
- **Docker**: For containerized development
- **Kubernetes**: For local cluster (minikube/kind)

### Installation

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MergePRCockPit.git
   cd MergePRCockPit
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/muammarlone/MergePRCockPit.git
   ```

## Development Setup

### Local Environment

#### Backend Services (Go)

```bash
# Navigate to backend directory
cd services/git-operations

# Install dependencies
go mod download

# Run tests
go test ./...

# Run service
go run cmd/server/main.go
```

#### Frontend (React/TypeScript)

```bash
# Navigate to frontend directory
cd web-ui

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

#### AI/ML Services (Python)

```bash
# Navigate to AI service
cd services/ai-assistants

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Run service
python -m uvicorn app.main:app --reload
```

### Docker Development

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Run specific service
docker-compose up git-operations

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Kubernetes Development

```bash
# Start local cluster
minikube start

# Build and deploy
skaffold dev

# Access services
kubectl port-forward svc/api-gateway 8080:80
```

## Architecture Overview

Please review [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

### Module Structure

```
MergePRCockPit/
├── services/               # Microservices
│   ├── git-operations/    # Git operations engine
│   ├── issue-management/  # Issue tracking
│   ├── pr-analytics/      # PR review analytics
│   ├── ai-assistants/     # AI modules
│   ├── trust-fabric/      # Compliance & audit
│   └── plugin-engine/     # Plugin framework
├── web-ui/                # Frontend application
├── cli/                   # Command-line interface
├── plugins/               # Official plugins
├── docs/                  # Documentation
├── deploy/                # Deployment configs
│   ├── kubernetes/        # K8s manifests
│   ├── terraform/         # Infrastructure as code
│   └── helm/              # Helm charts
└── scripts/               # Utility scripts
```

### Technology Stack

- **Backend**: Go, Python, Node.js
- **Frontend**: React, TypeScript
- **Database**: PostgreSQL, TimescaleDB
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: NATS
- **ML**: PyTorch, TensorFlow
- **Infrastructure**: Kubernetes, Docker

## Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### Branch Naming Convention

- **Features**: `feature/descriptive-name`
- **Bug fixes**: `fix/issue-number-description`
- **Documentation**: `docs/what-you-are-documenting`
- **Refactoring**: `refactor/what-you-are-refactoring`
- **Performance**: `perf/what-you-are-improving`

### 2. Make Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add/update tests
- Update documentation
- Commit regularly with meaningful messages

### 3. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(git-ops): add repository reorganization feature

Implements the ability to reorganize files across repositories
while preserving git history.

Closes #123

fix(api): resolve race condition in merge preview

The merge preview endpoint had a race condition when multiple
requests were made simultaneously. This adds proper locking.

docs(ai): update AI assistant API documentation

Added examples for new natural language query features.
```

### 4. Keep Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Resolve conflicts if any
# Then continue rebase
git rebase --continue

# Force push to your fork
git push --force-with-lease origin feature/your-feature-name
```

## Coding Standards

### Go

Follow [Effective Go](https://golang.org/doc/effective_go.html) and use standard tools:

```bash
# Format code
go fmt ./...

# Lint code
golangci-lint run

# Vet code
go vet ./...
```

**Key conventions**:
- Use `gofmt` for formatting
- Error handling: always check errors
- Naming: use camelCase for unexported, PascalCase for exported
- Comments: document all exported functions/types
- Testing: test files end with `_test.go`

### JavaScript/TypeScript

Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript):

```bash
# Lint code
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

**Key conventions**:
- Use ESLint and Prettier
- Prefer `const` over `let`, avoid `var`
- Use async/await over callbacks
- Use TypeScript for type safety
- Document public APIs with JSDoc

### Python

Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/):

```bash
# Format code
black .

# Lint code
flake8

# Type checking
mypy .
```

**Key conventions**:
- Use `black` for formatting
- Type hints for all functions
- Docstrings for all modules/classes/functions (Google style)
- Maximum line length: 100 characters
- Use `pylint` for linting

### Code Review Checklist

Before submitting, ensure:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] No performance regressions
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate

## Testing Guidelines

### Test Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /----\
     /      \    Integration Tests (Some)
    /--------\
   /          \  Unit Tests (Many)
  /____________\
```

### Unit Tests

**Coverage requirement**: 80%+ for new code

**Go example**:
```go
func TestMergePreview(t *testing.T) {
    tests := []struct {
        name    string
        input   MergeRequest
        want    MergePreview
        wantErr bool
    }{
        {
            name: "successful merge preview",
            input: MergeRequest{
                Source: "feature",
                Target: "main",
            },
            want: MergePreview{
                Conflicts: []string{},
                FilesChanged: 5,
            },
            wantErr: false,
        },
        // More test cases...
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := MergePreview(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("MergePreview() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if !reflect.DeepEqual(got, tt.want) {
                t.Errorf("MergePreview() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

**JavaScript example**:
```typescript
describe('PR Review Assistant', () => {
  it('should detect security vulnerabilities', async () => {
    const code = 'const query = `SELECT * FROM users WHERE id = ${userId}`';
    const result = await reviewAssistant.analyzeCode(code);
    
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('security');
    expect(result.issues[0].severity).toBe('critical');
  });
  
  it('should handle empty code', async () => {
    const result = await reviewAssistant.analyzeCode('');
    expect(result.issues).toHaveLength(0);
  });
});
```

### Integration Tests

Test interactions between components:

```python
def test_merge_workflow_integration():
    # Setup
    repo = create_test_repo()
    branch = create_branch(repo, "feature")
    make_changes(branch, "test.txt", "content")
    
    # Create PR
    pr = create_pull_request(repo, branch, "main")
    
    # Get merge preview
    preview = merge_service.preview(pr.id)
    assert preview.conflicts == []
    
    # Execute merge
    result = merge_service.merge(pr.id)
    assert result.success is True
    
    # Verify
    assert get_branch_content(repo, "main", "test.txt") == "content"
```

### E2E Tests

Test full user workflows:

```typescript
test('complete PR review workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to PRs
  await page.click('text=Pull Requests');
  await expect(page).toHaveURL('/prs');
  
  // Open first PR
  await page.click('.pr-list-item:first-child');
  
  // Review code
  await page.click('button:has-text("Start Review")');
  await page.fill('textarea[name="comment"]', 'LGTM!');
  await page.click('button:has-text("Approve")');
  
  // Verify success
  await expect(page.locator('.review-status')).toHaveText('Approved');
});
```

### Running Tests

```bash
# Run all tests
npm test                    # Frontend
go test ./...              # Backend Go
pytest                      # Backend Python

# Run with coverage
npm test -- --coverage
go test -cover ./...
pytest --cov

# Run specific test
npm test -- PRReviewAssistant.test.ts
go test -run TestMergePreview
pytest tests/test_ai_assistant.py::test_pr_review
```

## Documentation

### Code Documentation

- Document all public APIs
- Use examples in documentation
- Keep documentation up-to-date with code

**Go**:
```go
// MergePreview generates a preview of a merge operation without executing it.
// It analyzes the source and target branches to detect conflicts and estimate
// the impact of the merge.
//
// Example:
//   preview, err := MergePreview(MergeRequest{
//       Source: "feature",
//       Target: "main",
//   })
//
// Returns an error if the branches don't exist or cannot be analyzed.
func MergePreview(req MergeRequest) (*MergePreview, error) {
    // Implementation
}
```

**TypeScript**:
```typescript
/**
 * Analyzes code for security vulnerabilities and quality issues.
 * 
 * @param code - The source code to analyze
 * @param options - Analysis options
 * @returns Analysis result with detected issues
 * 
 * @example
 * ```typescript
 * const result = await reviewAssistant.analyzeCode(
 *   'const x = 1;',
 *   { checkSecurity: true }
 * );
 * console.log(result.issues);
 * ```
 */
async analyzeCode(code: string, options?: AnalysisOptions): Promise<AnalysisResult> {
  // Implementation
}
```

### User Documentation

- Add documentation to `docs/` directory
- Use Markdown format
- Include examples and screenshots
- Keep table of contents updated

### API Documentation

- Use OpenAPI/Swagger for REST APIs
- Use GraphQL schema documentation
- Include request/response examples
- Document error codes

## Pull Request Process

### Before Submitting

1. **Self-review your code**
2. **Run all tests locally**
3. **Update documentation**
4. **Rebase on latest main**
5. **Write clear PR description**

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional information]
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by at least 1 maintainer
3. **Security scan** must show no critical issues
4. **Documentation review** if docs changed
5. **Final approval** from maintainer

### After Approval

- PR will be merged using **squash and merge**
- Your commits will be squashed into one
- Commit message will be PR title + description
- Branch will be automatically deleted

## Plugin Development

See [Plugin Framework Documentation](docs/modules/plugin-framework.md) for detailed guide.

### Quick Start

```bash
# Create plugin from template
npm create @mergeprcockpit/plugin my-plugin

# Develop plugin
cd my-plugin
npm install
npm run dev

# Test plugin
npm test

# Build plugin
npm run build

# Package plugin
npm run package
```

### Publishing Plugins

1. Test thoroughly
2. Write comprehensive README
3. Add examples
4. Submit to plugin registry (future)

## Getting Help

- **Documentation**: https://docs.mergeprcockpit.io
- **Discussions**: https://github.com/muammarlone/MergePRCockPit/discussions
- **Discord**: https://discord.gg/mergeprcockpit (future)
- **Email**: dev@mergeprcockpit.io

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Annual contributor report

Thank you for contributing! 🎉
