import { Repository } from '../types';

const WORKSPACE_STORAGE_KEY = 'mergePR_workspace';
const RECENT_REPOS_KEY = 'mergePR_recent_repos';
const MAX_RECENT_REPOS = 10;

export interface WorkspaceSettings {
  lastOwner?: string;
  lastRepository?: Repository;
  recentRepositories?: Array<{
    owner: string;
    repo: Repository;
    lastAccessed: number;
  }>;
}

class WorkspaceService {
  private settings: WorkspaceSettings = {};

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load workspace settings:', error);
      this.settings = {};
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save workspace settings:', error);
    }
  }

  setLastRepository(owner: string, repo: Repository): void {
    this.settings.lastOwner = owner;
    this.settings.lastRepository = repo;
    this.addToRecentRepositories(owner, repo);
    this.saveSettings();
  }

  getLastOwner(): string | undefined {
    return this.settings.lastOwner;
  }

  getLastRepository(): Repository | undefined {
    return this.settings.lastRepository;
  }

  private addToRecentRepositories(owner: string, repo: Repository): void {
    if (!this.settings.recentRepositories) {
      this.settings.recentRepositories = [];
    }

    // Remove if already exists
    this.settings.recentRepositories = this.settings.recentRepositories.filter(
      r => !(r.owner === owner && r.repo.id === repo.id)
    );

    // Add to front
    this.settings.recentRepositories.unshift({
      owner,
      repo,
      lastAccessed: Date.now(),
    });

    // Keep only MAX_RECENT_REPOS
    if (this.settings.recentRepositories.length > MAX_RECENT_REPOS) {
      this.settings.recentRepositories = this.settings.recentRepositories.slice(0, MAX_RECENT_REPOS);
    }

    this.saveSettings();
  }

  getRecentRepositories(): Array<{ owner: string; repo: Repository; lastAccessed: number }> {
    return this.settings.recentRepositories || [];
  }

  clearWorkspace(): void {
    this.settings = {};
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }
}

export const workspaceService = new WorkspaceService();
