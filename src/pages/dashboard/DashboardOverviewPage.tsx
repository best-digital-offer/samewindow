import React from 'react';
import { Run, Project } from '../../types';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { RunsTable } from '../../components/dashboard/RunsTable';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { Layers, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

interface DashboardOverviewPageProps {
  runs: Run[];
  activeProject: Project;
  onSelectRun: (runId: string) => void;
  onNavigate: (route: string) => void;
  onCreateKeyClick: () => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  runs,
  activeProject,
  onSelectRun,
  onNavigate,
  onCreateKeyClick,
}) => {
  const totalRuns = runs.length;
  const successfulRuns = runs.filter((r) => r.status === 'SUCCESS').length;
  const failedRuns = runs.filter((r) => r.status === 'FAILED').length;
  const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : '100.0';

  const avgLatencyMs =
    totalRuns > 0
      ? Math.round(runs.reduce((acc, r) => acc + r.durationMs, 0) / totalRuns)
      : 0;

  const totalCost = runs.reduce((acc, r) => acc + r.estimatedCost, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fleet Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Observability metrics and recent execution traces for <span className="text-white font-medium">{activeProject.name}</span>.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          label="Total Recorded Runs"
          value={totalRuns.toLocaleString()}
          subValue={totalRuns > 0 ? 'Across all agents' : 'No runs recorded'}
        />
        <MetricCard
          label="Success Rate"
          value={`${successRate}%`}
          trend={{ value: `${successfulRuns} nominal`, isPositive: true }}
        />
        <MetricCard
          label="Failed Runs"
          value={failedRuns.toLocaleString()}
          trend={{ value: `${failedRuns} aborted`, isPositive: failedRuns === 0 }}
        />
        <MetricCard
          label="Avg Run Latency"
          value={`${(avgLatencyMs / 1000).toFixed(2)}s`}
          subValue={`${avgLatencyMs}ms per execution`}
        />
        <MetricCard
          label="Estimated AI Cost"
          value={`$${totalCost.toFixed(4)}`}
          subValue="Inference & tool API spend"
        />
      </div>

      {/* Runs Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Recent Executions
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {runs.length} traces available
          </span>
        </div>

        {runs.length === 0 ? (
          <EmptyState
            onQuickstartClick={() => onNavigate('/docs/quickstart')}
            onCreateKeyClick={onCreateKeyClick}
          />
        ) : (
          <RunsTable runs={runs} onSelectRun={onSelectRun} />
        )}
      </div>
    </div>
  );
};
