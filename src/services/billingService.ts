import { Storage } from '../lib/storage';
import { PRICING_PLANS } from '../lib/constants';
import { UserSubscription } from '../types';

export const BillingService = {
  getSubscription(): UserSubscription {
    return Storage.getSubscription();
  },

  checkCanRunAnalysis(): { allowed: boolean; message?: string } {
    const sub = this.getSubscription();
    if (sub.analysesUsed >= sub.analysesLimit) {
      return {
        allowed: false,
        message: `Monthly AI analysis limit reached (${sub.analysesUsed}/${sub.analysesLimit}). Upgrade to Pro or Team for higher limits.`,
      };
    }
    return { allowed: true };
  },

  getPlans() {
    return PRICING_PLANS;
  },

  updatePlan(planId: 'free' | 'developer' | 'pro' | 'team'): UserSubscription {
    const sub = Storage.getSubscription();
    const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
    sub.planId = plan.id as any;
    sub.planName = `${plan.name} Plan`;
    sub.monthlyCost = plan.price;
    sub.runsLimit = plan.limits.runs;
    sub.analysesLimit = plan.limits.analyses;
    sub.retentionDays = plan.limits.retentionDays;

    localStorage.setItem('samewindow_subscription', JSON.stringify(sub));
    return sub;
  },
};
