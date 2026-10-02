import React from 'react';
import { Terminal, KeyRound, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onQuickstartClick: () => void;
  onCreateKeyClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onQuickstartClick,
  onCreateKeyClick,
}) => {
  return (
    <div className="py-16 px-6 text-center rounded-xl border border-dashed border-[#20293a] bg-[#0c0f16]/60 flex flex-col items-center max-w-xl mx-auto my-8">
      <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-4">
        <Terminal className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight mb-2">
        Your flight recorder is ready
      </h3>
      <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
        Install the SameWindow SDK in your Python or TypeScript agent to automatically capture tool calls, latency, errors, and model reasoning.
      </p>

      {/* Code preview snippet */}
      <div className="w-full max-w-md bg-[#07090d] border border-[#1b2230] rounded-lg p-3 text-left font-mono text-[11px] text-slate-300 mb-6 overflow-x-auto">
        <span className="text-slate-400"># 1. Install SDK</span><br />
        <span className="text-indigo-300">npm install samewindow</span><br />
        <span className="text-slate-400"># 2. Wrap your agent execution</span><br />
        <span className="text-slate-400">const run = sw.startRun({'{ agent: "my-agent" }'});</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onQuickstartClick}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View Quickstart</span>
        </button>
        <button
          onClick={onCreateKeyClick}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-[#151c27] hover:bg-[#1a2332] border border-[#263145] rounded-md transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Create API Key</span>
        </button>
      </div>
    </div>
  );
};
