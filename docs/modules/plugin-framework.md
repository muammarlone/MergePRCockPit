# Plugin Framework

## Overview

The Extensible Plugin Framework enables third-party developers and organizations to extend MergePRCockPit functionality without modifying the core codebase. This module provides a secure, sandboxed environment for custom integrations, workflow automations, and feature extensions.

## Architecture

### Plugin Types

1. **Authentication Providers**: Custom auth backends (LDAP, SAML, OAuth, custom SSO)
2. **Git Provider Adapters**: Support for additional Git platforms
3. **Notification Channels**: Custom notification integrations (Slack, Teams, Discord, etc.)
4. **Analytics Widgets**: Custom dashboards and visualizations
5. **AI Model Providers**: Custom ML models and AI services
6. **Workflow Automations**: Custom business logic and automations
7. **Data Exporters**: Custom export formats and destinations
8. **Code Quality Tools**: Integration with linters, scanners, formatters

### Plugin Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Plugin Framework                       │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │  Plugin    │  │   Plugin   │  │   Extension     │   │
│  │  Registry  │  │   Loader   │  │   API           │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │   Hook     │  │  Sandbox   │  │   Marketplace   │   │
│  │   System   │  │  Runtime   │  │   (Future)      │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                   Plugin Instances                       │
│  [Auth] [Git] [Notify] [Analytics] [AI] [Workflow]     │
└─────────────────────────────────────────────────────────┘
```

## Plugin SDK

### Installation

```bash
npm install @mergeprcockpit/plugin-sdk
# or
pip install mergeprcockpit-plugin-sdk
# or
go get github.com/mergeprcockpit/plugin-sdk-go
```

### Quick Start (JavaScript/TypeScript)

```typescript
import { Plugin, PluginContext } from '@mergeprcockpit/plugin-sdk';

export default class MyPlugin extends Plugin {
  // Plugin metadata
  static metadata = {
    name: 'my-awesome-plugin',
    version: '1.0.0',
    description: 'An awesome plugin for MergePRCockPit',
    author: 'Your Name <you@example.com>',
    license: 'MIT',
    homepage: 'https://github.com/you/my-plugin',
    
    // Required platform version
    requires: {
      platform: '>=1.0.0'
    },
    
    // Dependencies on other plugins
    dependencies: {
      'core-auth': '^1.0.0'
    },
    
    // Permissions required
    permissions: [
      'repos:read',
      'prs:read',
      'prs:write'
    ]
  };

  // Lifecycle hooks
  async onInstall(ctx: PluginContext) {
    console.log('Plugin installed!');
    // Initialize plugin resources
  }

  async onEnable(ctx: PluginContext) {
    console.log('Plugin enabled!');
    // Register hooks, start services, etc.
    
    // Register a hook
    ctx.hooks.register('pr.opened', this.onPROpened.bind(this));
  }

  async onDisable(ctx: PluginContext) {
    console.log('Plugin disabled!');
    // Cleanup
  }

  async onUninstall(ctx: PluginContext) {
    console.log('Plugin uninstalled!');
    // Remove all plugin data
  }

  // Hook handlers
  async onPROpened(event: PROpenedEvent) {
    // Custom logic when PR is opened
    console.log(`PR opened: ${event.pr.title}`);
    
    // Access platform API
    const issues = await this.api.issues.list({
      repo: event.pr.repo,
      state: 'open'
    });
    
    // Emit custom event
    this.emit('my-plugin:pr-analyzed', { pr: event.pr, issues });
  }
}
```

### Quick Start (Python)

```python
from mergeprcockpit_sdk import Plugin, PluginContext, hook

class MyPlugin(Plugin):
    # Metadata
    name = "my-awesome-plugin"
    version = "1.0.0"
    description = "An awesome plugin"
    author = "Your Name <you@example.com>"
    
    # Lifecycle
    async def on_install(self, ctx: PluginContext):
        print("Plugin installed!")
    
    async def on_enable(self, ctx: PluginContext):
        print("Plugin enabled!")
    
    async def on_disable(self, ctx: PluginContext):
        print("Plugin disabled!")
    
    # Hook handlers
    @hook("pr.opened")
    async def on_pr_opened(self, event):
        print(f"PR opened: {event.pr.title}")
        
        # Access platform API
        issues = await self.api.issues.list(
            repo=event.pr.repo,
            state="open"
        )
        
        # Emit custom event
        self.emit("my-plugin:pr-analyzed", pr=event.pr, issues=issues)
```

### Quick Start (Go)

```go
package main

import (
    sdk "github.com/mergeprcockpit/plugin-sdk-go"
)

type MyPlugin struct {
    sdk.Plugin
}

func (p *MyPlugin) Metadata() sdk.Metadata {
    return sdk.Metadata{
        Name:        "my-awesome-plugin",
        Version:     "1.0.0",
        Description: "An awesome plugin",
        Author:      "Your Name <you@example.com>",
    }
}

func (p *MyPlugin) OnInstall(ctx sdk.Context) error {
    log.Println("Plugin installed!")
    return nil
}

func (p *MyPlugin) OnEnable(ctx sdk.Context) error {
    log.Println("Plugin enabled!")
    
    // Register hook
    ctx.Hooks.Register("pr.opened", p.onPROpened)
    return nil
}

func (p *MyPlugin) onPROpened(event *sdk.PROpenedEvent) error {
    log.Printf("PR opened: %s\n", event.PR.Title)
    
    // Access platform API
    issues, err := p.API.Issues.List(ctx, sdk.IssueListOptions{
        Repo:  event.PR.Repo,
        State: "open",
    })
    if err != nil {
        return err
    }
    
    // Emit custom event
    p.Emit("my-plugin:pr-analyzed", map[string]interface{}{
        "pr":     event.PR,
        "issues": issues,
    })
    
    return nil
}

func main() {
    plugin := &MyPlugin{}
    sdk.Serve(plugin)
}
```

## Hook System

### Available Hooks

#### Repository Hooks
```
repo.created         - When repository is added
repo.updated         - When repository metadata updated
repo.deleted         - When repository removed
repo.synced          - When repository synced with remote
```

#### Branch Hooks
```
branch.created       - When branch is created
branch.deleted       - When branch is deleted
branch.protected     - When branch protection enabled
branch.merged        - When branch is merged
```

#### PR Hooks
```
pr.opened            - When PR is created
pr.updated           - When PR is updated
pr.closed            - When PR is closed
pr.merged            - When PR is merged
pr.review.requested  - When review is requested
pr.review.submitted  - When review is submitted
pr.comment.added     - When comment is added
```

#### Issue Hooks
```
issue.created        - When issue is created
issue.updated        - When issue is updated
issue.closed         - When issue is closed
issue.reopened       - When issue is reopened
issue.assigned       - When issue is assigned
issue.labeled        - When label is added
```

#### Merge Hooks
```
merge.preview        - Before merge preview
merge.before         - Before merge execution
merge.after          - After merge execution
merge.conflict       - When conflict detected
```

#### Rollback Hooks
```
rollback.before      - Before rollback
rollback.after       - After rollback
rollback.failed      - When rollback fails
```

#### AI Hooks
```
ai.review.before     - Before AI review
ai.review.after      - After AI review
ai.prediction        - When AI makes prediction
```

#### System Hooks
```
system.startup       - When system starts
system.shutdown      - When system shuts down
user.login           - When user logs in
user.logout          - When user logs out
```

### Hook Priority

Hooks can specify priority (default is 100):

```typescript
ctx.hooks.register('pr.opened', this.handler, {
  priority: 50  // Lower = earlier execution
});
```

### Async Hooks

Some hooks support async execution (don't block main flow):

```typescript
ctx.hooks.register('pr.opened', this.handler, {
  async: true  // Executes in background
});
```

## Plugin API

### Core API

```typescript
interface PluginAPI {
  // Repositories
  repos: {
    list(options?: ListOptions): Promise<Repository[]>;
    get(id: string): Promise<Repository>;
    create(data: CreateRepoData): Promise<Repository>;
    update(id: string, data: UpdateRepoData): Promise<Repository>;
    delete(id: string): Promise<void>;
  };
  
  // Pull Requests
  prs: {
    list(options?: ListOptions): Promise<PullRequest[]>;
    get(id: string): Promise<PullRequest>;
    create(data: CreatePRData): Promise<PullRequest>;
    update(id: string, data: UpdatePRData): Promise<PullRequest>;
    merge(id: string, options?: MergeOptions): Promise<MergeResult>;
    close(id: string): Promise<void>;
  };
  
  // Issues
  issues: {
    list(options?: ListOptions): Promise<Issue[]>;
    get(id: string): Promise<Issue>;
    create(data: CreateIssueData): Promise<Issue>;
    update(id: string, data: UpdateIssueData): Promise<Issue>;
    close(id: string): Promise<void>;
  };
  
  // Analytics
  analytics: {
    query(query: AnalyticsQuery): Promise<AnalyticsResult>;
    metrics(options?: MetricsOptions): Promise<Metrics>;
  };
  
  // AI
  ai: {
    review(pr: PullRequest): Promise<ReviewResult>;
    predict(type: string, data: any): Promise<Prediction>;
    classify(issue: Issue): Promise<Classification>;
  };
  
  // Storage (plugin-specific data)
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    list(prefix?: string): Promise<string[]>;
  };
  
  // Configuration
  config: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  };
  
  // Notifications
  notifications: {
    send(notification: Notification): Promise<void>;
  };
  
  // HTTP client
  http: {
    get(url: string, options?: HttpOptions): Promise<Response>;
    post(url: string, data: any, options?: HttpOptions): Promise<Response>;
    put(url: string, data: any, options?: HttpOptions): Promise<Response>;
    delete(url: string, options?: HttpOptions): Promise<Response>;
  };
}
```

## Plugin Configuration

### Plugin Manifest (plugin.json)

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin for MergePRCockPit",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/you/my-plugin",
  
  "main": "dist/index.js",
  "icon": "icon.png",
  
  "requires": {
    "platform": ">=1.0.0",
    "node": ">=18.0.0"
  },
  
  "dependencies": {
    "core-auth": "^1.0.0"
  },
  
  "permissions": [
    "repos:read",
    "repos:write",
    "prs:read",
    "prs:write",
    "issues:read",
    "analytics:read",
    "ai:use",
    "storage:readwrite",
    "http:external"
  ],
  
  "configuration": [
    {
      "key": "api_key",
      "type": "string",
      "required": true,
      "secret": true,
      "description": "API key for external service"
    },
    {
      "key": "threshold",
      "type": "number",
      "default": 0.8,
      "description": "Confidence threshold (0-1)"
    },
    {
      "key": "enabled_features",
      "type": "array",
      "default": ["feature1", "feature2"],
      "description": "List of enabled features"
    }
  ],
  
  "hooks": [
    "pr.opened",
    "pr.merged",
    "issue.created"
  ],
  
  "ui": {
    "settings": "settings.html",
    "widgets": [
      {
        "id": "my-widget",
        "name": "My Widget",
        "description": "A custom dashboard widget",
        "component": "widgets/MyWidget.js",
        "defaultSize": { "width": 6, "height": 4 }
      }
    ]
  }
}
```

## Security

### Sandboxing

Plugins run in isolated sandboxes with limited permissions:

- **Process isolation**: Each plugin runs in separate process
- **Resource limits**: CPU, memory, disk quotas
- **Network restrictions**: Only allowed external domains
- **File system**: Access only to plugin directory
- **API access**: Only permitted operations

### Permission System

Plugins must declare required permissions:

```json
{
  "permissions": [
    "repos:read",      // Read repository data
    "repos:write",     // Modify repositories
    "prs:read",        // Read PRs
    "prs:write",       // Modify PRs
    "issues:read",     // Read issues
    "issues:write",    // Modify issues
    "analytics:read",  // Read analytics data
    "ai:use",          // Use AI services
    "storage:read",    // Read from plugin storage
    "storage:write",   // Write to plugin storage
    "http:external",   // Make external HTTP requests
    "admin:users"      // User management (admin plugins only)
  ]
}
```

### Code Signing

Production plugins must be signed:

```bash
# Sign plugin
mergeprcockpit plugin sign my-plugin-1.0.0.zip \
  --key private-key.pem \
  --cert certificate.pem

# Verify signature
mergeprcockpit plugin verify my-plugin-1.0.0.zip
```

## Plugin Management

### Installation

#### From File
```bash
mergeprcockpit plugin install ./my-plugin-1.0.0.zip
```

#### From URL
```bash
mergeprcockpit plugin install https://example.com/my-plugin-1.0.0.zip
```

#### From Registry (Future)
```bash
mergeprcockpit plugin install my-awesome-plugin
```

### Management Commands

```bash
# List installed plugins
mergeprcockpit plugin list

# Enable plugin
mergeprcockpit plugin enable my-awesome-plugin

# Disable plugin
mergeprcockpit plugin disable my-awesome-plugin

# Update plugin
mergeprcockpit plugin update my-awesome-plugin

# Uninstall plugin
mergeprcockpit plugin uninstall my-awesome-plugin

# View plugin details
mergeprcockpit plugin info my-awesome-plugin

# View plugin logs
mergeprcockpit plugin logs my-awesome-plugin
```

### Via Web UI

1. Navigate to Settings → Plugins
2. Click "Install Plugin"
3. Upload plugin file or enter URL
4. Review permissions
5. Click "Install"
6. Configure plugin settings
7. Enable plugin

## Example Plugins

### Example 1: Slack Notification Plugin

```typescript
import { Plugin, PluginContext } from '@mergeprcockpit/plugin-sdk';
import { WebClient } from '@slack/web-api';

export default class SlackNotificationPlugin extends Plugin {
  static metadata = {
    name: 'slack-notifications',
    version: '1.0.0',
    description: 'Send notifications to Slack',
    permissions: ['prs:read', 'http:external']
  };

  private slack: WebClient;

  async onEnable(ctx: PluginContext) {
    // Get Slack token from plugin config
    const token = await ctx.config.get('slack_token');
    this.slack = new WebClient(token);
    
    // Register hooks
    ctx.hooks.register('pr.opened', this.onPROpened.bind(this));
    ctx.hooks.register('pr.merged', this.onPRMerged.bind(this));
  }

  async onPROpened(event) {
    const channel = await this.config.get('channel');
    await this.slack.chat.postMessage({
      channel,
      text: `New PR opened: ${event.pr.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New PR*: <${event.pr.url}|${event.pr.title}>\n` +
                  `Author: ${event.pr.author}\n` +
                  `Repository: ${event.pr.repo}`
          }
        }
      ]
    });
  }

  async onPRMerged(event) {
    const channel = await this.config.get('channel');
    await this.slack.chat.postMessage({
      channel,
      text: `PR merged: ${event.pr.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*PR Merged*: <${event.pr.url}|${event.pr.title}>\n` +
                  `Merged by: ${event.mergedBy}\n` +
                  `Repository: ${event.pr.repo}`
          }
        }
      ]
    });
  }
}
```

### Example 2: Custom Code Quality Plugin

```typescript
import { Plugin, PluginContext } from '@mergeprcockpit/plugin-sdk';

export default class CodeQualityPlugin extends Plugin {
  static metadata = {
    name: 'code-quality-checker',
    version: '1.0.0',
    description: 'Custom code quality checks',
    permissions: ['prs:read', 'prs:write']
  };

  async onEnable(ctx: PluginContext) {
    ctx.hooks.register('pr.opened', this.checkQuality.bind(this));
    ctx.hooks.register('pr.updated', this.checkQuality.bind(this));
  }

  async checkQuality(event) {
    const pr = event.pr;
    
    // Get PR diff
    const diff = await this.api.prs.getDiff(pr.id);
    
    // Run custom quality checks
    const issues = [];
    
    // Check for console.log statements
    if (diff.includes('console.log')) {
      issues.push({
        type: 'warning',
        message: 'Found console.log statement. Remove before merging.',
        line: this.findLine(diff, 'console.log')
      });
    }
    
    // Check for TODO comments
    const todoCount = (diff.match(/TODO:/g) || []).length;
    if (todoCount > 5) {
      issues.push({
        type: 'info',
        message: `Found ${todoCount} TODO comments. Consider creating issues.`
      });
    }
    
    // Check file size
    const largeFiles = diff.files.filter(f => f.additions > 500);
    if (largeFiles.length > 0) {
      issues.push({
        type: 'warning',
        message: `Large files detected: ${largeFiles.map(f => f.name).join(', ')}`
      });
    }
    
    // Post review comments
    if (issues.length > 0) {
      await this.api.prs.createReview(pr.id, {
        event: 'COMMENT',
        body: this.formatIssues(issues)
      });
    }
  }

  formatIssues(issues) {
    let body = '## Code Quality Check Results\n\n';
    for (const issue of issues) {
      const icon = issue.type === 'warning' ? '⚠️' : 'ℹ️';
      body += `${icon} **${issue.type.toUpperCase()}**: ${issue.message}\n`;
    }
    return body;
  }

  findLine(diff, pattern) {
    const lines = diff.split('\n');
    return lines.findIndex(line => line.includes(pattern));
  }
}
```

## Testing Plugins

### Unit Tests

```typescript
import { PluginTestHarness } from '@mergeprcockpit/plugin-sdk/testing';
import MyPlugin from './index';

describe('MyPlugin', () => {
  let harness: PluginTestHarness;
  let plugin: MyPlugin;

  beforeEach(async () => {
    harness = new PluginTestHarness();
    plugin = new MyPlugin();
    await harness.install(plugin);
  });

  test('should handle PR opened event', async () => {
    const event = harness.createEvent('pr.opened', {
      pr: {
        id: '123',
        title: 'Test PR',
        repo: 'test-repo'
      }
    });

    await harness.emit(event);

    // Assert plugin behavior
    expect(harness.getHookCalls('pr.opened')).toHaveLength(1);
  });

  afterEach(async () => {
    await harness.uninstall(plugin);
  });
});
```

### Integration Tests

```typescript
import { IntegrationTestEnvironment } from '@mergeprcockpit/plugin-sdk/testing';

describe('MyPlugin Integration', () => {
  let env: IntegrationTestEnvironment;

  beforeAll(async () => {
    env = await IntegrationTestEnvironment.create();
    await env.installPlugin('./dist');
  });

  test('full workflow', async () => {
    // Create test repository
    const repo = await env.createRepo({ name: 'test-repo' });
    
    // Create PR
    const pr = await env.createPR({
      repo: repo.id,
      title: 'Test PR',
      source: 'feature',
      target: 'main'
    });
    
    // Wait for plugin to process
    await env.waitForHook('pr.opened');
    
    // Verify plugin behavior
    const comments = await env.getPRComments(pr.id);
    expect(comments).toHaveLength(1);
  });

  afterAll(async () => {
    await env.cleanup();
  });
});
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Logging**: Use structured logging for debugging
3. **Performance**: Avoid blocking operations, use async
4. **Security**: Validate all inputs, sanitize outputs
5. **Versioning**: Follow semantic versioning
6. **Documentation**: Include README, API docs, examples
7. **Testing**: Maintain 80%+ test coverage
8. **Monitoring**: Emit metrics for observability

## Roadmap

- [x] Core plugin framework
- [x] Hook system
- [x] Plugin SDK (JS/TS)
- [ ] Plugin SDK (Python)
- [ ] Plugin SDK (Go)
- [ ] Plugin marketplace
- [ ] Plugin revenue sharing
- [ ] Visual plugin builder
- [ ] Plugin analytics dashboard

## Resources

- **SDK Documentation**: https://docs.mergeprcockpit.io/plugin-sdk
- **API Reference**: https://api.mergeprcockpit.io/plugin-api
- **Example Plugins**: https://github.com/mergeprcockpit/example-plugins
- **Plugin Template**: https://github.com/mergeprcockpit/plugin-template
- **Community Plugins**: https://github.com/mergeprcockpit/community-plugins

## Support

- **Discord**: https://discord.gg/mergeprcockpit
- **Forum**: https://forum.mergeprcockpit.io
- **Email**: plugins@mergeprcockpit.io
