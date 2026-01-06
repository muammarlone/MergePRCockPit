import React, { useState, useEffect } from 'react';
import { Repository, FileMetadata, FileOperation } from '../types';
import { fileOperationsService } from '../services/fileOperationsService';
import '../styles/FileOperations.css';

interface FileOperationsProps {
  repository: Repository;
}

export const FileOperations: React.FC<FileOperationsProps> = ({ repository }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState<string>('');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [operations, setOperations] = useState<FileOperation[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, selectedBranch]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await fileOperationsService.listFiles(
        repository.owner.login,
        repository.name,
        '',
        selectedBranch
      );
      
      // Filter to show supported file types
      const supportedFiles = fileOperationsService.filterSupportedFiles(fileList);
      setFiles(supportedFiles);
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
      // Set default path if not set
      if (!uploadPath) {
        setUploadPath(`docs/${file.name}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadPath) {
      alert('Please select a file and specify a path');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (!content) return;

      const operation = await fileOperationsService.uploadFile(
        repository.owner.login,
        repository.name,
        uploadPath,
        content as ArrayBuffer,
        uploadMessage || `Upload ${uploadFile.name}`,
        selectedBranch
      );

      setOperations(prev => [operation, ...prev]);

      if (operation.status === 'success') {
        alert('File uploaded successfully!');
        setUploadFile(null);
        setUploadPath('');
        setUploadMessage('');
        loadFiles();
      } else {
        alert(`Upload failed: ${operation.error}`);
      }
    };

    reader.readAsArrayBuffer(uploadFile);
  };

  const handleDownload = async (file: FileMetadata) => {
    const operation = await fileOperationsService.downloadFile(
      repository.owner.login,
      repository.name,
      file.path,
      selectedBranch
    );

    setOperations(prev => [operation, ...prev]);

    if (operation.status === 'success' && 'content' in operation && operation.content) {
      // Create download link
      const blob = new Blob([operation.content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert(`Download failed: ${operation.error}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileName: string): string => {
    if (fileName.endsWith('.zip')) return '📦';
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return '📄';
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) return '📊';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return '📈';
    if (fileName.endsWith('.pdf')) return '📕';
    return '📁';
  };

  const getOperationStatusClass = (status: string): string => {
    if (status === 'success') return 'status-success';
    if (status === 'failed') return 'status-failed';
    return 'status-pending';
  };

  return (
    <div className="file-operations">
      <h2>📁 File Operations - {repository.name}</h2>

      {/* Branch Selector */}
      <div className="branch-selector">
        <label>Branch:</label>
        <input
          type="text"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          placeholder="main"
        />
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload File</h3>
        <div className="upload-form">
          <div className="form-group">
            <label>Select File (zip, docx, pptx, xlsx, pdf):</label>
            <input
              type="file"
              accept=".zip,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.pdf"
              onChange={handleFileSelect}
            />
            {uploadFile && (
              <div className="file-info">
                Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Destination Path:</label>
            <input
              type="text"
              value={uploadPath}
              onChange={(e) => setUploadPath(e.target.value)}
              placeholder="e.g., docs/myfile.docx"
            />
          </div>

          <div className="form-group">
            <label>Commit Message:</label>
            <input
              type="text"
              value={uploadMessage}
              onChange={(e) => setUploadMessage(e.target.value)}
              placeholder="Add document"
            />
          </div>

          <button 
            className="upload-button"
            onClick={handleUpload}
            disabled={!uploadFile || !uploadPath}
          >
            Upload File
          </button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <strong>🔒 Security:</strong> Files are scanned for size limits and type validation. 
          Max file size: 100MB. Only office documents and archives are allowed.
        </div>
      </div>

      {/* File List Section */}
      <div className="file-list-section">
        <h3>Repository Files (Supported Types)</h3>
        
        {loading ? (
          <div className="loading">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="no-files">
            No supported files found in this path. Upload files or change the path.
          </div>
        ) : (
          <div className="file-list">
            {files.map(file => (
              <div key={file.sha} className="file-item">
                <div className="file-icon">{getFileIcon(file.name)}</div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    {file.path} • {formatFileSize(file.size)}
                  </div>
                </div>
                <button 
                  className="download-button"
                  onClick={() => handleDownload(file)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operations History */}
      {operations.length > 0 && (
        <div className="operations-history">
          <h3>Recent Operations</h3>
          <div className="operations-list">
            {operations.slice(0, 10).map((op, index) => (
              <div key={index} className={`operation-item ${getOperationStatusClass(op.status)}`}>
                <div className="operation-icon">
                  {op.type === 'upload' ? '⬆️' : '⬇️'}
                </div>
                <div className="operation-details">
                  <div className="operation-name">
                    {op.type === 'upload' ? 'Uploaded' : 'Downloaded'}: {op.fileName}
                  </div>
                  <div className="operation-meta">
                    {formatFileSize(op.size)} • {op.timestamp.toLocaleString()}
                  </div>
                  {op.error && (
                    <div className="operation-error">Error: {op.error}</div>
                  )}
                </div>
                <div className={`operation-status ${op.status}`}>
                  {op.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <h3>ℹ️ File Operations Guide</h3>
        <ul>
          <li><strong>Upload:</strong> Select a file, specify destination path, and upload to repository</li>
          <li><strong>Download:</strong> Click download on any file to save it locally</li>
          <li><strong>Versioning:</strong> All uploads create commits with versioning in Git history</li>
          <li><strong>Supported Types:</strong> ZIP, DOCX, PPTX, XLSX, PDF, and legacy Office formats</li>
          <li><strong>Security:</strong> Files are validated for type and size before upload</li>
          <li><strong>Branches:</strong> Upload to specific branches using the branch selector</li>
        </ul>
      </div>
    </div>
  );
};
