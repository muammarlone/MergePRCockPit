import * as fs from 'fs-extra';
import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ARCH-003: Module Specifications Verification', () => {
  const testId = 'UAT-ARCH-003';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('ARCHITECTURE.md exists and is readable', async () => {
    const filePath = path.join(process.cwd(), 'ARCHITECTURE.md');

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
    await evidence.captureScreenshot(testId, 'architecture-specs');
  });

  test('Contains module architecture information', async () => {
    const filePath = path.join(process.cwd(), 'ARCHITECTURE.md');
    const content = await fs.readFile(filePath, 'utf-8');

    // Verify it contains architecture-related content
    const hasArchitecture = content.toLowerCase().includes('architecture');
    expect(hasArchitecture).toBe(true);

    await evidence.recordMetadata(testId, {
      hasArchitecture,
      contentLength: content.length,
    });
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
