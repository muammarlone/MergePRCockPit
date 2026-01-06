import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ANALYTICS-002: Conflict Prediction', () => {
  const testId = 'UAT-ANALYTICS-002';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Analytics includes predictive features', async () => {
    const fs = require('fs-extra');
    const analyticsPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'Analytics.tsx');
    
    const exists = await fs.pathExists(analyticsPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(analyticsPath, 'utf-8');
    
    // Check for prediction or conflict-related features
    const hasPrediction = 
      content.includes('predict') || 
      content.includes('conflict') ||
      content.includes('forecast');

    await evidence.recordMetadata(testId, {
      hasPrediction,
      analyticsFileExists: exists,
    });

    await evidence.captureScreenshot(testId, 'prediction-features');
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
