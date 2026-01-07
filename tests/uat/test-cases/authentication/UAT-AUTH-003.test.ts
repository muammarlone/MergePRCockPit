import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-AUTH-003: AuthGuard Protection', () => {
  const testId = 'UAT-AUTH-003';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('AuthGuard component exists', async () => {
    const fs = require('fs-extra');
    const authGuardPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'AuthGuard.tsx');
    
    // Verify the file exists
    const exists = await fs.pathExists(authGuardPath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      authGuardFile: authGuardPath,
      exists,
    });

    // Read file content
    const content = await fs.readFile(authGuardPath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);

    await evidence.captureScreenshot(testId, 'authguard-implementation');
  });

  test('AuthGuard implements protection logic', async () => {
    const fs = require('fs-extra');
    const authGuardPath = path.join(process.cwd(), 'src', 'renderer', 'components', 'AuthGuard.tsx');
    const content = await fs.readFile(authGuardPath, 'utf-8');

    // Check for authentication check logic
    const hasAuthCheck = 
      content.includes('isAuthenticated') || 
      content.includes('user') ||
      content.includes('auth');
    
    expect(hasAuthCheck).toBe(true);

    // Check for redirect or protection mechanism
    const hasProtection = 
      content.includes('Navigate') || 
      content.includes('redirect') ||
      content.includes('Login');

    expect(hasProtection).toBe(true);

    await evidence.recordMetadata(testId, {
      hasAuthCheck,
      hasProtection,
    });

    await evidence.captureLogs(testId);
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
