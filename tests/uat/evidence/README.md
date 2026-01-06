# UAT Evidence Storage

## Purpose

This directory stores evidence collected during UAT test executions. Each test case maintains its own evidence subdirectory containing screenshots, logs, network traces, and metadata.

## Directory Structure

```
evidence/
├── UAT-ARCH-001/
│   ├── evidence-report.json
│   ├── UAT-ARCH-001-screenshot-*.png
│   ├── UAT-ARCH-001-logs-*.txt
│   └── UAT-ARCH-001-filestructure-*.json
├── UAT-ARCH-002/
│   └── ...
├── UAT-AUTH-001/
│   └── ...
└── [other test IDs]/
    └── ...
```

## Evidence Types

### 1. Screenshots
- **Format:** PNG
- **Naming:** `{TEST-ID}-{description}-{timestamp}.png`
- **Purpose:** Visual verification of UI state and behavior

### 2. Logs
- **Format:** TXT
- **Naming:** `{TEST-ID}-logs-{timestamp}.txt`
- **Purpose:** Console output and debug information

### 3. Network Activity
- **Format:** JSON
- **Naming:** `{TEST-ID}-network-{timestamp}.json`
- **Purpose:** HTTP requests/responses during test execution

### 4. File Structure
- **Format:** JSON
- **Naming:** `{TEST-ID}-filestructure-{timestamp}.json`
- **Purpose:** Verification of file system state

### 5. Evidence Report
- **Format:** JSON
- **Naming:** `evidence-report.json`
- **Purpose:** Comprehensive report of all evidence for a test

## Evidence Retention

- Evidence is stored indefinitely by default
- Old evidence can be cleaned up manually
- Evidence directories can be archived for long-term storage

## Accessing Evidence

Evidence can be accessed:
1. Directly from the file system
2. Through the evidence report JSON file
3. Via links in HTML test reports
4. Through the evidence package (zip file)

## Evidence Package

Each test can generate an evidence package containing:
- All screenshots
- All logs
- All network traces
- All metadata
- Package manifest file

Generate a package:
```bash
npm run uat:evidence
```

## Storage Considerations

- Evidence files can grow large over time
- Screenshots are the largest files
- Consider implementing cleanup policies
- Archive old evidence periodically

## Security & Privacy

- Evidence may contain sensitive information
- Do not commit evidence to version control
- Sanitize evidence before sharing
- Follow data retention policies

## Troubleshooting

### Evidence Directory Not Created

If evidence directory is not created:
1. Check test initialization
2. Verify EvidenceCollector is properly instantiated
3. Check file system permissions

### Evidence Files Missing

If evidence files are missing:
1. Check if test completed successfully
2. Verify evidence capture calls in test
3. Check for file system errors in logs

### Large Evidence Directories

To manage large directories:
1. Archive old evidence
2. Implement cleanup scripts
3. Use evidence packages for archival

## Best Practices

1. **Regular Cleanup**
   - Remove old evidence periodically
   - Keep recent test runs only

2. **Selective Collection**
   - Collect evidence only when needed
   - Balance detail vs. storage

3. **Organized Storage**
   - One directory per test ID
   - Consistent naming conventions

4. **Documentation**
   - Document what each evidence file contains
   - Include context in evidence reports

---

*Part of MergePRCockPit UAT Testing Framework*
