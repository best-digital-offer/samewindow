import React from 'react';
import { Shield, Lock, EyeOff, Server, Key, Trash2, Clock } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const securityPillars = [
    {
      icon: Lock,
      title: 'Encryption in Transit & at Rest',
      desc: 'All trace ingestion and dashboard communications run over strict TLS 1.3. Persistent database tables are encrypted with industry-standard AES-256.',
    },
    {
      icon: EyeOff,
      title: 'Configurable In-Memory Redaction',
      desc: 'Sensitive parameters (passwords, credit cards, bearer tokens, API keys, and emails) are redacted in client memory prior to network transmission.',
    },
    {
      icon: Server,
      title: 'Supabase PostgreSQL Row Level Security (RLS)',
      desc: 'Every organization and project operates in strict cryptographic and logical isolation. No project can query or infer traces belonging to another tenant.',
    },
    {
      icon: Key,
      title: 'One-Time Secret Token Exposure',
      desc: 'Full API secrets are shown exactly once at creation and never stored in plaintext. The database retains only irreversible salted cryptographic hashes and prefixes.',
    },
    {
      icon: Clock,
      title: 'Automated Retention & Purging',
      desc: 'Traces automatically age out and are permanently expunged based on your project tier retention settings (7, 30, 90, or 365 days).',
    },
    {
      icon: Trash2,
      title: 'Instant Hard Deletion',
      desc: 'Deleting a project, API key, or individual run immediately deletes all corresponding events, tool call logs, and AI analysis records.',
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
      <div className="space-y-3 text-left">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          Trust & Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Enterprise Security & Data Isolation
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Observability requires deep trust. SameWindow is designed with zero-prompt retention options and strict client-side redaction so proprietary payloads never leave your perimeter unprotected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityPillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="p-6 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[#141a24] border border-[#222b3b] flex items-center justify-center text-indigo-400">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">{p.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="p-5 rounded-xl bg-[#0a0d14] border border-[#1b2230] text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-white">Responsible Security Disclosure</h4>
        <p>
          We take application and telemetry safety seriously. If you believe you have discovered a vulnerability, please reach out directly to{' '}
          <a href="mailto:security@samewindow.io" className="text-indigo-400 hover:underline">
            security@samewindow.io
          </a>
          .
        </p>
      </div>
    </div>
  );
};
