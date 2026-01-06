import * as fs from 'fs-extra';
import * as path from 'path';

export interface TestMetadata {
  [key: string]: any;
}

export interface EvidenceItem {
  type: 'screenshot' | 'log' | 'network' | 'filestructure' | 'metadata';
  timestamp: string;
  description: string;
  filePath?: string;
  data?: any;
}

/**
 * Patterns to redact sensitive information from evidence
 * IMPORTANT: More specific patterns should come before general ones
 */
const REDACTION_PATTERNS = [
  // JWT tokens (must come before Bearer tokens and general tokens)
  { pattern: /eyJ[A-Za-z0-9_\-]*\.eyJ[A-Za-z0-9_\-]*\.[A-Za-z0-9_\-]*/g, replacement: '[REDACTED_JWT]' },
  // Bearer tokens (must come before Authorization headers)
  { pattern: /Bearer\s+[A-Za-z0-9_\-\.]+/gi, replacement: 'Bearer [REDACTED]' },
  // Authorization headers (general fallback)
  { pattern: /(Authorization:\s*)(.+)/gi, replacement: '$1[REDACTED]' },
  // Cookie values (session cookies, auth cookies) - replace the entire cookie value
  { pattern: /(Set-Cookie|Cookie):\s*([^;\n]+)(.*)/gi, replacement: '$1: [REDACTED]' },
  // API Keys and Tokens - replace the entire value
  { pattern: /((?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token)[\s:=]+["']?)([A-Za-z0-9_\-\.]{20,})(["']?)/gi, replacement: '$1[REDACTED]$3' },
  // General token pattern (must come after more specific token patterns)
  { pattern: /((?:token)[\s:=]+["']?)([A-Za-z0-9_\-\.]{20,})(["']?)/gi, replacement: '$1[REDACTED]$3' },
  // Passwords - replace the value
  { pattern: /((?:password|passwd|pwd)[\s:=]+["']?)([^\s"']{6,})(["']?)/gi, replacement: '$1[REDACTED]$3' },
  // Secrets - replace the value
  { pattern: /((?:secret|client_secret)[\s:=]+["']?)([A-Za-z0-9_\-\.]{20,})(["']?)/gi, replacement: '$1[REDACTED]$3' },
  // OAuth tokens - replace the value
  { pattern: /((?:oauth|refresh_token|id_token)[\s:=]+["']?)([A-Za-z0-9_\-\.]{20,})(["']?)/gi, replacement: '$1[REDACTED]$3' },
];

/**
 * Sanitize sensitive data from text
 */
export function sanitizeText(text: string): string {
  let sanitized = text;
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * Sanitize sensitive data from objects
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Redact common sensitive keys
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || 
          lowerKey.includes('secret') || 
          lowerKey.includes('token') || 
          lowerKey.includes('key') ||
          lowerKey.includes('authorization') ||
          lowerKey.includes('cookie')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}

export class EvidenceCollector {
  private testId: string;
  private evidenceDir: string;
  private evidenceItems: EvidenceItem[] = [];
  private metadata: TestMetadata = {};

  constructor(testId: string) {
    this.testId = testId;
    this.evidenceDir = path.join(process.cwd(), 'tests', 'uat', 'evidence', testId);
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(this.evidenceDir);
  }

  /**
   * Capture a screenshot (simulated in non-GUI environment)
   * 
   * NOTE: This implementation creates placeholder files in non-GUI environments.
   * In a full Electron or browser environment, this should be replaced with
   * actual screenshot capture using Playwright or Puppeteer's screenshot() API.
   * 
   * Example for Playwright:
   *   await page.screenshot({ path: filePath });
   */
  async captureScreenshot(testId: string, description: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testId}-${description}-${timestamp}.png`;
    const filePath = path.join(this.evidenceDir, filename);

    // In a real implementation with GUI, this would capture actual screenshots
    // For now, we create a placeholder to demonstrate the framework
    await fs.writeFile(filePath, `Screenshot placeholder for ${description}`);

    this.evidenceItems.push({
      type: 'screenshot',
      timestamp: new Date().toISOString(),
      description,
      filePath: filename,
    });

    return filePath;
  }

  /**
   * Capture console logs with sanitization
   */
  async captureLogs(testId: string, rawLogs?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testId}-logs-${timestamp}.txt`;
    const filePath = path.join(this.evidenceDir, filename);

    // Capture and sanitize console logs
    const logs = rawLogs || `Test ID: ${testId}\nTimestamp: ${new Date().toISOString()}\n`;
    const sanitizedLogs = sanitizeText(logs);
    await fs.writeFile(filePath, sanitizedLogs);

    this.evidenceItems.push({
      type: 'log',
      timestamp: new Date().toISOString(),
      description: 'Console logs (sanitized)',
      filePath: filename,
    });

    return filePath;
  }

  /**
   * Capture network activity with header/cookie sanitization
   */
  async captureNetworkActivity(testId: string, networkData?: any): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testId}-network-${timestamp}.json`;
    const filePath = path.join(this.evidenceDir, filename);

    const data = networkData || {
      testId,
      timestamp: new Date().toISOString(),
      requests: [],
    };
    
    // Sanitize network data to remove sensitive headers/cookies
    const sanitizedData = sanitizeObject(data);
    await fs.writeFile(filePath, JSON.stringify(sanitizedData, null, 2));

    this.evidenceItems.push({
      type: 'network',
      timestamp: new Date().toISOString(),
      description: 'Network activity (sanitized)',
      filePath: filename,
    });

    return filePath;
  }

  /**
   * Capture file structure verification
   */
  async captureFileStructure(paths: string[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.testId}-filestructure-${timestamp}.json`;
    const filePath = path.join(this.evidenceDir, filename);

    const fileStructure = await Promise.all(
      paths.map(async (p) => {
        const exists = await fs.pathExists(p);
        let stats = null;
        if (exists) {
          stats = await fs.stat(p);
        }
        return {
          path: p,
          exists,
          isDirectory: stats?.isDirectory() || false,
          isFile: stats?.isFile() || false,
          size: stats?.size || 0,
        };
      })
    );

    await fs.writeFile(filePath, JSON.stringify(fileStructure, null, 2));

    this.evidenceItems.push({
      type: 'filestructure',
      timestamp: new Date().toISOString(),
      description: 'File structure verification',
      filePath: filename,
      data: fileStructure,
    });

    return filePath;
  }

  /**
   * Record test metadata with sanitization
   */
  async recordMetadata(testId: string, metadata: TestMetadata): Promise<void> {
    // Sanitize metadata before storing
    const sanitizedMetadata = sanitizeObject(metadata);
    this.metadata = { ...this.metadata, ...sanitizedMetadata };

    this.evidenceItems.push({
      type: 'metadata',
      timestamp: new Date().toISOString(),
      description: 'Test metadata (sanitized)',
      data: sanitizedMetadata,
    });
  }

  /**
   * Generate evidence report for this test with all data sanitized
   */
  async generateReport(testId: string): Promise<string> {
    const reportPath = path.join(this.evidenceDir, 'evidence-report.json');

    const report = {
      testId,
      timestamp: new Date().toISOString(),
      metadata: this.metadata,
      evidence: this.evidenceItems,
      sanitizationApplied: true,
      note: 'All sensitive data has been redacted from this report',
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return reportPath;
  }

  /**
   * Get all collected evidence
   */
  getEvidence(): EvidenceItem[] {
    return this.evidenceItems;
  }

  /**
   * Get test metadata
   */
  getMetadata(): TestMetadata {
    return this.metadata;
  }
}
