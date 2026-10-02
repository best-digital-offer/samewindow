import React from 'react';

export const TrustStrip: React.FC = () => {
  const capabilities = [
    'AI Agents',
    'Tool Calling',
    'RAG Systems',
    'Autonomous Automation',
    'Multi-Step Workflows',
    'Production AI Fleet',
  ];

  return (
    <div className="border-y border-[#151b24] bg-[#07090d]/60 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="text-slate-400 font-medium whitespace-nowrap">
          Engineered for developers building:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-[11px] text-slate-300">
          {capabilities.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <span className="text-slate-400" aria-hidden="true">·</span>}
              <span className="hover:text-indigo-300 transition-colors">{c}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
