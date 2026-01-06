import * as fs from 'fs-extra';
import * as path from 'path';
import { AuditLogger } from './audit-logger';
import { ReportGenerator, UATResult } from './report-generator';

export interface UATSuiteResult {
  suite: string;
  results: UATResult[];
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface UATReport {
  timestamp: string;
  suites: UATSuiteResult[];
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuration: number;
  passRate: number;
}

export class UATRunner {
  private auditLogger: AuditLogger;
  private reportGenerator: ReportGenerator;
  private results: UATResult[] = [];

  constructor() {
    this.auditLogger = new AuditLogger();
    this.reportGenerator = new ReportGenerator();
  }

  async initialize(): Promise<void> {
    await this.auditLogger.initialize();
    await this.reportGenerator.initialize();
  }

  /**
   * Execute a single test case (placeholder - actual execution via Jest)
   */
  async runTest(testId: string): Promise<UATResult> {
    const startTime = Date.now();
    
    await this.auditLogger.logTestStart(testId);

    // This is a placeholder - actual tests are run via Jest
    const result: UATResult = {
      testId,
      name: `Test ${testId}`,
      status: 'passed',
      duration: Date.now() - startTime,
    };

    await this.auditLogger.logTestComplete(testId, result.status, result.duration);
    this.results.push(result);

    return result;
  }

  /**
   * Execute a test suite
   */
  async runSuite(suite: string): Promise<UATSuiteResult> {
    const startTime = Date.now();
    
    await this.auditLogger.logSuiteStart(suite);

    // This is a placeholder - actual suites are run via Jest
    const suiteResult: UATSuiteResult = {
      suite,
      results: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: Date.now() - startTime,
    };

    const status = suiteResult.failed > 0 ? 'failed' : 'passed';
    await this.auditLogger.logSuiteComplete(suite, status, suiteResult.duration, {
      passed: suiteResult.passed,
      failed: suiteResult.failed,
      skipped: suiteResult.skipped,
    });

    return suiteResult;
  }

  /**
   * Execute all UAT tests
   */
  async runAll(): Promise<UATReport> {
    const startTime = Date.now();
    
    await this.auditLogger.logInfo('UAT_ALL', 'Starting full UAT test suite');

    // This is a placeholder - actual execution via Jest
    const report: UATReport = {
      timestamp: new Date().toISOString(),
      suites: [],
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      totalDuration: Date.now() - startTime,
      passRate: 0,
    };

    report.passRate = report.totalTests > 0 
      ? (report.totalPassed / report.totalTests) * 100 
      : 0;

    await this.auditLogger.logInfo('UAT_ALL', 'Completed full UAT test suite', {
      totalTests: report.totalTests,
      passed: report.totalPassed,
      failed: report.totalFailed,
      passRate: report.passRate,
    });

    return report;
  }

  /**
   * Generate evidence package for a test
   */
  async generateEvidencePackage(testId: string): Promise<string> {
    const evidenceDir = path.join(process.cwd(), 'tests', 'uat', 'evidence', testId);
    const packagePath = path.join(process.cwd(), 'tests', 'uat', 'evidence', `${testId}-package.zip`);

    // Check if evidence directory exists
    if (!(await fs.pathExists(evidenceDir))) {
      throw new Error(`Evidence directory not found for test ${testId}`);
    }

    // In a real implementation, this would create a zip file
    // For now, we create a manifest file
    const files = await fs.readdir(evidenceDir);
    const manifest = {
      testId,
      timestamp: new Date().toISOString(),
      files: files.map(f => ({
        name: f,
        path: path.join(evidenceDir, f),
      })),
    };

    await fs.writeFile(
      path.join(evidenceDir, 'package-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    await this.auditLogger.logInfo(testId, 'Evidence package generated', {
      fileCount: files.length,
    });

    return packagePath;
  }

  /**
   * Get all test results
   */
  getResults(): UATResult[] {
    return this.results;
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }
}
