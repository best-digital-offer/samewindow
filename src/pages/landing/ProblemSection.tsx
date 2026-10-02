import React from 'react';
import { Layers, ArrowRight, XCircle } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const siloedLogs = [
    { label: 'Application Logs', icon: 'app.log', desc: 'Standard stdout with missing agent context' },
    { label: 'Model Provider Logs', icon: 'llm.api', desc: 'Raw prompt tokens detached from app state' },
    { label: 'Tool Logs', icon: 'tools.log', desc: 'Disjointed microservice API responses' },
    { label: 'Database Logs', icon: 'postgres', desc: 'Deadlock and uncommitted transaction queries' },
    { label: 'Deployment Logs', icon: 'k8s/docker', desc: 'Host container restarts and timeouts' },
    { label: 'External API Provider', icon: 'stripe/crm', desc: '401/429 status codes buried in rate limiters' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      <div className="max-w-3xl space-y-3 text-left">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          The Debugging Dilemma
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          When an agent fails, the logs rarely tell the whole story.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          A failed agent run crosses multiple systems. Developers waste hours jumping between fragmented browser tabs, log aggregators, and terminal windows trying to reconstruct why a model picked the wrong tool or why an API call aborted.
        </p>
      </div>

      {/* Visual Comparison: The 6 Frustrating Silos vs SameWindow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Fragmented reality */}
        <div className="p-5 rounded-xl border border-rose-950/60 bg-[#0e0a0d] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#241318]">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              Before: Jumping Between 6 Windows
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {siloedLogs.map((item) => (
              <div key={item.label} className="p-2 rounded bg-[#160c11] border border-[#2b1720] space-y-0.5">
                <div className="text-slate-300 font-semibold text-[11px] truncate">{item.label}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-rose-300/80 pt-2 italic">
            “Why did the agent call process_refund with invalid args at step 4? The app log doesn’t show the model’s internal reasoning, and the model log doesn’t show the tool response.”
          </p>
        </div>

        {/* SameWindow Single Flight Recorder */}
        <div className="p-5 rounded-xl border border-indigo-500/40 bg-[#0b0f18] space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2538]">
            <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
              After: SameWindow Flight Recorder
            </span>
            <span className="text-[11px] font-mono text-emerald-400">All in One Window</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            SameWindow captures the unified chronological timeline across model decisions, tool invocations, payloads, return codes, latency, and token consumption.
          </p>

          <div className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-[#070a10] p-3 rounded-lg border border-[#1b2332]">
            <div className="flex items-center gap-2 text-sky-300">
              <span>00:00.000</span>
              <span>Prompt: "Refund order #ORD-9821"</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <span>00:00.142</span>
              <span>Model call: Reasoned refund criteria met</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>00:00.481</span>
              <span>Tool search_customer → 200 OK</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span>00:01.883</span>
              <span>Tool process_refund → 401 UNAUTHORIZED [Divergence]</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Replay the entire execution step-by-step or trigger AI analysis to pinpoint the root cause immediately.
          </p>
        </div>
      </div>
    </section>
  );
};
