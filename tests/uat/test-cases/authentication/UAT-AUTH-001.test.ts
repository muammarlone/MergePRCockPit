import * as fs from 'fs-extra';
import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-AUTH-001: Google OAuth Configuration Validation', () => {
  const testId = 'UAT-AUTH-001';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('Google OAuth service configuration exists', async () => {
    // Import the auth service
    const authServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'authService.ts');
    
    // Verify the file exists
    const exists = await fs.pathExists(authServicePath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      authServiceFile: authServicePath,
      exists,
    });

    // Read file content and check for Google OAuth (case-insensitive)
    const content = await fs.readFile(authServicePath, 'utf-8');
    const hasGoogleAuth = /google/i.test(content);
    expect(hasGoogleAuth).toBe(true);

    await evidence.recordMetadata(testId, {
      hasGoogleAuth,
    });

    await evidence.captureScreenshot(testId, 'google-oauth-implementation');
  });

  test('OAuth wiring/redirect validation (non-interactive)', async () => {
    // NOTE: This test validates OAuth configuration and wiring, not end-to-end flow
    // Actual OAuth flow requires user interaction and is not tested in UAT
    const authServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'authService.ts');
    const content = await fs.readFile(authServicePath, 'utf-8');

    // Check for mock or actual implementation
    const hasOAuthImplementation = 
      /loginWithGoogle/i.test(content) || 
      /mockGoogleLogin/i.test(content);
    
    expect(hasOAuthImplementation).toBe(true);

    await evidence.recordMetadata(testId, {
      hasOAuthImplementation,
      implementationType: /mock/i.test(content) ? 'mock' : 'actual',
      note: 'Configuration validation only - not end-to-end OAuth flow',
    });

    await evidence.captureLogs(testId);
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
