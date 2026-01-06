import * as fs from 'fs-extra';
import * as path from 'path';
import { AuditLogger, AuditLogEntry } from './audit-logger';

export interface UATResult {
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  evidence?: string[];
  metadata?: any;
}

export class ReportGenerator {
  private reportsDir: string;
  private auditLogger: AuditLogger;

  constructor() {
    this.reportsDir = path.join(process.cwd(), 'tests', 'uat', 'reports');
    this.auditLogger = new AuditLogger();
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(this.reportsDir);
    await this.auditLogger.initialize();
  }

  /**
   * Generate HTML report
   */
  async generateHTML(results: UATResult[]): Promise<string> {
    const timestamp = new Date().toISOString();
    const htmlPath = path.join(this.reportsDir, `uat-report-${timestamp.replace(/[:.]/g, '-')}.html`);

    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;
    const totalTests = results.length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UAT Test Report - ${timestamp}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .summary-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card.passed {
      background-color: #d4edda;
      border: 2px solid #28a745;
    }
    .summary-card.failed {
      background-color: #f8d7da;
      border: 2px solid #dc3545;
    }
    .summary-card.skipped {
      background-color: #fff3cd;
      border: 2px solid #ffc107;
    }
    .summary-card.total {
      background-color: #d1ecf1;
      border: 2px solid #17a2b8;
    }
    .summary-card h2 {
      margin: 0;
      font-size: 36px;
    }
    .summary-card p {
      margin: 5px 0 0 0;
      font-size: 14px;
      font-weight: bold;
    }
    .test-results {
      margin-top: 30px;
    }
    .test-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #fafafa;
    }
    .test-item.passed {
      border-left: 5px solid #28a745;
    }
    .test-item.failed {
      border-left: 5px solid #dc3545;
    }
    .test-item.skipped {
      border-left: 5px solid #ffc107;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .test-id {
      font-weight: bold;
      font-size: 18px;
      color: #333;
    }
    .test-status {
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
    }
    .test-status.passed {
      background-color: #28a745;
      color: white;
    }
    .test-status.failed {
      background-color: #dc3545;
      color: white;
    }
    .test-status.skipped {
      background-color: #ffc107;
      color: white;
    }
    .test-name {
      color: #666;
      margin-bottom: 10px;
    }
    .test-duration {
      color: #999;
      font-size: 14px;
    }
    .test-error {
      background-color: #ffe6e6;
      border: 1px solid #ffcccc;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>UAT Test Report</h1>
    <p><strong>Generated:</strong> ${new Date(timestamp).toLocaleString()}</p>
    
    <div class="summary">
      <div class="summary-card total">
        <h2>${totalTests}</h2>
        <p>Total Tests</p>
      </div>
      <div class="summary-card passed">
        <h2>${passedTests}</h2>
        <p>Passed (${passRate}%)</p>
      </div>
      <div class="summary-card failed">
        <h2>${failedTests}</h2>
        <p>Failed</p>
      </div>
      <div class="summary-card skipped">
        <h2>${skippedTests}</h2>
        <p>Skipped</p>
      </div>
    </div>

    <div class="test-results">
      <h2>Test Results</h2>
      ${results.map(result => `
        <div class="test-item ${result.status}">
          <div class="test-header">
            <div class="test-id">${result.testId}</div>
            <div class="test-status ${result.status}">${result.status}</div>
          </div>
          <div class="test-name">${result.name}</div>
          <div class="test-duration">Duration: ${result.duration}ms</div>
          ${result.error ? `<div class="test-error">${this.escapeHtml(result.error)}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>MergePRCockPit UAT Testing Framework</p>
      <p>Generated at ${new Date(timestamp).toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    await fs.writeFile(htmlPath, html);
    return htmlPath;
  }

  /**
   * Generate Markdown summary
   */
  async generateMarkdown(results: UATResult[]): Promise<string> {
    const timestamp = new Date().toISOString();
    const mdPath = path.join(this.reportsDir, `uat-report-${timestamp.replace(/[:.]/g, '-')}.md`);

    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;
    const totalTests = results.length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0';

    const markdown = `# UAT Test Report

**Generated:** ${new Date(timestamp).toLocaleString()}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${totalTests} |
| Passed | ${passedTests} (${passRate}%) |
| Failed | ${failedTests} |
| Skipped | ${skippedTests} |

## Test Results

${results.map(result => `
### ${result.testId} - ${result.status.toUpperCase()}

**Test Name:** ${result.name}  
**Status:** ${result.status}  
**Duration:** ${result.duration}ms

${result.error ? `**Error:**\n\`\`\`\n${result.error}\n\`\`\`` : ''}

---
`).join('\n')}

## Footer

Report generated by MergePRCockPit UAT Testing Framework  
Timestamp: ${new Date(timestamp).toLocaleString()}
`;

    await fs.writeFile(mdPath, markdown);
    return mdPath;
  }

  /**
   * Generate audit trail report
   */
  async generateAuditTrail(results: UATResult[]): Promise<string> {
    const timestamp = new Date().toISOString();
    const auditPath = path.join(this.reportsDir, `audit-trail-${timestamp.replace(/[:.]/g, '-')}.md`);

    const entries = this.auditLogger.getEntries();
    
    const markdown = `# UAT Audit Trail

**Generated:** ${new Date(timestamp).toLocaleString()}

## Audit Log Entries

${entries.map(entry => `
### ${entry.timestamp}

- **Test ID:** ${entry.testId}
- **Action:** ${entry.action}
- **Status:** ${entry.status}
${entry.duration ? `- **Duration:** ${entry.duration}ms` : ''}
${entry.details ? `- **Details:** ${JSON.stringify(entry.details, null, 2)}` : ''}

---
`).join('\n')}

## Summary

Total audit entries: ${entries.length}

Report generated by MergePRCockPit UAT Testing Framework
`;

    await fs.writeFile(auditPath, markdown);
    return auditPath;
  }

  /**
   * Generate dashboard summary
   */
  async generateDashboard(): Promise<string> {
    const dashboardPath = path.join(this.reportsDir, 'dashboard.json');

    const auditEntries = this.auditLogger.getEntries();
    const testEntries = auditEntries.filter(e => e.action === 'test_completed');
    
    const dashboard = {
      timestamp: new Date().toISOString(),
      totalTests: testEntries.length,
      passed: testEntries.filter(e => e.status === 'passed').length,
      failed: testEntries.filter(e => e.status === 'failed').length,
      skipped: testEntries.filter(e => e.status === 'skipped').length,
      averageDuration: testEntries.length > 0 
        ? testEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / testEntries.length 
        : 0,
      recentTests: testEntries.slice(-10).map(e => ({
        testId: e.testId,
        status: e.status,
        duration: e.duration,
        timestamp: e.timestamp,
      })),
    };

    await fs.writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
    return dashboardPath;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
