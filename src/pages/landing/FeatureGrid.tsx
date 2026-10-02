import React from 'react';
import {
  Clock,
  Wrench,
  Play,
  GitCompare,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: 'Full Run Timeline',
      description: 'See every meaningful event in strict chronological order with millisecond offsets and duration tracking.',
      badge: 'Observability',
    },
    {
      icon: Wrench,
      title: 'Tool Call Inspection',
      description: 'Inspect exact tool names, JSON arguments, API responses, HTTP status codes, and network latency.',
      badge: 'Tool Calling',
    },
    {
      icon: Play,
      title: 'Execution Replay',
      description: 'Step forward and backward through agent decision paths at 0.5x to 5x speed to see state evolve.',
      badge: 'Flight Recorder',
    },
    {
      icon: GitCompare,
      title: 'Run Comparison',
      description: 'Compare successful and failed executions side-by-side to automatically spot the first point of divergence.',
      badge: 'Diff Engine',
    },
    {
      icon: Sparkles,
      title: 'AI Failure Explanation',
      description: 'Leverage Groq-powered Llama 3.3 to analyze trace evidence and receive actionable remediation guidance.',
      badge: 'Groq / Llama',
    },
    {
      icon: BarChart3,
      title: 'Cost & Performance Tracking',
      description: 'Track prompt vs completion tokens, model inference latency, and estimated per-run API dollar costs.',
      badge: 'Telemetry',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      <div className="max-w-2xl space-y-2 text-left">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          Core Engine
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Everything you need to debug agentic software.
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          No generic dashboards or decorative AI widgets. Built with developer-grade precision for production agent architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-[#0c0f16] border border-[#1b2230] hover:border-[#2a364d] transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#141a24] border border-[#222b3b] flex items-center justify-center text-indigo-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {f.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {f.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
