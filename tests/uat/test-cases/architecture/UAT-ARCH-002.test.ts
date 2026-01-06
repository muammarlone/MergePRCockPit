import * as fs from 'fs-extra';
import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ARCH-002: Roadmap Documentation Verification', () => {
  const testId = 'UAT-ARCH-002';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('ROADMAP.md exists and is readable', async () => {
    const filePath = path.join(process.cwd(), 'ROADMAP.md');

    // Verify file exists
    const exists = await fs.pathExists(filePath);
    await evidence.recordMetadata(testId, { file: filePath, exists });
    expect(exists).toBe(true);

    // Capture file structure
    await evidence.captureFileStructure([filePath]);

    // Read and verify content
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);

    // Take evidence screenshot
    await evidence.captureScreenshot(testId, 'roadmap-file-structure');
  });

  test('Contains development phases', async () => {
    const filePath = path.join(process.cwd(), 'ROADMAP.md');
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for phase or release indicators (case insensitive)
    const hasPhases = 
      content.toLowerCase().includes('phase') || 
      content.toLowerCase().includes('milestone') ||
      content.toLowerCase().includes('release');
    expect(hasPhases).toBe(true);

    await evidence.recordMetadata(testId, {
      hasPhases,
      contentLength: content.length,
    });
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
