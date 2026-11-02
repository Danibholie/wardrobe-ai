"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Users,
  Zap,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Database,
  ShieldAlert,
  Sparkles,
  Camera,
  UploadCloud,
  ChevronRight,
} from "lucide-react";

interface MetricsResponse {
  success: boolean;
  message?: string;
  timestamp: string;
  overview: {
    dau: number;
    totalUsers: number;
    totalRequests24h: number;
    totalFailures24h: number;
    successRate24h: number;
    recommendationAvgLatencyMs: number;
    recommendationMaxLatencyMs: number;
  };
  breakdown: Record<
    string,
    {
      total: number;
      successes: number;
      failures: number;
      avgLatencyMs: number;
      maxLatencyMs: number;
      minLatencyMs: number;
    }
  >;
  sevenDayTrend: Array<{
    _id: string;
    total: number;
    failures: number;
    avgLatency: number;
  }>;
  database: {
    totalUsers: number;
    totalWardrobeItems: number;
    totalSavedOutfits: number;
  };
  storage: {
    available: boolean;
    plan?: string;
    storageHuman?: string;
    imageCount?: number;
    creditsUsedPercent?: number;
  };
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
}

export default function AdminMonitoringDashboard() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

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
        err instanceof Error ? err.message : "Failed to load system metrics",
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-60" />
        <p className="text-sm font-medium text-stone-500">
          Gathering system telemetry & usage vitals...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-stone-50 border border-stone-200 rounded-3xl text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Admin Authorization Required
        </h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          {error}
        </p>
        <div className="bg-white border border-stone-200 rounded-xl p-4 text-left text-xs font-mono text-stone-700 max-w-lg mx-auto space-y-1">
          <p className="font-semibold text-stone-900 font-sans">
            How to grant yourself access:
          </p>
          <p className="text-stone-600 font-sans">
            Add your signed-in email to your{" "}
            <code className="text-amber-800 font-mono">.env.local</code> file:
          </p>
          <p className="p-2 bg-stone-100 rounded text-stone-800 select-all">
            ADMIN_EMAIL=your-google-email@gmail.com
          </p>
          <p className="text-stone-500 font-sans pt-1">
            Or set <code className="font-mono">role: &quot;admin&quot;</code> on
            your user document in MongoDB.
          </p>
        </div>
        <button
          onClick={() => fetchMetrics()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Access
        </button>
      </div>
    );
  }

  if (!data) return null;

  const {
    overview,
    breakdown,
    recentFailures,
    database,
    storage,
    sevenDayTrend,
  } = data;

  // Determine overall health status
  const isHealthy =
    overview.successRate24h >= 98 && overview.recommendationAvgLatencyMs < 6000;
  const isDegraded =
    overview.successRate24h < 98 && overview.successRate24h >= 90;

  const healthStatus = isHealthy
    ? {
        label: "Systems Optimal",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      }
    : isDegraded
      ? {
          label: "Performance Degraded",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertTriangle,
        }
      : {
          label: "Attention Needed",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: ShieldAlert,
        };

  const HealthIcon = healthStatus.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              System Telemetry & Vitals
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${healthStatus.color}`}
            >
              <HealthIcon className="w-3.5 h-3.5" />
              {healthStatus.label}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Real-time observability into AI latency, user engagement, and early
            failure detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Updated {lastRefreshedAt.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-stone-200 hover:bg-stone-50 transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Daily Active Users */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Daily Active Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {overview.dau}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              active past 24h
            </span>
          </div>
          <p className="text-xs text-stone-400">
            {overview.totalUsers} registered users total
          </p>
        </div>

        {/* Card 2: AI Recommendation Latency */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              AI Recommendation Latency
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {(overview.recommendationAvgLatencyMs / 1000).toFixed(2)}s
            </span>
            <span className="text-xs text-stone-500 font-medium">avg</span>
          </div>
          <p className="text-xs text-stone-400">
            Peak: {(overview.recommendationMaxLatencyMs / 1000).toFixed(2)}s ·
            Target: &lt; 5.0s
          </p>
        </div>

        {/* Card 3: AI Request Health */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              AI Success Rate (24h)
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                overview.successRate24h >= 98
                  ? "text-emerald-700"
                  : overview.successRate24h >= 90
                    ? "text-amber-700"
                    : "text-rose-700"
              }`}
            >
              {overview.successRate24h}%
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {overview.totalRequests24h} calls
            </span>
          </div>
          <p className="text-xs text-stone-400">
            {overview.totalFailures24h} failed requests today
          </p>
        </div>

        {/* Card 4: Database & Storage */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Storage & DB Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {database.totalWardrobeItems}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              clothes stored
            </span>
          </div>
          <p className="text-xs text-stone-400">
            {database.totalSavedOutfits} outfits ·{" "}
            {storage.storageHuman || "Cloudinary Active"}
          </p>
        </div>
      </div>

      {/* Middle Section: Operation Breakdown + 7-Day Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operation Breakdown Table */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-stone-500" />
            Operation Performance Breakdown (Past 24h)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Operation</th>
                  <th className="pb-3 font-semibold">Total Calls</th>
                  <th className="pb-3 font-semibold">Avg Latency</th>
                  <th className="pb-3 font-semibold">Peak Latency</th>
                  <th className="pb-3 font-semibold">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {/* Outfit Recommendation Row */}
                <tr>
                  <td className="py-3 font-medium text-stone-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                    </div>
                    AI Recommendations
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {breakdown.ai_recommendation?.total ?? 0}
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {(
                      (breakdown.ai_recommendation?.avgLatencyMs ?? 0) / 1000
                    ).toFixed(2)}
                    s
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {(
                      (breakdown.ai_recommendation?.maxLatencyMs ?? 0) / 1000
                    ).toFixed(2)}
                    s
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        (breakdown.ai_recommendation?.failures ?? 0) === 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {(breakdown.ai_recommendation?.failures ?? 0) === 0
                        ? "100% OK"
                        : `${breakdown.ai_recommendation?.failures} failed`}
                    </span>
                  </td>
                </tr>

                {/* Garment Identification Row */}
                <tr>
                  <td className="py-3 font-medium text-stone-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5 text-stone-700" />
                    </div>
                    Garment Identification
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {breakdown.clothing_identification?.total ?? 0}
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {(
                      (breakdown.clothing_identification?.avgLatencyMs ?? 0) /
                      1000
                    ).toFixed(2)}
                    s
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {(
                      (breakdown.clothing_identification?.maxLatencyMs ?? 0) /
                      1000
                    ).toFixed(2)}
                    s
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        (breakdown.clothing_identification?.failures ?? 0) === 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {(breakdown.clothing_identification?.failures ?? 0) === 0
                        ? "100% OK"
                        : `${breakdown.clothing_identification?.failures} failed`}
                    </span>
                  </td>
                </tr>

                {/* Cloudinary Upload Row */}
                <tr>
                  <td className="py-3 font-medium text-stone-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center">
                      <UploadCloud className="w-3.5 h-3.5 text-stone-700" />
                    </div>
                    Image Uploads (Cloudinary)
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {breakdown.image_upload?.total ?? 0}
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {(
                      (breakdown.image_upload?.avgLatencyMs ?? 0) / 1000
                    ).toFixed(2)}
                    s
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {(
                      (breakdown.image_upload?.maxLatencyMs ?? 0) / 1000
                    ).toFixed(2)}
                    s
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        (breakdown.image_upload?.failures ?? 0) === 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {(breakdown.image_upload?.failures ?? 0) === 0
                        ? "100% OK"
                        : `${breakdown.image_upload?.failures} failed`}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 7-Day Activity / Volume Trend Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-stone-500" />
            7-Day Activity Trend
          </h2>

          {sevenDayTrend.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No historical data recorded yet.
              <br />
              Telemetry points will display here over time.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {sevenDayTrend.map((day) => {
                const maxVol = Math.max(
                  ...sevenDayTrend.map((d) => d.total),
                  1,
                );
                const percent = Math.round((day.total / maxVol) * 100);

                return (
                  <div key={day._id} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-500 font-mono">
                      <span>{day._id}</span>
                      <span className="font-semibold text-stone-900">
                        {day.total} reqs
                        {day.failures > 0 && (
                          <span className="text-rose-600 ml-1">
                            ({day.failures} err)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-stone-900 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Live Failure Feed (The "Before Users Start Complaining" Section) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Live Failure & Error Feed
            </h2>
            <p className="text-xs text-stone-500">
              Recent errors caught automatically across AI generation, vision,
              and uploads.
            </p>
          </div>
          <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
            {recentFailures.length} recent error
            {recentFailures.length === 1 ? "" : "s"}
          </span>
        </div>

        {recentFailures.length === 0 ? (
          <div className="py-12 border border-dashed border-stone-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-stone-900">
              Zero Unhandled Failures
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              All AI recommendations, uploads, and image analyses are running
              without errors.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 overflow-hidden">
            {recentFailures.map((failure) => (
              <div
                key={failure._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-stone-50/50 rounded-lg px-2 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-mono font-medium border border-rose-200">
                      {failure.errorCode || "ERROR"}
                    </span>
                    <span className="font-mono text-xs text-stone-500">
                      {failure.endpoint || failure.type}
                    </span>
                    {failure.statusCode && (
                      <span className="text-xs text-stone-400 font-mono">
                        status {failure.statusCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 font-mono break-all">
                    {failure.errorMessage || "Unknown error encountered"}
                  </p>
                </div>

                <div className="text-right text-xs text-stone-400 flex sm:flex-col items-center sm:items-end justify-between shrink-0 font-mono">
                  <span>
                    {new Date(failure.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-stone-400">
                    {(failure.durationMs / 1000).toFixed(2)}s duration
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
