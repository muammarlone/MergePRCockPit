import React, { useState, useEffect } from 'react';
import { FileOperation, FileOperationResult } from '../types';
import { fileOperationsService } from '../services/fileOperationsService';
import '../styles/FileOperations.css';

interface FileOperationsProps {
  repository: { owner: string; name: string };
}

export const FileOperations: React.FC<FileOperationsProps> = ({ repository }) => {
  const [files, setFiles] = useState<FileOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState('');
  const [uploadBranch, setUploadBranch] = useState('main');
  const [uploadMessage, setUploadMessage] = useState('');
  const [result, setResult] = useState<FileOperationResult | null>(null);

  useEffect(() => {
    loadFiles();
  }, [repository]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await fileOperationsService.listFiles(
        repository.owner,
        repository.name
      );
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPath(file.name);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadPath || !uploadMessage) {
      setResult({
        success: false,
        message: 'Please fill all required fields',
        error: 'Missing required fields'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) {
          setResult({
            success: false,
            message: 'Failed to read file',
            error: 'File content is empty'
          });
          setLoading(false);
          return;
        }

        const fileType = getFileType(uploadFile.name);
        const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
        const uploadResult = await fileOperationsService.uploadFile(
          repository.owner,
          repository.name,
          uploadBranch,
          uploadPath,
          buffer,
          uploadMessage,
          fileType
        );

        setResult(uploadResult);
        if (uploadResult.success) {
          loadFiles();
          // Reset form
          setUploadFile(null);
          setUploadPath('');
          setUploadMessage('');
        }
        setLoading(false);
      };

      reader.onerror = () => {
        setResult({
          success: false,
          message: 'Failed to read file',
          error: 'File read error'
        });
        setLoading(false);
      };

      reader.readAsArrayBuffer(uploadFile);
    } catch (error) {
      console.error('Upload failed:', error);
      setResult({
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileOperation) => {
    setLoading(true);
    try {
      const result = await fileOperationsService.downloadFile(
        repository.owner,
        repository.name,
        file.filename
      );
      
      if (result.success) {
        setResult({
          success: true,
          message: `File ${file.filename} downloaded successfully`
        });
      } else {
        setResult(result);
      }
    } catch (error) {
      console.error('Download failed:', error);
      setResult({
        success: false,
        message: 'Download failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename: string): 'zip' | 'docx' | 'pptx' | 'xlsx' | 'other' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'zip': return 'zip';
      case 'docx': return 'docx';
      case 'pptx': return 'pptx';
      case 'xlsx': return 'xlsx';
      default: return 'other';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'zip': return '📦';
      case 'docx': return '📄';
      case 'pptx': return '📊';
      case 'xlsx': return '📈';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="file-operations">
      <h2>📁 File Operations</h2>
      <p className="subtitle">Upload and manage zip archives, documents, and presentations</p>

      <div className="operations-grid">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload File</h3>
          <div className="upload-form">
            <div className="form-group">
              <label>Select File</label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".zip,.docx,.pptx,.xlsx"
                disabled={loading}
              />
              {uploadFile && (
                <div className="file-info">
                  Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </div>
              )}
            </div>

            <div className="form-group">
              <label>File Path (in repository)</label>
              <input
                type="text"
                value={uploadPath}
                onChange={(e) => setUploadPath(e.target.value)}
                placeholder="docs/myfile.zip"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Branch</label>
              <input
                type="text"
                value={uploadBranch}
                onChange={(e) => setUploadBranch(e.target.value)}
                placeholder="main"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Commit Message</label>
              <input
                type="text"
                value={uploadMessage}
                onChange={(e) => setUploadMessage(e.target.value)}
                placeholder="Add file via MergePR Cockpit"
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading || !uploadFile}
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>

          {result && (
            <div className={`result-message ${result.success ? 'success' : 'error'}`}>
              {result.message}
              {result.error && <div className="error-detail">{result.error}</div>}
            </div>
          )}
        </div>

        {/* Files List Section */}
        <div className="files-section">
          <h3>Repository Files</h3>
          {loading && files.length === 0 ? (
            <div className="loading">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="empty-state">
              <p>No office files or archives found</p>
              <p className="subtitle">Upload a file to get started</p>
            </div>
          ) : (
            <div className="files-list">
              {files.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-icon">{getFileIcon(file.fileType)}</div>
                  <div className="file-info">
                    <div className="file-name">{file.filename}</div>
                    <div className="file-meta">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>v{file.version}</span>
                      {file.checksum && (
                        <>
                          <span>•</span>
                          <span title={`Checksum: ${file.checksum}`}>✓ Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => handleDownload(file)}
                      disabled={loading}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Information */}
      <div className="security-info">
        <h4>🔒 Security & Integrity</h4>
        <ul>
          <li>✓ File type validation using magic numbers</li>
          <li>✓ Maximum file size: 100MB</li>
          <li>✓ Checksum verification for integrity</li>
          <li>✓ Version tracking for all uploads</li>
          <li>✓ Secure GitHub API integration</li>
        </ul>
      </div>
    </div>
  );
};
