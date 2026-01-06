# Git Operations Engine

## Overview

The Git Operations Engine is a core module of MergePRCockPit that provides advanced Git operations with safety features like preview, rollback, and cross-repository management.

## Key Capabilities

### 1. Repository Management

**Features**:
- Multi-provider support (GitHub, GitLab, Bitbucket, Gitea, custom Git servers)
- Repository cloning and synchronization
- Repository health monitoring
- Metadata extraction and indexing

**Use Cases**:
- Connect to enterprise Git infrastructure
- Migrate between Git providers
- Centralized repository catalog

**API Endpoints**:
```
POST   /api/v1/repos/connect       # Connect to a Git provider
GET    /api/v1/repos                # List all repositories
POST   /api/v1/repos/clone          # Clone a repository
PUT    /api/v1/repos/{id}/sync      # Sync with remote
GET    /api/v1/repos/{id}/health    # Health check
DELETE /api/v1/repos/{id}           # Remove repository
```

### 2. Branch Operations

**Features**:
- Create, delete, rename branches
- Branch protection policies
- Branch comparison and divergence analysis
- Branch history visualization

**Use Cases**:
- Enforce branching strategies (GitFlow, trunk-based)
- Prevent accidental deletions
- Analyze branch health

**API Endpoints**:
```
GET    /api/v1/repos/{id}/branches
POST   /api/v1/repos/{id}/branches
DELETE /api/v1/repos/{id}/branches/{name}
PUT    /api/v1/repos/{id}/branches/{name}/protect
GET    /api/v1/repos/{id}/branches/{name}/compare
```

### 3. Safe Merge with Preview

**Features**:
- Non-destructive merge preview
- Visual diff representation
- Conflict detection before merge
- Multiple merge strategies (merge commit, squash, rebase)
- Merge simulation (dry-run)

**Use Cases**:
- Preview merge impact before execution
- Identify conflicts early
- Choose optimal merge strategy

**Workflow**:
```
1. Request merge preview
   POST /api/v1/repos/{id}/merge/preview
   {
     "source": "feature-branch",
     "target": "main",
     "strategy": "merge"
   }

2. Review preview results
   - Conflicting files (if any)
   - Files changed
   - Commits to be merged
   - Estimated risk score

3. Execute merge (if acceptable)
   POST /api/v1/repos/{id}/merge
   {
     "preview_id": "abc123",
     "strategy": "merge",
     "commit_message": "Merge feature-branch"
   }
```

**Preview Output**:
```json
{
  "preview_id": "abc123",
  "status": "success",
  "conflicts": [],
  "files_changed": 15,
  "insertions": 245,
  "deletions": 89,
  "commits": [
    {
      "sha": "a1b2c3",
      "message": "Add new feature",
      "author": "developer@example.com"
    }
  ],
  "risk_score": 0.3,
  "recommendation": "safe_to_merge"
}
```

### 4. Atomic Rollback

**Features**:
- Rollback to any previous state
- Rollback preview (before execution)
- Partial rollback (specific files or commits)
- Rollback history and audit trail
- Rollback validation

**Use Cases**:
- Undo problematic merges
- Recover from mistakes
- Revert specific changes while keeping others

**Rollback Types**:

#### Full Rollback
Reverts repository to a specific commit state.

```
POST /api/v1/repos/{id}/rollback
{
  "type": "full",
  "target_commit": "def456",
  "preview": true
}
```

#### Partial Rollback
Reverts specific files or commits.

```
POST /api/v1/repos/{id}/rollback
{
  "type": "partial",
  "commits": ["abc123", "def456"],
  "files": ["src/app.js", "src/utils.js"],
  "preview": true
}
```

**Safety Features**:
- Mandatory preview before execution
- Confirmation required for rollback
- Automatic backup before rollback
- Rollback audit log

### 5. Repository Reorganization

**Features**:
- Move files/directories between repositories
- Preserve git history during moves
- Bulk operations support
- Preview before execution
- Undo capability

**Use Cases**:
- Split monorepos into multiple repos
- Consolidate repos into monorepo
- Reorganize code structure

**Workflow**:
```
1. Define reorganization plan
   POST /api/v1/repos/reorganize/plan
   {
     "operations": [
       {
         "type": "move",
         "source_repo": "repo-a",
         "source_path": "libs/shared",
         "target_repo": "shared-libs",
         "target_path": "src/shared",
         "preserve_history": true
       },
       {
         "type": "split",
         "source_repo": "monorepo",
         "paths": ["services/auth", "services/api"],
         "target_repos": ["auth-service", "api-service"]
       }
     ]
   }

2. Preview impact
   GET /api/v1/repos/reorganize/plan/{plan_id}/preview

3. Execute plan
   POST /api/v1/repos/reorganize/plan/{plan_id}/execute
```

### 6. Cross-Provider Migration

**Features**:
- Migrate repositories between Git providers
- Preserve all metadata (issues, PRs, wikis, releases)
- Automated validation
- Migration rollback
- Progress tracking

**Supported Migrations**:
- GitHub ↔ GitLab
- GitHub ↔ Bitbucket
- GitLab ↔ Bitbucket
- Any ↔ Gitea/Gogs

**Migration Process**:
```
1. Create migration job
   POST /api/v1/repos/migrate
   {
     "source": {
       "provider": "github",
       "repo": "org/repo-name",
       "include": ["code", "issues", "prs", "wiki", "releases"]
     },
     "target": {
       "provider": "gitlab",
       "repo": "group/repo-name"
     }
   }

2. Monitor progress
   GET /api/v1/repos/migrate/{job_id}

3. Validate migration
   GET /api/v1/repos/migrate/{job_id}/validate

4. Complete or rollback
   POST /api/v1/repos/migrate/{job_id}/complete
   POST /api/v1/repos/migrate/{job_id}/rollback
```

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Git Operations Engine                       │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │ Repository │  │  Branch    │  │  Merge Engine   │   │
│  │  Manager   │  │  Manager   │  │  - Preview      │   │
│  └────────────┘  └────────────┘  │  - Execute      │   │
│                                   │  - Validation   │   │
│  ┌────────────┐  ┌────────────┐  └─────────────────┘   │
│  │  Rollback  │  │ Reorganize │                         │
│  │  Manager   │  │  Engine    │                         │
│  └────────────┘  └────────────┘                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Git Provider Adapters                    │   │
│  │  [GitHub] [GitLab] [Bitbucket] [Gitea] [Custom] │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│         Storage: Object Store + PostgreSQL              │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Language**: Go (high performance, excellent git support)
- **Git Library**: go-git (pure Go implementation) + libgit2 bindings
- **Storage**: MinIO (S3-compatible) for repositories, PostgreSQL for metadata
- **Cache**: Redis for operation state and locks
- **Queue**: NATS for async operations
- **Monitoring**: Prometheus metrics

## Configuration

### Repository Configuration

```yaml
# config/git-operations.yaml
git_operations:
  # Storage
  repository_storage:
    type: s3
    endpoint: minio.local:9000
    bucket: git-repositories
    cache_size_gb: 50

  # Providers
  providers:
    - name: github-enterprise
      type: github
      api_url: https://github.example.com/api/v3
      ssh_url: git@github.example.com

    - name: gitlab-onprem
      type: gitlab
      api_url: https://gitlab.example.com/api/v4

  # Operations
  merge:
    default_strategy: merge
    require_preview: true
    auto_delete_source_branch: false
    
  rollback:
    require_confirmation: true
    create_backup: true
    max_rollback_days: 90

  reorganize:
    preserve_history: true
    require_preview: true
    max_batch_size: 1000
```

## Security

### Access Control

- Repository-level permissions (read, write, admin)
- Branch protection rules
- Merge approval requirements
- Signed commits verification

### Audit Trail

All operations are logged:
- User identity
- Timestamp
- Operation type
- Before/after state
- IP address
- Result (success/failure)

### Encryption

- Repositories encrypted at rest (AES-256)
- TLS 1.3 for all network communication
- SSH key management
- Secrets stored in HashiCorp Vault

## Performance

### Benchmarks

| Operation | Target | Notes |
|-----------|--------|-------|
| Clone 100MB repo | < 10s | With cache |
| Merge preview | < 5s | Typical PR |
| Rollback | < 30s | With validation |
| Reorganize (1000 files) | < 5min | With history |
| Migration (1GB repo) | < 30min | All metadata |

### Optimization

- Lazy loading for large repositories
- Incremental sync with remote
- Parallel operations where safe
- Smart caching strategy
- Background processing for heavy tasks

## Monitoring

### Metrics

```
# Operation counters
git_operations_total{operation="merge", status="success"}
git_operations_total{operation="rollback", status="failure"}

# Duration histograms
git_operation_duration_seconds{operation="clone"}
git_operation_duration_seconds{operation="merge_preview"}

# Resource usage
git_repository_cache_size_bytes
git_active_operations{type="merge"}

# Errors
git_operation_errors_total{operation="merge", error_type="conflict"}
```

### Alerts

- Merge failure rate > 5%
- Rollback required > 10 times/day
- Operation duration > SLA
- Cache hit rate < 80%
- Provider API errors

## Testing

### Test Coverage

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Core workflows
- **E2E Tests**: Full migration scenarios
- **Performance Tests**: Load and stress testing
- **Security Tests**: Penetration testing

### Test Scenarios

1. Merge with conflicts
2. Rollback after failed merge
3. Large repository reorganization
4. Cross-provider migration
5. Concurrent operations on same repo
6. Network failure during operation
7. Partial operation recovery

## Best Practices

### For Users

1. **Always preview before merge**: Review changes and conflicts
2. **Use descriptive commit messages**: Aids in rollback identification
3. **Test rollbacks in staging**: Verify rollback procedure
4. **Document reorganizations**: Keep record of major changes
5. **Monitor migration progress**: Don't assume success

### For Administrators

1. **Configure repository backups**: Automated daily backups
2. **Set branch protection rules**: Prevent accidental deletions
3. **Enable audit logging**: Compliance and debugging
4. **Monitor resource usage**: Scale storage as needed
5. **Regular security audits**: Scan for vulnerabilities

## Troubleshooting

### Common Issues

#### Merge Conflicts

**Symptom**: Merge preview shows conflicts

**Solution**:
1. Review conflicting files
2. Manually resolve in local workspace
3. Push resolution
4. Retry merge

#### Rollback Failure

**Symptom**: Rollback operation fails

**Solution**:
1. Check audit logs for error details
2. Verify target commit exists
3. Ensure no locks on repository
4. Contact support if persists

#### Migration Stalled

**Symptom**: Migration stuck at certain percentage

**Solution**:
1. Check migration job logs
2. Verify API rate limits not exceeded
3. Check network connectivity
4. Resume or restart migration

## Roadmap

### v0.1 (Current)
- [x] Basic repository management
- [x] Simple merge operations
- [x] Initial provider support

### v0.2 (Next)
- [ ] Merge preview
- [ ] Conflict detection
- [ ] Basic rollback

### v0.3
- [ ] Repository reorganization
- [ ] Advanced rollback (partial)

### v0.4
- [ ] Cross-provider migration
- [ ] Bulk operations

### Future
- [ ] GraphQL API
- [ ] Real-time collaboration
- [ ] Advanced conflict resolution AI
- [ ] Automated merge strategies

## Support

- **Documentation**: https://docs.mergeprcockpit.io/git-operations
- **API Reference**: https://api.mergeprcockpit.io/docs
- **Community**: https://community.mergeprcockpit.io
- **Support Email**: support@mergeprcockpit.io
- **GitHub Issues**: https://github.com/muammarlone/MergePRCockPit/issues

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this module.

## License

See [LICENSE](../LICENSE) for licensing information.
