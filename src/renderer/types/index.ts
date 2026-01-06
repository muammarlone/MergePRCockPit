export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'email';
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  url: string;
  private: boolean;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at?: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  body: string;
  html_url: string;
  mergeable?: boolean;
  comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface RepositoryMetrics {
  totalPRs: number;
  openPRs: number;
  mergedPRs: number;
  closedPRs: number;
  avgMergeTime: number;
  mergeConflicts: number;
}

export interface OllamaAnalysis {
  summary: string;
  suggestedTitle?: string;
  riskAssessment: 'low' | 'medium' | 'high';
  suggestedReviewers: string[];
  potentialIssues: string[];
  suggestions: string[];
}

// Enhanced Analytics Types
export interface TrendData {
  date: string;
  openPRs: number;
  mergedPRs: number;
  conflictPRs: number;
}

export interface PredictiveMetrics {
  conflictProbability: number;
  estimatedMergeTime: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface EnhancedMetrics extends RepositoryMetrics {
  trends: TrendData[];
  conflictTrend: 'increasing' | 'decreasing' | 'stable';
  velocityTrend: 'improving' | 'declining' | 'stable';
  healthScore: number;
}

// Merge Remediation Types
export interface ConflictAnalysis {
  hasConflicts: boolean;
  conflictFiles: string[];
  severity: 'low' | 'medium' | 'high';
  autoResolvable: boolean;
  suggestedActions: string[];
  aiRemediation?: string;
}

export interface RemediationSuggestion {
  type: 'rebase' | 'merge' | 'manual' | 'auto';
  description: string;
  steps: string[];
  confidence: number;
  estimatedTime: number;
}

// File Operations Types
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
