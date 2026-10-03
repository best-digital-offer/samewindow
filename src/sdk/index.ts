import { EventType, Run, RunEvent } from '../types';
import { redactData } from '../lib/redaction';

export interface SameWindowConfig {
  apiKey: string;
  projectId: string;
  endpoint?: string;
  captureInput?: boolean;
  captureOutput?: boolean;
  redact?: string[];
  batchSize?: number;
  flushIntervalMs?: number;
  disabled?: boolean;
  maxRetries?: number;
  retryBaseDelayMs?: number;
}

export class AgentRunRecorder {
  private run: Run;
  private client: SameWindow;
  private startTime: number;

  constructor(client: SameWindow, agentName: string, initialModel = 'default-model') {
    this.client = client;
    this.startTime = Date.now();
    this.run = {
      id: `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: client.config.projectId,
      agentName,
      status: 'RUNNING',
      startedAt: new Date(this.startTime).toISOString(),
      durationMs: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0,
      model: initialModel,
      environment: 'production',
      events: [],
    };
  }

  get id(): string {
    return this.run.id;
  }

  userInput(text: string): this {
    try {
      const sanitized = this.client.config.captureInput !== false
        ? redactData(text, this.client.config.redact)
        : '[CAPTURED_INPUT_DISABLED]';

      this.addEvent({
        type: 'USER_INPUT',
        title: 'User Input Received',
        status: 'OK',
        data: { userInput: sanitized },
      });
    } catch {
      // Safe failover
    }
    return this;
  }

  modelCall(params: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    temperature?: number;
    latencyMs?: number;
    promptPreview?: string;
    responsePreview?: string;
  }): this {
    try {
      this.run.model = params.model;
      this.run.inputTokens += params.inputTokens;
      this.run.outputTokens += params.outputTokens;
      this.run.totalTokens += params.inputTokens + params.outputTokens;

      // Calculate approximate cost (e.g. standard Llama/GPT rates)
      const costPer1kInput = 0.0015;
      const costPer1kOutput = 0.002;
      this.run.estimatedCost +=
        (params.inputTokens / 1000) * costPer1kInput +
        (params.outputTokens / 1000) * costPer1kOutput;

      this.addEvent({
        type: 'MODEL_CALL',
        title: `Model: ${params.model}`,
        status: 'OK',
        durationMs: params.latencyMs || 0,
        data: {
          modelCall: {
            ...params,
            latencyMs: params.latencyMs || 0,
            promptPreview: redactData(params.promptPreview, this.client.config.redact),
            responsePreview: redactData(params.responsePreview, this.client.config.redact),
          },
        },
      });
    } catch {
      // Safe failover
    }
    return this;
  }

  toolCall(toolName: string, args: Record<string, any>, response?: any, status: number | string = 200, latencyMs = 0): this {
    try {
      const isError = typeof status === 'number' ? status >= 400 : status !== 'OK';
      this.addEvent({
        type: 'TOOL_CALL',
        title: `Tool: ${toolName}`,
        status: isError ? 'ERROR' : 'OK',
        statusCode: typeof status === 'number' ? status : isError ? 500 : 200,
        durationMs: latencyMs,
        data: {
          toolCall: {
            toolName,
            arguments: redactData(args, this.client.config.redact),
            response: redactData(response, this.client.config.redact),
            status,
            latencyMs,
          },
        },
      });
    } catch {
      // Safe failover
    }
    return this;
  }

  error(errorType: string, message: string, statusCode = 500, culpritTool?: string): this {
    try {
      this.run.status = 'FAILED';
      this.run.errorMessage = message;
      this.addEvent({
        type: 'ERROR',
        title: `Error: ${errorType}`,
        status: 'ERROR',
        statusCode,
        data: {
          error: {
            errorType,
            message,
            statusCode,
            culpritTool,
          },
        },
      });
    } catch {
      // Safe failover
    }
    return this;
  }

  event(type: EventType, title: string, data: Record<string, any> = {}): this {
    try {
      this.addEvent({
        type,
        title,
        data: redactData(data, this.client.config.redact),
      });
    } catch {
      // Safe failover
    }
    return this;
  }

  end(finalResponse?: string, status?: 'SUCCESS' | 'FAILED'): Run {
    try {
      const now = Date.now();
      this.run.durationMs = now - this.startTime;
      this.run.completedAt = new Date(now).toISOString();

      if (status) {
        this.run.status = status;
      } else if (this.run.status === 'RUNNING') {
        this.run.status = 'SUCCESS';
      }

      if (finalResponse) {
        const sanitized = this.client.config.captureOutput !== false
          ? redactData(finalResponse, this.client.config.redact)
          : '[CAPTURED_OUTPUT_DISABLED]';

        this.addEvent({
          type: 'FINAL_RESPONSE',
          title: 'Final Response',
          status: this.run.status === 'SUCCESS' ? 'OK' : 'ERROR',
          data: { finalResponse: sanitized },
        });
      }

      this.client.queueRun(this.run);
    } catch {
      // Safe failover
    }
    return this.run;
  }

  private addEvent(eventData: Omit<RunEvent, 'id' | 'runId' | 'timestamp' | 'offsetMs'>): void {
    const now = Date.now();
    const event: RunEvent = {
      id: `ev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      runId: this.run.id,
      timestamp: new Date(now).toISOString(),
      offsetMs: now - this.startTime,
      ...eventData,
    };
    this.run.events.push(event);
  }
}

export class SameWindow {
  readonly config: SameWindowConfig;
  private queue: Run[] = [];
  private flushTimer: any = null;

  constructor(config: SameWindowConfig) {
    this.config = {
      endpoint: '/api/ingest',
      captureInput: true,
      captureOutput: true,
      batchSize: 10,
      flushIntervalMs: 5000,
      disabled: false,
      maxRetries: 3,
      retryBaseDelayMs: 500,
      ...config,
    };

    if (typeof window !== 'undefined' && !this.config.disabled) {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  startRun(options: { agent: string; model?: string }): AgentRunRecorder {
    return new AgentRunRecorder(this, options.agent, options.model);
  }

  queueRun(run: Run): void {
    if (this.config.disabled) return;
    this.queue.push(run);

    if (this.queue.length >= (this.config.batchSize || 10)) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flush();
      }, this.config.flushIntervalMs || 5000);
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    const batch = [...this.queue];
    this.queue = [];

    try {
      const endpoint = this.config.endpoint || '/api/ingest';
      const maxRetries = Math.max(0, this.config.maxRetries ?? 3);
      const baseDelayMs = Math.max(100, this.config.retryBaseDelayMs ?? 500);

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-SameWindow-API-Key': this.config.apiKey,
              'X-Project-Id': this.config.projectId,
            },
            body: JSON.stringify({ runs: batch }),
            keepalive: true,
          });

          if (response.ok) return;

          // Retry only transient failures. Auth/validation failures should not be retried.
          const retryable = response.status === 408 || response.status === 425 ||
            response.status === 429 || response.status >= 500;
          if (!retryable || attempt === maxRetries) {
            if (typeof console !== 'undefined') {
              console.warn(`SameWindow ingestion failed: HTTP ${response.status}`);
            }
            return;
          }

          const retryAfter = Number(response.headers.get('Retry-After'));
          const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : baseDelayMs * Math.pow(2, attempt);

          await new Promise(resolve => setTimeout(resolve, delayMs));
        } catch (error) {
          if (attempt === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
        }
      }
    } catch (error) {
      // Never throw into the host agent. Surface the failure for debugging instead.
      if (typeof console !== 'undefined') {
        console.warn('SameWindow ingestion request failed.', error);
      }
    }
  }
}
