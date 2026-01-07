import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ANALYTICS-004: File Operations', () => {
  const testId = 'UAT-ANALYTICS-004';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('File operations in analytics context', async () => {
    const fs = require('fs-extra');
    const analyticsPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'Analytics.tsx');
    
    const exists = await fs.pathExists(analyticsPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      analyticsFile: analyticsPath,
      exists,
    });

    await evidence.captureScreenshot(testId, 'analytics-file-operations');
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
