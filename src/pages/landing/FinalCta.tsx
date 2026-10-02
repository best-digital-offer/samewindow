import React from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

interface FinalCtaProps {
  onStartBuildingFree: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onStartBuildingFree }) => {
  return (
    <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
      <div className="p-8 sm:p-14 rounded-2xl bg-gradient-to-b from-[#10141f] to-[#090b0f] border border-[#21293a] shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <Terminal className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight text-balance">
          Stop guessing what your agent did.
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed text-balance">
          Record the run. Replay the failure. Find the difference.
        </p>

        <div className="pt-2">
          <button
            onClick={onStartBuildingFree}
            className="px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-600/25 inline-flex items-center gap-2 group"
          >
            <span>Start Building Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Takes under 2 minutes to install. Free forever tier for development.
        </p>
      </div>
    </section>
  );
};
