import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { PRICING_PLANS } from '../lib/constants';
import { BillingService } from '../services/billingService';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';

interface PricingPageProps {
  onSelectPlan: (planId: string) => void;
  isAuthenticated: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan, isAuthenticated }) => {
  const { toast } = useToast();
  const [selectedPlanModal, setSelectedPlanModal] = useState<any | null>(null);
  const currentSub = BillingService.getSubscription();

  const handleChoosePlan = (plan: any) => {
    if (!isAuthenticated) {
      onSelectPlan(plan.id);
      return;
    }
    setSelectedPlanModal(plan);
  };

  const handleConfirmUpgrade = () => {
    if (selectedPlanModal) {
      BillingService.updatePlan(selectedPlanModal.id);
      toast(`Successfully activated ${selectedPlanModal.name} Plan!`, 'success');
      setSelectedPlanModal(null);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          Transparent Predictable Pricing
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Invest in observability, not debugging downtime.
        </h1>
        <p className="text-sm text-slate-400">
          Scale effortlessly from your first prototype to millions of autonomous agent executions.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = currentSub.planId === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-[#0f1422] border-2 border-indigo-500/80 shadow-2xl shadow-indigo-950/40'
                  : 'bg-[#0b0e14] border border-[#1b2230] hover:border-[#283244]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.subtitle}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-[#18202d]">
                  <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-slate-400">{plan.interval}</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleChoosePlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#151c27] text-slate-400 border border-[#222a38] cursor-default'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-[#141a24] hover:bg-[#1a2230] text-white border border-[#222b3b]'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : `Get Started with ${plan.name}`}</span>
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-xl border border-[#1b2230] bg-[#090c12] p-6 space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight">Detailed Feature Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="border-b border-[#1b2230] text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-sans font-medium">Feature</th>
                <th className="py-2.5 px-3">Free</th>
                <th className="py-2.5 px-3">Developer</th>
                <th className="py-2.5 px-3">Pro</th>
                <th className="py-2.5 px-3">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151b26] text-[11px]">
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-white">Monthly Runs</td>
                <td className="py-3 px-3">1,000</td>
                <td className="py-3 px-3">25,000</td>
                <td className="py-3 px-3">250,000</td>
                <td className="py-3 px-3">1,000,000+</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-white">Data Retention</td>
                <td className="py-3 px-3">7 Days</td>
                <td className="py-3 px-3">30 Days</td>
                <td className="py-3 px-3">90 Days</td>
                <td className="py-3 px-3">365 Days</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-white">Timeline Replay</td>
                <td className="py-3 px-3 text-slate-400">—</td>
                <td className="py-3 px-3 text-emerald-400">Included</td>
                <td className="py-3 px-3 text-emerald-400">Included</td>
                <td className="py-3 px-3 text-emerald-400">Included</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-white">Divergence Comparison</td>
                <td className="py-3 px-3 text-slate-400">—</td>
                <td className="py-3 px-3 text-emerald-400">Included</td>
                <td className="py-3 px-3 text-emerald-400">Included</td>
                <td className="py-3 px-3 text-emerald-400">Included</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-white">AI Failure Analysis (Groq)</td>
                <td className="py-3 px-3">20 / mo</td>
                <td className="py-3 px-3">500 / mo</td>
                <td className="py-3 px-3">2,500 / mo</td>
                <td className="py-3 px-3">10,000 / mo</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-white">Field Redaction</td>
                <td className="py-3 px-3">Standard</td>
                <td className="py-3 px-3">Configurable</td>
                <td className="py-3 px-3">Custom RegEx</td>
                <td className="py-3 px-3">Enterprise Rules</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Modal */}
      {selectedPlanModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlanModal(null)}
          title={`Switch to ${selectedPlanModal.name} Plan`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <p>
              You are upgrading to the <strong className="text-white">{selectedPlanModal.name} Plan</strong> at{' '}
              <strong className="text-emerald-400 font-mono">${selectedPlanModal.price}/month</strong>.
            </p>
            <div className="p-3 rounded-lg bg-[#080b10] border border-[#1b2230] space-y-1 font-mono text-[11px]">
              <div>• Monthly Run Capacity: {selectedPlanModal.limits.runs.toLocaleString()} runs</div>
              <div>• History Retention: {selectedPlanModal.limits.retentionDays} days</div>
              <div>• AI Failure Analysis: {selectedPlanModal.limits.analyses} analyses/mo</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
