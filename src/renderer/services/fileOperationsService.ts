import { Octokit } from '@octokit/rest';
import { authService } from './authService';

export interface FileOperation {
  type: 'upload' | 'download';
  fileName: string;
  filePath: string;
  fileType: 'zip' | 'docx' | 'pptx' | 'xlsx' | 'pdf' | 'other';
  size: number;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface FileMetadata {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  downloadUrl: string;
}

export interface SecurityCheck {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

class FileOperationsService {
  private octokit: Octokit | null = null;
  private maxFileSize = 100 * 1024 * 1024; // 100MB limit
  private allowedExtensions = ['.zip', '.docx', '.pptx', '.xlsx', '.pdf', '.doc', '.ppt', '.xls'];

  constructor() {
    this.initializeOctokit();
  }

  private initializeOctokit(): void {
    const token = authService.getAccessToken();
    if (token && token.startsWith('github-')) {
      this.octokit = new Octokit({ auth: token });
    } else {
      this.octokit = new Octokit();
    }
  }

  /**
   * Upload file to repository
   */
  async uploadFile(
    owner: string,
    repo: string,
    filePath: string,
    content: string | ArrayBuffer,
    message: string,
    branch: string = 'main'
  ): Promise<FileOperation> {
    const operation: FileOperation = {
      type: 'upload',
      fileName: this.getFileName(filePath),
      filePath,
      fileType: this.getFileType(filePath),
      size: typeof content === 'string' ? content.length : content.byteLength,
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      // Security check
      const securityCheck = this.performSecurityCheck(operation);
      if (!securityCheck.passed) {
        operation.status = 'failed';
        operation.error = `Security check failed: ${securityCheck.issues.join(', ')}`;
        return operation;
      }

      // Validate file
      const validation = this.validateFile(operation);
      if (!validation.valid) {
        operation.status = 'failed';
        operation.error = validation.error;
        return operation;
      }

      if (!this.octokit) {
        this.initializeOctokit();
      }

      // Convert content to base64 if it's ArrayBuffer
      let base64Content: string;
      if (content instanceof ArrayBuffer) {
        base64Content = this.arrayBufferToBase64(content);
      } else {
        base64Content = btoa(content);
      }

      // Check if file exists
      let sha: string | undefined;
      try {
        const { data } = await this.octokit!.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branch
        });
        
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
      }

      // Create or update file
      await this.octokit!.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message,
        content: base64Content,
        branch,
        ...(sha && { sha })
      });

      operation.status = 'success';
    } catch (error) {
      console.error('Failed to upload file:', error);
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return operation;
  }

  /**
   * Download file from repository
   */
  async downloadFile(
    owner: string,
    repo: string,
    filePath: string,
    branch: string = 'main'
  ): Promise<FileOperation & { content?: string | ArrayBuffer }> {
    const operation: FileOperation = {
      type: 'download',
      fileName: this.getFileName(filePath),
      filePath,
      fileType: this.getFileType(filePath),
      size: 0,
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      if (!this.octokit) {
        this.initializeOctokit();
      }

      const { data } = await this.octokit!.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch
      });

      if (Array.isArray(data) || !('content' in data)) {
        throw new Error('Path is a directory, not a file');
      }

      const content = data.content;
      const decodedContent = atob(content.replace(/\n/g, ''));
      
      operation.size = data.size;
      operation.status = 'success';

      return {
        ...operation,
        content: decodedContent
      };
    } catch (error) {
      console.error('Failed to download file:', error);
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      return operation;
    }
  }

  /**
   * List files in repository path
   */
  async listFiles(
    owner: string,
    repo: string,
    path: string = '',
    branch: string = 'main'
  ): Promise<FileMetadata[]> {
    try {
      if (!this.octokit) {
        this.initializeOctokit();
      }

      const { data } = await this.octokit!.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });

      if (!Array.isArray(data)) {
        return [{
          name: data.name,
          path: data.path,
          sha: data.sha,
          size: data.size,
          type: data.type,
          downloadUrl: data.download_url || ''
        }];
      }

      return data.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        type: item.type,
        downloadUrl: (item as any).download_url || ''
      }));
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * Filter files by supported types
   */
  filterSupportedFiles(files: FileMetadata[]): FileMetadata[] {
    return files.filter(file => {
      const ext = this.getFileExtension(file.name);
      return this.allowedExtensions.includes(ext);
    });
  }

  /**
   * Perform security and integrity checks
   */
  performSecurityCheck(operation: FileOperation): SecurityCheck {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (operation.size > this.maxFileSize) {
      issues.push(`File size (${this.formatSize(operation.size)}) exceeds maximum allowed (${this.formatSize(this.maxFileSize)})`);
    }

    // Check file extension
    const ext = this.getFileExtension(operation.fileName);
    if (!this.allowedExtensions.includes(ext)) {
      issues.push(`File type ${ext} is not allowed`);
    }

    // Check for suspicious file names
    if (operation.fileName.includes('..') || operation.fileName.includes('~')) {
      issues.push('Suspicious file name detected');
    }

    // Check for executable extensions (should not be in office files)
    const dangerousExtensions = ['.exe', '.bat', '.sh', '.cmd', '.com', '.scr'];
    if (dangerousExtensions.some(ext => operation.fileName.toLowerCase().endsWith(ext))) {
      issues.push('Executable file type detected');
    }

    // Warnings for large files
    if (operation.size > 50 * 1024 * 1024) {
      warnings.push('Large file size may affect performance');
    }

    // Warning for certain file types
    if (ext === '.zip') {
      warnings.push('Zip files will not be scanned for malware - ensure source is trusted');
    }

    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate file before upload
   */
  private validateFile(operation: FileOperation): { valid: boolean; error?: string } {
    if (operation.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    if (!operation.fileName) {
      return { valid: false, error: 'File name is required' };
    }

    if (operation.filePath.length > 255) {
      return { valid: false, error: 'File path too long' };
    }

    return { valid: true };
  }

  /**
   * Get file type from extension
   */
  private getFileType(filePath: string): FileOperation['fileType'] {
    const ext = this.getFileExtension(filePath).toLowerCase();
    
    if (ext === '.zip') return 'zip';
    if (ext === '.docx' || ext === '.doc') return 'docx';
    if (ext === '.pptx' || ext === '.ppt') return 'pptx';
    if (ext === '.xlsx' || ext === '.xls') return 'xlsx';
    if (ext === '.pdf') return 'pdf';
    
    return 'other';
  }

  /**
   * Extract file name from path
   */
  private getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  /**
   * Get file extension
   */
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }

  /**
   * Format file size for display
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Get operation history (placeholder for future implementation)
   */
  getOperationHistory(): FileOperation[] {
    // In real implementation, would retrieve from local storage or database
    return [];
  }

  /**
   * Verify file integrity after download
   */
  verifyFileIntegrity(
    originalSha: string,
    downloadedContent: string | ArrayBuffer
  ): boolean {
    // In real implementation, would calculate SHA and compare
    // For now, basic validation
    return downloadedContent !== null && downloadedContent !== undefined;
  }
}

export const fileOperationsService = new FileOperationsService();
