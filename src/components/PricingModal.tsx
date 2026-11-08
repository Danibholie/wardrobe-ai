"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Loader2,
  Crown,
  Zap,
} from "lucide-react";
import type { SubscriptionInfo, BillingCycle } from "@/lib/subscription";
import { trackBeginCheckout } from "@/lib/analytics";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: SubscriptionInfo | null;
  highlightReason?: string;
  defaultCycle?: BillingCycle;
}

export function PricingModal({
  isOpen,
  onClose,
  subscription,
  highlightReason,
  defaultCycle = "monthly",
}: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultCycle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && defaultCycle) {
      setBillingCycle(defaultCycle);
    }
  }, [isOpen, defaultCycle]);

  if (!isOpen) return null;

  const isPro = subscription?.isPro ?? false;

  async function handleUpgrade() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billingCycle }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.message || "Failed to initialize payment.");
      }

      // Track checkout initiation in Google Analytics
      trackBeginCheckout(billingCycle, billingCycle === "annual" ? 15000 : 1500);

      // Redirect user to Flutterwave hosted payment checkout
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("Upgrade error:", err);
      setError((err as Error).message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Wardrobe AI Plans
              </h3>
              <p className="text-xs text-on-surface-variant">
                Simple, transparent styling plans tailored for you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight notification if triggered by a limit */}
        {highlightReason && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-secondary-container/40 border border-secondary/20 flex items-center gap-2.5 text-xs text-on-secondary-container">
            <Zap className="w-4 h-4 text-secondary shrink-0" />
            <span>{highlightReason}</span>
          </div>
        )}

        {/* Billing Cycle Pill Selector */}
        <div className="flex justify-center pt-5 px-6">
          <div className="inline-flex items-center p-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-surface text-on-surface font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Monthly (₦1,500 / 30d)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>Annual (₦15,000 / yr)</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  billingCycle === "annual"
                    ? "bg-on-primary/20 text-on-primary"
                    : "bg-terracotta text-white"
                }`}
              >
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starter Plan */}
            <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Starter Wardrobe
                  </span>
                  {!isPro && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-on-surface">
                    Free
                  </span>
                  <span className="text-xs text-on-surface-variant ml-1">
                    / forever
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-on-surface-variant mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Upload up to <strong>20 clothing items</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>1 AI outfit recommendation</strong> per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Styles generated from your <strong>top 20 items</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Standard everyday occasions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Up to <strong>5 saved outfits</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-on-surface-variant/50">
                    <X className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                    <span>Special event &amp; owambe styling</span>
                  </li>
                  <li className="flex items-start gap-2 text-on-surface-variant/50">
                    <X className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                    <span>Outfit History &amp; wear counter</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-surface-container text-on-surface-variant cursor-default text-center"
                >
                  {!isPro ? "Your Current Plan" : "Basic Tier"}
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative p-5 rounded-2xl border-2 border-primary bg-primary-container/10 flex flex-col justify-between shadow-sm">
              <div className="absolute -top-3 right-4 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Wardrobe Pro
                  </span>
                  {isPro && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary text-on-primary">
                      {subscription?.isTrial ? "Trial Active" : "Active"}
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-on-surface">
                      {billingCycle === "monthly" ? "₦1,500" : "₦15,000"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {billingCycle === "monthly" ? "/ 30 days" : "/ year"}
                    </span>
                  </div>
                  {billingCycle === "annual" ? (
                    <p className="text-[11px] text-primary font-semibold mt-1">
                      ₦1,250 / mo effective • <strong>2 months free (Save ₦3,000)</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Flexible 30-day renewable access
                    </p>
                  )}
                </div>
                <ul className="space-y-2.5 text-xs text-on-surface mb-6">
                  <li className="flex items-start gap-2 font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> wardrobe items</span>
                  </li>
                  <li className="flex items-start gap-2 font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> daily outfit recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>AI styles across your <strong>entire closet</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Unlimited saved outfits</strong> + Outfit History &amp; wear counter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Special occasions: <strong>Owambe, Weddings, Dates, Gala</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Powered by <strong>Gemini 3.8 Flash</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Deep weather intelligence (heat, humidity &amp; rain radar)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting to Flutterwave...</span>
                    </>
                  ) : isPro ? (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>
                        {subscription?.isTrial
                          ? billingCycle === "monthly"
                            ? "Lock In Pro (₦1,500 for +30 Days)"
                            : "Lock In Annual Pro (₦15,000 for +365 Days)"
                          : billingCycle === "monthly"
                            ? "Renew Pro (₦1,500 for +30 Days)"
                            : "Renew Annual Pro (₦15,000 for +365 Days)"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>
                        {billingCycle === "monthly"
                          ? "Upgrade to Pro — ₦1,500"
                          : "Upgrade to Annual Pro — ₦15,000"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs text-center">
              {error}
            </div>
          )}

          {/* Payment trust notes */}
          <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-[11px] text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Instant activation &amp; 256-bit encryption</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-secondary" />
              <span>Supports Card, Bank Transfer, USSD via Flutterwave</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

