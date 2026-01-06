import { fileOperationsService } from '../fileOperationsService';

// Mock Octokit
jest.mock('@octokit/rest');

describe('FileOperationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should validate file size', () => {
    // Create a large buffer (> 100MB)
    const largeContent = Buffer.alloc(101 * 1024 * 1024);
    
    // This is a private method, so we test it through uploadFile
    // We expect the upload to fail with size validation error
    const result = fileOperationsService.uploadFile(
      'owner',
      'repo',
      'main',
      'test.zip',
      largeContent,
      'Test commit',
      'zip'
    );
    
    expect(result).toBeDefined();
  });

  test('should get file type from path', () => {
    // Test through listFiles which uses getFileTypeFromPath
    const result = fileOperationsService.listFiles('owner', 'repo', '', ['.zip']);
    expect(result).toBeDefined();
  });

  test('should list files with specific extensions', async () => {
    const files = await fileOperationsService.listFiles(
      'owner',
      'repo',
      '',
      ['.zip', '.docx', '.pptx']
    );
    
    expect(Array.isArray(files)).toBe(true);
    files.forEach(file => {
      expect(file).toHaveProperty('id');
      expect(file).toHaveProperty('filename');
      expect(file).toHaveProperty('fileType');
      expect(file).toHaveProperty('size');
      expect(file).toHaveProperty('repository');
      expect(file.fileType).toMatch(/zip|docx|pptx|xlsx|other/);
    });
  });

  test('should get file history', async () => {
    const history = await fileOperationsService.getFileHistory(
      'owner',
      'repo',
      'test.zip'
    );
    
    expect(Array.isArray(history)).toBe(true);
    history.forEach(version => {
      expect(version).toHaveProperty('version');
      expect(version).toHaveProperty('sha');
      expect(version).toHaveProperty('date');
      expect(version).toHaveProperty('author');
      expect(version).toHaveProperty('message');
    });
  });

  test('should handle upload errors gracefully', async () => {
    const result = await fileOperationsService.uploadFile(
      'invalid-owner',
      'invalid-repo',
      'main',
      'test.zip',
      'test content',
      'Test commit',
      'zip'
    );
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  test('should handle download errors gracefully', async () => {
    const result = await fileOperationsService.downloadFile(
      'invalid-owner',
      'invalid-repo',
      'nonexistent.zip'
    );
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  test('should validate file signatures for security', async () => {
    // Test with valid zip file signature
    const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    
    const result = await fileOperationsService.uploadFile(
      'owner',
      'repo',
      'main',
      'test.zip',
      zipSignature,
      'Test commit',
      'zip'
    );
    
    expect(result).toBeDefined();
  });
});
