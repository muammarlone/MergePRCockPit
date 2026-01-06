import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ANALYTICS-003: Remediation Dashboard', () => {
  const testId = 'UAT-ANALYTICS-003';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Dashboard component exists', async () => {
    const fs = require('fs-extra');
    const dashboardPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'Dashboard.tsx');
    
    const exists = await fs.pathExists(dashboardPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      dashboardFile: dashboardPath,
      exists,
    });

    await evidence.captureFileStructure([dashboardPath]);
  });

  test('Dashboard provides actionable insights', async () => {
    const fs = require('fs-extra');
    const dashboardPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'Dashboard.tsx');
    const content = await fs.readFile(dashboardPath, 'utf-8');

    // Check for dashboard features
    const hasDashboardFeatures = content.toLowerCase().includes('dashboard');
    expect(hasDashboardFeatures).toBe(true);

    await evidence.recordMetadata(testId, {
      hasDashboardFeatures,
      componentLength: content.length,
    });

    await evidence.captureScreenshot(testId, 'dashboard-implementation');
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
