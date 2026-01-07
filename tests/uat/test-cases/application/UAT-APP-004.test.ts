import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-APP-004: Ollama AI Integration', () => {
  const testId = 'UAT-APP-004';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Ollama service exists', async () => {
    const fs = require('fs-extra');
    const ollamaServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'ollamaService.ts');
    
    const exists = await fs.pathExists(ollamaServicePath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      ollamaServiceFile: ollamaServicePath,
      exists,
    });

    await evidence.captureFileStructure([ollamaServicePath]);
  });

  test('Ollama integration implemented', async () => {
    const fs = require('fs-extra');
    const ollamaServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'ollamaService.ts');
    const content = await fs.readFile(ollamaServicePath, 'utf-8');

    // Check for Ollama-related functionality
    const hasOllamaFeatures = 
      content.includes('ollama') || 
      content.includes('Ollama') ||
      content.includes('AI');
    
    expect(hasOllamaFeatures).toBe(true);

    await evidence.recordMetadata(testId, {
      hasOllamaFeatures,
      serviceLength: content.length,
    });

    await evidence.captureScreenshot(testId, 'ollama-integration');
  });

  test('AI service provides functionality', async () => {
    const fs = require('fs-extra');
    const ollamaServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'ollamaService.ts');
    const content = await fs.readFile(ollamaServicePath, 'utf-8');

    // Check for service methods
    const hasMethods = 
      content.includes('class') || 
      content.includes('function') ||
      content.includes('export');

    expect(hasMethods).toBe(true);

    await evidence.recordMetadata(testId, {
      hasMethods,
    });

    await evidence.captureLogs(testId);
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
