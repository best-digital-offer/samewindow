import { Run } from '../types';

export function exportRunToJson(run: Run): void {
  const jsonStr = JSON.stringify(run, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `samewindow_run_${run.id}_${run.status.toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRunsToCsv(runs: Run[]): void {
  const headers = ['ID', 'Agent', 'Status', 'StartedAt', 'DurationMs', 'TotalTokens', 'CostUSD', 'Model'];
  const rows = runs.map((r) => [
    r.id,
    `"${r.agentName.replace(/"/g, '""')}"`,
    r.status,
    r.startedAt,
    r.durationMs,
    r.totalTokens,
    r.estimatedCost.toFixed(4),
    r.model,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `samewindow_runs_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
