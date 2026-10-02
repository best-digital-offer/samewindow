import { ApiKey, Project, Run, UserSubscription } from '../types';
import { INITIAL_SAMPLE_RUNS } from './sampleData';

const STORAGE_KEYS = {
  PROJECTS: 'samewindow_projects',
  ACTIVE_PROJECT_ID: 'samewindow_active_project_id',
  API_KEYS: 'samewindow_api_keys',
  RUNS: 'samewindow_runs',
  SHOW_DEMO_RUNS: 'samewindow_show_demo_runs',
  USER_SESSION: 'samewindow_user_session',
  SUBSCRIPTION: 'samewindow_subscription',
};

const DEFAULT_PROJECT: Project = {
  id: 'proj_default',
  name: 'Default Agent Fleet',
  description: 'Production tool-calling agents and workflow telemetry',
  environment: 'production',
  createdAt: '2026-09-15T10:00:00.000Z',
  redactionKeys: ['email', 'password', 'apiKey', 'authorization', 'creditCard'],
  retentionDays: 30,
};

const DEFAULT_API_KEY: ApiKey = {
  id: 'key_prod_01',
  projectId: 'proj_default',
  name: 'Production Ingest Key',
  prefix: 'sw_live_4a82...9bc1',
  createdAt: '2026-09-15T10:05:00.000Z',
  lastUsedAt: '2026-10-01T14:32:18.000Z',
};

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  planId: 'developer',
  planName: 'Developer Plan',
  monthlyCost: 19,
  runsLimit: 25000,
  runsUsed: 3,
  analysesLimit: 500,
  analysesUsed: 1,
  storageLimitGb: 10,
  storageUsedGb: 0.14,
  retentionDays: 30,
  status: 'active',
};

export const Storage = {
  // Projects
  getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      const initial = [DEFAULT_PROJECT];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [DEFAULT_PROJECT];
    }
  },

  getActiveProjectId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    if (active) return active;
    const projects = this.getProjects();
    const id = projects[0]?.id || DEFAULT_PROJECT.id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    return id;
  },

  setActiveProjectId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  },

  createProject(name: string, description: string, environment: 'production' | 'staging' | 'development' = 'production'): Project {
    const projects = this.getProjects();
    const newProj: Project = {
      id: `proj_${Date.now().toString(36)}`,
      name,
      description,
      environment,
      createdAt: new Date().toISOString(),
      redactionKeys: ['email', 'password', 'apiKey', 'authorization', 'creditCard'],
      retentionDays: 30,
    };
    projects.push(newProj);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.setActiveProjectId(newProj.id);
    return newProj;
  },

  updateProject(updated: Project): void {
    const projects = this.getProjects().map((p) => (p.id === updated.id ? updated : p));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // API Keys
  getApiKeys(projectId?: string): ApiKey[] {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    let keys: ApiKey[] = [];
    if (!raw) {
      keys = [DEFAULT_API_KEY];
      localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
    } else {
      try {
        keys = JSON.parse(raw);
      } catch {
        keys = [DEFAULT_API_KEY];
      }
    }
    if (projectId) {
      return keys.filter((k) => k.projectId === projectId);
    }
    return keys;
  },

  createApiKey(projectId: string, name: string): { key: ApiKey; rawSecret: string } {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const rawSecret = `sw_live_${randomHex}`;
    const prefix = `sw_live_${rawSecret.slice(8, 12)}...${rawSecret.slice(-4)}`;

    const newKey: ApiKey = {
      id: `key_${Date.now().toString(36)}`,
      projectId,
      name,
      prefix,
      createdAt: new Date().toISOString(),
      token: rawSecret,
    };

    const keys = this.getApiKeys();
    // Do NOT store rawSecret in persistent storage, only prefix!
    const keyToStore: ApiKey = {
      id: newKey.id,
      projectId: newKey.projectId,
      name: newKey.name,
      prefix: newKey.prefix,
      createdAt: newKey.createdAt,
    };
    keys.unshift(keyToStore);
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));

    return { key: newKey, rawSecret };
  },

  revokeApiKey(keyId: string): void {
    const keys = this.getApiKeys().filter((k) => k.id !== keyId);
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  },

  // Demo runs flag
  getShowDemoRuns(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.SHOW_DEMO_RUNS);
    if (val === null) return true; // Default true so new visitors see rich flight recorder capabilities immediately
    return val === 'true';
  },

  setShowDemoRuns(show: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SHOW_DEMO_RUNS, String(show));
  },

  // Runs
  getRuns(projectId?: string): Run[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RUNS);
    let userRuns: Run[] = [];
    if (raw) {
      try {
        userRuns = JSON.parse(raw);
      } catch {
        userRuns = [];
      }
    }

    const showDemo = this.getShowDemoRuns();
    const demoRuns = showDemo ? INITIAL_SAMPLE_RUNS : [];

    let combined = [...userRuns, ...demoRuns];
    if (projectId) {
      combined = combined.filter((r) => r.projectId === projectId || r.isDemo);
    }
    return combined;
  },

  getRunById(runId: string): Run | undefined {
    const runs = this.getRuns();
    return runs.find((r) => r.id === runId);
  },

  saveRun(run: Run): void {
    const raw = localStorage.getItem(STORAGE_KEYS.RUNS);
    let userRuns: Run[] = [];
    if (raw) {
      try {
        userRuns = JSON.parse(raw);
      } catch {
        userRuns = [];
      }
    }
    const existingIndex = userRuns.findIndex((r) => r.id === run.id);
    if (existingIndex >= 0) {
      userRuns[existingIndex] = run;
    } else {
      userRuns.unshift(run);
    }
    localStorage.setItem(STORAGE_KEYS.RUNS, JSON.stringify(userRuns));
  },

  deleteRun(runId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.RUNS);
    if (!raw) return;
    try {
      const userRuns: Run[] = JSON.parse(raw);
      const filtered = userRuns.filter((r) => r.id !== runId);
      localStorage.setItem(STORAGE_KEYS.RUNS, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  // User auth state
  getUserSession(): { email: string; name: string } | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!raw) {
      // Default dev user session for instant seamless usability
      const defaultUser = { email: 'developer@samewindow.io', name: 'Dev Operator' };
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUserSession(session: { email: string; name: string } | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
    }
  },

  // Subscription / Usage
  getSubscription(): UserSubscription {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(DEFAULT_SUBSCRIPTION));
      return DEFAULT_SUBSCRIPTION;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SUBSCRIPTION;
    }
  },

  incrementAnalysisCount(): void {
    const sub = this.getSubscription();
    sub.analysesUsed += 1;
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  },
};
