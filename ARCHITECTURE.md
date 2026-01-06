# MergePR Cockpit - Architecture Documentation

## Overview

MergePR Cockpit is built following TOGAF (The Open Group Architecture Framework) principles with a focus on modularity, extensibility, and separation of concerns. This document describes the architectural design and key decisions.

## Architecture Principles

1. **Modularity**: Each component has a single, well-defined responsibility
2. **Extensibility**: New features can be added without modifying core components
3. **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
4. **Security First**: Authentication and authorization are enforced at all layers
5. **Platform Independence**: Core business logic is platform-agnostic

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │   Login    │  │ Dashboard  │  │  PR Management & AI    ││
│  └────────────┘  └────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │   Auth     │  │  GitHub    │  │      Ollama AI         ││
│  │  Service   │  │  Service   │  │      Service           ││
│  └────────────┘  └────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │   Local    │  │  GitHub    │  │     Ollama API         ││
│  │  Storage   │  │    API     │  │                        ││
│  └────────────┘  └────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Platform Layer                            │
│                   Electron Framework                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │   Main     │  │  Preload   │  │    Renderer            ││
│  │  Process   │  │  Scripts   │  │    Process             ││
│  └────────────┘  └────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Presentation Layer

**Responsibility**: User interface and user interaction

**Components**:
- **Login**: Authentication UI supporting Google, GitHub, and email
- **Dashboard**: Main application interface with repository selection
- **RepositorySelector**: Repository owner and name selection
- **PullRequestList**: List view of PRs with filtering
- **PullRequestDetail**: Detailed PR view with merge capabilities
- **Analytics**: Repository metrics and visualization with enhanced trends
- **RemediationDashboard** (NEW v1.1.0): Conflict prediction and fix suggestions
- **FileOperations** (NEW v1.1.0): File upload/download interface

**Technology**: React 18 with TypeScript, CSS modules

**Design Patterns**:
- Component-based architecture
- Unidirectional data flow
- State management via React hooks
- Separation of presentational and container components

### 2. Business Logic Layer

**Responsibility**: Application logic and workflows

**Services**:

#### AuthService
- User authentication (Google, GitHub, Email)
- Token management
- Session persistence
- Authentication state management

**Key Methods**:
```typescript
- loginWithGoogle(): Promise<User>
- loginWithGitHub(): Promise<User>
- loginWithEmail(email, password): Promise<User>
- logout(): Promise<void>
- isAuthenticated(): boolean
- getAccessToken(): string | null
```

#### GitHubService
- Repository operations
- Pull request management
- Metrics calculation
- GitHub API abstraction

**Key Methods**:
```typescript
- getRepositories(owner): Promise<Repository[]>
- getPullRequests(owner, repo, state): Promise<PullRequest[]>
- getPullRequest(owner, repo, number): Promise<PullRequest>
- mergePullRequest(owner, repo, number): Promise<boolean>
- getRepositoryMetrics(owner, repo): Promise<RepositoryMetrics>
```

**Enhanced Metrics (v1.1.0)**:
- PR velocity calculation (PRs per week)
- Top contributors analysis with merge patterns
- Conflict trend tracking over time
- File hotspot identification

#### OllamaService
- AI-powered PR analysis
- Risk assessment
- Suggestion generation
- **NEW:** Conflict prediction
- **NEW:** Remediation recommendations
- GPT export functionality

**Key Methods**:
```typescript
- analyzePullRequest(pr): Promise<OllamaAnalysis>
- testConnection(): Promise<boolean>
- exportToGPT(context): Promise<string>
```

#### ConflictPredictionService (NEW v1.1.0)
- Predictive merge conflict detection
- Remediation suggestion generation
- Historical conflict pattern analysis
- Auto-fix feasibility assessment

**Key Methods**:
```typescript
- predictConflicts(pr, baseBranch): Promise<ConflictPrediction>
- generateRemediationSuggestions(prNumber, files, context): Promise<RemediationSuggestion[]>
- analyzeConflictPatterns(prs): Promise<ConflictPatterns>
- isAutoFixable(file, content): Promise<AutoFixAnalysis>
```

#### FileOperationsService (NEW v1.1.0)
- Secure file upload/download
- Office document handling (zip, docx, pptx, xlsx)
- File versioning and history tracking
- Integrity validation with checksums
- Magic number verification for security

**Key Methods**:
```typescript
- uploadFile(owner, repo, branch, path, content, message, type): Promise<FileOperationResult>
- downloadFile(owner, repo, path, ref): Promise<FileOperationResult>
- listFiles(owner, repo, path, extensions): Promise<FileOperation[]>
- getFileHistory(owner, repo, path): Promise<FileVersion[]>
```

### 3. Data Access Layer

**Responsibility**: External data integration and persistence

**Components**:

#### Local Storage
- Authentication token persistence
- User preferences
- Session data
- Implemented using browser localStorage and Electron Store

#### GitHub API
- RESTful API integration via Octokit
- Rate limiting handling
- Error management
- Response caching (future enhancement)

#### Ollama API
- HTTP REST API to local Ollama instance
- Streaming support (for future use)
- Fallback handling when unavailable

### 4. Platform Layer

**Responsibility**: Platform-specific functionality

**Components**:

#### Main Process (main.ts)
- Window management
- Application lifecycle
- IPC communication
- System integration

#### Preload Scripts (preload.ts)
- Context bridge for secure IPC
- Exposed APIs for renderer
- Security boundary enforcement

#### Renderer Process
- Web content rendering
- User interaction handling
- React application execution

## Security Architecture

### Authentication Flow

```
User → Login Component → AuthService → OAuth Provider
                              ↓
                         Token Storage
                              ↓
                      Protected Components
```

### Security Measures

1. **Context Isolation**: Electron's context isolation prevents direct access to Node.js APIs
2. **IPC Security**: Only whitelisted APIs are exposed via contextBridge
3. **Token Security**: Tokens stored securely in localStorage with expiration
4. **HTTPS**: All external API calls use HTTPS
5. **Input Validation**: All user inputs are validated before processing

## Data Flow

### Pull Request Retrieval Flow

```
User Selection
    ↓
Dashboard Component
    ↓
GitHubService.getPullRequests()
    ↓
Octokit API Call
    ↓
Response Processing
    ↓
State Update
    ↓
UI Render
```

### AI Analysis Flow

```
PR Detail View
    ↓
OllamaService.analyzePullRequest()
    ↓
Build Analysis Prompt
    ↓
Ollama API Call
    ↓
Parse Response
    ↓
Display Results
```

## Design Patterns

### Service Layer Pattern
All business logic is encapsulated in service classes that can be easily tested and reused.

### Observer Pattern
React's state management system implements the observer pattern for reactive UI updates.

### Singleton Pattern
Services are implemented as singletons to maintain consistent state across the application.

### Factory Pattern
Component creation follows the factory pattern through React's component model.

## Extensibility Points

### Plugin Framework (Future)
The architecture is designed to support plugins through:
- Service injection
- Event bus for inter-component communication
- Well-defined interfaces
- Configuration-based loading

### Supported Extensions
1. **Custom Authentication Providers**: Add new OAuth providers
2. **Additional Analytics**: Extend metrics and visualizations
3. **AI Models**: Support additional AI services beyond Ollama
4. **File Operations**: Add support for additional file types
5. **Git Operations**: Extend with advanced Git functionality

## Technology Decisions

### Why Electron?
- Cross-platform desktop application support
- Access to Node.js for advanced functionality
- Local file system access for future features
- Native integrations possible

### Why React?
- Component-based architecture aligns with modularity goals
- Large ecosystem and community
- Excellent TypeScript support
- Virtual DOM for performance

### Why TypeScript?
- Type safety reduces bugs
- Better IDE support
- Self-documenting code
- Easier refactoring

### Why Octokit?
- Official GitHub API library
- Well-maintained and documented
- TypeScript support
- Built-in retry and rate limiting

## Performance Considerations

### Current Optimizations
1. **Lazy Loading**: Components loaded on demand
2. **Memoization**: React.memo for expensive components
3. **Virtual Rendering**: List virtualization for large PR lists (future)
4. **API Caching**: Response caching to reduce API calls (future)

### Scalability
- Service layer can be moved to backend for large deployments
- Database integration possible for enhanced performance
- Microservices architecture ready if needed

## Testing Strategy

### Unit Tests
- Service layer thoroughly tested
- Authentication flows validated
- Mocked external dependencies

### Integration Tests
- GitHub API integration tests
- End-to-end authentication flows
- Component integration tests

### E2E Tests (Future)
- Full user workflows
- Cross-platform testing
- Performance benchmarks

## Deployment Architecture

### Development
```
localhost:3000 (React Dev Server) → Electron Main Process
```

### Production
```
Bundled React App → Electron Main Process → Installed Application
```

### Distribution
- Electron Builder creates platform-specific installers
- NSIS for Windows
- DMG for macOS
- AppImage/deb for Linux

## Future Enhancements

### Planned Architecture Improvements

1. **Backend Service** (Optional)
   - Centralized authentication
   - Enhanced caching
   - Multi-user support
   - Audit logging

2. **Database Integration**
   - SQLite for local data
   - Historical analytics
   - Offline support

3. **Microservices**
   - Separate AI service
   - Dedicated file processing service
   - Analytics service

4. **Trust Fabric**
   - Provenance tracking
   - Compliance monitoring
   - Audit trails

5. **Observability**
   - Logging framework
   - Metrics collection
   - Error tracking
   - Performance monitoring

## Recent Enhancements (v1.1.0)

### Enhanced Analytics
- **Trend Analysis**: Time-series visualization of conflicts and PR activity
- **Velocity Metrics**: Track PR throughput and team productivity
- **Contributor Analytics**: Identify top contributors and review patterns
- **Conflict Trends**: Visualize merge conflict patterns over time

### Predictive Intelligence
- **AI-Powered Conflict Prediction**: Predict merge conflicts before they occur
- **Risk Assessment**: Evaluate PR complexity and conflict probability
- **Remediation Engine**: Generate actionable fix suggestions
- **Auto-Fix Detection**: Identify conflicts that can be automatically resolved

### File Operations
- **Multi-Format Support**: Handle zip, docx, pptx, xlsx files
- **Security Validation**: Magic number verification and size limits
- **Version Control**: Track file history and changes
- **Integrity Checks**: Checksum validation for uploads/downloads

### Architecture Patterns
- **Service-Oriented**: New services follow single responsibility principle
- **Type Safety**: Comprehensive TypeScript interfaces for new features
- **Error Handling**: Graceful degradation when AI services unavailable
- **Testing**: 100% test coverage for new services

## Compliance with TOGAF

### Architecture Development Method (ADM)

**Phase A - Architecture Vision**: Defined in Epic #1
**Phase B - Business Architecture**: GitOps workflows documented
**Phase C - Information Systems Architecture**: This document
**Phase D - Technology Architecture**: Platform and technology choices documented
**Phase E - Opportunities & Solutions**: Roadmap in Issues #4, #5
**Phase F - Migration Planning**: Phased delivery approach
**Phase G - Implementation Governance**: Code reviews and testing
**Phase H - Architecture Change Management**: Version control and CI/CD

### Architecture Principles Alignment

1. **Business Principles**: Support GitOps workflows efficiently
2. **Data Principles**: Secure data handling, user privacy
3. **Application Principles**: Modular, extensible, maintainable
4. **Technology Principles**: Open standards, platform independence

## Conclusion

The MergePR Cockpit architecture provides a solid foundation for a consumer-grade GitOps platform. The modular design allows for incremental enhancement while maintaining stability and security. The clear separation of concerns enables parallel development and easy testing, while TOGAF alignment ensures enterprise-grade architectural quality.
