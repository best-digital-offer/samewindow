export type RunStatus = 'SUCCESS' | 'FAILED' | 'RUNNING';

export type EventType =
  | 'USER_INPUT'
  | 'MODEL_CALL'
  | 'TOOL_CALL'
  | 'ERROR'
  | 'FINAL_RESPONSE'
  | 'CUSTOM';

export interface ToolCallData {
  toolName: string;
  arguments: Record<string, any>;
  response: any;
  status: number | string;
  latencyMs: number;
}

export interface ModelCallData {
  model: string;
  inputTokens: number;
  outputTokens: number;
  temperature?: number;
  latencyMs: number;
  promptPreview?: string;
  responsePreview?: string;
}

export interface ErrorEventData {
  errorType: string;
  statusCode?: number;
  message: string;
  stack?: string;
  culpritTool?: string;
}

export interface RunEvent {
  id: string;
  runId: string;
  timestamp: string;
  offsetMs: number;
  type: EventType;
  title: string;
  status?: 'OK' | 'ERROR' | 'WARN' | 'PENDING';
  statusCode?: number;
  durationMs?: number;
  data: {
    userInput?: string;
    modelCall?: ModelCallData;
    toolCall?: ToolCallData;
    error?: ErrorEventData;
    finalResponse?: string;
    raw?: any;
    [key: string]: any;
  };
}

export interface Run {
  id: string;
  projectId: string;
  agentName: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model: string;
  environment: 'production' | 'staging' | 'development';
  tags?: string[];
  errorMessage?: string;
  isDemo?: boolean;
  events: RunEvent[];
}

export interface AIAnalysisResult {
  summary: string;
  first_failure: string;
  likely_cause: string;
  evidence: string[];
  recommended_next_steps: string[];
  provider: 'groq' | 'gemini' | 'heuristic';
  modelUsed: string;
  analyzedAt: string;
}

export interface ComparisonDivergence {
  indexA: number;
  indexB: number;
  eventA: RunEvent;
  eventB: RunEvent;
  divergenceType: 'STATUS_MISMATCH' | 'TOOL_PAYLOAD' | 'ERROR_ENCOUNTERED' | 'EVENT_MISSING';
  description: string;
}

export interface RunComparisonResult {
  runA: Run;
  runB: Run;
  divergence: ComparisonDivergence | null;
  durationDiffMs: number;
  tokenDiff: number;
  costDiff: number;
  explanation?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  environment: 'production' | 'staging' | 'development';
  createdAt: string;
  redactionKeys: string[];
  retentionDays: number;
}

export interface ApiKey {
  id: string;
  projectId: string;
  name: string;
  prefix: string; // e.g. sw_live_83...10b
  createdAt: string;
  lastUsedAt?: string;
  token?: string; // only present in memory right after creation
}

export interface UserSubscription {
  planId: 'free' | 'developer' | 'pro' | 'team';
  planName: string;
  monthlyCost: number;
  runsLimit: number;
  runsUsed: number;
  analysesLimit: number;
  analysesUsed: number;
  storageLimitGb: number;
  storageUsedGb: number;
  retentionDays: number;
  status: 'active' | 'past_due' | 'canceled';
}
