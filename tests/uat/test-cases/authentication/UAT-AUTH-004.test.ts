import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-AUTH-004: Authentication Test Suite Validation', () => {
  const testId = 'UAT-AUTH-004';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Authentication unit tests exist', async () => {
    const fs = require('fs-extra');
    const testPath = path.join(process.cwd(), 'src', 'renderer', 'services', '__tests__', 'authService.test.ts');
    
    // Verify the file exists
    const exists = await fs.pathExists(testPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      authTestFile: testPath,
      exists,
    });

    await evidence.captureFileStructure([testPath]);
  });

  test('OAuth test suite exists', async () => {
    const fs = require('fs-extra');
    const oauthTestPath = path.join(process.cwd(), 'src', 'renderer', 'services', '__tests__', 'authService.oauth.test.ts');
    
    // Verify the file exists
    const exists = await fs.pathExists(oauthTestPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      oauthTestFile: oauthTestPath,
      exists,
    });

    await evidence.captureFileStructure([oauthTestPath]);
  });

  test('AuthGuard tests exist', async () => {
    const fs = require('fs-extra');
    const authGuardTestPath = path.join(process.cwd(), 'src', 'renderer', 'components', '__tests__', 'AuthGuard.test.tsx');
    
    // Verify the file exists
    const exists = await fs.pathExists(authGuardTestPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      authGuardTestFile: authGuardTestPath,
      exists,
    });

    await evidence.captureScreenshot(testId, 'auth-test-suite');
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
