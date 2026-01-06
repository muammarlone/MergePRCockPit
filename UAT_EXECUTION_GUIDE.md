# UAT Execution Guide

## Overview

This guide provides step-by-step instructions for executing User Acceptance Testing (UAT) for MergePRCockPit from a Pull Request or local development environment.

## Prerequisites

Before running UAT tests, ensure you have:

1. **Node.js and npm installed**
   ```bash
   node --version  # Should be v18 or higher
   npm --version   # Should be v8 or higher
   ```

2. **Repository cloned**
   ```bash
   git clone https://github.com/muammarlone/MergePRCockPit.git
   cd MergePRCockPit
   ```

3. **Dependencies installed**
   ```bash
   npm install
   ```

4. **Application built** (optional, for some tests)
   ```bash
   npm run build
   ```

## Quick Start

### Run Complete UAT Suite

Execute all UAT tests, collect evidence, and generate reports:

```bash
npm run uat:full
```

This single command will:
1. ✅ Execute all 16 UAT test cases
2. ✅ Collect evidence for each test
3. ✅ Generate HTML and Markdown reports
4. ✅ Create audit trail
5. ✅ Package evidence files

### View Results

After execution completes:

1. **View HTML Report (Recommended)**
   ```bash
   # Linux/Mac
   open tests/uat/reports/uat-report-*.html
   
   # Windows
   start tests/uat/reports/uat-report-*.html
   ```

2. **View Markdown Report**
   ```bash
   cat tests/uat/reports/uat-report-*.md
   ```

3. **View Audit Trail**
   ```bash
   cat tests/uat/reports/audit-trail.json
   ```

## Detailed Execution Steps

### Step 1: Prepare Environment

1. **Ensure clean state**
   ```bash
   git status  # Should show clean working directory
   ```

2. **Pull latest changes** (if running from existing clone)
   ```bash
   git pull origin main
   ```

3. **Install/update dependencies**
   ```bash
   npm install
   ```

### Step 2: Run Test Suites

You can run tests by category or all at once:

#### Option A: Run All Tests (Recommended)

```bash
npm run uat:full
```

#### Option B: Run by Category

Run specific test categories:

```bash
# Architecture documentation tests
npm run uat:arch

# Authentication tests
npm run uat:auth

# Analytics tests
npm run uat:analytics

# Application tests
npm run uat:app
```

#### Option C: Run Individual Test

Run a specific test file:

```bash
npm run uat -- tests/uat/test-cases/architecture/UAT-ARCH-001.test.ts
```

### Step 3: Review Results

#### HTML Report

The HTML report provides the most comprehensive view:

- **Location:** `tests/uat/reports/uat-report-[timestamp].html`
- **Contains:**
  - Summary dashboard with pass/fail counts
  - Detailed results for each test
  - Visual indicators (green/red)
  - Error messages and stack traces
  - Execution times

**To open:**
```bash
# Find the latest report
ls -lt tests/uat/reports/*.html | head -1

# Open it (Mac/Linux)
open tests/uat/reports/uat-report-*.html
```

#### Markdown Report

The Markdown report is suitable for documentation:

- **Location:** `tests/uat/reports/uat-report-[timestamp].md`
- **Contains:**
  - Summary table
  - Test results in markdown format
  - Easy to read in terminal or GitHub

**To view:**
```bash
cat tests/uat/reports/uat-report-*.md | less
```

#### Audit Trail

The audit trail provides detailed execution logs:

- **Location:** `tests/uat/reports/audit-trail.json`
- **Contains:**
  - Timestamped log of all actions
  - Test start/stop events
  - Duration metrics
  - Detailed metadata

**To view:**
```bash
cat tests/uat/reports/audit-trail.json | jq .
```

### Step 4: Examine Evidence

Each test collects evidence in its own directory:

```bash
# List all evidence directories
ls -l tests/uat/evidence/

# Examine specific test evidence
ls -l tests/uat/evidence/UAT-ARCH-001/

# View evidence report for a test
cat tests/uat/evidence/UAT-ARCH-001/evidence-report.json | jq .
```

Evidence includes:
- Screenshots (PNG files)
- Console logs (TXT files)
- Network activity (JSON files)
- File structure verification (JSON files)
- Test metadata

## Running UAT from Pull Request

### GitHub Actions (Automated)

UAT tests run automatically on pull requests:

1. **View Workflow Run**
   - Go to the PR on GitHub
   - Click "Checks" tab
   - Select "UAT Testing" workflow

2. **Download Artifacts**
   - Scroll to bottom of workflow run
   - Download "uat-evidence" artifact
   - Download "uat-reports" artifact

3. **Review Results**
   - Extract downloaded artifacts
   - Open HTML report from reports artifact

### Manual Execution from PR Branch

1. **Checkout PR branch**
   ```bash
   # Get PR number from GitHub
   git fetch origin pull/[PR_NUMBER]/head:pr-[PR_NUMBER]
   git checkout pr-[PR_NUMBER]
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run UAT**
   ```bash
   npm run uat:full
   ```

4. **Review results** (as described in Step 3)

## Interpreting Results

### Success Criteria

UAT passes if:
- ✅ All tests pass (100% pass rate)
- ✅ No errors in audit trail
- ✅ Evidence collected for all tests
- ✅ Reports generated successfully

### Partial Success

If some tests fail:
1. **Review failed tests in HTML report**
2. **Check error messages**
3. **Examine evidence for failed tests**
4. **Determine if failures are expected**
   - Some tests may fail in non-GUI environments
   - Some features may require specific configuration

### Common Pass/Fail Scenarios

**Architecture Tests:**
- Should always pass (verify documentation exists)

**Authentication Tests:**
- May show warnings in non-GUI environment
- Verify implementation exists, not actual OAuth flow

**Analytics Tests:**
- Verify components and features exist
- May not test actual data visualization

**Application Tests:**
- Verify application structure and integration
- May not test full Electron app execution

## Troubleshooting

### Tests Won't Run

**Problem:** `npm run uat` fails  
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run uat
```

### Missing Dependencies

**Problem:** "Cannot find module 'fs-extra'"  
**Solution:**
```bash
npm install --save-dev fs-extra @playwright/test jest-html-reporter chalk
```

### Permission Errors

**Problem:** "EACCES: permission denied"  
**Solution:**
```bash
# Fix permissions
chmod -R u+w tests/uat/

# Try again
npm run uat
```

### Timeout Errors

**Problem:** "Test timeout exceeded"  
**Solution:**
- Increase timeout in `tests/uat/jest.config.js`
- Change `testTimeout: 30000` to `testTimeout: 60000`

### Evidence Not Generated

**Problem:** Evidence directories empty  
**Solution:**
1. Check test completed successfully
2. Verify no file system errors
3. Check permissions on evidence directory

## Advanced Usage

### Custom Test Filters

Run tests matching a pattern:

```bash
# Run all architecture tests
npm run uat -- --testNamePattern="ARCH"

# Run specific test name
npm run uat -- --testNamePattern="Google OAuth"
```

### Generate Reports Only

If tests already run, regenerate reports:

```bash
npm run uat:report
```

### Package Evidence

Create evidence packages:

```bash
npm run uat:evidence
```

### Clear Old Evidence

Clean up old evidence:

```bash
# Remove all evidence (careful!)
rm -rf tests/uat/evidence/UAT-*

# Remove old reports
rm -f tests/uat/reports/*.html tests/uat/reports/*.md
```

### Run with Coverage

Collect test coverage:

```bash
npm run uat -- --coverage
```

## CI/CD Integration

### GitHub Actions

The UAT workflow (`.github/workflows/uat.yml`) runs automatically:

- **Triggers:**
  - On pull requests to main branch
  - Manual workflow dispatch

- **Actions:**
  - Installs dependencies
  - Runs full UAT suite
  - Uploads evidence and reports as artifacts

- **Artifacts:**
  - `uat-evidence`: All test evidence
  - `uat-reports`: All generated reports

### Running Locally Like CI

Simulate CI environment:

```bash
# Fresh install
rm -rf node_modules
npm ci

# Run tests
npm run uat:full
```

## Best Practices

1. **Always run full suite before deployment**
   ```bash
   npm run uat:full
   ```

2. **Review evidence for failed tests**
   - Don't just look at pass/fail
   - Understand why tests failed

3. **Keep evidence for important runs**
   - Archive evidence from releases
   - Keep PR evidence until merged

4. **Run incrementally during development**
   ```bash
   npm run uat:auth  # Test what you're working on
   ```

5. **Clean up old evidence periodically**
   ```bash
   # Keep only last 10 runs
   ls -t tests/uat/evidence/ | tail -n +11 | xargs rm -rf
   ```

## Support and Resources

### Documentation

- **UAT Framework README:** `tests/uat/README.md`
- **Evidence Guide:** `tests/uat/evidence/README.md`
- **Main Testing Guide:** `TESTING.md`

### Common Commands Reference

```bash
# Run all UAT tests with reports
npm run uat:full

# Run specific suite
npm run uat:arch
npm run uat:auth
npm run uat:analytics
npm run uat:app

# Run single test
npm run uat -- path/to/test.ts

# Generate reports
npm run uat:report

# Package evidence
npm run uat:evidence

# View results
open tests/uat/reports/uat-report-*.html
```

### Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review test output for error messages
3. Check the audit trail for detailed logs
4. Consult the UAT README in `tests/uat/README.md`
5. Open an issue on GitHub with:
   - Command you ran
   - Error message
   - Relevant logs from audit trail

## Summary

UAT testing for MergePRCockPit is designed to be:
- ✅ **Simple:** One command to run all tests
- ✅ **Comprehensive:** Tests all major features
- ✅ **Transparent:** Clear reports and evidence
- ✅ **Automated:** Runs in CI/CD
- ✅ **Traceable:** Complete audit trail

Run `npm run uat:full` and review the HTML report for complete UAT validation.

---

**MergePRCockPit UAT Testing Framework**  
For questions or issues, please open a GitHub issue.
