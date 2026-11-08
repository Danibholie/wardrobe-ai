"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Shirt,
  Sparkles,
  Bookmark,
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Palette,
  ExternalLink,
  Share2,
  Copy,
  Check,
  MapPin,
  Wallet,
  CreditCard,
  DollarSign,
  ArrowDownRight,
  BadgeCheck,
} from "lucide-react";
import { SocialCanvasCard } from "@/components/admin/SocialCanvasCard";

interface AdminData {
  success: boolean;
  message?: string;
  timestamp: string;
  adminEmail?: string;
  users: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    dau: number;
    wau: number;
    recent: Array<{
      _id: string;
      name?: string;
      email: string;
      image?: string;
      role?: string;
      subscriptionTier?: string;
      subscriptionStatus?: string;
      isTrial?: boolean;
      createdAt: string;
      lastActiveAt?: string;
      wardrobeCount: number;
    }>;
  };
  clothes: {
    total: number;
    today: number;
    thisWeek: number;
    avgPerUser: string;
    categoryBreakdown: Array<{ category: string; count: number }>;
    colorBreakdown: Array<{ color: string; count: number }>;
    recent: Array<{
      _id: string;
      name: string;
      category: string;
      subcategory?: string;
      color: string;
      imageUrl: string;
      createdAt: string;
      user: { name?: string; email?: string } | null;
    }>;
  };
  outfitsGenerated: {
    totalRuns: number;
    estimatedTotalOutfits: number;
    today: number;
    thisWeek: number;
    avgLatencyMs: number;
    occasionBreakdown: Array<{ occasion: string; count: number }>;
  };
  savedOutfits: {
    total: number;
    today: number;
    thisWeek: number;
    totalWears: number;
    outfitsWithWears: number;
    avgWearsPerOutfit: string;
    mostWorn: Array<{
      _id: string;
      title: string;
      event?: string;
      wearCount: number;
      lastWorn?: string;
      user: { name?: string; email?: string } | null;
    }>;
    recent: Array<{
      _id: string;
      title: string;
      event?: string;
      weather?: string;
      wearCount: number;
      createdAt: string;
      user: { name?: string; email?: string } | null;
    }>;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    totalTransactions: number;
    activePaidSubscribers: number;
    activeTrials: number;
    starterUsers: number;
    recentTransactions: Array<{
      _id: string;
      txRef: string;
      flwTransactionId?: string;
      amount: number;
      currency: string;
      status: "pending" | "successful" | "failed";
      paymentType?: string;
      planCycle?: "monthly" | "annual";
      customerEmail: string;
      customerName?: string;
      paidAt?: string;
      createdAt: string;
    }>;
  };
  trends: Array<{
    date: string;
    label: string;
    newUsers: number;
    clothesAdded: number;
    outfitsGenerated: number;
    outfitsSaved: number;
    revenue?: number;
  }>;
  storage: {
    available: boolean;
    plan?: string;
    storageHuman?: string;
    imageCount?: number;
    creditsUsedPercent?: number;
  };
  health: {
    successRate24h: number;
    totalRequests24h: number;
    totalFailures24h: number;
    recommendationAvgLatencyMs: number;
    recommendationMaxLatencyMs: number;
    breakdown: Record<
      string,
      {
        total: number;
        successes: number;
        failures: number;
        avgLatencyMs: number;
      }
    >;
    recentFailures: Array<{
      _id: string;
      type: string;
      endpoint?: string;
      durationMs: number;
      statusCode?: number;
      errorCode?: string;
      errorMessage?: string;
      createdAt: string;
    }>;
  };
}

interface SocialDropData {
  city: string;
  dayOfWeek: string;
  themeTitle: string;
  culturalVibe: string;
  weatherSummary: string;
  temperature: string;
  humidity: string;
  fragranceProfile: string;
  herLook: {
    title: string;
    description: string;
    itemIds: string[];
    stylingNotes: string;
  };
  hisLook: {
    title: string;
    description: string;
    itemIds: string[];
    stylingNotes: string;
  };
  socialPosts: {
    twitter: string;
    instagram: string;
    linkedin: string;
    tiktokScript: string;
  };
}

type TabKey =
  | "overview"
  | "revenue"
  | "social"
  | "users"
  | "clothes"
  | "outfits"
  | "saved"
  | "health";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Daily Social Studio State
  const [socialData, setSocialData] = useState<SocialDropData | null>(null);
  const [selectedCity, setSelectedCity] = useState("Lagos");
  const [selectedDay, setSelectedDay] = useState(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        weekday: "long",
      }).format(new Date());
    } catch {
      return "Friday";
    }
  });
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [socialPlatformTab, setSocialPlatformTab] = useState<
    "twitter" | "instagram" | "linkedin" | "tiktok"
  >("twitter");
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (background = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/admin/metrics", { signal: controller.signal });
      clearTimeout(timeoutId);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || `Request failed with status ${res.status}`);
      } else {
        setData(json);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Connection to metrics API timed out. Click 'Refresh Data' to retry."
          : err instanceof Error
            ? err.message
            : "Failed to load admin metrics"
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleGenerateSocialDrop = useCallback(
    async (cityOverride?: string, dayOverride?: string) => {
      setIsGeneratingSocial(true);
      const targetCity = cityOverride || selectedCity;
      const targetDay = dayOverride || selectedDay;

      try {
        const res = await fetch("/api/admin/social-drop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: targetCity, dayOfWeek: targetDay }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setSocialData(json.data);
        }
      } catch (err) {
        console.error("Failed to generate social drop:", err);
      } finally {
        setIsGeneratingSocial(false);
      }
    },
    [selectedCity, selectedDay],
  );

  const handleCopySocialPost = useCallback(
    async (platform: "twitter" | "instagram" | "linkedin" | "tiktok") => {
      if (!socialData) return;
      const textToCopy =
        platform === "twitter"
          ? socialData.socialPosts.twitter
          : platform === "instagram"
            ? socialData.socialPosts.instagram
            : platform === "linkedin"
              ? socialData.socialPosts.linkedin
              : socialData.socialPosts.tiktokScript;

      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedPlatform(platform);
        setTimeout(() => setCopiedPlatform(null), 2500);
      } catch (err) {
        console.error("Failed to copy post text:", err);
      }
    },
    [socialData],
  );

  // Auto-generate social drop when user switches to the social tab for the first time
  useEffect(() => {
    if (activeTab === "social" && !socialData && !isGeneratingSocial) {
      handleGenerateSocialDrop();
    }
  }, [activeTab, socialData, isGeneratingSocial, handleGenerateSocialDrop]);

  // Clean error state if metrics fail to load for authorized admin
  if (error && !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-display-hero text-xl font-bold text-on-surface">
          Unable to Load Metrics
        </h2>
        <p className="text-on-surface-variant text-xs leading-relaxed">
          {error}
        </p>
        <button
          onClick={() => fetchMetrics()}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Graceful fallback data so dashboard and Social Studio load immediately without infinite blocking
  const fallbackData: AdminData = {
    success: true,
    timestamp: new Date().toISOString(),
    users: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, dau: 0, wau: 0, recent: [] },
    clothes: { total: 0, today: 0, thisWeek: 0, avgPerUser: "0", categoryBreakdown: [], colorBreakdown: [], recent: [] },
    outfitsGenerated: { totalRuns: 0, estimatedTotalOutfits: 0, today: 0, thisWeek: 0, avgLatencyMs: 0, occasionBreakdown: [] },
    savedOutfits: { total: 0, today: 0, thisWeek: 0, totalWears: 0, outfitsWithWears: 0, avgWearsPerOutfit: "0", mostWorn: [], recent: [] },
    revenue: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      totalTransactions: 0,
      activePaidSubscribers: 0,
      activeTrials: 0,
      starterUsers: 0,
      recentTransactions: [],
    },
    trends: [],
    storage: { available: false, imageCount: 0, storageHuman: "Available" },
    health: { successRate24h: 100, totalRequests24h: 0, totalFailures24h: 0, recommendationAvgLatencyMs: 0, recommendationMaxLatencyMs: 0, breakdown: {}, recentFailures: [] },
  };

  const activeMetrics = data || fallbackData;
  const {
    users,
    clothes,
    outfitsGenerated,
    savedOutfits,
    revenue,
    trends,
    storage,
    health,
  } = activeMetrics;

  // Max trend count for calculating relative bar heights
  const maxTrendVal = Math.max(
    ...trends.flatMap((t) => [
      t.clothesAdded,
      t.outfitsGenerated,
      t.newUsers,
      t.outfitsSaved,
      1,
    ]),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-12 pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ivory-300 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-forest">
              Live Operations Control
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mt-1 tracking-tight">
            Wardrobe AI Master Dashboard
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Real-time analytics for users, clothing catalog, AI outfit
            generations, and wardrobe sustainability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-ivory-300">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span suppressHydrationWarning>
              Synced: {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : "Live"}
            </span>
          </div>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-forest text-white hover:bg-forest-light transition shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Syncing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="p-3.5 rounded-xl bg-ivory-200/90 border border-ivory-300 text-xs text-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest" />
            <span>Syncing database vitals and catalog metrics...</span>
          </div>
          <span className="text-[11px] text-forest font-semibold">✨ Daily Social Studio is available to use below</span>
        </div>
      )}

      {error && !data && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>Notice: {error}</span>
          <button onClick={() => fetchMetrics()} className="underline font-semibold hover:text-amber-950 cursor-pointer">
            Retry Sync
          </button>
        </div>
      )}

      {/* 5 Core KPI Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* KPI 1: Total Revenue */}
        <div
          onClick={() => setActiveTab("revenue")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "revenue"
              ? "bg-ivory-200/90 border-forest ring-1 ring-forest"
              : "bg-white border-ivory-300 hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              ₦{revenue.total.toLocaleString()}
            </span>
            {revenue.today > 0 && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +₦{revenue.today.toLocaleString()}
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-ivory-200 text-xs text-stone-500 flex justify-between">
            <span>
              Pro: <strong>{revenue.activePaidSubscribers}</strong>
            </span>
            <span>
              Trials: <strong>{revenue.activeTrials}</strong>
            </span>
            <span>
              30d: <strong>₦{revenue.thisMonth.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* KPI 2: Total Users */}
        <div
          onClick={() => setActiveTab("users")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "users"
              ? "bg-ivory-200/90 border-forest ring-1 ring-forest"
              : "bg-white border-ivory-300 hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-ivory-200 text-forest flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-bold text-stone-900 tracking-tight">
              {users.total}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +{users.thisWeek} this wk
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-ivory-200 text-xs text-stone-500 flex justify-between">
            <span>
              DAU: <strong>{users.dau}</strong>
            </span>
            <span>
              WAU: <strong>{users.wau}</strong>
            </span>
            <span>
              Today: <strong>+{users.today}</strong>
            </span>
          </div>
        </div>

        {/* KPI 3: Total Clothes Added */}
        <div
          onClick={() => setActiveTab("clothes")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "clothes"
              ? "bg-ivory-200/90 border-forest ring-1 ring-forest"
              : "bg-white border-ivory-300 hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Clothes Cataloged
            </span>
            <div className="w-9 h-9 rounded-xl bg-ivory-200 text-forest flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-bold text-stone-900 tracking-tight">
              {clothes.total}
            </span>
            <span className="text-xs font-medium text-forest bg-ivory-200 px-2 py-0.5 rounded-full border border-ivory-300">
              +{clothes.thisWeek} this wk
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-ivory-200 text-xs text-stone-500 flex justify-between">
            <span>
              Avg / user: <strong>{clothes.avgPerUser}</strong>
            </span>
            <span>
              Added today: <strong>+{clothes.today}</strong>
            </span>
          </div>
        </div>

        {/* KPI 4: Total Outfits Generated */}
        <div
          onClick={() => setActiveTab("outfits")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "outfits"
              ? "bg-ivory-200/90 border-forest ring-1 ring-forest"
              : "bg-white border-ivory-300 hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Outfits Generated
            </span>
            <div className="w-9 h-9 rounded-xl bg-ivory-200 text-forest flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-bold text-stone-900 tracking-tight">
              {outfitsGenerated.estimatedTotalOutfits}
            </span>
            <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
              {outfitsGenerated.totalRuns} AI runs
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-ivory-200 text-xs text-stone-500 flex justify-between">
            <span>
              Runs today: <strong>{outfitsGenerated.today}</strong>
            </span>
            <span>
              Avg speed:{" "}
              <strong>
                {(outfitsGenerated.avgLatencyMs / 1000).toFixed(1)}s
              </strong>
            </span>
          </div>
        </div>

        {/* KPI 5: Total Outfits Saved & Wears */}
        <div
          onClick={() => setActiveTab("saved")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "saved"
              ? "bg-ivory-200/90 border-forest ring-1 ring-forest"
              : "bg-white border-ivory-300 hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Saved &amp; Wear Tracker
            </span>
            <div className="w-9 h-9 rounded-xl bg-ivory-200 text-forest flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-bold text-stone-900 tracking-tight">
              {savedOutfits.total}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {savedOutfits.totalWears} wears
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-ivory-200 text-xs text-stone-500 flex justify-between">
            <span>
              Saved 7d: <strong>+{savedOutfits.thisWeek}</strong>
            </span>
            <span>
              Avg wear: <strong>{savedOutfits.avgWearsPerOutfit}x</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-ivory-300 scrollbar-none">
        {[
          { key: "overview", label: "Executive Overview", icon: Layers },
          {
            key: "revenue",
            label: `Revenue & Billing (₦${revenue.total.toLocaleString()})`,
            icon: CreditCard,
          },
          { key: "social", label: "✨ Daily Social Studio", icon: Share2 },
          { key: "users", label: `Users (${users.total})`, icon: Users },
          {
            key: "clothes",
            label: `Clothes Catalog (${clothes.total})`,
            icon: Shirt,
          },
          {
            key: "outfits",
            label: `AI Outfits (${outfitsGenerated.totalRuns})`,
            icon: Sparkles,
          },
          {
            key: "saved",
            label: `Saved & Wears (${savedOutfits.total})`,
            icon: Bookmark,
          },
          { key: "health", label: "System Health & Cloud", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-forest text-white shadow-xs"
                  : "bg-white text-stone-600 hover:text-stone-900 hover:bg-ivory-200/80 border border-ivory-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Revenue & Financial Health Pulse */}
          <div className="bg-gradient-to-br from-forest/5 via-ivory-100 to-ivory-200/60 rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ivory-300 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900">
                    Revenue &amp; Monetization Inflow
                  </h3>
                  <p className="text-xs text-stone-500">
                    Gross subscription earnings from Wardrobe Pro (₦1,500/30-day pass)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("revenue")}
                className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                Full Billing Ledger <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-white border border-ivory-300 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Total Collected
                </span>
                <div className="font-editorial text-2xl font-bold text-stone-900">
                  ₦{revenue.total.toLocaleString()}
                </div>
                <p className="text-[10px] text-stone-500">
                  {revenue.totalTransactions} paid {revenue.totalTransactions === 1 ? "subscription" : "subscriptions"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-ivory-300 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Past 30 Days (MRR)
                </span>
                <div className="font-editorial text-2xl font-bold text-forest">
                  ₦{revenue.thisMonth.toLocaleString()}
                </div>
                <p className="text-[10px] text-stone-500">
                  Rolling monthly run rate
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-ivory-300 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Active Pro Users
                </span>
                <div className="font-editorial text-2xl font-bold text-emerald-800">
                  {revenue.activePaidSubscribers}
                </div>
                <p className="text-[10px] text-stone-500">
                  + {revenue.activeTrials} on 7-day trial
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-ivory-300 shadow-2xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Pro Conversion Rate
                </span>
                <div className="font-editorial text-2xl font-bold text-amber-700">
                  {users.total > 0
                    ? ((revenue.activePaidSubscribers / users.total) * 100).toFixed(1)
                    : "0.0"}
                  %
                </div>
                <p className="text-[10px] text-stone-500">
                  Paid vs {users.total} total accounts
                </p>
              </div>
            </div>
          </div>

          {/* 7-Day Activity Trends Multi-chart */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  7-Day Platform Activity Trajectory
                </h3>
                <p className="text-xs text-stone-500">
                  Daily progression across garment uploads, AI styling runs, and
                  user registrations.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-forest"></span>{" "}
                  Clothes Added
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>{" "}
                  AI Runs
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>{" "}
                  New Users
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end h-48 border-b border-ivory-200">
              {trends.map((day) => {
                const clothesHeight = Math.max(
                  Math.round((day.clothesAdded / maxTrendVal) * 100),
                  day.clothesAdded > 0 ? 10 : 2,
                );
                const aiHeight = Math.max(
                  Math.round((day.outfitsGenerated / maxTrendVal) * 100),
                  day.outfitsGenerated > 0 ? 10 : 2,
                );
                const userHeight = Math.max(
                  Math.round((day.newUsers / maxTrendVal) * 100),
                  day.newUsers > 0 ? 10 : 2,
                );

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center h-full justify-end gap-1.5"
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Clothes Bar */}
                      <div
                        title={`Clothes: ${day.clothesAdded}`}
                        style={{ height: `${clothesHeight}%` }}
                        className="w-2.5 sm:w-4 bg-forest rounded-t-sm transition-all"
                      />
                      {/* AI Bar */}
                      <div
                        title={`AI Runs: ${day.outfitsGenerated}`}
                        style={{ height: `${aiHeight}%` }}
                        className="w-2.5 sm:w-4 bg-amber-500 rounded-t-sm transition-all"
                      />
                      {/* User Bar */}
                      <div
                        title={`New Users: ${day.newUsers}`}
                        style={{ height: `${userHeight}%` }}
                        className="w-2.5 sm:w-4 bg-emerald-500 rounded-t-sm transition-all"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-stone-600">
                      {day.label}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Dual Columns: Recent Signups + Recent Uploads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Recent Users */}
            <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-forest" />
                  Latest Registrations
                </h3>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-xs text-forest font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-ivory-200">
                {users.recent.slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (user.name?.[0] || user.email[0]).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {user.name || "Anonymous Member"}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ivory-200 text-forest border border-ivory-300">
                        {user.wardrobeCount} items
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5" suppressHydrationWarning>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Recent Clothes */}
            <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-forest" />
                  Recent Wardrobe Uploads
                </h3>
                <button
                  onClick={() => setActiveTab("clothes")}
                  className="text-xs text-forest font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {clothes.recent.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    className="p-2.5 rounded-xl bg-ivory-100/70 border border-ivory-200 flex flex-col items-center text-center space-y-2"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white relative border border-ivory-300 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-500 capitalize truncate">
                        {item.category} · {item.color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. REVENUE & BILLING */}
      {activeTab === "revenue" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Revenue Header Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Gross Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="font-editorial text-3xl font-bold text-stone-900 tracking-tight">
                ₦{revenue.total.toLocaleString()}
              </div>
              <p className="text-xs text-stone-500">
                All-time revenue received via Flutterwave
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  30-Day Monthly Run Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-ivory-200 text-forest border border-ivory-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-editorial text-3xl font-bold text-forest tracking-tight">
                ₦{revenue.thisMonth.toLocaleString()}
              </div>
              <p className="text-xs text-stone-500">
                Inflow past 30 days (7d: ₦{revenue.thisWeek.toLocaleString()})
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Active Pro Subscribers
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-3xl font-bold text-stone-900 tracking-tight">
                  {revenue.activePaidSubscribers}
                </span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Paying ₦1,500/mo
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Plus <strong>{revenue.activeTrials}</strong> users on active 7-day trial
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Free Starter Users
                </span>
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-3xl font-bold text-stone-900 tracking-tight">
                  {revenue.starterUsers}
                </span>
                <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                  Free Tier
                </span>
              </div>
              <p className="text-xs text-stone-500">
                20 items cap &amp; 1 AI outfit generation/day
              </p>
            </div>
          </div>

          {/* Pricing Model & Tier Benefits Summary */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <div className="border-b border-ivory-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Configured Monetization &amp; Pricing Architecture
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Current active product tiers, entitlement limits, and billing cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Starter Tier */}
              <div className="p-4 rounded-xl bg-ivory-100/60 border border-ivory-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-800">
                    Starter Wardrobe
                  </span>
                  <span className="font-editorial text-2xl font-bold text-stone-900">
                    ₦0 <span className="text-xs font-normal text-stone-500">/ forever</span>
                  </span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Up to <strong>20 clothing items</strong> cataloged</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span><strong>1 AI outfit recommendation</strong> per day (atomic daily reset)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Active 20-item rotation window for oversized closets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Weather-based smart styling &amp; wear counter</span>
                  </li>
                </ul>
              </div>

              {/* Pro Tier */}
              <div className="p-4 rounded-xl bg-forest/5 border border-forest/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-forest text-white">
                    Wardrobe Pro
                  </span>
                  <div className="text-right">
                    <span className="font-editorial text-2xl font-bold text-forest">
                      ₦1,500 <span className="text-xs font-normal text-stone-500">/ 30-day</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800 block">
                      or ₦15,000 / year (Save 17%)
                    </span>
                  </div>
                </div>
                <ul className="text-xs text-stone-700 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span><strong>Unlimited</strong> clothing items &amp; full closet catalog</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span><strong>Unlimited daily AI outfit generations</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>Flexible passes: <strong>30-Day (₦1,500)</strong> or <strong>Annual (₦15,000)</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span><strong>7-day automatic trial</strong> for all newly registered users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>Hosted Flutterwave checkout with instant webhook synchronization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ivory-200 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-forest" />
                  Live Transactions Ledger
                </h3>
                <p className="text-xs text-stone-500">
                  Recent payment attempts, subscription purchases, and webhook confirmations.
                </p>
              </div>
              <div className="text-xs font-semibold text-stone-600 bg-ivory-100 px-3 py-1.5 rounded-xl border border-ivory-300">
                Total Transactions: {revenue.totalTransactions}
              </div>
            </div>

            {revenue.recentTransactions.length === 0 ? (
              <div className="p-8 text-center bg-ivory-100/50 rounded-xl border border-ivory-200">
                <Wallet className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800">
                  No payment transactions recorded yet.
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  When members upgrade to Wardrobe Pro via Flutterwave, real-time transaction ledgers will show here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-ivory-100 text-stone-600 font-semibold uppercase tracking-wider text-[10px] border-b border-ivory-300">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-200">
                    {revenue.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-ivory-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-stone-900">
                            {tx.customerName || "Member"}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {tx.customerEmail}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-stone-900">
                          <div>₦{tx.amount.toLocaleString()} {tx.currency}</div>
                          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">
                            {tx.planCycle === "annual" || tx.amount >= 15000
                              ? "Annual (365d)"
                              : "Monthly (30d)"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {tx.status === "successful" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Successful
                            </span>
                          ) : tx.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 capitalize text-stone-600">
                          {tx.paymentType || "Card / Bank"}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-stone-500">
                          <span title={tx.txRef}>
                            {tx.txRef.length > 20 ? `${tx.txRef.slice(0, 18)}...` : tx.txRef}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-500" suppressHydrationWarning>
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DAILY SOCIAL STUDIO */}
      {activeTab === "social" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Automated Branded Canvas Studio
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  Daily Naija Social Drop Studio
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Generate editorial flat-lay graphics and platform-ready copy
                  for Twitter/X, Instagram, LinkedIn, and TikTok in 60 seconds.
                </p>
              </div>

              {/* Selectors and Action */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-ivory-100 px-3 py-2 rounded-xl border border-ivory-300 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  <span className="font-semibold text-stone-700">City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setSelectedCity(newCity);
                      handleGenerateSocialDrop(newCity, selectedDay);
                    }}
                    className="bg-transparent font-medium text-stone-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Ibadan">Ibadan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-ivory-100 px-3 py-2 rounded-xl border border-ivory-300 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-forest" />
                  <span className="font-semibold text-stone-700">Day:</span>
                  <select
                    value={selectedDay}
                    onChange={(e) => {
                      const newDay = e.target.value;
                      setSelectedDay(newDay);
                      handleGenerateSocialDrop(selectedCity, newDay);
                    }}
                    className="bg-transparent font-medium text-stone-900 focus:outline-none cursor-pointer"
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleGenerateSocialDrop()}
                  disabled={isGeneratingSocial}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest text-white hover:bg-forest-light transition shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isGeneratingSocial ? "animate-spin" : ""}`}
                  />
                  {isGeneratingSocial
                    ? "Curating & Styling..."
                    : "Regenerate Drop"}
                </button>
              </div>
            </div>
          </div>

          {/* Social Output View */}
          {socialData ? (
            <div className="space-y-8">
              {/* Daily Theme & Weather Bar */}
              <div className="p-5 rounded-2xl bg-ivory-200/80 border border-ivory-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-forest">
                    {socialData.dayOfWeek.toUpperCase()} IN{" "}
                    {socialData.city.toUpperCase()} · NIGERIAN DAILY BLUEPRINT
                  </span>
                  <h4 className="font-editorial text-2xl font-bold text-stone-900">
                    {socialData.themeTitle}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {socialData.culturalVibe}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-ivory-300 font-semibold text-stone-800">
                    🌡️ {socialData.temperature} · {socialData.humidity} Humidity
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-ivory-300 font-semibold text-amber-800">
                    🌿 {socialData.fragranceProfile}
                  </span>
                </div>
              </div>

              {/* Main Grid: Visual Cards (Left) + Copy Hub (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 7 cols: The Canvas Graphic Cards (Her + His) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SocialCanvasCard
                    gender="women"
                    city={socialData.city}
                    dayOfWeek={socialData.dayOfWeek}
                    themeTitle={socialData.themeTitle}
                    temperature={socialData.temperature}
                    humidity={socialData.humidity}
                    fragranceProfile={socialData.fragranceProfile}
                    look={socialData.herLook}
                  />

                  <SocialCanvasCard
                    gender="men"
                    city={socialData.city}
                    dayOfWeek={socialData.dayOfWeek}
                    themeTitle={socialData.themeTitle}
                    temperature={socialData.temperature}
                    humidity={socialData.humidity}
                    fragranceProfile={socialData.fragranceProfile}
                    look={socialData.hisLook}
                  />
                </div>

                {/* Right 5 cols: Platform Copy Hub */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm space-y-5 sticky top-24">
                  <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
                    <div>
                      <h4 className="font-editorial text-xl font-bold text-stone-900">
                        Channel Copy Hub
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Optimized for algorithms &amp; culture
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-ivory-100 border border-ivory-300 text-[10px] font-mono text-stone-600">
                      1-Click Copy
                    </span>
                  </div>

                  {/* Channel Subtabs */}
                  <div className="grid grid-cols-4 gap-1.5 bg-ivory-100 p-1.5 rounded-xl border border-ivory-200 text-xs">
                    {(
                      [
                        { key: "twitter", label: "Twitter / X" },
                        { key: "instagram", label: "Instagram" },
                        { key: "linkedin", label: "LinkedIn" },
                        { key: "tiktok", label: "TikTok" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSocialPlatformTab(tab.key)}
                        className={`py-1.5 rounded-lg font-semibold text-center text-xs transition-all cursor-pointer ${
                          socialPlatformTab === tab.key
                            ? "bg-forest text-white shadow-2xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Copy Area for Selected Tab */}
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        readOnly
                        value={
                          socialPlatformTab === "twitter"
                            ? socialData.socialPosts.twitter
                            : socialPlatformTab === "instagram"
                              ? socialData.socialPosts.instagram
                              : socialPlatformTab === "linkedin"
                                ? socialData.socialPosts.linkedin
                                : socialData.socialPosts.tiktokScript
                        }
                        rows={13}
                        className="w-full p-4 rounded-xl bg-ivory-50 border border-ivory-200 text-xs font-sans text-stone-800 leading-relaxed resize-none focus:outline-none select-all"
                      />
                    </div>

                    <button
                      onClick={() => handleCopySocialPost(socialPlatformTab)}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                        copiedPlatform === socialPlatformTab
                          ? "bg-emerald-600 text-white"
                          : "bg-forest text-white hover:bg-forest-light"
                      }`}
                    >
                      {copiedPlatform === socialPlatformTab ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>
                            Copy {socialPlatformTab.toUpperCase()} Text
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-ivory-300 shadow-sm space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-forest mx-auto opacity-70" />
              <p className="font-editorial text-xl font-bold text-stone-900">
                Generating Today&apos;s Editorial Social Blueprint...
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Gemini is checking live Nigerian weather, curating His &amp; Her
                looks, and writing channel posts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. USERS */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ivory-200 pb-4">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  User Accounts &amp; Retention
                </h3>
                <p className="text-xs text-stone-500">
                  Registered members, wardrobe collection sizes, and login
                  activity.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-ivory-200 text-forest font-semibold">
                  {users.total} Total Registered
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  {users.dau} Active Past 24h
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-ivory-100 text-stone-600 font-semibold uppercase tracking-wider text-[10px] border-b border-ivory-300">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Wardrobe Size</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {users.recent.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-ivory-50 transition-colors"
                    >
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (user.name?.[0] || user.email[0]).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate">
                            {user.name || "Member"}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {user.subscriptionTier === "pro" ? (
                          user.isTrial ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Pro Trial (7d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Pro (₦1,500)
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600">
                            Starter Free
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-forest">
                        {user.wardrobeCount} items
                      </td>
                      <td className="px-4 py-3.5 text-stone-500" suppressHydrationWarning>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-stone-500" suppressHydrationWarning>
                        {user.lastActiveAt
                          ? new Date(user.lastActiveAt).toLocaleString()
                          : "Recently"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. CLOTHES */}
      {activeTab === "clothes" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Categories & Colors Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-forest" />
                Category Distribution
              </h3>
              <div className="space-y-3 pt-2">
                {clothes.categoryBreakdown.map((cat) => {
                  const percent =
                    clothes.total > 0
                      ? Math.round((cat.count / clothes.total) * 100)
                      : 0;
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-stone-700">
                        <span className="capitalize">{cat.category}</span>
                        <span>
                          <strong>{cat.count}</strong> ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-ivory-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-forest rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-forest" />
                Top Wardrobe Colors
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {clothes.colorBreakdown.map((color) => (
                  <div
                    key={color.color}
                    className="p-3 rounded-xl bg-ivory-100 border border-ivory-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs" />
                      <span className="text-xs font-semibold capitalize text-stone-800">
                        {color.color}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-forest">
                      {color.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clothes Gallery */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <h3 className="font-editorial text-xl font-bold text-stone-900">
              Catalog Items Feed ({clothes.recent.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
              {clothes.recent.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-ivory-200 bg-ivory-50/50 p-2.5 flex flex-col space-y-2"
                >
                  <div className="aspect-square rounded-lg bg-white overflow-hidden border border-ivory-300 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-stone-500 capitalize truncate">
                      {item.category} · {item.color}
                    </p>
                    <p className="text-[9px] text-stone-400 mt-1 truncate">
                      By {item.user?.name || "User"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. OUTFITS & AI */}
      {activeTab === "outfits" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                Total AI Runs
              </span>
              <div className="font-editorial text-3xl font-bold text-stone-900">
                {outfitsGenerated.totalRuns}
              </div>
              <p className="text-xs text-stone-400">
                Yielded ~{outfitsGenerated.estimatedTotalOutfits} styled options
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                Average Latency
              </span>
              <div className="font-editorial text-3xl font-bold text-forest">
                {(outfitsGenerated.avgLatencyMs / 1000).toFixed(2)}s
              </div>
              <p className="text-xs text-stone-400">
                Powered by Google Gemini multimodal reasoning
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                Saved Conversion
              </span>
              <div className="font-editorial text-3xl font-bold text-amber-700">
                {outfitsGenerated.totalRuns > 0
                  ? Math.round(
                      (savedOutfits.total /
                        outfitsGenerated.estimatedTotalOutfits) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-stone-400">
                Ratio of generated outfits saved to favorites
              </p>
            </div>
          </div>

          {/* Occasion Popularity */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <h3 className="font-editorial text-xl font-bold text-stone-900">
              Most Requested Styling Occasions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {outfitsGenerated.occasionBreakdown.map((occ) => (
                <div
                  key={occ.occasion}
                  className="p-4 rounded-xl bg-ivory-100 border border-ivory-200"
                >
                  <p className="text-xs font-semibold capitalize text-stone-800">
                    {occ.occasion}
                  </p>
                  <p className="font-editorial text-2xl font-bold text-forest mt-1">
                    {occ.count}{" "}
                    <span className="text-xs font-normal text-stone-500">
                      requests
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. SAVED & WEARS */}
      {activeTab === "saved" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Worn Outfits Leaderboard */}
            <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-forest" />
                Most Rotated Outfits (Wear Counter)
              </h3>
              <div className="divide-y divide-ivory-200">
                {savedOutfits.mostWorn.map((outfit) => (
                  <div
                    key={outfit._id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {outfit.title}
                      </p>
                      <p className="text-[11px] text-stone-500 capitalize">
                        {outfit.event || "General Style"} ·{" "}
                        {outfit.user?.name || "Member"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {outfit.wearCount} Wears
                      </span>
                    </div>
                  </div>
                ))}
                {savedOutfits.mostWorn.length === 0 && (
                  <p className="text-xs text-stone-500 py-4 text-center">
                    No outfits have logged wear counts yet.
                  </p>
                )}
              </div>
            </div>

            {/* Recently Saved Outfits */}
            <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Recently Saved Looks
              </h3>
              <div className="divide-y divide-ivory-200">
                {savedOutfits.recent.map((outfit) => (
                  <div
                    key={outfit._id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {outfit.title}
                      </p>
                      <p className="text-[11px] text-stone-500 capitalize">
                        {outfit.event || "Saved Look"} ·{" "}
                        {outfit.user?.name || "Member"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 text-xs text-stone-400" suppressHydrationWarning>
                      {new Date(outfit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. HEALTH & CLOUDINARY */}
      {activeTab === "health" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Cloudinary Storage Metrics */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-forest" />
              Cloud Media Infrastructure (Cloudinary)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200">
                <span className="text-xs text-stone-500 block">
                  Total Hosted Images
                </span>
                <span className="text-2xl font-bold text-stone-900">
                  {storage.imageCount ?? clothes.total}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200">
                <span className="text-xs text-stone-500 block">
                  Storage Volume
                </span>
                <span className="text-2xl font-bold text-forest">
                  {storage.storageHuman || "Available"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200">
                <span className="text-xs text-stone-500 block">
                  Cloud Status
                </span>
                <span className="text-2xl font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Failures & Diagnostics */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-forest" />
                Recent System Diagnostics &amp; Failure Logs
              </h3>
              <span className="text-xs font-semibold text-stone-600">
                Success Rate (24h): {health.successRate24h}%
              </span>
            </div>

            {health.recentFailures.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-900">
                  Zero critical failures in recent operations!
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  All API endpoints and AI recommendation systems are operating
                  nominally.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ivory-200">
                {health.recentFailures.map((failure) => (
                  <div key={failure._id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-rose-700">
                        {failure.type}{" "}
                        {failure.statusCode ? `(${failure.statusCode})` : ""}
                      </span>
                      <span className="text-stone-400" suppressHydrationWarning>
                        {new Date(failure.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-stone-700 font-mono text-[11px] truncate">
                      {failure.errorMessage ||
                        failure.errorCode ||
                        "Unknown error"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
