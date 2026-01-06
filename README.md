<<<<<<< HEAD
# MergePRCockPit

> **From MVP to Enterprise GitOps Platform** - A modular, AI-powered, on-premises platform for Git operations, PR reviews, issue management, and DevOps intelligence.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-green.svg)](docs/)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

## 🚀 Vision

MergePRCockPit is evolving from a simple PR review tool into a comprehensive, modular, on-premises GitOps platform that combines:

- **Advanced Git Operations**: Safe merges, previews, rollbacks, and repository reorganization
- **Intelligent PR Reviews**: AI-powered code analysis and reviewer suggestions
- **Issue Management**: Enterprise-grade tracking with analytics and SLA management
- **AI Assistants**: Intelligent automation across all workflows
- **Trust Fabric**: Compliance, audit trails, and supply chain security
- **Extensibility**: Plugin framework for custom integrations

## ✨ Key Features

### 🔧 Git Operations Engine
- Multi-provider support (GitHub, GitLab, Bitbucket, Gitea)
- Safe merge with preview and conflict detection
- Atomic rollback capabilities
- Repository reorganization with history preservation
- Cross-provider migration

### 📊 PR Review & Analytics
- Intelligent review dashboard
- AI-suggested reviewers
- Code quality gates
- Review time prediction
- Team performance analytics

### 🎯 Advanced Issue Management
- Custom issue types and workflows
- AI-powered auto-classification
- SLA tracking and enforcement
- Cross-repository issue linking
- Integration with Jira, Linear, etc.

### 🤖 AI Assistant Modules
- **PR Review Assistant**: Automated code review comments
- **Merge Intelligence**: Conflict prediction and risk scoring
- **Issue Classifier**: Auto-tagging and priority prediction
- **Analytics Assistant**: Natural language queries for insights
- **Decision Support**: Intelligent recommendations for workflows

### 🔒 Trust Fabric
- Provenance tracking for all changes
- Compliance policy enforcement
- Immutable audit logs
- Supply chain security (SBOM, vulnerability scanning)
- Digital signatures

### 🔌 Plugin Framework
- Extensible plugin architecture
- Custom authentication providers
- Notification channels
- Analytics widgets
- AI model providers

## 📋 Project Status

**Current Phase**: Architecture & Design  
**Version**: 0.1.0-alpha (Planning)

See [ROADMAP.md](ROADMAP.md) for detailed release timeline and epic stories.

### Roadmap Highlights

- **2026 Q1**: Foundation - Core platform, Git operations, basic PR review
- **2026 Q2**: Enhancement - Issue management, analytics, basic AI
- **2026 Q3**: Intelligence - Advanced AI assistants, predictive analytics
- **2026 Q4**: Enterprise - Trust fabric, compliance, plugin marketplace (v1.0)
- **2027+**: Scale & Innovation - Multi-tenancy, advanced features

## 🏗️ Architecture

MergePRCockPit follows **TOGAF** principles for enterprise architecture and **Lean Startup** methodology for iterative delivery.

### Architecture Overview

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

- **Backend**: Go, Python, Node.js
- **Frontend**: React/Next.js with TypeScript
- **Databases**: PostgreSQL, TimescaleDB
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: NATS
- **AI/ML**: PyTorch, TensorFlow, MLflow
- **Infrastructure**: Kubernetes, Docker, Terraform

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 📚 Documentation

- **[Architecture](ARCHITECTURE.md)**: Comprehensive TOGAF-based architecture
- **[Roadmap](ROADMAP.md)**: Product roadmap with epic stories and milestones
- **[Contributing](CONTRIBUTING.md)**: Development guidelines and workflows
- **[Modules](docs/modules/)**: Detailed module specifications
  - [Git Operations Engine](docs/modules/git-operations.md)
  - [Plugin Framework](docs/modules/plugin-framework.md)
  - [AI Assistant Modules](docs/modules/ai-assistants.md)

## 🚦 Quick Start

> **Note**: The platform is currently in the design phase. Implementation will begin in Q1 2026.

### Prerequisites

- Docker & Docker Compose
- Kubernetes (minikube/kind for local development)
- Go 1.21+, Node.js 18+, Python 3.10+

### Development Setup (Future)

```bash
# Clone repository
git clone https://github.com/muammarlone/MergePRCockPit.git
cd MergePRCockPit

# Start development environment
docker-compose up

# Access the platform
open http://localhost:8080
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- **Code**: Implement features, fix bugs
- **Documentation**: Improve docs, write tutorials
- **Testing**: Write tests, report bugs
- **Design**: UI/UX improvements, architecture feedback
- **Plugins**: Develop plugins for the ecosystem

## 📊 Project Principles

### TOGAF Architecture

- **Modular Design**: Each component is independently deployable
- **API-First**: All services expose standard REST/GraphQL APIs
- **Event-Driven**: Loose coupling through message bus
- **Cloud-Native**: Kubernetes-based infrastructure

### Lean Startup Methodology

- **Build-Measure-Learn**: Rapid iteration with metrics
- **MVP Approach**: Ship minimal viable increments
- **Validated Learning**: Feature releases based on user feedback
- **Customer Development**: Early adopter program for validation

## 🔐 Security

- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: Multi-factor auth, SSO support
- **Authorization**: RBAC and ABAC
- **Audit**: Immutable audit trails
- **Compliance**: GDPR, SOC 2 ready

Report security vulnerabilities to: security@mergeprcockpit.io

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

Built with modern DevOps and AI/ML best practices, inspired by:
- TOGAF (The Open Group Architecture Framework)
- Lean Startup methodology
- Twelve-Factor App principles
- Kubernetes design patterns

## 📞 Contact & Support

- **Website**: https://mergeprcockpit.io (future)
- **Documentation**: https://docs.mergeprcockpit.io (future)
- **Community**: https://community.mergeprcockpit.io (future)
- **Email**: hello@mergeprcockpit.io

---

**Made with ❤️ by the MergePRCockPit team**
=======
# MergePR Cockpit

A consumer-grade on-premises GitOps cockpit for managing pull requests across multiple repositories.

## Features

### 🔐 Authentication
- Google OAuth2 sign-in
- GitHub OAuth2 sign-in  
- Email-based authentication
- Secure token storage and session management

### 📊 Repository Management
- Multi-repository support
- Repository owner/name selection
- Real-time PR list view with filtering
- Detailed PR drill-down views

### 📈 Analytics Dashboard
- Repository activity metrics
- PR statistics and health indicators
- Merge conflict trends
- Visual charts and graphs (using Recharts)

### 🤖 AI-Powered Insights (Ollama Integration)
- PR summaries
- Risk assessment
- Reviewer recommendations
- Potential issue detection
- Remediation suggestions
- Export context to external GPTs

### 🛠️ Core GitOps Operations
- View open/closed/merged PRs
- Merge operations with preview
- File statistics and change tracking
- GitHub API integration via Octokit

## Installation

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- (Optional) Ollama installed locally for AI features

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/muammarlone/MergePRCockPit.git
   cd MergePRCockPit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application in development mode**
   ```bash
   npm start
   ```

   This will:
   - Start the React development server on http://localhost:3000
   - Launch the Electron application
   - Enable hot reload for rapid development

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Create installer packages**
   
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

## Usage

### First Time Setup

1. **Configure OAuth (Required for Production)**
   
   For real OAuth authentication, configure your credentials:
   
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Edit `.env` and add your OAuth credentials:
   - **Google OAuth**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **GitHub OAuth**: Get credentials from [GitHub Developer Settings](https://github.com/settings/developers)
   
   See [DEPLOYMENT.md](DEPLOYMENT.md#oauth-setup-required-for-authentication) for detailed setup instructions.
   
   **Note**: For development/testing, OAuth will fall back to mock authentication if not configured.

2. **Launch the application**
   - Run the installed application or use `npm start` for development

3. **Sign In**
   - Choose your preferred authentication method:
     - Google OAuth (configured via .env)
     - GitHub OAuth (configured via .env)
     - Email/Password (mock for development)
   
4. **Select Repository**
   - Enter a GitHub username or organization name
   - Click "Load Repositories"
   - Select a repository from the dropdown

5. **Manage Pull Requests**
   - View the list of pull requests
   - Click on any PR to see details
   - Use the Analytics tab to see repository metrics

### AI Features (Ollama)

To enable AI-powered analysis:

1. **Install Ollama**
   - Download from https://ollama.ai
   - Install the `llama2` model: `ollama pull llama2`
   - Ensure Ollama is running on http://localhost:11434

2. **Use AI Analysis**
   - Open any PR detail view
   - AI analysis will automatically run
   - View risk assessment, suggestions, and insights
   - Export context to external GPT tools

## Architecture

The application follows TOGAF principles with a modular, layered architecture:

```
MergePR Cockpit
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
    ├── Preload Scripts
    └── IPC Communication
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design documentation.

## Development

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
└── package.json
```

### Available Scripts

- `npm start` - Start development mode
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code

### Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Platform-specific installation steps
- Configuration options
- Troubleshooting guide
- Screenshots and UAT evidence

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Electron 28 (Node.js)
- **UI Components**: Custom components with CSS
- **Charts**: Recharts
- **GitHub Integration**: Octokit REST API
- **AI Integration**: Ollama API
- **Build Tool**: Webpack 5
- **Testing**: Jest + React Testing Library
- **Packaging**: Electron Builder

## Security

- OAuth2 authentication flows
- Secure token storage using Electron Store
- Context isolation in Electron
- Input validation and sanitization
- No sensitive data in source code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/muammarlone/MergePRCockPit/issues
- Documentation: See docs/ folder

## Roadmap

See [Issue #1](https://github.com/muammarlone/MergePRCockPit/issues/1) for the complete product roadmap including:
- Advanced file operations (zip, docx, pptx)
- Extended AI capabilities
- Trust fabric integration
- Plugin framework
- Observability features
>>>>>>> main
