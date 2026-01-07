# UAT Testing Framework

## Overview

This directory contains the User Acceptance Testing (UAT) framework for MergePRCockPit. The framework provides automated test execution with comprehensive evidence collection, reporting, and audit trail capabilities.

## Directory Structure

```
tests/uat/
├── README.md                          # This file
├── jest.config.js                     # Jest configuration for UAT
├── framework/                         # Core framework files
│   ├── evidence-collector.ts          # Screenshot & log capture
│   ├── uat-runner.ts                  # Main UAT test runner
│   ├── report-generator.ts            # HTML/Markdown report generation
│   └── audit-logger.ts                # Audit trail logging
├── test-cases/                        # Test case implementations
│   ├── architecture/                  # Architecture documentation tests
│   │   ├── UAT-ARCH-001.test.ts      # Architecture docs verification
│   │   ├── UAT-ARCH-002.test.ts      # Roadmap verification
│   │   └── UAT-ARCH-003.test.ts      # Module specs verification
│   ├── authentication/                # Authentication tests
│   │   ├── UAT-AUTH-001.test.ts      # Google OAuth flow
│   │   ├── UAT-AUTH-002.test.ts      # GitHub OAuth flow
│   │   ├── UAT-AUTH-003.test.ts      # AuthGuard protection
│   │   └── UAT-AUTH-004.test.ts      # Auth test suite validation
│   ├── analytics/                     # Analytics feature tests
│   │   ├── UAT-ANALYTICS-001.test.ts # Health score calculation
│   │   ├── UAT-ANALYTICS-002.test.ts # Conflict prediction
│   │   ├── UAT-ANALYTICS-003.test.ts # Remediation dashboard
│   │   ├── UAT-ANALYTICS-004.test.ts # File operations
│   │   └── UAT-ANALYTICS-005.test.ts # Analytics test validation
│   └── application/                   # Application tests
│       ├── UAT-APP-001.test.ts       # Application startup
│       ├── UAT-APP-002.test.ts       # GitHub integration
│       ├── UAT-APP-003.test.ts       # Dashboard navigation
│       └── UAT-APP-004.test.ts       # Ollama AI integration
├── evidence/                          # Test evidence storage
│   ├── .gitkeep
│   └── README.md                      # Evidence storage guide
└── reports/                           # Generated reports
    ├── .gitkeep
    └── templates/                     # Report templates
        ├── evidence-template.md
        └── audit-report-template.md
```

## Quick Start

### Running All UAT Tests

```bash
npm run uat:full
```

This command will:
1. Execute all UAT test cases
2. Collect evidence for each test
3. Generate HTML and Markdown reports
4. Create an audit trail
5. Package evidence files

### Running Specific Test Suites

```bash
# Architecture tests only
npm run uat:arch

# Authentication tests only
npm run uat:auth

# Analytics tests only
npm run uat:analytics

# Application tests only
npm run uat:app
```

### Running Individual Tests

```bash
# Run specific test file
npm run uat -- tests/uat/test-cases/architecture/UAT-ARCH-001.test.ts
```

## Test Execution Instructions

### Prerequisites

1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Build the application (if needed):
   ```bash
   npm run build
   ```

### Step-by-Step Execution

1. **Run the complete UAT suite:**
   ```bash
   npm run uat:full
   ```

2. **View the HTML report:**
   - Open `tests/uat/reports/uat-report-*.html` in a browser
   - The report shows pass/fail status for all tests
   - Click on failed tests to see error details

3. **Review the audit trail:**
   - Open `tests/uat/reports/audit-trail.json`
   - Contains timestamped log of all test executions

4. **Examine test evidence:**
   - Navigate to `tests/uat/evidence/[TEST-ID]/`
   - Each test has its own evidence directory
   - Contains screenshots, logs, and metadata

## Evidence Collection

The UAT framework automatically collects the following evidence for each test:

### 1. Screenshots
- Captured at key points during test execution
- Stored as PNG files in evidence directory
- Referenced in the evidence report

### 2. Console Logs
- All console output during test execution
- Captured to text files
- Includes timestamps

### 3. Network Activity
- Network requests made during tests
- Stored as JSON files
- Includes request/response data

### 4. File Structure Verification
- Validates existence of required files
- Captures file metadata (size, type, etc.)
- Documents file system state

### 5. Test Metadata
- Custom metadata recorded during tests
- Test-specific data points
- Stored in evidence report

## Report Interpretation

### HTML Report

The HTML report provides:
- **Summary Dashboard**: Overview of test results
- **Test Results**: Detailed results for each test
- **Pass/Fail Indicators**: Visual status for each test
- **Error Messages**: Full error details for failed tests
- **Duration Metrics**: Execution time for each test

### Markdown Report

The Markdown report includes:
- Summary statistics
- Test results in table format
- Error details for failed tests
- Suitable for version control and documentation

### Audit Trail

The audit trail provides:
- Chronological log of all test actions
- Start/end timestamps for each test
- Test outcomes and durations
- Detailed execution metadata

## Troubleshooting

### Tests Fail to Run

1. **Check dependencies:**
   ```bash
   npm install
   ```

2. **Verify Jest is installed:**
   ```bash
   npx jest --version
   ```

3. **Check file paths:**
   - Ensure all test files are in correct directories
   - Verify imports are correct

### Evidence Not Collected

1. **Check evidence directory permissions:**
   ```bash
   ls -la tests/uat/evidence/
   ```

2. **Verify EvidenceCollector is initialized:**
   - Look for `initialize()` calls in test files
   - Check for errors in test output

### Reports Not Generated

1. **Check reports directory:**
   ```bash
   ls -la tests/uat/reports/
   ```

2. **Run report generation manually:**
   ```bash
   npm run uat:report
   ```

3. **Check for errors in audit trail:**
   ```bash
   cat tests/uat/reports/audit-trail.json
   ```

### Common Issues

**Issue:** "Cannot find module 'fs-extra'"
**Solution:** Run `npm install fs-extra`

**Issue:** "Test timeout exceeded"
**Solution:** Increase timeout in jest.config.js

**Issue:** "Permission denied writing to evidence directory"
**Solution:** Check directory permissions and ownership

## Framework Architecture

### Evidence Collector

Responsible for:
- Capturing screenshots during test execution
- Recording console logs
- Capturing network activity
- Verifying file structures
- Recording test metadata

### UAT Runner

Provides:
- Test execution orchestration
- Suite management
- Evidence package generation
- Integration with Jest

### Report Generator

Generates:
- HTML reports with visual dashboard
- Markdown reports for documentation
- Audit trail reports
- Dashboard summaries

### Audit Logger

Maintains:
- Chronological audit trail
- Test start/stop events
- Suite execution logs
- Detailed execution metadata

## Best Practices

1. **Always run tests before deployment**
   - Ensures all features are validated
   - Catches regressions early

2. **Review evidence for failed tests**
   - Evidence helps diagnose issues
   - Screenshots show exact failure point

3. **Keep audit trail for compliance**
   - Provides traceability
   - Documents testing activities

4. **Run suites incrementally**
   - Faster feedback during development
   - Run full suite before release

5. **Document test updates**
   - Update tests when features change
   - Keep test descriptions current

## CI/CD Integration

The UAT framework is designed to run in CI/CD pipelines:

1. **GitHub Actions Integration**
   - See `.github/workflows/uat.yml`
   - Runs on pull requests and manually

2. **Artifact Upload**
   - Evidence automatically uploaded
   - Reports available as artifacts

3. **Status Checks**
   - UAT results shown in PR checks
   - Prevents merge if tests fail

## Contributing

When adding new UAT tests:

1. Follow the existing test structure
2. Use the EvidenceCollector for all tests
3. Add proper test documentation
4. Update this README if needed
5. Ensure tests are idempotent

## Support

For issues or questions:
- Check the troubleshooting section
- Review existing test implementations
- Consult the main project documentation
- Open an issue on GitHub

---

**MergePRCockPit UAT Testing Framework**  
Version 1.0.0  
Last Updated: 2026-01-06
