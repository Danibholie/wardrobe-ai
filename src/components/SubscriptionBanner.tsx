"use client";

import { Sparkles, Crown, AlertTriangle } from "lucide-react";
import type { SubscriptionInfo } from "@/lib/subscription";

interface SubscriptionBannerProps {
  subscription: SubscriptionInfo | null;
  onOpenPricing: () => void;
}

export function SubscriptionBanner({
  subscription,
  onOpenPricing,
}: SubscriptionBannerProps) {
  if (!subscription) return null;

  const { isPro, isTrial, daysRemaining, itemCount, maxItems } = subscription;

  // Case 1: Pro Free Trial active
  if (isPro && isTrial) {
    return (
      <div className="bg-gradient-to-r from-primary/15 via-primary-container/20 to-primary/10 border-b border-primary/20 px-4 py-2 text-xs text-on-surface flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
          <span>
            <strong>Pro Free Trial Active:</strong> You have{" "}
            <strong>{daysRemaining} day{daysRemaining === 1 ? "" : "s"}</strong> of unlimited AI styling and uploads left!
          </span>
        </div>
        <button
          onClick={onOpenPricing}
          className="px-3 py-1 bg-primary text-on-primary text-[11px] font-semibold rounded-full hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          Keep Pro for ₦1,500
        </button>
      </div>
    );
  }

  // Case 2: Pro expiring within 3 days
  if (isPro && daysRemaining <= 3) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            Your Pro access expires in{" "}
            <strong>{daysRemaining} day{daysRemaining === 1 ? "" : "s"}</strong>. Renew now to avoid styling restrictions.
          </span>
        </div>
        <button
          onClick={onOpenPricing}
          className="px-3 py-1 bg-amber-600 text-white text-[11px] font-semibold rounded-full hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
        >
          Renew (+30 Days)
        </button>
      </div>
    );
  }

  // Case 3: Starter close to or reached 20-item limit
  if (!isPro && itemCount >= maxItems) {
    return (
      <div className="bg-secondary-container/40 border-b border-secondary/20 px-4 py-2 text-xs text-on-secondary-container flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-secondary shrink-0" />
          <span>
            <strong>Wardrobe Limit Reached ({itemCount}/{maxItems}):</strong> Upgrade to Wardrobe Pro to unlock unlimited clothing uploads and daily outfits.
          </span>
        </div>
        <button
          onClick={onOpenPricing}
          className="px-3 py-1 bg-secondary text-on-secondary text-[11px] font-semibold rounded-full hover:bg-secondary/90 transition-colors shrink-0 cursor-pointer"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return null;
}

