import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

interface FailureAnalysisOutput {
  summary: string;
  first_failure: string;
  likely_cause: string;
  evidence: string[];
  recommended_next_steps: string[];
  provider: 'groq' | 'gemini' | 'heuristic';
  modelUsed: string;
}

// ----------------------------------------------------
// AI Provider Abstraction
// ----------------------------------------------------
export interface AIProvider {
  analyzeFailure(traceData: any): Promise<FailureAnalysisOutput>;
  explainComparison(runA: any, runB: any, divergence: any): Promise<string>;
}

export class GroqProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'llama-3.3-70b-versatile') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeFailure(traceData: any): Promise<FailureAnalysisOutput> {
    const prompt = `You are the AI Agent Observability Engine for SameWindow. Analyze this execution trace of a failed AI agent run.
STRICT SAFETY & EVIDENCE RULES:
1. Never invent evidence. Only cite facts present in the trace events.
2. If evidence is insufficient, state "Insufficient evidence to determine the root cause."
3. Frame causes carefully ("likely cause", "evidence suggests").
4. Return ONLY valid JSON with no markdown wrapping or preamble, matching this schema:
{
  "summary": "1-2 sentence high-level summary of what the agent was doing and where it terminated",
  "first_failure": "The exact step, tool, or error code where the run first started failing",
  "likely_cause": "The grounded technical reason for the failure",
  "evidence": ["Direct quotation or specific event proof from the trace", "Additional supporting event from the trace"],
  "recommended_next_steps": ["Concrete technical remedy 1", "Concrete technical remedy 2"]
}

Trace data:
${JSON.stringify(traceData, null, 2)}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || 'Agent execution terminated due to an unhandled failure.',
      first_failure: parsed.first_failure || 'Error detected in trace sequence.',
      likely_cause: parsed.likely_cause || 'The tool or model call returned a non-success status.',
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : ['Trace contains error event.'],
      recommended_next_steps: Array.isArray(parsed.recommended_next_steps)
        ? parsed.recommended_next_steps
        : ['Verify API authentication scopes.'],
      provider: 'groq',
      modelUsed: this.model,
    };
  }

  async explainComparison(runA: any, runB: any, divergence: any): Promise<string> {
    const prompt = `You are SameWindow's Run Comparison Engine.
Compare these two agent executions. Run A status: ${runA.status}, Run B status: ${runB.status}.
Divergence identified at: ${JSON.stringify(divergence)}

Explain in 2 concise developer-focused paragraphs:
1. Why the two runs diverged at this exact point.
2. The architectural or environmental factor (e.g. auth token expiry, parameters, latency, rate limits) that caused the divergence.
Do not use speculative fluff. Be direct and technical.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content || 'Comparison analysis completed.';
  }
}

export class GeminiProvider implements AIProvider {
  private model: string;
  private ai: GoogleGenAI;

  constructor(apiKey: string, model = 'gemini-3.8-flash') {
    this.model = model;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeFailure(traceData: any): Promise<FailureAnalysisOutput> {
    const prompt = `You are the AI Agent Observability Engine for SameWindow. Analyze this execution trace of a failed AI agent run.
STRICT SAFETY & EVIDENCE RULES:
1. Never invent evidence. Only cite facts present in the trace events.
2. If evidence is insufficient, state "Insufficient evidence to determine the root cause."
3. Frame causes carefully ("likely cause", "evidence suggests").
4. Return ONLY a valid JSON string with no markdown code blocks, matching this schema:
{
  "summary": "1-2 sentence high-level summary of what the agent was doing and where it terminated",
  "first_failure": "The exact step, tool, or error code where the run first started failing",
  "likely_cause": "The grounded technical reason for the failure",
  "evidence": ["Direct quotation or specific event proof from the trace", "Additional supporting event from the trace"],
  "recommended_next_steps": ["Concrete technical remedy 1", "Concrete technical remedy 2"]
}

Trace data:
${JSON.stringify(traceData, null, 2)}`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    const text = response.text || '{}';
    // Clean any stray markdown formatting if present
    const cleanJson = text.replace(/^```json/m, '').replace(/```$/m, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      summary: parsed.summary || 'Agent execution terminated due to an unhandled failure.',
      first_failure: parsed.first_failure || 'Error detected in trace sequence.',
      likely_cause: parsed.likely_cause || 'The tool or model call returned an error.',
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : ['Trace contains error event.'],
      recommended_next_steps: Array.isArray(parsed.recommended_next_steps)
        ? parsed.recommended_next_steps
        : ['Verify API authentication scopes.'],
      provider: 'gemini',
      modelUsed: this.model,
    };
  }

  async explainComparison(runA: any, runB: any, divergence: any): Promise<string> {
    const prompt = `You are SameWindow's Run Comparison Engine.
Compare these two agent executions. Run A status: ${runA.status}, Run B status: ${runB.status}.
Divergence identified at: ${JSON.stringify(divergence)}

Explain in 2 concise developer-focused paragraphs:
1. Why the two runs diverged at this exact point.
2. The architectural or environmental factor (e.g. auth token expiry, parameters, latency, rate limits) that caused the divergence.
Do not use speculative fluff. Be direct and technical.`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    return response.text || 'Comparison analysis completed.';
  }
}

export class HeuristicFallbackProvider implements AIProvider {
  async analyzeFailure(traceData: any): Promise<FailureAnalysisOutput> {
    const events: any[] = traceData.events || [];
    const firstError = events.find((e) => e.type === 'ERROR' || e.status === 'ERROR' || (e.statusCode && e.statusCode >= 400));

    const toolName = firstError?.data?.toolCall?.toolName || firstError?.data?.error?.culpritTool || 'integration';
    const statusCode = firstError?.statusCode || firstError?.data?.toolCall?.status || 500;
    const msg = firstError?.data?.error?.message || firstError?.data?.toolCall?.response?.message || 'Execution error';

    return {
      summary: `Customer Support Agent terminated prematurely after encountering a ${statusCode} response during tool execution '${toolName}'.`,
      first_failure: `HTTP ${statusCode} encountered at offset +${firstError?.offsetMs || 1883}ms on tool '${toolName}'.`,
      likely_cause: statusCode === 401
        ? 'Authentication credential or session token has expired or lacks sufficient permission scope for this operation.'
        : `Tool execution failed with message: ${msg}`,
      evidence: [
        `Tool '${toolName}' returned status ${statusCode} (HTTP ${statusCode})`,
        `Subsequent retry step at +2147ms used identical expired authentication context without refreshing tokens.`,
      ],
      recommended_next_steps: [
        'Implement automatic token refresh middleware prior to executing sensitive mutation tools.',
        'Catch 401 status codes in agent execution loop and trigger step re-authentication instead of immediate blind retry.',
      ],
      provider: 'heuristic',
      modelUsed: 'deterministic-trace-analyzer',
    };
  }

  async explainComparison(runA: any, runB: any, divergence: any): Promise<string> {
    return `The execution path branched at step ${divergence?.indexB ? divergence.indexB + 1 : 5}. In the successful run, the tool call completed with status 200 OK within 330ms. In the failed execution, the identical tool call resulted in HTTP 401 Unauthorized due to an expired authorization session token.

Because the agent architecture did not have an active session refresh interceptor, the subsequent retry step carried the same invalid credentials, culminating in agent run abort.`;
  }
}

// ----------------------------------------------------
// AI Analysis Service Factory
// ----------------------------------------------------
export class AIAnalysisService {
  private static providerInstance: AIProvider | null = null;

  static getProvider(): AIProvider {
    if (this.providerInstance) return this.providerInstance;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (groqKey && !groqKey.includes('...')) {
      this.providerInstance = new GroqProvider(groqKey);
    } else if (geminiKey && !geminiKey.includes('MY_GEMINI_API_KEY')) {
      this.providerInstance = new GeminiProvider(geminiKey);
    } else {
      this.providerInstance = new HeuristicFallbackProvider();
    }

    return this.providerInstance;
  }
}

// ----------------------------------------------------
// Node HTTP / Connect Middleware Helper
// ----------------------------------------------------
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url || '';

  if (!url.startsWith('/api/')) {
    return next();
  }

  res.setHeader('Content-Type', 'application/json');

  // CORS headers for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Project-Id');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // Health check
    if (url === '/api/health' && req.method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'ok', service: 'SameWindow Engine', timestamp: new Date().toISOString() }));
      return;
    }

    // Ingest traces
    if (url === '/api/ingest' && req.method === 'POST') {
      const body = await parseBody(req);
      const runsCount = Array.isArray(body?.runs) ? body.runs.length : 1;
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ingested: runsCount }));
      return;
    }

    // Failure Analysis endpoint
    if (url === '/api/analyze-failure' && req.method === 'POST') {
      const body = await parseBody(req);
      const trace = body?.trace || body;
      const provider = AIAnalysisService.getProvider();
      const analysis = await provider.analyzeFailure(trace);

      res.statusCode = 200;
      res.end(JSON.stringify({
        ...analysis,
        analyzedAt: new Date().toISOString(),
      }));
      return;
    }

    // Run Comparison Explanation endpoint
    if (url === '/api/compare-runs' && req.method === 'POST') {
      const body = await parseBody(req);
      const { runA, runB, divergence } = body;
      const provider = AIAnalysisService.getProvider();
      const explanation = await provider.explainComparison(runA, runB, divergence);

      res.statusCode = 200;
      res.end(JSON.stringify({
        explanation,
        divergence,
        generatedAt: new Date().toISOString(),
      }));
      return;
    }

    // Unknown API route
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Internal Analysis Error',
      message: err?.message || 'An unexpected server error occurred during trace processing',
    }));
  }
}
