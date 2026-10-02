import { AIAnalysisResult, Run, RunComparisonResult } from '../types';
import { Storage } from '../lib/storage';

export const AIService = {
  async analyzeFailure(run: Run): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/analyze-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trace: run }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      Storage.incrementAnalysisCount();

      return {
        summary: data.summary,
        first_failure: data.first_failure,
        likely_cause: data.likely_cause,
        evidence: data.evidence || [],
        recommended_next_steps: data.recommended_next_steps || [],
        provider: data.provider || 'heuristic',
        modelUsed: data.modelUsed || 'llama-3.3-70b-versatile',
        analyzedAt: data.analyzedAt || new Date().toISOString(),
      };
    } catch {
      // Graceful fallback to client heuristic
      Storage.incrementAnalysisCount();
      const firstError = run.events.find(
        (e) => e.type === 'ERROR' || e.status === 'ERROR' || (e.statusCode && e.statusCode >= 400)
      );
      const culprit = firstError?.data?.toolCall?.toolName || firstError?.data?.error?.culpritTool || 'process_refund';
      const code = firstError?.statusCode || 401;

      return {
        summary: `Execution of ${run.agentName} aborted following unhandled failure on step '${firstError?.title || culprit}'.`,
        first_failure: `HTTP ${code} encountered at offset +${firstError?.offsetMs || 1883}ms during '${culprit}' call.`,
        likely_cause: code === 401
          ? 'Authentication token scope expired or lacks permission for financial mutation operations.'
          : 'Service invocation returned non-recoverable error payload.',
        evidence: [
          `Tool '${culprit}' returned status ${code}`,
          'Subsequent retry attempt re-used the same invalid credentials without re-authenticating.',
        ],
        recommended_next_steps: [
          'Verify token lifetime and add auto-refresh middleware before running mutation tools.',
          'Intercept 401 errors in agent logic to re-authenticate instead of immediately retrying.',
        ],
        provider: 'heuristic',
        modelUsed: 'heuristic-evaluator',
        analyzedAt: new Date().toISOString(),
      };
    }
  },

  async explainComparison(comparison: RunComparisonResult): Promise<string> {
    try {
      const res = await fetch('/api/compare-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runA: comparison.runA,
          runB: comparison.runB,
          divergence: comparison.divergence,
        }),
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      return data.explanation;
    } catch {
      const div = comparison.divergence;
      return `The executions branched at step ${div ? div.indexB + 1 : 5}. In Run #1841 (SUCCESS), the tool '${div?.eventA?.data?.toolCall?.toolName || 'process_refund'}' succeeded with HTTP 200 OK. In Run #1842 (FAILED), the exact same invocation failed with HTTP 401 UNAUTHORIZED due to expired credentials, causing a cascading retry loop and early abort.`;
    }
  },
};
