import * as fs from 'fs-extra';
import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-ARCH-001: Architecture Documentation Exists', () => {
  const testId = 'UAT-ARCH-001';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('ARCHITECTURE-FUTURE.md exists and is readable', async () => {
    const filePath = path.join(process.cwd(), 'ARCHITECTURE-FUTURE.md');

    // Verify file exists
    const exists = await fs.pathExists(filePath);
    await evidence.recordMetadata(testId, { file: filePath, exists });
    expect(exists).toBe(true);

    // Capture file structure
    await evidence.captureFileStructure([filePath]);

    // Read and verify content
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);

    // Verify key sections (case insensitive)
    expect(content.toLowerCase()).toContain('microservice');
    expect(content).toContain('TOGAF');

    // Take evidence screenshot (simulated)
    await evidence.captureScreenshot(testId, 'architecture-file-structure');
  });

  test('Contains all 6 microservices specifications', async () => {
    const filePath = path.join(process.cwd(), 'ARCHITECTURE-FUTURE.md');
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for the core 6 services (using flexible matching)
    const requiredServices = [
      { name: 'Git Operations', pattern: /git operations/i },
      { name: 'Issue Management', pattern: /issue (management|mgmt)/i },
      { name: 'PR Analytics', pattern: /pr analytics/i },
      { name: 'AI Assistants', pattern: /(ai assistants|ai core|ai-first)/i },
      { name: 'Trust Fabric', pattern: /trust fabric/i },
      { name: 'Plugin Engine', pattern: /(plugin (engine|framework)|extension api)/i },
    ];

    for (const service of requiredServices) {
      const found = service.pattern.test(content);
      expect(found).toBe(true);
      await evidence.recordMetadata(testId, {
        service: service.name,
        found,
      });
    }
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
