import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-APP-001: Application Startup', () => {
  const testId = 'UAT-APP-001';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Electron main process file exists', async () => {
    const fs = require('fs-extra');
    const mainPath = path.join(process.cwd(), 'src', 'electron', 'main.ts');
    
    const exists = await fs.pathExists(mainPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      mainProcessFile: mainPath,
      exists,
    });

    await evidence.captureFileStructure([mainPath]);
  });

  test('Application entry point configured', async () => {
    const fs = require('fs-extra');
    const packagePath = path.join(process.cwd(), 'package.json');
    const content = await fs.readFile(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    // Check main entry point
    expect(pkg.main).toBeDefined();
    expect(pkg.main).toContain('electron');

    await evidence.recordMetadata(testId, {
      mainEntryPoint: pkg.main,
      hasStartScript: !!pkg.scripts?.start,
    });

    await evidence.captureScreenshot(testId, 'app-configuration');
  });

  test('Renderer process configured', async () => {
    const fs = require('fs-extra');
    const indexPath = path.join(process.cwd(), 'src', 'renderer', 'index.tsx');
    
    const exists = await fs.pathExists(indexPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      rendererFile: indexPath,
      exists,
    });

    await evidence.captureLogs(testId);
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
