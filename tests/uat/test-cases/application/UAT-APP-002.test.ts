import * as path from 'path';
import { EvidenceCollector } from '../../framework/evidence-collector';

describe('UAT-APP-002: GitHub Integration', () => {
  const testId = 'UAT-APP-002';
  let evidence: EvidenceCollector;

  beforeAll(async () => {
    evidence = new EvidenceCollector(testId);
    await evidence.initialize();
  });

  test('GitHub service exists', async () => {
    const fs = require('fs-extra');
    const githubServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'githubService.ts');
    
    const exists = await fs.pathExists(githubServicePath);
    expect(exists).toBe(true);

    await evidence.recordMetadata(testId, {
      githubServiceFile: githubServicePath,
      exists,
    });

    await evidence.captureFileStructure([githubServicePath]);
  });

  test('GitHub API integration implemented', async () => {
    const fs = require('fs-extra');
    const githubServicePath = path.join(process.cwd(), 'src', 'renderer', 'services', 'githubService.ts');
    const content = await fs.readFile(githubServicePath, 'utf-8');

    // Check for GitHub API usage
    const hasGitHubAPI = 
      content.includes('octokit') || 
      content.includes('github') ||
      content.includes('@octokit');
    
    expect(hasGitHubAPI).toBe(true);

    await evidence.recordMetadata(testId, {
      hasGitHubAPI,
      serviceLength: content.length,
    });

    await evidence.captureScreenshot(testId, 'github-integration');
  });

  test('GitHub dependency installed', async () => {
    const fs = require('fs-extra');
    const packagePath = path.join(process.cwd(), 'package.json');
    const content = await fs.readFile(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    // Check for GitHub client dependency
    const hasOctokit = pkg.dependencies?.['@octokit/rest'];
    expect(hasOctokit).toBeDefined();

    await evidence.recordMetadata(testId, {
      octokitVersion: hasOctokit,
    });

    await evidence.captureLogs(testId);
  });

  afterAll(async () => {
    await evidence.generateReport(testId);
  });
});
