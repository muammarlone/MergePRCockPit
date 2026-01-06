# Testing Guide - MergePR Cockpit

This document provides comprehensive testing instructions for all authentication, installation, and data loading scenarios.

## Test Environment Setup

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Git installed
- Three test environments (optional but recommended):
  - Windows 10/11
  - macOS 10.15+
  - Ubuntu 20.04+

### Test Data
- Create test Google OAuth app
- Create test GitHub OAuth app
- Prepare test GitHub repository with multiple PRs
- Test user accounts for Google and GitHub

## Automated Test Suite

### Running All Tests
```bash
npm test
```

### Running Specific Test Suites
```bash
# Authentication service tests
npm test -- authService

# OAuth-specific tests
npm test -- authService.oauth

# AuthGuard component tests
npm test -- AuthGuard
```

### Expected Results
- All 21 tests should pass
- No console errors or warnings
- Test coverage should be adequate for authentication flows

## Manual Testing Scenarios

### 1. Fresh Installation Testing

#### Windows Installation
**Test Steps:**
1. Download the Windows installer (.exe)
2. Run the installer
3. Handle SmartScreen warning (if appears)
4. Complete installation wizard
5. Launch application from Start Menu
6. Verify application opens without errors

**Expected Results:**
- Installer runs smoothly
- No installation errors
- Application launches successfully
- Login screen appears

**Failure Scenarios to Test:**
- Cancel installation midway
- Install to custom directory
- Install without admin privileges (if applicable)

#### macOS Installation
**Test Steps:**
1. Download the DMG file
2. Open DMG
3. Drag application to Applications folder
4. Eject DMG
5. Open application (right-click → Open for first launch)
6. Handle Gatekeeper prompt

**Expected Results:**
- DMG opens correctly
- Drag-and-drop works
- Gatekeeper allows execution
- Application launches

**Failure Scenarios to Test:**
- Try to run from DMG without installing
- Test with different macOS versions
- Test on Apple Silicon vs Intel Macs

#### Linux Installation
**AppImage Test:**
```bash
chmod +x MergePR-Cockpit-*.AppImage
./MergePR-Cockpit-*.AppImage
```

**DEB Package Test:**
```bash
sudo dpkg -i mergeprcockpit_*.deb
sudo apt-get install -f
mergeprcockpit
```

**Expected Results:**
- AppImage runs without installation
- DEB package installs dependencies
- Application accessible from command line or menu

**Failure Scenarios to Test:**
- Missing dependencies
- Permissions issues
- Different Linux distributions

### 2. OAuth Authentication Testing

#### Google OAuth Flow

**Prerequisites:**
- Valid Google OAuth credentials in .env file
- Test Google account

**Test Steps:**
1. Launch application
2. Click "Sign in with Google"
3. OAuth window should open
4. Authorize the application
5. Window closes automatically
6. User is logged in

**Expected Results:**
- OAuth consent screen loads correctly
- User information displayed accurately
- Token stored securely
- Dashboard loads with user context

**Failure Scenarios:**
- Click "Cancel" or "Deny" in OAuth screen
- Invalid client ID/secret
- Network interruption during OAuth
- Expired OAuth consent
- Revoke app permissions and retry

#### GitHub OAuth Flow

**Prerequisites:**
- Valid GitHub OAuth credentials in .env file
- Test GitHub account

**Test Steps:**
1. Launch application
2. Click "Sign in with GitHub"
3. OAuth window should open
4. Authorize the application
5. Window closes automatically
6. User is logged in

**Expected Results:**
- OAuth authorization screen loads
- Permissions scope clearly displayed
- Successful authentication
- User profile loaded

**Failure Scenarios:**
- Deny permissions
- Invalid credentials
- Network issues
- Account without email access
- Two-factor authentication handling

#### Email/Password Authentication (Mock Mode)

**Test Steps:**
1. Ensure OAuth is NOT configured (.env missing or empty)
2. Enter email: test@example.com
3. Enter password: any password
4. Click "Sign in with Email"

**Expected Results:**
- Mock authentication succeeds
- User logged in with mock account
- Warning/notice about mock mode (optional enhancement)

**Failure Scenarios:**
- Empty email field
- Empty password field
- Both fields empty

### 3. Authentication Persistence Testing

**Test Steps:**
1. Login using any method
2. Close application completely
3. Relaunch application
4. Check if user remains logged in

**Expected Results:**
- User remains authenticated
- Token persists across sessions
- No re-login required (unless token expired)

**Failure Scenarios:**
- Clear localStorage and relaunch
- Wait for token expiration (1 hour default)
- Corrupt localStorage data

### 4. Authentication Guard Testing

**Test Steps:**
1. Without logging in, try to access protected routes
2. Should be redirected to login
3. After login, access to protected content granted

**Expected Results:**
- Unauthenticated users see login screen
- Authenticated users see dashboard
- Logout works correctly

### 5. GitHub Integration Testing

#### Repository Loading

**Prerequisites:**
- Authenticated user
- Valid GitHub username with public repos

**Test Steps:**
1. Enter GitHub username: "octocat" (or your test username)
2. Click "Load Repositories"
3. Wait for repositories to load
4. Select a repository

**Expected Results:**
- Repository list populates
- Dropdown shows repository names
- Selection works correctly

**Failure Scenarios:**
- Invalid username
- Empty username
- User with no public repositories
- Network timeout
- GitHub API rate limit reached

#### Pull Request Loading

**Test Steps:**
1. After selecting repository
2. Pull requests should load automatically
3. View list of PRs with status

**Expected Results:**
- PR list displays correctly
- Open/Closed/Merged states shown
- PR metadata accurate
- Click on PR opens detail view

**Failure Scenarios:**
- Repository with no PRs
- Repository with 100+ PRs (pagination)
- Private repository access
- API errors

### 6. Data Access Control Testing

**Test Steps:**
1. Login with user account
2. Try to access another user's private data
3. Verify access denied or appropriate error

**Expected Results:**
- User can only access authorized data
- Proper error messages for unauthorized access
- No data leakage

### 7. Token Expiration Testing

**Test Steps:**
1. Login successfully
2. Manually set token expiration to past time (via localStorage)
3. Try to access protected resources

**Expected Results:**
- User is logged out or prompted to re-authenticate
- Graceful handling of expired tokens
- No application crash

### 8. Offline/Network Failure Testing

**Test Steps:**
1. Disconnect from internet
2. Try to login with OAuth
3. Try to load repositories

**Expected Results:**
- Clear error messages
- Application doesn't crash
- Helpful troubleshooting hints
- Retry mechanism available

### 9. Multi-Account Testing

**Test Steps:**
1. Login with Google account
2. Logout
3. Login with GitHub account
4. Verify correct account context

**Expected Results:**
- Each provider works independently
- User context switches correctly
- No data mixing between accounts

### 10. Security Testing

#### Secure Token Storage
**Test Steps:**
1. Login successfully
2. Inspect application data storage
3. Verify tokens are stored securely
4. Check they're not in source code

**Expected Results:**
- Tokens not visible in renderer console
- Storage encrypted or protected
- .env not committed to Git

#### XSS Prevention
**Test Steps:**
1. Try to inject scripts in form fields
2. Verify proper sanitization

**Expected Results:**
- Scripts don't execute
- Input sanitized
- No security warnings

## Performance Testing

### Startup Time
- Measure time from launch to login screen
- Target: < 3 seconds

### Authentication Speed
- Measure OAuth flow completion time
- Target: < 10 seconds

### Data Loading
- Measure PR list load time for repo with 20 PRs
- Target: < 5 seconds

## Regression Testing

After any code changes, run these critical paths:

1. **Happy Path**: Install → Login with Google → Load Repo → View PRs
2. **GitHub Path**: Install → Login with GitHub → Load Repo → View PRs
3. **Offline Path**: Install → No network → See error messages
4. **Token Expiry Path**: Login → Wait → Token expires → Re-auth

## Test Reporting

### Bug Report Template
```
**Title**: Brief description
**Severity**: Critical / High / Medium / Low
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Screenshots**: Attach if applicable
**Environment**: 
- OS: Windows 11 / macOS 13 / Ubuntu 22.04
- App Version: 1.0.0
- OAuth Configured: Yes/No
```

### Test Completion Checklist

- [ ] All automated tests pass
- [ ] Fresh install tested on Windows
- [ ] Fresh install tested on macOS
- [ ] Fresh install tested on Linux
- [ ] Google OAuth flow tested
- [ ] GitHub OAuth flow tested
- [ ] Email mock auth tested
- [ ] Authentication persistence tested
- [ ] Token expiration tested
- [ ] Repository loading tested
- [ ] PR loading tested
- [ ] Network failure handling tested
- [ ] Security checks passed
- [ ] Performance benchmarks met
- [ ] No console errors in normal operation
- [ ] Documentation accurate and complete

## Continuous Integration

Automated tests run on every commit via GitHub Actions:
- Lint checks
- Unit tests
- Build verification
- Security scanning (CodeQL)

## Known Issues and Limitations

Document any known issues or limitations discovered during testing:

1. **OAuth Fallback**: Mock authentication used when OAuth not configured
2. **Rate Limiting**: GitHub API has rate limits for unauthenticated requests
3. **Platform-Specific**: Some features may behave differently on different platforms

## Testing Tools

Recommended tools for manual testing:
- **Network Throttling**: Chrome DevTools
- **Token Inspection**: Application DevTools → Storage
- **API Monitoring**: Browser Network tab
- **Performance**: Chrome DevTools Performance tab

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
