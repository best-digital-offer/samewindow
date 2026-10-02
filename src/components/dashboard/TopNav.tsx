import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Project } from '../../types';

interface TopNavProps {
  breadcrumbs: { label: string; route?: string }[];
  onNavigate: (route: string) => void;
  activeProject?: Project;
}

export const TopNav: React.FC<TopNavProps> = ({
  breadcrumbs,
  onNavigate,
  activeProject,
  }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#171d28] bg-[#090b0e]/95 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            {b.route ? (
              <button
                onClick={() => onNavigate(b.route!)}
                className="hover:text-slate-200 transition-colors"
              >
                {b.label}
              </button>
            ) : (
              <span className="text-slate-200 font-medium">{b.label}</span>
            )}
          </React.Fragment>
        ))}
        {activeProject && (
          <span className="ml-2 text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
            {activeProject.environment}
          </span>
        )}
      </nav>

    </header>
  );
};
