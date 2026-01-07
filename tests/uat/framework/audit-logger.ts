import * as fs from 'fs-extra';
import * as path from 'path';

export interface AuditLogEntry {
  timestamp: string;
  testId: string;
  action: string;
  status: 'started' | 'passed' | 'failed' | 'skipped' | 'info';
  details?: any;
  duration?: number;
}

export class AuditLogger {
  private logPath: string;
  private entries: AuditLogEntry[] = [];

  constructor() {
    const logDir = path.join(process.cwd(), 'tests', 'uat', 'reports');
    this.logPath = path.join(logDir, 'audit-trail.json');
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(path.dirname(this.logPath));
    
    // Load existing audit trail if it exists
    if (await fs.pathExists(this.logPath)) {
      const content = await fs.readFile(this.logPath, 'utf-8');
      this.entries = JSON.parse(content);
    }
  }

  /**
   * Log a test action
   */
  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.entries.push(logEntry);
    await this.save();
  }

  /**
   * Log test start
   */
  async logTestStart(testId: string, details?: any): Promise<void> {
    await this.log({
      testId,
      action: 'test_started',
      status: 'started',
      details,
    });
  }

  /**
   * Log test completion
   */
  async logTestComplete(testId: string, status: 'passed' | 'failed' | 'skipped', duration: number, details?: any): Promise<void> {
    await this.log({
      testId,
      action: 'test_completed',
      status,
      duration,
      details,
    });
  }

  /**
   * Log suite execution
   */
  async logSuiteStart(suite: string, details?: any): Promise<void> {
    await this.log({
      testId: suite,
      action: 'suite_started',
      status: 'started',
      details,
    });
  }

  /**
   * Log suite completion
   */
  async logSuiteComplete(suite: string, status: 'passed' | 'failed', duration: number, results: any): Promise<void> {
    await this.log({
      testId: suite,
      action: 'suite_completed',
      status,
      duration,
      details: results,
    });
  }

  /**
   * Log general info
   */
  async logInfo(testId: string, action: string, details?: any): Promise<void> {
    await this.log({
      testId,
      action,
      status: 'info',
      details,
    });
  }

  /**
   * Save audit trail to disk
   */
  private async save(): Promise<void> {
    await fs.writeFile(this.logPath, JSON.stringify(this.entries, null, 2));
  }

  /**
   * Get all audit entries
   */
  getEntries(): AuditLogEntry[] {
    return this.entries;
  }

  /**
   * Get entries for a specific test
   */
  getTestEntries(testId: string): AuditLogEntry[] {
    return this.entries.filter(entry => entry.testId === testId);
  }

  /**
   * Get entries within a time range
   */
  getEntriesInRange(startTime: Date, endTime: Date): AuditLogEntry[] {
    return this.entries.filter(entry => {
      const entryTime = new Date(entry.timestamp);
      return entryTime >= startTime && entryTime <= endTime;
    });
  }

  /**
   * Clear audit trail
   */
  async clear(): Promise<void> {
    this.entries = [];
    await this.save();
  }
}
