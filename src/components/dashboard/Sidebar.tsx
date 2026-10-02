import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  GitCompare,
  Bot,
  BarChart3,
  KeyRound,
  Settings,
  BookOpen,
  HelpCircle,
  LogOut,
  FolderDot,
  Plus,
  Terminal,
  ChevronDown,
} from 'lucide-react';
import { Project } from '../../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProjectClick: () => void;
  userEmail: string;
  onSignOut: () => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProjectClick,
  userEmail,
  onSignOut,
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const navItems = [
    { label: 'Overview', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Runs', route: `/projects/${activeProjectId}/runs`, icon: Layers },
    { label: 'Errors', route: `/projects/${activeProjectId}/errors`, icon: AlertTriangle },
    { label: 'Compare', route: `/projects/${activeProjectId}/compare`, icon: GitCompare },
    { label: 'Agents', route: `/projects/${activeProjectId}/agents`, icon: Bot },
    { label: 'Analytics', route: `/projects/${activeProjectId}/analytics`, icon: BarChart3 },
    { label: 'API Keys', route: '/api-keys', icon: KeyRound },
    { label: 'Project Settings', route: `/projects/${activeProjectId}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-[#1a202c] bg-[#090b0f] flex flex-col justify-between h-screen sticky top-0 text-slate-400 select-none">
      {/* Top brand + Project switcher */}
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-14 px-4 border-b border-[#171d28] flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-white hover:text-indigo-400 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">SameWindow</span>
          </button>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#171c26] text-slate-400 border border-[#232b3a]">
            REC
          </span>
        </div>

        {/* Project Selector dropdown */}
        <div className="p-3 border-b border-[#141a24] relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-[#111620] hover:bg-[#161c28] border border-[#202736] text-xs transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <FolderDot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate text-slate-200 font-medium">
                {activeProject?.name || 'Select Project'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute top-14 left-3 right-3 z-50 rounded-lg bg-[#111622] border border-[#242c3c] shadow-2xl py-1 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 tracking-wider">
                Projects
              </div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    setProjectDropdownOpen(false);
                    onNavigate(`/projects/${p.id}/runs`);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 hover:bg-[#182030] flex items-center justify-between ${
                    p.id === activeProjectId ? 'text-indigo-400 font-medium bg-[#141b2a]' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-[9px] uppercase font-mono text-slate-400">{p.environment}</span>
                </button>
              ))}
              <div className="pt-1 mt-1 border-t border-[#1c2434]">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    onCreateProjectClick();
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#182030] text-indigo-400 flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.route ||
              (item.label === 'Runs' && currentRoute.includes('/runs') && !currentRoute.includes('/compare')) ||
              (item.label === 'Compare' && currentRoute.includes('/compare'));

            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-[#182030] text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121722]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-[#141a24] space-y-1 text-xs">
        <button
          onClick={() => onNavigate('/docs')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:text-slate-200 hover:bg-[#121722] transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Documentation</span>
        </button>
        <button
          onClick={() => onNavigate('/contact')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:text-slate-200 hover:bg-[#121722] transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Support & SLA</span>
        </button>

        {/* User Profile */}
        <div className="pt-2 mt-2 border-t border-[#141a24] flex items-center justify-between px-2">
          <div className="flex flex-col truncate mr-2">
            <span className="text-[11px] font-medium text-slate-300 truncate">
              {userEmail || 'Developer'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Developer Tier</span>
          </div>
          <button
            onClick={onSignOut}
            title="Sign Out"
            className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
