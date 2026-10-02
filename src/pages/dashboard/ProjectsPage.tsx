import React, { useState } from 'react';
import { FolderDot, Plus, ArrowRight, Shield, Layers } from 'lucide-react';
import { Project } from '../../types';
import { createProject } from '../../lib/db';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

interface ProjectsPageProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNavigate,
}) => {
  const { toast } = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [env, setEnv] = useState<'production' | 'staging' | 'development'>('production');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const session = await (await import('../../lib/supabase')).supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    if (!userId) { toast('Please sign in again.', 'error'); return; }
    const newProj = await createProject(userId, name.trim(), description.trim(), env);
    toast(`Project '${newProj.name}' initialized.`, 'success');
    setCreateModal(false);
    setName('');
    setDescription('');
    onSelectProject(newProj.id);
    onNavigate(`/projects/${newProj.id}/runs`);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2230]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Agent Fleet Projects</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize independent agent teams, environments, and retention policies.
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          return (
            <div
              key={proj.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-[#111724] border-indigo-500/60 shadow-lg'
                  : 'bg-[#0c0f16] border-[#1b2230] hover:border-[#283244]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderDot className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-sm text-white">{proj.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#161d2b] text-indigo-300 border border-[#232c3e]">
                    {proj.environment}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                  {proj.description || 'No description provided'}
                </p>

                <div className="pt-2 border-t border-[#171d28] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Retention: {proj.retentionDays}d</span>
                  <span>ID: {proj.id.slice(0, 12)}</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => {
                    onSelectProject(proj.id);
                    onNavigate(`/projects/${proj.id}/runs`);
                  }}
                  className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-[#141a24] hover:bg-[#1a2230] text-slate-200 hover:text-white border border-[#202836] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{isActive ? 'Active Fleet' : 'Select Project'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Initialize New Project Fleet"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-slate-400 mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous Customer Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Primary tool-calling agents and finance mutation workflows"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Environment</label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as any)}
              className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
