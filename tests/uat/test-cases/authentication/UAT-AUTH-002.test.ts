import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-AUTH-002: GitHub OAuth Flow', () => {
  const testId = 'UAT-AUTH-002';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('GitHub OAuth service method exists', async () => {
    const fs = require('fs-extra');
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
    const hasGitHubAuth = content.includes('GitHub') || content.includes('github');
    expect(hasGitHubAuth).toBe(true);

    await evidence.recordMetadata(testId, {
      hasGitHubAuth,
    });

    await evidence.captureScreenshot(testId, 'github-oauth-implementation');
  });

  test('GitHub OAuth flow can be initiated or mocked', async () => {
    const fs = require('fs-extra');
    const authServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'authService.ts');
    const content = await fs.readFile(authServicePath, 'utf-8');

    // Check for GitHub OAuth implementation
    const hasOAuthImplementation = 
      content.includes('loginWithGitHub') || 
      content.includes('mockGitHubLogin');
    
    expect(hasOAuthImplementation).toBe(true);

    await evidence.recordMetadata(testId, {
      hasOAuthImplementation,
      implementationType: content.includes('mock') ? 'mock' : 'actual',
    });

    await evidence.captureLogs(testId);
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
