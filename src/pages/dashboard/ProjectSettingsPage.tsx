import React, { useState } from 'react';
import { Project } from '../../types';
import { Storage } from '../../lib/storage';
import { useToast } from '../../components/common/Toast';
import { Shield, EyeOff, Save, Trash2 } from 'lucide-react';

interface ProjectSettingsPageProps {
  project: Project;
  onProjectUpdated: (p: Project) => void;
}

export const ProjectSettingsPage: React.FC<ProjectSettingsPageProps> = ({
  project,
  onProjectUpdated,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [environment, setEnvironment] = useState(project.environment);
  const [retentionDays, setRetentionDays] = useState(project.retentionDays);
  const [newKey, setNewKey] = useState('');
  const [redactionKeys, setRedactionKeys] = useState<string[]>(project.redactionKeys || []);

  const handleAddRedactionKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    if (!redactionKeys.includes(newKey.trim())) {
      setRedactionKeys([...redactionKeys, newKey.trim()]);
    }
    setNewKey('');
  };

  const handleRemoveRedactionKey = (k: string) => {
    setRedactionKeys(redactionKeys.filter((x) => x !== k));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Project = {
      ...project,
      name,
      description,
      environment,
      retentionDays: Number(retentionDays),
      redactionKeys,
    };
    Storage.updateProject(updated);
    onProjectUpdated(updated);
    toast('Project settings saved successfully.', 'success');
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto text-xs text-slate-300">
      <div className="pb-4 border-b border-[#1b2230]">
        <h1 className="text-xl font-bold text-white tracking-tight">Project Settings</h1>
        <p className="text-slate-400 mt-0.5">
          Manage workspace identity, automated retention, and telemetry data redaction rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <div className="p-5 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-4">
          <h3 className="text-sm font-semibold text-white">General Information</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Retention Window</label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                >
                  <option value={7}>7 Days (Free Plan limit)</option>
                  <option value={30}>30 Days (Developer Plan)</option>
                  <option value={90}>90 Days (Pro Plan)</option>
                  <option value={365}>365 Days (Team Plan)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Redaction Configuration */}
        <div className="p-5 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-indigo-400" />
                <span>Automatic Field Redaction Rules</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Any JSON keys matching these identifiers will have their values replaced with <code>[REDACTED]</code> prior to database persistence.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {redactionKeys.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131924] border border-[#222c3e] text-indigo-300 font-mono text-[11px]"
              >
                <span>{k}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRedactionKey(k)}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add custom key */}
          <div className="flex gap-2 max-w-sm pt-2">
            <input
              type="text"
              placeholder="Add key e.g. customer_ssn"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-[#10141d] border border-[#212836] text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="button"
              onClick={handleAddRedactionKey}
              className="px-3 py-2 bg-[#17202e] hover:bg-[#1d293b] text-slate-200 rounded-lg text-xs font-medium border border-[#253247] transition-colors"
            >
              Add Key
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
