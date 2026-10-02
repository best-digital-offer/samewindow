import { ComparisonDivergence, Run, RunComparisonResult } from '../types';

/**
 * Compares two agent executions step-by-step to find the FIRST meaningful divergence.
 */
export function findFirstDivergence(runA: Run, runB: Run): ComparisonDivergence | null {
  const eventsA = runA.events || [];
  const eventsB = runB.events || [];
  const maxLen = Math.max(eventsA.length, eventsB.length);

  for (let i = 0; i < maxLen; i++) {
    const evA = eventsA[i];
    const evB = eventsB[i];

    // If one run ended earlier than the other
    if (!evA && evB) {
      return {
        indexA: i - 1,
        indexB: i,
        eventA: eventsA[eventsA.length - 1],
        eventB: evB,
        divergenceType: 'EVENT_MISSING',
        description: `Run A ended early. Run B executed extra step '${evB.title}'.`,
      };
    }

    if (evA && !evB) {
      return {
        indexA: i,
        indexB: i - 1,
        eventA: evA,
        eventB: eventsB[eventsB.length - 1],
        divergenceType: 'EVENT_MISSING',
        description: `Run B aborted early before reaching '${evA.title}'.`,
      };
    }

    if (!evA || !evB) continue;

    // Check for error occurrence
    if (evA.type === 'ERROR' && evB.type !== 'ERROR') {
      return {
        indexA: i,
        indexB: i,
        eventA: evA,
        eventB: evB,
        divergenceType: 'ERROR_ENCOUNTERED',
        description: `Run A raised error '${evA.title}' whereas Run B succeeded.`,
      };
    }
    if (evB.type === 'ERROR' && evA.type !== 'ERROR') {
      return {
        indexA: i,
        indexB: i,
        eventA: evA,
        eventB: evB,
        divergenceType: 'ERROR_ENCOUNTERED',
        description: `Run B raised error '${evB.title}' (statusCode: ${evB.statusCode || 'N/A'}) while Run A continued normally.`,
      };
    }

    // Check status code discrepancy on tool calls
    if (evA.type === 'TOOL_CALL' && evB.type === 'TOOL_CALL') {
      const codeA = evA.statusCode || (evA.data.toolCall?.status as number);
      const codeB = evB.statusCode || (evB.data.toolCall?.status as number);

      if (codeA !== codeB && (codeA >= 400 || codeB >= 400)) {
        return {
          indexA: i,
          indexB: i,
          eventA: evA,
          eventB: evB,
          divergenceType: 'STATUS_MISMATCH',
          description: `First divergence at tool '${evA.data.toolCall?.toolName || evA.title}': Run A returned ${codeA || 'OK'} while Run B failed with ${codeB || 'ERROR'}.`,
        };
      }

      // Check tool name mismatch
      const toolA = evA.data.toolCall?.toolName;
      const toolB = evB.data.toolCall?.toolName;
      if (toolA && toolB && toolA !== toolB) {
        return {
          indexA: i,
          indexB: i,
          eventA: evA,
          eventB: evB,
          divergenceType: 'TOOL_PAYLOAD',
          description: `Model chose divergent tool: Run A invoked '${toolA}' while Run B invoked '${toolB}'.`,
        };
      }
    }

    // Check general event type mismatch
    if (evA.type !== evB.type) {
      return {
        indexA: i,
        indexB: i,
        eventA: evA,
        eventB: evB,
        divergenceType: 'STATUS_MISMATCH',
        description: `Execution branched at step ${i + 1}: Run A transitioned to ${evA.type} while Run B transitioned to ${evB.type}.`,
      };
    }
  }

  return null;
}

export function compareRuns(runA: Run, runB: Run): RunComparisonResult {
  const divergence = findFirstDivergence(runA, runB);
  const durationDiffMs = runB.durationMs - runA.durationMs;
  const tokenDiff = runB.totalTokens - runA.totalTokens;
  const costDiff = runB.estimatedCost - runA.estimatedCost;

  return {
    runA,
    runB,
    divergence,
    durationDiffMs,
    tokenDiff,
    costDiff,
  };
}
