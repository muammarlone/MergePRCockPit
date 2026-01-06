# Enhanced Analytics & Predictive Intelligence Features

This document describes the new enhanced analytics, merge conflict remediation, and file operations features added to MergePR Cockpit.

## Table of Contents

1. [Enhanced Analytics](#enhanced-analytics)
2. [Merge Conflict Remediation](#merge-conflict-remediation)
3. [File Operations](#file-operations)
4. [Architecture](#architecture)
5. [Usage Guide](#usage-guide)

## Enhanced Analytics

### Overview

The Enhanced Analytics feature provides advanced insights into repository health, PR trends, and predictive metrics to help teams make data-driven decisions.

### Key Features

#### 1. Repository Health Score (0-100)
- Automated scoring based on multiple factors:
  - Number of open PRs
  - Merge conflict rate
  - Average merge time
  - Trend analysis
- Visual health indicator with color coding
- Actionable recommendations for improvement

#### 2. Trend Analysis
- 30-day historical data tracking
- PR activity trends (open, merged, conflicts)
- Conflict trend detection (increasing/decreasing/stable)
- Velocity trend analysis (improving/declining/stable)
- Interactive time-series charts

#### 3. Predictive Metrics
- Merge conflict probability estimation
- Estimated merge time calculation
- Risk factor identification
- Automated recommendations

#### 4. Advanced Visualizations
- Line charts for PR activity over time
- Area charts for conflict trends
- Bar charts for PR distribution
- Pie charts for state breakdown

### Health Score Calculation

The health score is calculated based on:
- **Open PR Count** (-5 to -15 points based on count)
- **Conflict Rate** (-5 to -20 points based on percentage)
- **Merge Time** (-5 to -15 points based on hours)
- **Conflict Trend** (-10 points if increasing, +5 if decreasing)
- **Velocity Trend** (+5 points if improving, -10 if declining)

Score ranges:
- **80-100**: Excellent - Repository is well maintained
- **60-79**: Good - Minor improvements recommended
- **40-59**: Fair - Several areas need attention
- **0-39**: Poor - Immediate action required

### API Reference

#### AnalyticsService

```typescript
// Get enhanced metrics with trends
const metrics = await analyticsService.getEnhancedMetrics(owner, repo, pullRequests);

// Predict merge conflict probability
const prediction = analyticsService.predictMergeConflict(pr, repoHistory);
```

## Merge Conflict Remediation

### Overview

The Merge Conflict Remediation feature provides AI-powered analysis and automated suggestions for resolving merge conflicts.

### Key Features

#### 1. Conflict Analysis
- Automatic detection of merge conflicts
- Severity assessment (low/medium/high)
- File-level conflict identification
- Auto-resolvability determination

#### 2. Remediation Strategies
Multiple resolution strategies provided:
- **Auto-Resolution**: For simple conflicts (low complexity)
- **Rebase Strategy**: Step-by-step rebase instructions
- **Merge Strategy**: Merge base branch into feature
- **Manual Resolution**: Detailed manual steps

Each strategy includes:
- Confidence score (0-100%)
- Estimated time (minutes)
- Step-by-step instructions

#### 3. AI-Powered Suggestions
- Integration with Ollama for intelligent advice
- Context-aware recommendations
- Best practice guidance
- Risk mitigation strategies

#### 4. Conflict Statistics
- Total conflict count
- Conflict rate percentage
- Average resolution time
- Common conflict patterns

### Severity Assessment

Conflicts are categorized as:
- **Low**: ≤5 files, ≤200 total changes
- **Medium**: 6-15 files or 200-1000 changes
- **High**: >15 files or >1000 changes

### API Reference

#### MergeRemediationService

```typescript
// Analyze conflicts for a PR
const analysis = await mergeRemediationService.analyzeConflicts(owner, repo, pr);

// Get remediation suggestions
const suggestions = await mergeRemediationService.getRemediationSuggestions(pr);

// Attempt auto-resolution (requires permissions)
const result = await mergeRemediationService.autoResolveConflicts(owner, repo, pr);

// Get repository conflict statistics
const stats = mergeRemediationService.getConflictStats(allPRs);
```

## File Operations

### Overview

The File Operations feature enables secure upload and download of office documents and archives directly from the repository.

### Supported File Types

- **Documents**: .docx, .doc
- **Presentations**: .pptx, .ppt
- **Spreadsheets**: .xlsx, .xls
- **Archives**: .zip
- **PDFs**: .pdf

### Key Features

#### 1. Secure Upload
- File type validation
- Size limit enforcement (100MB max)
- Security checks for suspicious files
- Commit message support
- Branch selection

#### 2. Download
- Direct file download
- Integrity verification
- Browser-based file saving

#### 3. File Browsing
- List files in repository
- Filter by supported types
- File metadata display (size, path)
- Icon-based file type identification

#### 4. Security Features
- **Type Validation**: Only allowed file types
- **Size Limits**: Maximum 100MB per file
- **Path Sanitization**: Prevents directory traversal
- **Executable Detection**: Blocks dangerous file types
- **Warnings**: Alerts for large files and archives

### Security Checks

The system performs comprehensive security validation:

1. **File Type Check**: Only whitelisted extensions allowed
2. **Size Check**: Files exceeding 100MB are rejected
3. **Path Check**: Detects suspicious paths (../, ~)
4. **Executable Check**: Blocks .exe, .bat, .sh, .cmd, etc.
5. **Large File Warning**: Warns for files >50MB
6. **Archive Warning**: Alerts that zips are not scanned

### API Reference

#### FileOperationsService

```typescript
// Upload file
const operation = await fileOperationsService.uploadFile(
  owner,
  repo,
  filePath,
  content,
  commitMessage,
  branch
);

// Download file
const result = await fileOperationsService.downloadFile(
  owner,
  repo,
  filePath,
  branch
);

// List files
const files = await fileOperationsService.listFiles(
  owner,
  repo,
  path,
  branch
);

// Security check
const check = fileOperationsService.performSecurityCheck(operation);

// Filter supported files
const supported = fileOperationsService.filterSupportedFiles(allFiles);
```

## Architecture

### Service Layer

All features follow the established service layer pattern:

```
Components (UI)
    ↓
Services (Business Logic)
    ↓
Data Access (GitHub API, Ollama)
```

### New Services

1. **AnalyticsService**: Enhanced analytics and predictions
2. **MergeRemediationService**: Conflict analysis and remediation
3. **FileOperationsService**: File upload/download operations

### Component Integration

New components integrate seamlessly into the Dashboard:

- **EnhancedAnalytics**: Advanced analytics tab
- **RemediationDashboard**: Conflict remediation tab
- **FileOperations**: File management tab

### Type Safety

All features use TypeScript with comprehensive type definitions:

- `EnhancedMetrics`: Extended metrics with trends
- `ConflictAnalysis`: Conflict analysis results
- `RemediationSuggestion`: Remediation strategies
- `FileOperation`: File operation metadata
- `FileMetadata`: Repository file information

## Usage Guide

### Accessing Features

From the Dashboard, select a repository and navigate to the desired tab:

1. **📊 Enhanced Analytics**: View advanced repository insights
2. **🔧 Remediation**: Analyze and resolve merge conflicts
3. **📁 File Ops**: Upload/download office files

### Enhanced Analytics Workflow

1. Select repository
2. Navigate to "Enhanced Analytics" tab
3. Review health score and trends
4. Examine insights and recommendations
5. Use predictive metrics to identify high-risk PRs

### Conflict Remediation Workflow

1. Select repository
2. Navigate to "Remediation" tab
3. View list of PRs with conflicts
4. Click on a PR to analyze
5. Review conflict severity and files
6. Choose a remediation strategy
7. Follow step-by-step instructions
8. Review AI-powered suggestions (if Ollama available)

### File Operations Workflow

#### Upload Files
1. Select repository
2. Navigate to "File Ops" tab
3. Choose branch (default: main)
4. Click file selector
5. Choose file from local system
6. Specify destination path
7. Add commit message
8. Click "Upload File"
9. Review security warnings if any

#### Download Files
1. Browse repository files
2. Click "Download" on desired file
3. File saves to local system

### Best Practices

#### For Analytics
- Review health score weekly
- Monitor trends for early warning signs
- Act on recommendations promptly
- Use predictive metrics before merging large PRs

#### For Remediation
- Address conflicts early
- Use auto-resolution only for simple conflicts
- Follow rebase strategy for clean history
- Coordinate with team on overlapping work

#### For File Operations
- Keep files under 50MB when possible
- Use descriptive commit messages
- Verify file type before upload
- Store files in organized directories (e.g., /docs, /presentations)

## Testing

Comprehensive test coverage includes:

- **AnalyticsService**: 10+ tests covering metrics, predictions, trends
- **MergeRemediationService**: 15+ tests for conflict analysis and remediation
- **FileOperationsService**: 10+ tests for security and operations

Run tests:
```bash
npm test
```

## Future Enhancements

Planned improvements include:

1. **Database Integration**: Historical data persistence
2. **Advanced AI Models**: Support for multiple AI providers
3. **Automated Conflict Resolution**: Enhanced auto-resolution capabilities
4. **File Previews**: In-browser document preview
5. **Batch Operations**: Upload/download multiple files
6. **Conflict Prediction**: ML-based conflict prediction
7. **Team Insights**: Developer-specific metrics
8. **Custom Dashboards**: User-configurable analytics views

## Security Considerations

- All file operations validate input
- Size limits prevent resource exhaustion
- Type checking prevents malicious uploads
- Path sanitization prevents directory traversal
- Executable files are blocked
- Git versioning provides audit trail
- OAuth tokens used for authentication

## Performance

Optimizations implemented:

- Lazy loading of analytics data
- Memoization for expensive calculations
- Efficient trend calculation algorithms
- Client-side file validation
- Minimal API calls

## Troubleshooting

### Enhanced Analytics

**Issue**: Trends not showing data
- **Solution**: Ensure repository has PR history spanning multiple days

**Issue**: Health score seems low
- **Solution**: Review specific factors in insights section

### Remediation

**Issue**: AI suggestions unavailable
- **Solution**: Install and run Ollama locally (http://localhost:11434)

**Issue**: Auto-resolution fails
- **Solution**: Use manual resolution or rebase strategy

### File Operations

**Issue**: Upload fails with security error
- **Solution**: Check file type and size limits

**Issue**: File not appearing after upload
- **Solution**: Refresh file list or check branch selection

## Support

For issues or questions:
- GitHub Issues: https://github.com/muammarlone/MergePRCockPit/issues
- Documentation: See ARCHITECTURE.md and README.md
