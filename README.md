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

### 📈 Enhanced Analytics Dashboard
- Repository activity metrics with trend analysis
- PR statistics and health indicators
- **NEW:** PR velocity tracking (PRs per week)
- **NEW:** Top contributors analytics with merge patterns
- **NEW:** Merge conflict trend visualization over time
- **NEW:** File hotspot analysis (most changed files)
- Visual charts and graphs (using Recharts)
- Predictive insights and actionable recommendations

### 🤖 AI-Powered Insights (Ollama Integration)
- PR summaries and risk assessment
- Reviewer recommendations
- Potential issue detection
- **NEW:** Conflict probability prediction
- **NEW:** Merge conflict remediation suggestions
- **NEW:** Auto-fix recommendations for common conflicts
- **NEW:** Intelligent conflict area detection
- Export context to external GPTs

### 🔧 Merge Remediation Dashboard
- **NEW:** Predictive conflict detection with probability scores
- **NEW:** Risk level assessment (low/medium/high)
- **NEW:** Automated remediation suggestions
- **NEW:** Three-tier fix workflow: Suggest, Fix, Auto-Resolve
- **NEW:** Confidence scoring for remediation actions
- **NEW:** Historical conflict pattern analysis
- **NEW:** Common conflict file identification

### 📁 Advanced File Operations
- **NEW:** Upload/download support for zip archives
- **NEW:** Office document handling (docx, pptx, xlsx)
- **NEW:** File versioning and history tracking
- **NEW:** Checksum validation for integrity
- **NEW:** Magic number verification for security
- **NEW:** 100MB file size limit enforcement
- **NEW:** Seamless GitHub integration with commit messages
- **NEW:** File type validation and sanitization

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
   - **NEW:** Use the Remediation tab to see conflict predictions and fixes
   - **NEW:** Use the Files tab to upload/download office documents and archives

### AI Features (Ollama)

To enable AI-powered analysis and conflict prediction:

1. **Install Ollama**
   - Download from https://ollama.ai
   - Install the `llama2` model: `ollama pull llama2`
   - Ensure Ollama is running on http://localhost:11434

2. **Use AI Analysis**
   - Open any PR detail view for AI-powered insights
   - View risk assessment, suggestions, and insights
   - **NEW:** Navigate to Remediation tab for conflict predictions
   - **NEW:** Get automated fix suggestions for merge conflicts
   - **NEW:** Review auto-fixable conflicts with confidence scores
   - Export context to external GPT tools

### File Operations

Upload and manage files directly from the cockpit:

1. **Navigate to Files Tab**
   - Select a repository from the dashboard
   - Click on the "📁 Files" tab

2. **Upload Files**
   - Select a file (zip, docx, pptx, xlsx)
   - Specify the file path in the repository
   - Choose the target branch
   - Add a commit message
   - Click "Upload File"

3. **Security Features**
   - File type validation using magic numbers
   - Checksum verification for integrity
   - 100MB maximum file size
   - Version tracking for all uploads

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

See [Issue #1](https://github.com/muammarlone/MergePRCockPit/issues/1) for the complete product roadmap.

### Recently Implemented (v1.1.0)
- ✅ Enhanced analytics with trend analysis
- ✅ PR velocity and contributor metrics
- ✅ Conflict trend visualization
- ✅ AI-powered conflict prediction
- ✅ Merge remediation dashboard
- ✅ Advanced file operations (zip, docx, pptx, xlsx)
- ✅ File versioning and integrity checks
- ✅ Auto-fix suggestions for conflicts

### Upcoming Features
- Extended AI capabilities with multiple models
- Trust fabric integration for compliance
- Plugin framework for extensibility
- Observability features and metrics
- Real-time collaboration features
- Enhanced security scanning
