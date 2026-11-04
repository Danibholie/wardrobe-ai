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
} from "lucide-react";

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
  trends: Array<{
    date: string;
    label: string;
    newUsers: number;
    clothesAdded: number;
    outfitsGenerated: number;
    outfitsSaved: number;
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

type TabKey = "overview" | "users" | "clothes" | "outfits" | "saved" | "health";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const fetchMetrics = useCallback(async (background = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch("/api/admin/metrics");
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || `Request failed with status ${res.status}`);
      } else {
        setData(json);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin metrics"
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchMetrics(true), 60000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-forest opacity-70" />
        <p className="text-sm font-medium text-stone-600">
          Loading Wardrobe AI executive data &amp; telemetry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-ivory-300 rounded-3xl shadow-sm text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-editorial text-3xl font-bold text-stone-900 tracking-tight">
          Admin Authorization Required
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          {error}
        </p>
        <div className="bg-ivory-100 border border-ivory-300 rounded-xl p-4 text-left text-xs font-mono text-stone-700 max-w-lg mx-auto space-y-1.5">
          <p className="font-semibold text-stone-900 font-sans text-sm">
            Quick Setup:
          </p>
          <p className="text-stone-600 font-sans">
            Add your signed-in email address to your{" "}
            <code className="text-forest font-mono">.env.local</code> file:
          </p>
          <div className="p-2.5 bg-white border border-ivory-300 rounded text-forest font-medium select-all">
            ADMIN_EMAIL=boluwatifelambe@gmail.com
          </div>
          <p className="text-stone-500 font-sans pt-1">
            Or update your user document role to &quot;admin&quot; in MongoDB.
          </p>
        </div>
        <button
          onClick={() => fetchMetrics()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest text-white text-sm font-medium hover:bg-forest-light transition shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Access
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { users, clothes, outfitsGenerated, savedOutfits, trends, storage, health } =
    data;

  // Max trend count for calculating relative bar heights
  const maxTrendVal = Math.max(
    ...trends.flatMap((t) => [
      t.clothesAdded,
      t.outfitsGenerated,
      t.newUsers,
      t.outfitsSaved,
      1,
    ])
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
            Real-time analytics for users, clothing catalog, AI outfit generations, and wardrobe sustainability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-ivory-300">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Synced: {lastRefreshedAt.toLocaleTimeString()}</span>
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

      {/* 4 Core KPI Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Users */}
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
            <span>DAU: <strong>{users.dau}</strong></span>
            <span>WAU: <strong>{users.wau}</strong></span>
            <span>Today: <strong>+{users.today}</strong></span>
          </div>
        </div>

        {/* KPI 2: Total Clothes Added */}
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
            <span>Avg / user: <strong>{clothes.avgPerUser}</strong></span>
            <span>Added today: <strong>+{clothes.today}</strong></span>
          </div>
        </div>

        {/* KPI 3: Total Outfits Generated */}
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
            <span>Runs today: <strong>{outfitsGenerated.today}</strong></span>
            <span>Avg speed: <strong>{(outfitsGenerated.avgLatencyMs / 1000).toFixed(1)}s</strong></span>
          </div>
        </div>

        {/* KPI 4: Total Outfits Saved & Wears */}
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
            <span>Saved 7d: <strong>+{savedOutfits.thisWeek}</strong></span>
            <span>Avg wear: <strong>{savedOutfits.avgWearsPerOutfit}x</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-ivory-300 scrollbar-none">
        {[
          { key: "overview", label: "Executive Overview", icon: Layers },
          { key: "users", label: `Users (${users.total})`, icon: Users },
          { key: "clothes", label: `Clothes Catalog (${clothes.total})`, icon: Shirt },
          { key: "outfits", label: `AI Outfits (${outfitsGenerated.totalRuns})`, icon: Sparkles },
          { key: "saved", label: `Saved & Wears (${savedOutfits.total})`, icon: Bookmark },
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
          {/* 7-Day Activity Trends Multi-chart */}
          <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  7-Day Platform Activity Trajectory
                </h3>
                <p className="text-xs text-stone-500">
                  Daily progression across garment uploads, AI styling runs, and user registrations.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-forest"></span> Clothes Added
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> AI Runs
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> New Users
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end h-48 border-b border-ivory-200">
              {trends.map((day) => {
                const clothesHeight = Math.max(
                  Math.round((day.clothesAdded / maxTrendVal) * 100),
                  day.clothesAdded > 0 ? 10 : 2
                );
                const aiHeight = Math.max(
                  Math.round((day.outfitsGenerated / maxTrendVal) * 100),
                  day.outfitsGenerated > 0 ? 10 : 2
                );
                const userHeight = Math.max(
                  Math.round((day.newUsers / maxTrendVal) * 100),
                  day.newUsers > 0 ? 10 : 2
                );

                return (
                  <div key={day.date} className="flex flex-col items-center h-full justify-end gap-1.5">
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
                  <div key={user._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          (user.name?.[0] || user.email[0]).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {user.name || "Anonymous Member"}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ivory-200 text-forest border border-ivory-300">
                        {user.wardrobeCount} items
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5">
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
                  Registered members, wardrobe collection sizes, and login activity.
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
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Wardrobe Size</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {users.recent.map((user) => (
                    <tr key={user._id} className="hover:bg-ivory-50 transition-colors">
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {user.image ? (
                            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                          ) : (
                            (user.name?.[0] || user.email[0]).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate">
                            {user.name || "Member"}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                        </div>
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
                      <td className="px-4 py-3.5 text-stone-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-stone-500">
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
                      (savedOutfits.total / outfitsGenerated.estimatedTotalOutfits) *
                        100
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
                    {occ.count} <span className="text-xs font-normal text-stone-500">requests</span>
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
                  <div key={outfit._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {outfit.title}
                      </p>
                      <p className="text-[11px] text-stone-500 capitalize">
                        {outfit.event || "General Style"} · {outfit.user?.name || "Member"}
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
                  <div key={outfit._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {outfit.title}
                      </p>
                      <p className="text-[11px] text-stone-500 capitalize">
                        {outfit.event || "Saved Look"} · {outfit.user?.name || "Member"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 text-xs text-stone-400">
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
                <span className="text-xs text-stone-500 block">Total Hosted Images</span>
                <span className="text-2xl font-bold text-stone-900">
                  {storage.imageCount ?? clothes.total}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200">
                <span className="text-xs text-stone-500 block">Storage Volume</span>
                <span className="text-2xl font-bold text-forest">
                  {storage.storageHuman || "Available"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200">
                <span className="text-xs text-stone-500 block">Cloud Status</span>
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
                  All API endpoints and AI recommendation systems are operating nominally.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ivory-200">
                {health.recentFailures.map((failure) => (
                  <div key={failure._id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-rose-700">
                        {failure.type} {failure.statusCode ? `(${failure.statusCode})` : ""}
                      </span>
                      <span className="text-stone-400">
                        {new Date(failure.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-stone-700 font-mono text-[11px] truncate">
                      {failure.errorMessage || failure.errorCode || "Unknown error"}
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
