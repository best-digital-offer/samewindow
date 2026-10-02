import React, { useState } from 'react';
import { Terminal, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 text-xs text-slate-300 leading-relaxed">
      <div className="space-y-2">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          About SameWindow
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Why we built the AI Agent Flight Recorder
        </h1>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">
        Modern software development spent 25 years building observability for deterministic distributed systems. But autonomous AI agents do not behave like classical microservices.
      </p>

      <p>
        An agent decides its own execution path in real time. It inspects a user’s prompt, calls a model, picks a tool, inspects the result, calls another tool, and sometimes enters recursive loops or reaches catastrophic hallucinations.
      </p>

      <div className="p-4 rounded-xl bg-[#0e121a] border border-[#1d2535] space-y-2">
        <h3 className="font-semibold text-white text-sm">The SameWindow Philosophy</h3>
        <p>
          Developers should never have to toggle between 6 disjointed logs — application stdout, model providers, tool microservices, database transactions, deployments, and gateway rate limits. Everything that happened in an execution belongs in <strong>SameWindow</strong>.
        </p>
      </div>

      <p>
        We are an engineering-driven team obsessed with developer tooling, reproducible debugging, and high-performance infrastructure.
      </p>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', subject: 'Developer Support' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast('Support ticket created. Our team will follow up within 2 hours.', 'success');
  };

  return (
    <div className="py-16 px-4 sm:px-6 max-w-xl mx-auto space-y-8 text-xs text-slate-300">
      <div className="text-center space-y-2">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          Get in Touch
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Developer Support & Inquiries</h1>
        <p className="text-slate-400">
          Have questions about self-hosting, custom volume contracts, or SDK integrations?
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Message Dispatched</h3>
          <p className="text-xs text-slate-400">
            A customer engineer has received your request and will reply directly to {formData.email || 'your email'}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Your Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Work Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Topic</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option>Developer Support & Debugging</option>
              <option>Team & Enterprise Inquiries</option>
              <option>Security & Privacy Audit</option>
              <option>Billing & Invoices</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-2 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message</span>
          </button>
        </form>
      )}
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
      <p className="text-slate-400">Effective Date: October 1, 2026</p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">1. Telemetry Ingestion</h2>
        <p>
          SameWindow collects only the telemetry data explicitly dispatched via the SameWindow SDK or REST API. Developers retain full ownership and rights over all agent traces, payloads, and tokens.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">2. Redaction and Data Minimization</h2>
        <p>
          We provide both client-side and server-side filtering engines to ensure sensitive credentials, passwords, and credit cards are scrubbed before storage.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">3. Third-Party AI Models</h2>
        <p>
          AI Failure Analysis features utilize Groq and secure inference providers. Traces submitted for failure reasoning are never used to train frontier foundation models.
        </p>
      </section>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
      <p className="text-slate-400">Effective Date: October 1, 2026</p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">1. Service Availability & Fail-Safe Commitment</h2>
        <p>
          SameWindow provides developer infrastructure and flight recording. Our client SDK is engineered to fail safely, guaranteeing that transient SameWindow outages will never degrade the execution of customer agent applications.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">2. Acceptable Use</h2>
        <p>
          You agree not to use SameWindow to ingest malicious payloads, execute denial of service attacks, or process unauthorized eavesdropping telemetry.
        </p>
      </section>
    </div>
  );
};

export const RefundPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-2xl font-bold text-white">Refund & Billing Policy</h1>
      <p className="text-slate-400">Effective Date: October 1, 2026</p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">1. 14-Day Money-Back Guarantee</h2>
        <p>
          If SameWindow does not meet your expectations for agent observability within your first 14 days of paid subscription, contact support for a 100% full refund with no questions asked.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">2. Cancellation Policy</h2>
        <p>
          You can cancel your subscription at any time directly through the Billing panel. Your access will continue until the end of the current billing cycle.
        </p>
      </section>
    </div>
  );
};
