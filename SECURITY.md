# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |

## Reporting Security Issues

**Please do not open public issues for security vulnerabilities.**

Instead, email security details to: [your-security-email]

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for fixes.

## Security Practices

### What We Do
✅ Keep dependencies updated  
✅ Validate all user inputs  
✅ Use context isolation in Electron  
✅ Secure IPC communication  
✅ No external telemetry  
✅ Transparent code practices  

### What You Should Do
🔒 Keep `.env` file private  
🔒 Use strong GitHub tokens with minimal scope  
🔒 Rotate tokens regularly  
🔒 Don't share credentials in issues/PRs  
🔒 Keep the app updated  

## Vulnerability Disclosure

Once a fix is released, we will:
1. Publish security advisory
2. Update all documentation
3. Tag a new release
4. Notify users via GitHub

## Third-Party Dependencies

All dependencies are regularly audited:
- Check: `npm audit`
- Update: `npm update` and `npm outdated`

## GitHub Token Permissions

We recommend GitHub tokens with these minimum scopes:
```
- repo (full repo access)
- workflow (CI/CD actions)
```

## Electron Security

- Context isolation enabled
- Preload scripts restrict access
- Node integration disabled
- No eval() or dangerous patterns
- Regular updates to Electron

## Compliance

- Follows OWASP security guidelines
- Complies with GitHub API terms
- No data collection or tracking
- Fully open-source for auditing

---

Thank you for helping us keep Merge Cockpit secure! 🛡️
