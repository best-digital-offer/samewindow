import React, { useState } from 'react';
import { CreditCard, Zap, ShieldCheck, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { BillingService } from '../../services/billingService';
import { PRICING_PLANS } from '../../lib/constants';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const BillingDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [sub, setSub] = useState(() => BillingService.getSubscription());
  const [changePlanModal, setChangePlanModal] = useState(false);

  // Compute percentages
  const runsPct = Math.min(100, Math.round((sub.runsUsed / sub.runsLimit) * 100));
  const analysesPct = Math.min(100, Math.round((sub.analysesUsed / sub.analysesLimit) * 100));
  const storagePct = Math.min(100, Math.round((sub.storageUsedGb / sub.storageLimitGb) * 100));

  const handlePlanChange = (planId: any) => {
    const updated = BillingService.updatePlan(planId);
    setSub(updated);
    setChangePlanModal(false);
    toast(`Tier changed to ${updated.planName}.`, 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto text-xs text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2230]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Billing & Usage Quotas</h1>
          <p className="text-slate-400 mt-0.5">
            Monitor real-time consumption across runs, storage, and Groq-powered AI investigations.
          </p>
        </div>

        <button
          onClick={() => setChangePlanModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Change Subscription Plan</span>
        </button>
      </div>

      {/* Plan Card */}
      <div className="p-5 rounded-xl bg-[#0c0f16] border border-[#1b2230] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Current Tier
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">{sub.planName}</h3>
          <p className="text-slate-400 mt-0.5">
            ${sub.monthlyCost}/month billed monthly. {sub.retentionDays}-day retention history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 font-mono text-[11px] border border-emerald-800/40 font-semibold">
            ACTIVE STATUS
          </span>
        </div>
      </div>

      {/* Usage Limit Bars */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Monthly Quotas & Utilization</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Runs */}
          <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-white">Agent Runs</span>
              <span className="font-mono text-[11px]">{runsPct}%</span>
            </div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              {sub.runsUsed.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {sub.runsLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#171d28] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.max(5, runsPct)}%` }}
              />
            </div>
          </div>

          {/* AI Analysis */}
          <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-white">AI Failure Analysis</span>
              <span className="font-mono text-[11px]">{analysesPct}%</span>
            </div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              {sub.analysesUsed}{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {sub.analysesLimit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#171d28] rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${Math.max(5, analysesPct)}%` }}
              />
            </div>
          </div>

          {/* Storage */}
          <div className="p-4 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-white">Telemetry Storage</span>
              <span className="font-mono text-[11px]">{storagePct}%</span>
            </div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              {sub.storageUsedGb.toFixed(2)} GB{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {sub.storageLimitGb} GB
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#171d28] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.max(5, storagePct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Architecture Placeholder Notice */}
      <div className="p-4 rounded-xl bg-[#080b10] border border-[#1b2230] text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-white font-semibold text-xs">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          <span>Payment Gateway Architecture</span>
        </div>
        <p className="leading-relaxed">
          Stripe billing integration is decoupled via <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_WEBHOOK_SECRET</code> in <code>.env</code>. In sandbox/development mode, plan switches execute immediately without external card charges.
        </p>
      </div>

      {/* Plan Switcher Modal */}
      {changePlanModal && (
        <Modal
          isOpen={true}
          onClose={() => setChangePlanModal(false)}
          title="Select Subscription Tier"
          maxWidth="max-w-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRICING_PLANS.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-[#090d14] border border-[#1e2738] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="font-mono font-bold text-white text-base">
                      ${p.price}<span className="text-xs text-slate-400 font-normal">/mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{p.subtitle}</p>
                  <div className="mt-2 text-[11px] font-mono text-indigo-300">
                    {p.limits.runs.toLocaleString()} runs · {p.limits.retentionDays}d retention
                  </div>
                </div>

                <button
                  onClick={() => handlePlanChange(p.id)}
                  disabled={sub.planId === p.id}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold ${
                    sub.planId === p.id
                      ? 'bg-[#151c27] text-slate-400 border border-[#222a38] cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {sub.planId === p.id ? 'Current Plan' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
