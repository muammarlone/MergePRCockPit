# MergePRCockPit

> **A Consumer-Grade GitOps Platform Evolving Toward Enterprise** - An on-premises, AI-powered platform for Git operations, starting with intelligent PR management and expanding toward comprehensive DevOps intelligence.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-green.svg)](docs/)
[![Status](https://img.shields.io/badge/status-MVP%20functional-green.svg)]()

## 🎯 Overview

MergePRCockPit is a desktop application that brings intelligent Git operations to individual developers and small teams. Built on **TOGAF architecture principles** and **Lean Startup methodology**, it delivers immediate value through a functional MVP while maintaining a clear path toward enterprise capabilities.

**Current State**: Functional MVP with PR management, analytics, and AI-powered insights  
**Vision**: Comprehensive, modular, on-premises GitOps platform for enterprise teams

## ✨ Current Features (MVP - Available Now)

### 🔐 Authentication & Security
- Google OAuth2 sign-in
- GitHub OAuth2 sign-in  
- Email-based authentication (development)
- Secure token storage using Electron Store

### 📊 Repository & PR Management
- Multi-repository support across GitHub organizations
- Real-time PR list with intelligent filtering
- Detailed PR drill-down with file statistics
- Repository owner/name selection
- GitHub API integration via Octokit

### 📈 Analytics Dashboard
- Repository activity metrics
- PR statistics and health indicators
- Merge conflict trend analysis
- Visual charts and graphs (Recharts)
- Team performance insights

### 🤖 AI-Powered Insights (Ollama Integration)
- Automated PR summaries
- Risk assessment and scoring
- Intelligent reviewer recommendations
- Potential issue detection
- Remediation suggestions
- Export context to external GPTs

### 🛠️ Core GitOps Operations
- View open/closed/merged PRs
- Merge operations with preview
- Change tracking and statistics
- Cross-repository visibility

## 🚀 Future Vision: Enterprise Platform

Building on the MVP foundation, MergePRCockPit will evolve into a comprehensive enterprise GitOps platform:

### Planned Capabilities

**🔧 Advanced Git Operations Engine**
- Multi-provider support (GitHub, GitLab, Bitbucket, Gitea)
- Safe merge with conflict detection and preview
- Atomic rollback capabilities
- Repository reorganization with history preservation
- Cross-provider migration support

**🎯 Enterprise Issue Management**
- Custom issue types and workflows
- AI-powered auto-classification
- SLA tracking and enforcement
- Cross-repository issue linking
- Integration with Jira, Linear, Azure DevOps

**🤖 Advanced AI Assistant Modules**
- PR Review Assistant with automated comments
- Merge Intelligence with conflict prediction
- Issue Classifier with auto-tagging
- Analytics Assistant with natural language queries
- Decision Support with workflow recommendations

**🔒 Trust Fabric & Compliance**
- Provenance tracking for all changes
- Compliance policy enforcement (SOC 2, GDPR)
- Immutable audit logs
- Supply chain security (SBOM, vulnerability scanning)
- Digital signatures and verification

**🔌 Plugin Framework**
- Extensible plugin architecture
- Custom authentication providers
- Notification channels
- Analytics widgets
- AI model providers

## 📋 Roadmap

### Phase 1: MVP Foundation (✅ Complete - Current)
- Electron-based desktop application
- GitHub OAuth and authentication
- PR list and detail views
- Basic analytics dashboard
- Ollama AI integration for insights

### Phase 2: Enhanced Git Operations (Q1 2026)
- Multi-provider Git support
- Advanced merge capabilities with preview
- Rollback and conflict resolution
- Repository reorganization tools

### Phase 3: Intelligence Layer (Q2 2026)
- Enhanced AI assistants
- Predictive analytics
- Code quality gates
- Review time prediction
- Advanced risk scoring

### Phase 4: Issue Management (Q3 2026)
- Custom issue types and workflows
- SLA tracking and enforcement
- Cross-repository linking
- External system integrations

### Phase 5: Enterprise Features (Q4 2026)
- Trust fabric and compliance
- Advanced audit logging
- Supply chain security
- Plugin marketplace
- **Target: v1.0 Enterprise Release**

### Phase 6: Scale & Innovation (2027+)
- Multi-tenancy support
- Cloud-native deployment options
- Advanced observability
- AI model marketplace

See [ROADMAP.md](ROADMAP.md) for detailed epic stories and milestones.

## 🏗️ Architecture

MergePRCockPit follows **TOGAF** principles for sustainable enterprise architecture:

### Current Architecture (MVP)

```
MergePR Cockpit (Electron Desktop)
├── Presentation Layer (React UI)
│   ├── Components (Login, Dashboard, PR List, Analytics)
│   └── Styles (CSS modules)
├── Business Logic Layer
│   ├── Services (Auth, GitHub, Ollama)
│   └── State Management
├── Data Access Layer
│   ├── GitHub API (Octokit)
│   ├── Ollama API
│   └── Local Storage
└── Platform Layer (Electron)
    ├── Main Process
    ├── Preload Scripts (Security)
    └── IPC Communication
```

### Target Architecture (Enterprise Platform)

```
┌─────────────────────────────────────────────────────────────┐
│                   MergePRCockPit Platform                    │
├─────────────────────────────────────────────────────────────┤
│  Git Operations  │  Issue Mgmt  │  PR Analytics  │  AI Core │
├─────────────────────────────────────────────────────────────┤
│         Trust Fabric & Compliance Infrastructure             │
├─────────────────────────────────────────────────────────────┤
│              Plugin Framework & Extension API                │
├─────────────────────────────────────────────────────────────┤
│         Observability, Monitoring & Audit Logging            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Current (MVP)**
- Frontend: React 18 with TypeScript
- Backend: Electron 28 (Node.js runtime)
- UI Components: Custom components with CSS
- Charts: Recharts
- APIs: Octokit (GitHub), Ollama
- Build: Webpack 5
- Testing: Jest + React Testing Library
- Packaging: Electron Builder

**Planned (Enterprise)**
- Backend Services: Go, Python, Node.js microservices
- Frontend: React/Next.js with TypeScript
- Databases: PostgreSQL, TimescaleDB
- Cache: Redis
- Search: Elasticsearch
- Message Queue: NATS
- AI/ML: PyTorch, TensorFlow, MLflow
- Infrastructure: Kubernetes, Docker, Terraform

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 🚦 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- (Optional) Ollama installed locally for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/muammarlone/MergePRCockPit.git
   cd MergePRCockPit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OAuth (Optional but Recommended for Production)**
   
   **For Development/Testing**: You can skip this step. The app will use mock authentication automatically.
   
   **For Production Use**: Follow these steps to enable real OAuth:
   
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Edit `.env` and add your OAuth credentials:
   - **Google OAuth**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **GitHub OAuth**: Get credentials from [GitHub Developer Settings](https://github.com/settings/developers)
   
   **Detailed OAuth Setup Instructions**: See [DEPLOYMENT.md](DEPLOYMENT.md#oauth-setup-required-for-authentication) for step-by-step guides with screenshots.
   
   **Benefits of Real OAuth**:
   - Secure authentication without storing passwords
   - Access to private repositories (when GitHub token is used)
   - Higher API rate limits for GitHub requests
   - Professional-grade security for production deployments

4. **Start the application in development mode**
   ```bash
   npm start
   ```

   This will:
   - Start the React development server on http://localhost:3000
   - Launch the Electron application
   - Enable hot reload for rapid development

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Create installer packages**
   
   For all platforms:
   ```bash
   npm run build:all
   ```
   
   For specific platforms:
   ```bash
   npm run build:win   # Windows installer
   npm run build:mac   # macOS DMG
   npm run build:linux # Linux AppImage and deb
   ```

   Installers will be created in the `release/` directory.

### First-Time Setup

1. **Launch the application**
   - Run the installed application or use `npm start` for development

2. **Sign In**
   - Choose your preferred authentication method:
     - **Google OAuth** (requires .env configuration - see step 3 above)
     - **GitHub OAuth** (requires .env configuration - see step 3 above)
     - **Email/Password** (mock authentication for development/testing)
   
   **Note**: If OAuth is not configured, the application will use mock authentication automatically. You'll see a "Mock" badge on the login buttons to indicate this.

3. **Select Repository**
   - On first use, enter a GitHub username or organization name
   - Click "Load Repositories"
   - Select a repository from the dropdown
   - **Your selection is automatically saved!** Next time you open the app, it will remember your last repository.

4. **Quick Access to Recent Repositories**
   - After using the app, you'll see a "Recent Repositories" list when you next sign in
   - Click any recent repository to quickly switch to it
   - Up to 10 recent repositories are saved for easy access

5. **Manage Pull Requests**
   - View the list of pull requests
   - Click on any PR to see details
   - Use the Analytics tab to see repository metrics

### Enable AI Features (Optional)

1. **Install Ollama**
   - Download from https://ollama.ai
   - Install the `llama2` model: `ollama pull llama2`
   - Ensure Ollama is running on http://localhost:11434

2. **Use AI Analysis**
   - Open any PR detail view
   - AI analysis will automatically run
   - View risk assessment, suggestions, and insights
   - Export context to external GPT tools

## 📚 Documentation

- **[Architecture](ARCHITECTURE.md)**: Comprehensive TOGAF-based architecture
- **[Roadmap](ROADMAP.md)**: Detailed product roadmap with epic stories
- **[Deployment](DEPLOYMENT.md)**: Platform-specific installation and configuration
- **[Contributing](CONTRIBUTING.md)**: Development guidelines and workflows
- **[Modules](docs/modules/)**: Detailed module specifications (planned)

## 🧪 Development

### Project Structure

```
MergePRCockPit/
├── src/
│   ├── electron/           # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   └── preload.ts     # Preload script
│   └── renderer/          # React application
│       ├── components/    # UI components
│       ├── services/      # Business logic
│       ├── types/         # TypeScript types
│       ├── styles/        # CSS files
│       └── App.tsx        # Root component
├── assets/                # Application assets
├── dist/                  # Compiled output
├── release/              # Built installers
├── docs/                 # Documentation
└── package.json
```

### Available Scripts

- `npm start` - Start development mode with hot reload
- `npm run build` - Build for production
- `npm run build:all` - Create installers for all platforms
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code with ESLint

### Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

Watch mode for development:
```bash
npm run test:watch
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### OAuth / Authentication Issues

**Problem**: "Mock" badge appears on login buttons  
**Solution**: This is normal if OAuth is not configured. For development/testing, mock authentication works fine. To enable real OAuth:
1. Copy `.env.example` to `.env`
2. Add your Google/GitHub OAuth credentials
3. See [DEPLOYMENT.md](DEPLOYMENT.md#oauth-setup-required-for-authentication) for detailed setup

**Problem**: Can't sign in / Authentication fails  
**Solution**:
- Check browser console for error messages
- If using real OAuth, verify your `.env` file has correct credentials
- Try using mock authentication (works without configuration)
- Clear browser local storage and try again

#### Repository / GitHub Issues

**Problem**: Can't load repositories  
**Solution**:
- Verify the GitHub username/organization name is correct
- Check your internet connection
- GitHub may rate-limit requests (60/hour without auth, 5000/hour with auth token)
- Wait an hour or configure GitHub OAuth for higher limits

**Problem**: "Recent Repositories" not showing  
**Solution**:
- Recent repositories are saved in browser local storage
- Select a repository first, then it will appear in recent list next time
- If you cleared browser data, recent repositories will be empty

#### Build / Installation Issues

**Problem**: Build fails with module not found errors  
**Solution**:
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Electron app won't start  
**Solution**:
- Make sure you ran `npm install` first
- Check Node.js version is 20.x or higher: `node --version`
- Try rebuilding: `npm run build`
- Check console for error messages

#### Data / Storage Issues

**Problem**: Lost my selected repository after restart  
**Solution**:
- This shouldn't happen - the app saves your last repository automatically
- Check if browser local storage is being cleared
- Try selecting a repository again - it will be saved

**Problem**: Want to clear saved data / start fresh  
**Solution**:
- Sign out of the application (this clears workspace)
- Or manually clear browser local storage
- Or delete: `localStorage.getItem('mergePR_workspace')`

### Getting Help

If you encounter issues not listed here:
1. Check the [Issues page](https://github.com/muammarlone/MergePRCockPit/issues) for similar problems
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions
3. Open a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Error messages or screenshots
   - Your OS and Node.js version

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- **Code**: Implement features, fix bugs
- **Documentation**: Improve docs, write tutorials
- **Testing**: Write tests, report bugs
- **Design**: UI/UX improvements, architecture feedback
- **Features**: Propose and discuss new capabilities

## 📊 Design Principles

### TOGAF Architecture
- **Modular Design**: Components are independently deployable
- **API-First**: Services expose standard REST/GraphQL APIs
- **Event-Driven**: Loose coupling through message bus
- **Cloud-Native Ready**: Kubernetes-based infrastructure (future)

### Lean Startup Methodology
- **Build-Measure-Learn**: Rapid iteration with metrics
- **MVP Approach**: Ship minimal viable increments
- **Validated Learning**: Feature releases based on user feedback
- **Customer Development**: Early adopter program for validation

### Enterprise Architecture
- **Scalability**: Design for growth from individual to enterprise
- **Security**: Defense in depth, zero trust principles
- **Compliance**: Built-in audit trails and policy enforcement
- **Interoperability**: Open APIs and standard protocols

## 🔐 Security

**Current (MVP)**
- OAuth2 authentication flows
- Secure token storage using Electron Store
- Context isolation in Electron
- Input validation and sanitization
- No sensitive data in source code

**Planned (Enterprise)**
- AES-256 encryption at rest
- TLS 1.3 in transit
- Multi-factor authentication
- SSO support (SAML, OIDC)
- RBAC and ABAC authorization
- Immutable audit trails
- GDPR, SOC 2 compliance ready

Report security vulnerabilities to: security@mergeprcockpit.io

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

Built with modern DevOps and AI/ML best practices, inspired by:
- TOGAF (The Open Group Architecture Framework)
- Lean Startup methodology
- Twelve-Factor App principles
- Kubernetes design patterns
- GitOps operational model

## 📞 Contact & Support

**Current Support**
- GitHub Issues: https://github.com/muammarlone/MergePRCockPit/issues
- Documentation: See docs/ folder

**Future Resources**
- Website: https://mergeprcockpit.io (planned)
- Documentation: https://docs.mergeprcockpit.io (planned)
- Community: https://community.mergeprcockpit.io (planned)
- Email: hello@mergeprcockpit.io

---

**Built with ❤️ for the DevOps community** | From MVP to Enterprise, one commit at a time