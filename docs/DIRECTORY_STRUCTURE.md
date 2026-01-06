# Directory Structure

This document outlines the planned directory structure for the MergePRCockPit platform.

## Overview

```
MergePRCockPit/
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD workflows
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── services/                   # Backend microservices
│   ├── api-gateway/           # API gateway service
│   │   ├── cmd/               # Main applications
│   │   ├── internal/          # Private application code
│   │   ├── pkg/               # Public libraries
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   ├── git-operations/        # Git operations engine
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── repository/    # Repository management
│   │   │   ├── merge/         # Merge operations
│   │   │   ├── rollback/      # Rollback functionality
│   │   │   └── migration/     # Cross-provider migration
│   │   ├── pkg/
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   ├── issue-management/      # Issue tracking service
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── issue/         # Issue CRUD
│   │   │   ├── workflow/      # Workflow engine
│   │   │   ├── sla/           # SLA management
│   │   │   └── integration/   # Third-party integrations
│   │   ├── pkg/
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   ├── pr-analytics/          # PR review & analytics
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── review/        # Review management
│   │   │   ├── analytics/     # Analytics engine
│   │   │   ├── metrics/       # Metrics collection
│   │   │   └── dashboard/     # Dashboard data
│   │   ├── pkg/
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   ├── ai-assistants/         # AI/ML services
│   │   ├── app/               # Application code
│   │   │   ├── main.py        # FastAPI entry point
│   │   │   ├── models/        # ML model definitions
│   │   │   ├── services/      # Business logic
│   │   │   │   ├── pr_review.py
│   │   │   │   ├── merge_intelligence.py
│   │   │   │   ├── issue_classifier.py
│   │   │   │   └── analytics_assistant.py
│   │   │   └── api/           # API routes
│   │   ├── ml/                # ML training pipeline
│   │   │   ├── training/
│   │   │   ├── evaluation/
│   │   │   └── deployment/
│   │   ├── models_store/      # Trained models
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── trust-fabric/          # Compliance & audit
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── provenance/    # Provenance tracking
│   │   │   ├── compliance/    # Compliance engine
│   │   │   ├── audit/         # Audit logging
│   │   │   └── security/      # Security scanning
│   │   ├── pkg/
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   └── plugin-engine/         # Plugin framework
│       ├── cmd/
│       ├── internal/
│       │   ├── registry/      # Plugin registry
│       │   ├── loader/        # Plugin loader
│       │   ├── sandbox/       # Sandbox runtime
│       │   └── hooks/         # Hook system
│       ├── pkg/
│       ├── sdk/               # Plugin SDK
│       │   ├── javascript/    # JS/TS SDK
│       │   ├── python/        # Python SDK
│       │   └── go/            # Go SDK
│       ├── Dockerfile
│       └── go.mod
│
├── web-ui/                    # Frontend application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Shared components
│   │   │   ├── git/           # Git operations UI
│   │   │   ├── issues/        # Issue management UI
│   │   │   ├── prs/           # PR review UI
│   │   │   ├── analytics/     # Analytics dashboards
│   │   │   └── settings/      # Settings UI
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   ├── utils/             # Utilities
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   ├── tests/                 # Frontend tests
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── cli/                       # Command-line interface
│   ├── cmd/                   # CLI commands
│   │   ├── root.go
│   │   ├── repo.go
│   │   ├── pr.go
│   │   ├── issue.go
│   │   └── plugin.go
│   ├── internal/
│   ├── Makefile
│   └── go.mod
│
├── plugins/                   # Official plugins
│   ├── auth-ldap/            # LDAP authentication
│   ├── auth-saml/            # SAML authentication
│   ├── notify-slack/         # Slack notifications
│   ├── notify-teams/         # MS Teams notifications
│   ├── git-gitea/            # Gitea provider
│   └── analytics-custom/     # Custom analytics widgets
│
├── docs/                      # Documentation
│   ├── modules/               # Module documentation
│   │   ├── git-operations.md
│   │   ├── issue-management.md
│   │   ├── pr-analytics.md
│   │   ├── ai-assistants.md
│   │   ├── trust-fabric.md
│   │   └── plugin-framework.md
│   ├── architecture/          # Architecture docs
│   │   ├── overview.md
│   │   ├── data-model.md
│   │   ├── api-design.md
│   │   └── security.md
│   ├── guides/                # User guides
│   │   ├── getting-started.md
│   │   ├── deployment.md
│   │   ├── configuration.md
│   │   └── plugin-development.md
│   └── api/                   # API documentation
│       ├── openapi.yaml
│       └── graphql-schema.graphql
│
├── deploy/                    # Deployment configurations
│   ├── kubernetes/            # Kubernetes manifests
│   │   ├── base/              # Base configurations
│   │   │   ├── namespace.yaml
│   │   │   ├── configmaps/
│   │   │   ├── secrets/
│   │   │   └── services/
│   │   ├── overlays/          # Environment overlays
│   │   │   ├── development/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── kustomization.yaml
│   │
│   ├── helm/                  # Helm charts
│   │   └── mergeprcockpit/
│   │       ├── Chart.yaml
│   │       ├── values.yaml
│   │       ├── templates/
│   │       └── charts/        # Dependency charts
│   │
│   ├── terraform/             # Infrastructure as Code
│   │   ├── aws/               # AWS deployment
│   │   ├── gcp/               # GCP deployment
│   │   ├── azure/             # Azure deployment
│   │   └── on-prem/           # On-premises
│   │
│   └── docker-compose/        # Docker Compose for local dev
│       ├── docker-compose.yml
│       ├── docker-compose.prod.yml
│       └── .env.example
│
├── scripts/                   # Utility scripts
│   ├── setup/                 # Setup scripts
│   │   ├── init-dev.sh
│   │   ├── init-database.sh
│   │   └── generate-certs.sh
│   ├── build/                 # Build scripts
│   │   ├── build-all.sh
│   │   ├── build-images.sh
│   │   └── push-images.sh
│   ├── test/                  # Test scripts
│   │   ├── run-tests.sh
│   │   ├── e2e-tests.sh
│   │   └── load-tests.sh
│   └── deploy/                # Deployment scripts
│       ├── deploy-k8s.sh
│       └── rollback.sh
│
├── tests/                     # Integration & E2E tests
│   ├── integration/           # Integration tests
│   │   ├── git-ops/
│   │   ├── issue-mgmt/
│   │   └── pr-analytics/
│   ├── e2e/                   # End-to-end tests
│   │   ├── workflows/
│   │   └── scenarios/
│   └── performance/           # Performance tests
│       ├── load/
│       └── stress/
│
├── config/                    # Configuration files
│   ├── development/           # Dev environment
│   ├── staging/               # Staging environment
│   ├── production/            # Production environment
│   └── schema/                # Config schemas
│
├── migrations/                # Database migrations
│   ├── postgres/
│   └── timescaledb/
│
├── .github/                   # GitHub-specific files
│   ├── workflows/             # GitHub Actions
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   ├── security-scan.yml
│   │   └── docs.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── epic.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore                 # Git ignore rules
├── .dockerignore              # Docker ignore rules
├── README.md                  # Project overview
├── ARCHITECTURE.md            # Architecture documentation
├── ROADMAP.md                 # Product roadmap
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
├── SECURITY.md                # Security policy
├── CODE_OF_CONDUCT.md         # Code of conduct
└── Makefile                   # Build automation

```

## Module Organization

### Services

Each microservice follows a consistent structure:

```
service-name/
├── cmd/                       # Entry points
│   └── server/
│       └── main.go
├── internal/                  # Private code
│   ├── handler/              # HTTP/gRPC handlers
│   ├── service/              # Business logic
│   ├── repository/           # Data access
│   └── model/                # Domain models
├── pkg/                      # Public libraries
│   └── api/                  # API clients
├── config/                   # Configuration
├── migrations/               # Database migrations
├── tests/                    # Service-specific tests
├── Dockerfile
├── go.mod
└── README.md
```

### Frontend

```
web-ui/
├── public/                   # Static assets
├── src/
│   ├── components/           # Reusable components
│   ├── pages/                # Page components
│   ├── hooks/                # Custom hooks
│   ├── services/             # API clients
│   ├── store/                # State management
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript definitions
│   └── styles/               # Global styles
└── tests/                    # Component tests
```

### Plugins

```
plugin-name/
├── src/
│   ├── index.ts             # Plugin entry point
│   ├── handlers/            # Hook handlers
│   ├── services/            # Plugin services
│   └── types/               # Type definitions
├── tests/                   # Plugin tests
├── plugin.json              # Plugin manifest
├── README.md
└── package.json
```

## Configuration Structure

```
config/
├── development/
│   ├── api-gateway.yaml
│   ├── git-operations.yaml
│   ├── database.yaml
│   └── ai-assistants.yaml
├── staging/
│   └── [same as development]
└── production/
    └── [same as development]
```

## Documentation Structure

```
docs/
├── modules/                  # Per-module documentation
├── architecture/             # Architecture details
├── guides/                   # How-to guides
│   ├── getting-started.md
│   ├── deployment/
│   │   ├── kubernetes.md
│   │   ├── docker.md
│   │   └── bare-metal.md
│   ├── configuration/
│   └── troubleshooting/
├── api/                      # API documentation
│   ├── rest/
│   └── graphql/
└── contributing/             # Contributor docs
    ├── development.md
    ├── testing.md
    └── plugins.md
```

## Build Artifacts

Generated files (ignored by git):

```
MergePRCockPit/
├── bin/                      # Compiled binaries
├── dist/                     # Distribution packages
├── coverage/                 # Test coverage reports
├── .artifacts/               # Build artifacts
└── node_modules/             # Node dependencies
```

## Development Environment

```
MergePRCockPit/
├── .env                      # Local environment variables
├── .env.example              # Environment template
├── docker-compose.yml        # Local services
└── skaffold.yaml            # K8s development
```

## Future Additions

As the project evolves, we may add:

- `examples/` - Example integrations and use cases
- `benchmarks/` - Performance benchmarks
- `tools/` - Development tools
- `data/` - Sample data for testing
- `vendor/` - Vendored dependencies (Go)

## Notes

- This structure follows **modular architecture** principles
- Each service is **independently deployable**
- **Clear separation** between services, frontend, and infrastructure
- **Consistent patterns** across all modules
- **Scalable** for future growth
- **Plugin-friendly** architecture

## Maintenance

This document should be updated as the structure evolves. When adding new directories or modules, update this document accordingly.

---

**Last Updated**: 2026-01-06  
**Version**: 1.0
