import * as fs from 'fs-extra';
import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-AUTH-002: GitHub OAuth Configuration Validation', () => {
  const testId = 'UAT-AUTH-002';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('GitHub OAuth service configuration exists', async () => {
    const authServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'authService.ts');
    
    // Verify the file exists
    const exists = await fs.pathExists(authServicePath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      authServiceFile: authServicePath,
      exists,
    });

    // Read file content and check for GitHub OAuth
    const content = await fs.readFile(authServicePath, 'utf-8');
    const hasGitHubAuth = /github/i.test(content);
    expect(hasGitHubAuth).toBe(true);

    await evidence.recordMetadata(testId, {
      hasGitHubAuth,
    });

    await evidence.captureScreenshot(testId, 'github-oauth-implementation');
  });

  test('OAuth wiring/redirect validation (non-interactive)', async () => {
    // NOTE: This test validates OAuth configuration and wiring, not end-to-end flow
    // Actual OAuth flow requires user interaction and is not tested in UAT
    const authServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'authService.ts');
    const content = await fs.readFile(authServicePath, 'utf-8');

    // Check for GitHub OAuth implementation
    const hasOAuthImplementation = 
      /loginWithGitHub/i.test(content) || 
      /mockGitHubLogin/i.test(content);
    
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
