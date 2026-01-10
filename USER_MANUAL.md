# MergePRCockPit User Manual

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Target Audience:** End Users, Developers, Team Leads

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [User Interface Guide](#3-user-interface-guide)
4. [Feature Walkthrough](#4-feature-walkthrough)
5. [Common Tasks](#5-common-tasks)
6. [Troubleshooting](#6-troubleshooting)
7. [FAQ](#7-faq)
8. [Support & Resources](#8-support--resources)

---

## 1. Introduction

### What is MergePRCockPit?

MergePRCockPit is a **consumer-grade desktop application** designed to simplify and enhance your GitHub Pull Request (PR) management experience. It provides:

- **Intelligent PR Management**: View, analyze, and manage pull requests across multiple repositories
- **AI-Powered Insights**: Get automated PR summaries, risk assessments, and reviewer recommendations
- **Visual Analytics**: Track repository health, PR metrics, and team performance
- **Secure Authentication**: Sign in with Google or GitHub OAuth2

### Who Should Use This Manual?

- **Developers** managing pull requests
- **Team Leads** tracking PR metrics
- **DevOps Engineers** monitoring repository health
- **Contributors** collaborating on GitHub projects

### System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **OS** | Windows 10, macOS 10.14, Ubuntu 18.04 | Latest stable versions |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 500 MB | 1 GB |
| **Node.js** | v20.x | v20.x+ |
| **Internet** | Required for GitHub API | Stable connection |
| **Optional: Ollama** | Local installation | For AI features |

---

## 2. Getting Started

### 2.1 Installation

#### Option A: Download Pre-built Installer

1. **Download the installer** for your platform:
   - **Windows**: `MergePRCockpit-Setup-1.0.0.exe`
   - **macOS**: `MergePRCockpit-1.0.0.dmg`
   - **Linux**: `MergePRCockpit-1.0.0.AppImage` or `.deb`

2. **Run the installer**:
   - Windows: Double-click the `.exe` file
   - macOS: Open the `.dmg` and drag to Applications
   - Linux: Make executable and run: `chmod +x MergePRCockpit-*.AppImage && ./MergePRCockpit-*.AppImage`

3. **Launch the application** from your applications menu

#### Option B: Build from Source

```bash
# Clone the repository
git clone https://github.com/muammarlone/MergePRCockPit.git
cd MergePRCockPit

# Install dependencies
npm install

# Start in development mode
npm start

# OR build for production
npm run build:all
```

### 2.2 First-Time Setup

#### Step 1: Launch Application

When you first launch MergePRCockPit, you'll see the **Login Screen**.

#### Step 2: Sign In

Choose your preferred authentication method:

##### **Option 1: Google OAuth** (Recommended for personal use)

1. Click **"Sign in with Google"**
2. A browser window will open
3. Select your Google account
4. Grant permissions to MergePRCockPit
5. You'll be redirected back to the app

##### **Option 2: GitHub OAuth** (Recommended for GitHub-focused workflows)

1. Click **"Sign in with GitHub"**
2. A browser window will open
3. Authorize MergePRCockPit
4. Grant repository access permissions
5. You'll be redirected back to the app

##### **Option 3: Email/Password** (Development/Testing)

1. Enter any email and password
2. Click **"Sign In"**
3. **Note**: This uses mock authentication and doesn't access real data

> **💡 Tip**: If you see a "Mock" badge on the login buttons, OAuth is not configured. The app will use mock authentication which works fine for testing.

#### Step 3: Select Repository

After signing in, you'll see the **Repository Selection Screen**.

1. **Enter GitHub username or organization** (e.g., `facebook`, `microsoft`, `your-username`)
2. Click **"Load Repositories"**
3. Select a repository from the dropdown
4. Click **"Load Pull Requests"**

> **💡 Tip**: Your selection is automatically saved! Next time you open the app, it will remember your last repository.

---

## 3. User Interface Guide

### 3.1 Main Dashboard

The dashboard is divided into three main areas:

#### **A. Header Bar**
- **Repository Selector**: Change repositories
- **User Profile**: View current user
- **Settings Icon**: Access preferences
- **Sign Out**: Log out of the application

#### **B. Navigation Tabs**
- **Pull Requests**: View and manage PRs
- **Analytics**: Repository metrics and insights
- **AI Insights**: Automated analysis (requires Ollama)

#### **C. Content Area**
- Dynamic content based on selected tab

### 3.2 Pull Requests Tab

#### Features:

1. **PR List**:
   - Status indicator (Open, Merged, Closed)
   - PR number and title
   - Author avatar and name
   - Created/updated timestamps
   - Labels and tags

2. **Filters**:
   - **State**: All, Open, Closed, Merged
   - **Author**: Filter by PR creator
   - **Labels**: Filter by assigned labels

3. **Search Bar**:
   - Search by PR title or number
   - Real-time filtering

4. **Sort Options**:
   - Created (newest first)
   - Updated (most recent)
   - Comments (most active)

#### PR Detail View

Click on any PR to see detailed information:

- **PR Information**:
  - Full title and description
  - Branch information (head → base)
  - Merge status and conflicts
  
- **File Statistics**:
  - Files changed: 15
  - Additions: +450 lines
  - Deletions: -120 lines
  
- **Activity**:
  - Comments count
  - Review status
  - Commit history

- **AI Analysis** (if Ollama is enabled):
  - PR summary
  - Risk assessment (Low/Medium/High)
  - Suggested reviewers
  - Potential issues
  - Remediation suggestions

### 3.3 Analytics Tab

#### Metrics Displayed:

1. **Overview Cards**:
   - Total PRs
   - Open PRs
   - Merged PRs
   - Average Merge Time

2. **Charts**:
   - **PR Status Distribution** (Pie chart)
   - **PR Activity Over Time** (Line graph)
   - **Merge Conflict Trends** (Bar chart)
   - **Top Contributors** (Bar chart)

3. **Health Indicators**:
   - **Repository Health Score**: 0-100
   - **PR Velocity**: PRs/week
   - **Average Review Time**: Hours/days
   - **Conflict Rate**: Percentage

### 3.4 AI Insights Tab

**Requirements**: Ollama must be installed and running locally

#### Features:

1. **Automated PR Summaries**:
   - Natural language description of changes
   - Key highlights and impacts

2. **Risk Assessment**:
   - **Low**: Routine changes, well-tested
   - **Medium**: Moderate complexity, needs review
   - **High**: Critical changes, extensive testing required

3. **Reviewer Recommendations**:
   - Suggested reviewers based on file expertise
   - Availability and workload consideration

4. **Potential Issues**:
   - Code quality concerns
   - Performance implications
   - Security considerations

5. **Export Context**:
   - Copy PR context for external GPT tools
   - Share insights with team

---

## 4. Feature Walkthrough

### 4.1 Managing Pull Requests

#### Viewing Pull Requests

1. Navigate to **Pull Requests** tab
2. Browse the list of PRs
3. Click on a PR to view details

#### Filtering PRs

1. Use the **State filter** dropdown:
   - Select "Open" to see active PRs
   - Select "Merged" to see completed PRs
   - Select "Closed" to see rejected PRs

2. Use the **Search bar**:
   - Type PR number: `#123`
   - Type keywords: `bugfix authentication`

#### Understanding PR Status

| Status | Icon | Meaning |
|--------|------|---------||
| **Open** | 🟢 | PR is active and awaiting review |
| **Merged** | 🟣 | PR has been merged into base branch |
| **Closed** | 🔴 | PR was closed without merging |
| **Conflict** | ⚠️ | PR has merge conflicts |

### 4.2 Analyzing Repository Health

#### Viewing Analytics

1. Click **Analytics** tab
2. Review the dashboard metrics
3. Scroll to see detailed charts

#### Understanding Health Score

The **Repository Health Score** (0-100) is calculated based on:

- **PR Velocity** (30%): How quickly PRs are created and merged
- **Review Time** (25%): Average time from creation to first review
- **Merge Success Rate** (25%): Percentage of PRs merged vs closed
- **Conflict Rate** (20%): Percentage of PRs with merge conflicts

**Score Interpretation**:
- **90-100**: Excellent health, optimal workflow
- **70-89**: Good health, minor improvements needed
- **50-69**: Fair health, attention required
- **Below 50**: Poor health, significant issues

### 4.3 Using AI-Powered Insights

#### Prerequisites

1. **Install Ollama**:
   ```bash
   # Visit https://ollama.ai and download
   # Then pull the model:
   ollama pull llama2
   ```

2. **Start Ollama**:
   ```bash
   ollama serve
   ```
   Ensure it's running on `http://localhost:11434`

#### Getting AI Analysis

1. Open any **PR detail view**
2. The AI analysis will **automatically run**
3. View results in the "AI Insights" section

#### Interpreting AI Results

**Example AI Analysis**:

```
Summary:
This PR refactors the authentication module to improve security
and add support for 2FA. Changes include updating dependencies,
adding new middleware, and enhancing error handling.

Risk Assessment: MEDIUM
- Reason: Affects critical authentication flow
- Recommendation: Thorough testing and security review required

Suggested Reviewers:
- @security-team (security changes)
- @backend-lead (architecture changes)

Potential Issues:
⚠️ Breaking changes to auth API
⚠️ Dependency updates may affect compatibility
⚠️ New middleware needs performance testing

Suggestions:
✅ Add integration tests for 2FA flow
✅ Update API documentation
✅ Create migration guide for existing users
```

#### Exporting Context

1. Click **"Export Context"** button
2. Context is copied to clipboard
3. Paste into ChatGPT or other AI tools for deeper analysis

---

## 5. Common Tasks

### 5.1 Switching Repositories

**Method 1: Using Header Selector**

1. Click **repository name** in header
2. Select from recent repositories dropdown
3. Or click "Load New Repository"

**Method 2: Using Recent Repositories**

1. Sign out
2. On login, you'll see "Recent Repositories"
3. Click any repository to load it instantly

### 5.2 Refreshing PR List

1. Navigate to **Pull Requests** tab
2. Click **Refresh** icon (🔄) in header
3. Wait for updated data

**Auto-Refresh**: PRs automatically refresh every 5 minutes

### 5.3 Viewing PR Diff

**Current Limitation**: In-app diff viewing is coming in Phase 2

**Workaround**:
1. Click **"View on GitHub"** button in PR detail
2. This opens the PR in your browser
3. View full diff and make comments on GitHub

### 5.4 Configuring OAuth

If you want to use **real OAuth** instead of mock authentication:

1. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Get Google OAuth credentials**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `http://localhost:3000/auth/google/callback`
   - Copy Client ID and Secret

3. **Get GitHub OAuth credentials**:
   - Visit [GitHub Developer Settings](https://github.com/settings/developers)
   - Create OAuth App
   - Add callback URL: `http://localhost:3000/auth/github/callback`
   - Copy Client ID and Secret

4. **Update `.env`**:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

5. **Restart application**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed OAuth setup instructions.

---

## 6. Troubleshooting

### 6.1 Authentication Issues

#### Problem: Can't sign in

**Solutions**:

1. **Check if OAuth is configured**:
   - Look for "Mock" badge on login buttons
   - If present, OAuth is not configured (this is normal for development)
   - You can still use mock authentication to test

2. **Clear browser cache**:
   - Sign out
   - Clear application data: Settings > Clear Data
   - Restart app

3. **Verify credentials in `.env`** (if using real OAuth):
   - Ensure Client ID and Secret are correct
   - Check redirect URIs match

#### Problem: "Mock" badge on login buttons

**This is expected behavior** when OAuth is not configured.

- **For testing**: Mock authentication works fine
- **For production**: Configure OAuth credentials (see Section 5.4)

### 6.2 Repository Loading Issues

#### Problem: Can't load repositories

**Solutions**:

1. **Verify GitHub username**:
   - Ensure username/org name is spelled correctly
   - Try a well-known org like `facebook` or `microsoft`

2. **Check internet connection**:
   - Ensure you're connected to the internet
   - Test by visiting https://github.com

3. **GitHub rate limiting**:
   - **Without auth**: 60 requests/hour
   - **With GitHub OAuth**: 5000 requests/hour
   - Wait an hour or configure GitHub OAuth

#### Problem: Recent repositories not showing

**Solutions**:

- Recent repositories are stored in browser local storage
- If you cleared browser data, they will be empty
- Select a repository once, and it will appear in recents

### 6.3 AI Features Not Working

#### Problem: AI analysis not showing

**Solutions**:

1. **Verify Ollama is installed**:
   ```bash
   ollama --version
   ```

2. **Ensure Ollama is running**:
   ```bash
   ollama serve
   ```

3. **Check model is available**:
   ```bash
   ollama list
   # Should show llama2
   ```

4. **Verify port**:
   - Ollama should run on `http://localhost:11434`
   - Check Settings > AI Configuration

#### Problem: AI analysis is slow

**Solutions**:

- AI analysis depends on your hardware
- First run may take 30-60 seconds to load model
- Subsequent analyses are faster (5-10 seconds)
- Consider upgrading to a larger model for better insights

### 6.4 Performance Issues

#### Problem: Application is slow

**Solutions**:

1. **Close unused tabs**:
   - Focus on one tab at a time
   - Analytics charts can be resource-intensive

2. **Reduce PR list size**:
   - Use filters to show fewer PRs
   - Avoid repositories with 1000+ PRs

3. **Clear cache**:
   - Settings > Clear Cache
   - Restart application

4. **Check system resources**:
   - Ensure sufficient RAM available
   - Close other applications

---

## 7. FAQ

### General Questions

**Q: Is my data secure?**

A: Yes! MergePRCockPit uses:
- OAuth2 for authentication (industry standard)
- Encrypted token storage (Electron Store)
- No data sent to external servers (except GitHub API)
- Local AI processing (Ollama runs on your machine)

**Q: Does this work with private repositories?**

A: Yes, if you use **GitHub OAuth** authentication. The app will request appropriate permissions.

**Q: Can I use this with GitLab or Bitbucket?**

A: Currently, only GitHub is supported. GitLab and Bitbucket support is planned for Phase 2 (Q1 2026).

**Q: Is this free?**

A: Yes! MergePRCockPit is open-source and free under MIT License.

### Features

**Q: Can I merge PRs from the app?**

A: Not yet. Merge functionality is coming in Phase 2. Currently, use "View on GitHub" to merge.

**Q: Can I comment on PRs?**

A: Not in the current MVP. PR commenting is planned for Phase 3.

**Q: Does this replace GitHub's web interface?**

A: No, it complements it. MergePRCockPit focuses on:
- Multi-repository visibility
- Advanced analytics
- AI-powered insights

For detailed code reviews and discussions, use GitHub's web interface.

### Technical

**Q: Why does it require Node.js v20+?**

A: The app uses modern JavaScript features and Electron 28, which require Node.js 20.x.

**Q: Can I run this on a server?**

A: Currently, it's a desktop application. A cloud-native version is planned for 2027.

**Q: How much disk space does it use?**

A: Approximately 500 MB after installation. Caches may add 50-100 MB over time.

---

## 8. Support & Resources

### Documentation

- **README**: [README.md](README.md) - Project overview
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md) - Installation and configuration
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- **Roadmap**: [ROADMAP.md](ROADMAP.md) - Future features

### Getting Help

#### Community Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/muammarlone/MergePRCockPit/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/muammarlone/MergePRCockPit/discussions)

#### Professional Support

- **Email**: hello@mergeprcockpit.io
- **Enterprise Support**: support@mergeprcockpit.io

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + R` | Refresh PR list |
| `Ctrl/Cmd + F` | Focus search bar |
| `Ctrl/Cmd + 1` | Switch to PR tab |
| `Ctrl/Cmd + 2` | Switch to Analytics tab |
| `Ctrl/Cmd + 3` | Switch to AI Insights tab |
| `Ctrl/Cmd + Q` | Quit application |
| `Esc` | Close detail view |

### Update Notifications

MergePRCockPit will notify you when updates are available. To check manually:

1. Click **Settings** icon (⚙️)
2. Click **Check for Updates**
3. Follow prompts to download and install

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **PR** | Pull Request - A proposed change to a repository |
| **OAuth** | Open Authorization - Secure authentication standard |
| **Ollama** | Local AI inference engine |
| **Merge Conflict** | When two changes can't be automatically combined |
| **Base Branch** | The branch you want to merge changes into (usually `main`) |
| **Head Branch** | The branch containing your changes |
| **Repository** | A GitHub project containing code and history |
| **Organization** | A GitHub account representing a team or company |

---

## Appendix B: Version History

| Version | Date | Changes |
|---------|------|---------||
| 1.0.0 | 2026-01-10 | Initial release with MVP features |

---

**Need more help?** Visit our [documentation](https://github.com/muammarlone/MergePRCockPit/tree/main/docs) or [open an issue](https://github.com/muammarlone/MergePRCockPit/issues).

**Happy PR managing! 🚀**