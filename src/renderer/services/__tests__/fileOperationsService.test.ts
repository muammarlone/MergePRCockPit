import { fileOperationsService } from '../fileOperationsService';

describe('FileOperationsService', () => {
  describe('performSecurityCheck', () => {
    test('should pass security check for valid file', () => {
      const operation = {
        type: 'upload' as const,
        fileName: 'document.docx',
        filePath: 'docs/document.docx',
        fileType: 'docx' as const,
        size: 5 * 1024 * 1024, // 5MB
        timestamp: new Date(),
        status: 'pending' as const,
      };

      const check = fileOperationsService.performSecurityCheck(operation);

      expect(check.passed).toBe(true);
      expect(check.issues).toHaveLength(0);
    });

    test('should fail for oversized file', () => {
      const operation = {
        type: 'upload' as const,
        fileName: 'large.zip',
        filePath: 'docs/large.zip',
        fileType: 'zip' as const,
        size: 150 * 1024 * 1024, // 150MB
        timestamp: new Date(),
        status: 'pending' as const,
      };

      const check = fileOperationsService.performSecurityCheck(operation);

      expect(check.passed).toBe(false);
      expect(check.issues.length).toBeGreaterThan(0);
      expect(check.issues[0]).toContain('exceeds maximum');
    });

    test('should fail for disallowed file type', () => {
      const operation = {
        type: 'upload' as const,
        fileName: 'script.exe',
        filePath: 'files/script.exe',
        fileType: 'other' as const,
        size: 1024,
        timestamp: new Date(),
        status: 'pending' as const,
      };

      const check = fileOperationsService.performSecurityCheck(operation);

      expect(check.passed).toBe(false);
      expect(check.issues.some(issue => issue.includes('not allowed') || issue.includes('Executable'))).toBe(true);
    });

    test('should warn for large files', () => {
      const operation = {
        type: 'upload' as const,
        fileName: 'presentation.pptx',
        filePath: 'docs/presentation.pptx',
        fileType: 'pptx' as const,
        size: 60 * 1024 * 1024, // 60MB
        timestamp: new Date(),
        status: 'pending' as const,
      };

      const check = fileOperationsService.performSecurityCheck(operation);

      expect(check.warnings.length).toBeGreaterThan(0);
      expect(check.warnings[0]).toContain('Large file size');
    });

    test('should warn for zip files', () => {
      const operation = {
        type: 'upload' as const,
        fileName: 'archive.zip',
        filePath: 'files/archive.zip',
        fileType: 'zip' as const,
        size: 10 * 1024 * 1024,
        timestamp: new Date(),
        status: 'pending' as const,
      };

      const check = fileOperationsService.performSecurityCheck(operation);

      expect(check.warnings.some(w => w.includes('malware'))).toBe(true);
    });

    test('should detect suspicious file names', () => {
      const operation = {
        type: 'upload' as const,
        fileName: '../../../etc/passwd',
        filePath: '../../../etc/passwd',
        fileType: 'other' as const,
        size: 1024,
        timestamp: new Date(),
        status: 'pending' as const,
      };

      const check = fileOperationsService.performSecurityCheck(operation);

      expect(check.passed).toBe(false);
      expect(check.issues.some(issue => issue.includes('Suspicious'))).toBe(true);
    });
  });

  describe('filterSupportedFiles', () => {
    test('should filter to only supported file types', () => {
      const files = [
        { name: 'doc.docx', path: 'docs/doc.docx', sha: 'abc', size: 1024, type: 'file', downloadUrl: '' },
        { name: 'slides.pptx', path: 'docs/slides.pptx', sha: 'def', size: 2048, type: 'file', downloadUrl: '' },
        { name: 'data.xlsx', path: 'docs/data.xlsx', sha: 'ghi', size: 1536, type: 'file', downloadUrl: '' },
        { name: 'readme.txt', path: 'readme.txt', sha: 'jkl', size: 512, type: 'file', downloadUrl: '' },
        { name: 'archive.zip', path: 'files/archive.zip', sha: 'mno', size: 4096, type: 'file', downloadUrl: '' },
      ];

      const filtered = fileOperationsService.filterSupportedFiles(files);

      expect(filtered).toHaveLength(4);
      expect(filtered.map(f => f.name)).toContain('doc.docx');
      expect(filtered.map(f => f.name)).toContain('slides.pptx');
      expect(filtered.map(f => f.name)).toContain('data.xlsx');
      expect(filtered.map(f => f.name)).toContain('archive.zip');
      expect(filtered.map(f => f.name)).not.toContain('readme.txt');
    });

    test('should handle empty file list', () => {
      const filtered = fileOperationsService.filterSupportedFiles([]);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getOperationHistory', () => {
    test('should return operation history', () => {
      const history = fileOperationsService.getOperationHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('verifyFileIntegrity', () => {
    test('should verify file integrity with valid content', () => {
      const result = fileOperationsService.verifyFileIntegrity('abc123', 'file content');
      
      expect(result).toBe(true);
    });

    test('should fail verification with null content', () => {
      const result = fileOperationsService.verifyFileIntegrity('abc123', null as any);
      
      expect(result).toBe(false);
    });

    test('should fail verification with undefined content', () => {
      const result = fileOperationsService.verifyFileIntegrity('abc123', undefined as any);
      
      expect(result).toBe(false);
    });
  });
});
