"use client";

import { useState, useEffect, useCallback } from "react";
import type { SubscriptionInfo } from "@/lib/subscription";

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/subscription");
      if (!res.ok) {
        throw new Error("Failed to load subscription status");
      }
      const data = await res.json();
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error("useSubscription error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refreshSubscription: fetchSubscription,
  };
}

