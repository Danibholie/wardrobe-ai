"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * Safely dispatches custom events to Google Analytics 4.
 * Fails silently if GA is blocked by an ad-blocker or uninitialized.
 */
export function trackAnalyticsEvent(
  action: string,
  params?: Record<string, string | number | boolean | null | undefined | unknown>
) {
  try {
    if (typeof window !== "undefined") {
      sendGAEvent("event", action, params || {});
    }
  } catch {
    // Graceful no-op in test, non-browser, or strict tracker-blocked environments
  }
}

export function trackBeginCheckout(
  billingCycle: "monthly" | "annual",
  priceNgn: number
) {
  trackAnalyticsEvent("begin_checkout", {
    currency: "NGN",
    value: priceNgn,
    items: [
      {
        item_id: `pro_${billingCycle}`,
        item_name: `Wardrobe Pro (${billingCycle})`,
        price: priceNgn,
        quantity: 1,
      },
    ],
  });
}

export function trackPurchase(
  txRef: string,
  priceNgn: number,
  billingCycle: "monthly" | "annual" = "monthly"
) {
  trackAnalyticsEvent("purchase", {
    transaction_id: txRef,
    value: priceNgn,
    currency: "NGN",
    items: [
      {
        item_id: `pro_${billingCycle}`,
        item_name: `Wardrobe Pro (${billingCycle})`,
        price: priceNgn,
        quantity: 1,
      },
    ],
  });
}

export function trackOutfitGenerated(
  occasion: string,
  weather: string,
  isPro: boolean
) {
  trackAnalyticsEvent("generate_outfit", {
    occasion,
    weather,
    tier: isPro ? "pro" : "starter",
  });
}

export function trackOutfitSaved(occasion?: string) {
  trackAnalyticsEvent("save_outfit", {
    occasion: occasion || "General Style",
  });
}

export function trackWearLogged(wearCount: number) {
  trackAnalyticsEvent("log_wear", {
    wear_count: wearCount,
  });
}

