import React, { useState } from 'react';
import { KeyRound, Plus, Trash2, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { ApiKey, Project } from '../../types';
import { loadApiKeys } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

interface ApiKeysPageProps {
  activeProject: Project;
}

export const ApiKeysPage: React.FC<ApiKeysPageProps> = ({ activeProject }) => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);

  React.useEffect(() => { loadApiKeys(activeProject.id).then(setKeys).catch(() => toast('Could not load API keys.', 'error')); }, [activeProject.id]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || creating) return;
    setCreating(true);

    try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const response = await fetch('/api/create-api-key', { method:'POST', headers:{'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})}, body:JSON.stringify({projectId:activeProject.id,name:newKeyName.trim()}) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to create API key.');
    const { rawSecret } = payload;
    const key = payload.key as ApiKey;
    setKeys((current) => [key, ...current]);
    setGeneratedSecret(rawSecret);
    setNewKeyName('');
    toast('API Key generated successfully.', 'success');
    setCreateModalOpen(false);
    } catch (error: any) {
      toast(error?.message || 'Unable to create API key. Please try again.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? Any agents using it will immediately fail ingestion.')) {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const response = await fetch('/api/create-api-key', { method:'DELETE', headers:{'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})}, body:JSON.stringify({keyId}) });
      if (!response.ok) throw new Error('Unable to revoke API key.');
      setKeys((current) => current.filter((k) => k.id !== keyId));
      toast('API Key revoked.', 'info');
    }
  };

  const copySecret = () => {
    if (!generatedSecret) return;
    navigator.clipboard.writeText(generatedSecret);
    setCopied(true);
    toast('Copied API Key to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2230]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">API Ingestion Keys</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Use these keys in your SameWindow SDK or REST headers to authenticate incoming agent traces.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedSecret(null);
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Key</span>
        </button>
      </div>

      {/* Secret Reveal Banner (Shown only right after creation) */}
      {generatedSecret && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Save your API Key now</span>
            </div>
            <button
              onClick={() => setGeneratedSecret(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Done
            </button>
          </div>
          <p className="text-xs text-slate-300">
            For security, this secret token will <strong>never be shown again</strong>. Please store it in your environment variables.
          </p>

          <div className="flex items-center gap-2 bg-[#080b10] border border-[#1e2738] p-2.5 rounded-lg font-mono text-xs text-emerald-400">
            <span className="flex-1 select-all truncate">{generatedSecret}</span>
            <button
              onClick={copySecret}
              className="p-1.5 rounded hover:bg-[#161c28] text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="rounded-xl border border-[#1b2230] bg-[#0c0f16] overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#090b0e] border-b border-[#1b2230] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Key Name</th>
              <th className="py-2.5 px-4">Token Prefix</th>
              <th className="py-2.5 px-4">Created</th>
              <th className="py-2.5 px-4">Last Ingested</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151b26]">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No API keys for this project yet. Create one to begin capturing traces.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-[#10141e] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{k.name}</td>
                  <td className="py-3 px-4 font-mono text-indigo-300 text-[11px]">{k.prefix}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create API Ingestion Key"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-slate-400 mb-1">Key Name / Identifier</label>
            <input
              type="text"
              required
              placeholder="e.g. Production Ingest Agent Worker"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#080b10] border border-[#1b2230] text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Security Notice</div>
            <p>
              Your token will be cryptographically generated and salted. Once created, only the prefix will remain accessible in your dashboard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              {creating ? 'Generating...' : 'Generate Key'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
