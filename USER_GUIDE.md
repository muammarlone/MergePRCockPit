# Enhanced Analytics & Predictive Intelligence - User Guide

This guide covers the new features added in version 1.1.0 of MergePR Cockpit.

## 🚀 New Features Overview

### 1. Enhanced Analytics Dashboard

The Analytics tab now provides comprehensive insights into your repository's health and team productivity.

#### Key Metrics
- **PR Velocity**: Track how many pull requests are created per week
- **Top Contributors**: See who's contributing the most with merge statistics
- **Conflict Trends**: Visualize merge conflicts over time to identify patterns
- **Average Merge Time**: Monitor how long it takes to merge PRs

#### How to Access
1. Select a repository from the Dashboard
2. Click on the "Analytics" tab
3. View real-time metrics and charts

#### New Visualizations
- **Conflict Trend Chart**: Line chart showing conflicts vs. resolved over 12 weeks
- **Top Contributors Chart**: Bar chart showing PR activity by contributor
- **PR State Breakdown**: Enhanced pie chart with distribution data

### 2. AI-Powered Conflict Prediction & Remediation

#### Conflict Prediction
The new Remediation Dashboard uses AI to predict merge conflicts before they happen.

**Features:**
- Probability scoring (0-100%) for conflict likelihood
- Risk level assessment (Low/Medium/High)
- Identification of likely conflicting files
- Auto-fixable conflict detection

#### How to Use
1. Navigate to the "🔧 Remediation" tab
2. View automatically analyzed high-risk PRs
3. Click on any PR to see detailed predictions
4. Review suggested preventive actions

#### Remediation Suggestions
For PRs with detected conflicts, the system generates remediation suggestions:

**Three-Tier Workflow:**
1. **Suggest**: AI provides recommendations for manual review
2. **Fix**: AI suggests specific code changes with confidence scores
3. **Auto-Resolve**: AI identifies conflicts that can be automatically fixed

**Confidence Scoring:**
Each suggestion includes a confidence score (0-100%) indicating how certain the AI is about the remediation approach.

#### Enabling AI Features
To use conflict prediction, ensure Ollama is installed and running:
```bash
# Install Ollama from https://ollama.ai
ollama pull llama2
ollama serve
```

The system will automatically detect when AI services are available.

### 3. Advanced File Operations

Upload and manage files directly from the cockpit interface.

#### Supported File Types
- **Archives**: .zip
- **Documents**: .docx
- **Presentations**: .pptx
- **Spreadsheets**: .xlsx

#### Security Features
- **File Type Validation**: Magic number verification ensures files are what they claim to be
- **Size Limits**: 100MB maximum file size for safety
- **Checksum Validation**: Integrity checks on all uploads/downloads
- **Version Tracking**: Complete history of file changes

#### How to Upload Files
1. Click on the "📁 Files" tab
2. Select a file from your computer
3. Specify:
   - File path in the repository
   - Target branch (default: main)
   - Commit message
4. Click "Upload File"
5. File will be committed to the repository with full version tracking

#### How to Download Files
1. Navigate to the "📁 Files" tab
2. Browse existing files in the repository
3. Click "Download" on any file
4. File will be retrieved with checksum verification

#### Version History
View complete version history for any file:
- Version numbers
- Commit SHA
- Author information
- Commit messages
- Timestamps

## 📊 Understanding the Metrics

### PR Velocity
Calculated as the average number of PRs created per week over the last 30 days.

**Interpretation:**
- High velocity (>10 PRs/week): Active development
- Medium velocity (3-10 PRs/week): Steady progress
- Low velocity (<3 PRs/week): Consider reviewing workflow

### Conflict Trends
Shows the number of conflicts created and resolved each week.

**What to Watch:**
- Increasing conflicts: May indicate architectural issues
- Low resolution rate: Team may need support with complex conflicts
- Patterns in timing: Identify busy periods that need extra attention

### Top Contributors
Ranked by total PR count with additional metrics:
- Total PRs created
- Successfully merged PRs
- Average time to merge

**Use Cases:**
- Identify knowledge experts
- Recognize team contributions
- Balance workload distribution

## 🔧 Remediation Workflow

### Understanding Risk Levels

**High Risk (Red)**
- Probability >60%
- Large number of changed files (>15)
- Complex merge scenarios
- Action: Review carefully, consider breaking into smaller PRs

**Medium Risk (Orange)**
- Probability 30-60%
- Moderate changes (5-15 files)
- Some potential conflicts
- Action: Review suggested remediations, proceed with caution

**Low Risk (Green)**
- Probability <30%
- Small changes (<5 files)
- Unlikely to conflict
- Action: Standard review process

### Applying Remediations

**Suggest Type:**
- Review the AI's recommendations
- Manually implement the suggestions
- No automatic changes

**Fix Type:**
- Review the proposed changes
- Click "Apply Fix" to implement
- Changes are made but require manual verification

**Auto-Resolve Type:**
- High confidence fixes (>80%)
- Click "Auto-Resolve" to apply immediately
- System will attempt automatic resolution
- Always review the result

## 🔒 Security Best Practices

### File Uploads
1. **Verify File Sources**: Only upload files from trusted sources
2. **Check File Contents**: The system validates file types but always review content
3. **Use Appropriate Branches**: Upload to feature branches, not directly to main
4. **Meaningful Commit Messages**: Help track file changes over time

### AI Recommendations
1. **Review All Suggestions**: Never blindly accept AI recommendations
2. **Test Auto-Fixes**: Even high-confidence fixes should be tested
3. **Understand the Context**: AI suggestions are based on patterns, not domain knowledge
4. **Manual Verification**: Always verify critical changes manually

## 📈 Analytics Insights Examples

### Scenario 1: High Conflict Rate
**Observation**: Conflict trend chart shows increasing conflicts
**Possible Causes:**
- Lack of communication between team members
- Outdated branches not syncing with main
- Architectural changes affecting multiple areas

**Actions:**
- Increase code review frequency
- Implement branch protection rules
- Schedule regular sync meetings
- Consider refactoring to reduce coupling

### Scenario 2: Declining PR Velocity
**Observation**: PR velocity dropping over time
**Possible Causes:**
- Team capacity issues
- Increasing complexity
- Blocking dependencies

**Actions:**
- Review team bandwidth
- Break down large features
- Identify and resolve blockers
- Automate repetitive tasks

### Scenario 3: Contributor Imbalance
**Observation**: Top contributors chart shows heavy concentration
**Possible Causes:**
- Knowledge silos
- Uneven workload distribution
- Onboarding gaps

**Actions:**
- Pair programming sessions
- Knowledge sharing meetings
- Rotate responsibilities
- Mentorship programs

## 🎯 Best Practices

### Using Analytics Effectively
1. **Regular Review**: Check analytics weekly
2. **Track Trends**: Focus on trends over absolute numbers
3. **Context Matters**: Consider team size, project phase, etc.
4. **Actionable Insights**: Use metrics to drive improvements

### Maximizing AI Benefits
1. **Keep Ollama Updated**: Newer models provide better predictions
2. **Provide Context**: Detailed PR descriptions improve AI analysis
3. **Feedback Loop**: Note which suggestions work well
4. **Gradual Adoption**: Start with suggestions, build trust before auto-resolve

### File Operations Guidelines
1. **Organize Files**: Use consistent paths and naming
2. **Small Files**: Keep files under 50MB when possible
3. **Regular Cleanup**: Remove obsolete files
4. **Document Purpose**: Use clear commit messages

## 🆘 Troubleshooting

### AI Features Not Available
**Issue**: "AI service not available" warning appears
**Solution:**
1. Verify Ollama is installed: `ollama --version`
2. Check Ollama is running: `ollama list`
3. Ensure port 11434 is accessible
4. Restart Ollama service if needed

### File Upload Fails
**Issue**: Upload returns validation error
**Solution:**
1. Check file size (<100MB)
2. Verify file type is supported
3. Ensure file is not corrupted
4. Try a different file format

### Metrics Not Updating
**Issue**: Analytics show stale data
**Solution:**
1. Refresh the repository view
2. Check GitHub API rate limits
3. Verify network connectivity
4. Re-authenticate if needed

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Main README](../README.md)
- [Architecture Documentation](../ARCHITECTURE.md)

## 🔄 Version History

### v1.1.0 (Current)
- Enhanced analytics with trends
- AI-powered conflict prediction
- Advanced file operations
- Remediation dashboard

### v1.0.0
- Initial release
- Basic analytics
- PR management
- Simple AI analysis

---

For questions or issues, please visit:
https://github.com/muammarlone/MergePRCockPit/issues
