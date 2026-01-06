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

// Electron API types
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getAuthToken: () => Promise<any>;
      setAuthToken: (token: string) => Promise<boolean>;
      clearAuthToken: () => Promise<boolean>;
      oauthGoogle: () => Promise<OAuthTokenResponse>;
      oauthGitHub: () => Promise<OAuthTokenResponse>;
      getUserInfo: (accessToken: string, provider: string) => Promise<UserInfo>;
    };
  }
}
