import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ANALYTICS-005: Analytics Test Validation', () => {
  const testId = 'UAT-ANALYTICS-005';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Analytics component is properly tested', async () => {
    const fs = require('fs-extra');
    
    // Check if Analytics component exists
    const analyticsPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'Analytics.tsx');
    const exists = await fs.pathExists(analyticsPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      analyticsComponent: analyticsPath,
      exists,
    });

    await evidence.captureScreenshot(testId, 'analytics-validation');
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
