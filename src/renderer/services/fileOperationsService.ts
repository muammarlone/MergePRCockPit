import { FileOperation, FileOperationResult } from '../types';
import { Octokit } from '@octokit/rest';
import { authService } from './authService';

// File signature magic numbers for validation
const FILE_SIGNATURES = {
  zip: [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]],
  docx: [[0x50, 0x4B, 0x03, 0x04]], // docx is a zip file
  pptx: [[0x50, 0x4B, 0x03, 0x04]], // pptx is a zip file
  xlsx: [[0x50, 0x4B, 0x03, 0x04]]  // xlsx is a zip file
};

class FileOperationsService {
  private octokit: Octokit | null = null;

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
   * Upload a file (zip, docx, pptx, etc.) to a repository
   */
  async uploadFile(
    owner: string,
    repo: string,
    branch: string,
    path: string,
    content: string | Buffer,
    message: string,
    fileType: 'zip' | 'docx' | 'pptx' | 'xlsx' | 'other'
  ): Promise<FileOperationResult> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      // Validate file type and size
      const validation = this.validateFile(content, fileType);
      if (!validation.valid) {
        return {
          success: false,
          message: 'File validation failed',
          error: validation.error
        };
      }

      // Calculate checksum for integrity
      const checksum = this.calculateChecksum(content);

      // Convert content to base64 if it's a buffer
      const base64Content = Buffer.isBuffer(content) 
        ? content.toString('base64')
        : Buffer.from(content).toString('base64');

      // Check if file exists to get current SHA
      let sha: string | undefined;
      try {
        const existing = await this.octokit!.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        
        if ('sha' in existing.data) {
          sha = existing.data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay for new uploads
      }

      // Create or update file
      const response = await this.octokit!.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: base64Content,
        branch,
        sha // Include sha if updating existing file
      });

      const fileOperation: FileOperation = {
        id: response.data.commit.sha || '',
        filename: path.split('/').pop() || path,
        fileType,
        size: Buffer.byteLength(base64Content, 'base64'),
        checksum,
        uploadedAt: new Date().toISOString(),
        uploadedBy: authService.getCurrentUser()?.email || 'unknown',
        version: sha ? 2 : 1, // Increment version if updating
        repository: `${owner}/${repo}`,
        branch
      };

      return {
        success: true,
        message: 'File uploaded successfully',
        fileOperation
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      return {
        success: false,
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Download a file from a repository
   */
  async downloadFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<FileOperationResult> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      const response = await this.octokit!.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(response.data) || !('content' in response.data)) {
        return {
          success: false,
          message: 'Path is a directory or content not available',
          error: 'Invalid file path'
        };
      }

      const content = Buffer.from(response.data.content, 'base64');
      const checksum = this.calculateChecksum(content);

      // Determine file type from extension
      const fileType = this.getFileTypeFromPath(path);

      const fileOperation: FileOperation = {
        id: response.data.sha,
        filename: path.split('/').pop() || path,
        fileType,
        size: response.data.size,
        checksum,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'downloaded',
        version: 1,
        repository: `${owner}/${repo}`,
        branch: ref || 'main'
      };

      return {
        success: true,
        message: 'File downloaded successfully',
        fileOperation
      };
    } catch (error) {
      console.error('Failed to download file:', error);
      return {
        success: false,
        message: 'Failed to download file',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * List files in a repository with specific extensions
   */
  async listFiles(
    owner: string,
    repo: string,
    path: string = '',
    extensions: string[] = ['.zip', '.docx', '.pptx', '.xlsx']
  ): Promise<FileOperation[]> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      const response = await this.octokit!.repos.getContent({
        owner,
        repo,
        path
      });

      if (!Array.isArray(response.data)) {
        return [];
      }

      const files: FileOperation[] = [];

      for (const item of response.data) {
        if (item.type === 'file') {
          const ext = '.' + item.name.split('.').pop()?.toLowerCase();
          if (extensions.includes(ext)) {
            files.push({
              id: item.sha,
              filename: item.name,
              fileType: this.getFileTypeFromPath(item.name),
              size: item.size,
              checksum: '', // Would need to download to calculate
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'system',
              version: 1,
              repository: `${owner}/${repo}`,
              branch: 'main'
            });
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    content: string | Buffer,
    fileType: string
  ): { valid: boolean; error?: string } {
    // Maximum file size: 100MB
    const MAX_SIZE = 100 * 1024 * 1024;
    const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content);

    if (size > MAX_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of 100MB`
      };
    }

    // Validate file type signatures (magic numbers)
    if (Buffer.isBuffer(content)) {
      const valid = this.validateFileSignature(content, fileType);
      if (!valid) {
        return {
          valid: false,
          error: 'File signature does not match declared file type'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate file signature (magic numbers) for security
   */
  private validateFileSignature(buffer: Buffer, fileType: string): boolean {
    // Check magic numbers for common file types
    const typeSignatures = FILE_SIGNATURES[fileType as keyof typeof FILE_SIGNATURES];
    if (!typeSignatures) {
      return true; // Unknown type, skip validation
    }

    return typeSignatures.some(sig => {
      return sig.every((byte, index) => buffer[index] === byte);
    });
  }

  /**
   * Calculate checksum for file integrity
   * NOTE: This is a simple implementation for demonstration.
   * For production use, implement proper cryptographic hashing using crypto.createHash('sha256')
   */
  private calculateChecksum(content: string | Buffer): string {
    // Simple checksum implementation
    // TODO: Replace with crypto.createHash('sha256') for production
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    return sum.toString(16).padStart(8, '0');
  }

  /**
   * Get file type from file path
   */
  private getFileTypeFromPath(path: string): 'zip' | 'docx' | 'pptx' | 'xlsx' | 'other' {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'zip':
        return 'zip';
      case 'docx':
        return 'docx';
      case 'pptx':
        return 'pptx';
      case 'xlsx':
        return 'xlsx';
      default:
        return 'other';
    }
  }

  /**
   * Get file versioning history
   */
  async getFileHistory(
    owner: string,
    repo: string,
    path: string
  ): Promise<{ version: number; sha: string; date: string; author: string; message: string }[]> {
    if (!this.octokit) {
      this.initializeOctokit();
    }

    try {
      const response = await this.octokit!.repos.listCommits({
        owner,
        repo,
        path,
        per_page: 10
      });

      return response.data.map((commit, index) => ({
        version: response.data.length - index,
        sha: commit.sha,
        date: commit.commit.author?.date || '',
        author: commit.commit.author?.name || 'Unknown',
        message: commit.commit.message
      }));
    } catch (error) {
      console.error('Failed to get file history:', error);
      return [];
    }
  }
}

export const fileOperationsService = new FileOperationsService();
