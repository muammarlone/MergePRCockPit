# Security Best Practices

This document outlines the security measures and best practices implemented in MergePRCockPit.

## Content Security Policy (CSP)

### Current Configuration

The application uses a strict Content Security Policy to protect against XSS and other injection attacks:

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self'; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: https:; 
           connect-src 'self' https://api.github.com https://github.com https://accounts.google.com https://oauth2.googleapis.com http://localhost:11434; 
           font-src 'self' data:;">
```

### CSP Directives Explained

- **default-src 'self'**: Only load resources from the same origin by default
- **script-src 'self'**: Only execute scripts from the same origin (no inline scripts or eval)
- **style-src 'self' 'unsafe-inline'**: Styles from same origin plus inline styles (required for React)
- **img-src 'self' data: https:**: Images from same origin, data URIs, and HTTPS sources
- **connect-src**: Network connections allowed to:
  - Same origin
  - GitHub API (https://api.github.com, https://github.com)
  - Google OAuth (https://accounts.google.com, https://oauth2.googleapis.com)
  - Local Ollama server (http://localhost:11434)
- **font-src 'self' data:**: Fonts from same origin and data URIs

### Why No unsafe-eval?

The application does **not** use `unsafe-eval` to prevent:
- Execution of arbitrary JavaScript strings
- Potential XSS vulnerabilities
- Code injection attacks

All JavaScript is bundled at build time and executed from trusted sources only.

## Electron Security

### Context Isolation

Context isolation is **enabled** in the main process (`src/electron/main.ts`):

```typescript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js')
}
```

**Benefits:**
- Prevents renderer processes from accessing Node.js APIs directly
- Isolates preload scripts from the web page context
- Reduces attack surface for malicious websites

### Node Integration

Node integration is **disabled** for security:
- Renderer processes cannot access Node.js APIs
- All privileged operations must go through IPC (Inter-Process Communication)
- Reduces risk of remote code execution

### Preload Script

The preload script (`src/electron/preload.ts`) exposes only necessary APIs:
- Authentication token management
- OAuth flows
- User information retrieval

**Security principle**: Expose the minimum required API surface.

## Dependency Security

### Polyfill Packages

The application uses browserify polyfills for Node.js core modules in the renderer process:

- `buffer` - Buffer implementation for browsers
- `process` - Process environment for browsers
- `util` - Node.js util module for browsers
- `stream-browserify` - Stream implementation for browsers
- `path-browserify` - Path module for browsers
- `crypto-browserify` - Crypto module for browsers

**Why these are needed**: The renderer process runs in a browser-like environment and needs polyfills for Node.js APIs that packages may depend on.

### Webpack Configuration

The webpack configuration (`webpack.renderer.config.js`) includes:

1. **ProvidePlugin**: Automatically injects Buffer and process where needed
2. **DefinePlugin**: Maps `global` to `window` for browser compatibility
3. **Fallbacks**: Provides browser-compatible implementations for Node.js core modules

## Authentication Security

### OAuth Token Storage

- Tokens are stored in `electron-store` (encrypted local storage)
- Never exposed to renderer processes directly
- Retrieved only through secure IPC handlers

### Token Handling Best Practices

1. **Never log tokens**: Avoid logging authentication tokens in console or files
2. **Secure transmission**: Always use HTTPS for API calls
3. **Token expiration**: Implement token refresh mechanisms
4. **Clear on logout**: Always clear tokens when user logs out

## API Security

### GitHub API

- Always use authenticated requests with proper tokens
- Validate response data before use
- Handle rate limiting appropriately
- Use specific API versions to avoid breaking changes

### Google OAuth

- Redirect URIs are validated
- State parameter used to prevent CSRF attacks
- Tokens stored securely in electron-store

## Network Security

### HTTPS Enforcement

- All external API calls use HTTPS (except local Ollama)
- CSP enforces HTTPS for images and external resources
- Development mode serves from localhost (http://localhost:3000)
- Production mode uses file:// protocol

### Localhost Exception

The Ollama server runs on `http://localhost:11434` - this is a local service and doesn't require HTTPS.

## Security Checklist for Contributors

When contributing code, ensure:

- [ ] No use of `eval()` or `Function()` constructor
- [ ] No inline event handlers in HTML
- [ ] All user input is sanitized
- [ ] No secrets in source code
- [ ] Dependencies are up to date
- [ ] CSP directives are not weakened
- [ ] IPC handlers validate input
- [ ] Sensitive data is not logged

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public GitHub issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for a fix before disclosure

## Security Audit Log

### 2026-01-11: CSP and Polyfill Security Fix
- **Issue**: Electron security warning about unsafe-eval in CSP
- **Resolution**: Removed 'unsafe-eval' and 'unsafe-inline' from script-src
- **Impact**: Improved security posture, eliminated XSS attack vector
- **Additional**: Added missing polyfill dependencies for proper webpack bundling

---

*Last updated: 2026-01-11*
