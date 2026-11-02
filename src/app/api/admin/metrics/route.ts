import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import WardrobeItem from "@/models/WardrobeItem";
import SavedOutfit from "@/models/SavedOutfit";
import SystemMetric from "@/models/SystemMetric";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email?.toLowerCase();

    if (!session || !userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is an admin
    const dbUser = await User.findOne({ email: userEmail }).lean();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    const isAuthorized =
      (adminEmail && userEmail === adminEmail) ||
      dbUser?.role === "admin";

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Admin access required.",
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. User & Engagement Metrics
    const [dauCount, totalUsers, totalWardrobeItems, totalSavedOutfits] =
      await Promise.all([
        User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
        User.countDocuments(),
        WardrobeItem.countDocuments(),
        SavedOutfit.countDocuments(),
      ]);

    // 2. 24-Hour AI & API Aggregations
    const metrics24h = await SystemMetric.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          successes: { $sum: { $cond: ["$success", 1, 0] } },
          failures: { $sum: { $cond: ["$success", 0, 1] } },
          avgLatencyMs: { $avg: "$durationMs" },
          maxLatencyMs: { $max: "$durationMs" },
          minLatencyMs: { $min: "$durationMs" },
        },
      },
    ]);

    // Transform aggregation into easily accessible dictionary
    const summaryByType: Record<
      string,
      {
        total: number;
        successes: number;
        failures: number;
        avgLatencyMs: number;
        maxLatencyMs: number;
        minLatencyMs: number;
      }
    > = {};

    let totalRequests24h = 0;
    let totalSuccesses24h = 0;
    let totalFailures24h = 0;

    for (const item of metrics24h) {
      totalRequests24h += item.total;
      totalSuccesses24h += item.successes;
      totalFailures24h += item.failures;

      summaryByType[item._id] = {
        total: item.total,
        successes: item.successes,
        failures: item.failures,
        avgLatencyMs: Math.round(item.avgLatencyMs || 0),
        maxLatencyMs: Math.round(item.maxLatencyMs || 0),
        minLatencyMs: Math.round(item.minLatencyMs || 0),
      };
    }

    const successRate24h =
      totalRequests24h > 0
        ? Math.round((totalSuccesses24h / totalRequests24h) * 100)
        : 100;

    // Specific Recommendation Latency breakdown
    const recommendationStats = summaryByType["ai_recommendation"] || {
      total: 0,
      successes: 0,
      failures: 0,
      avgLatencyMs: 0,
      maxLatencyMs: 0,
      minLatencyMs: 0,
    };

    // 3. 7-Day Trend (Daily Volumes)
    const sevenDayTrend = await SystemMetric.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          failures: { $sum: { $cond: ["$success", 0, 1] } },
          avgLatency: { $avg: "$durationMs" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Live Failure Feed (last 15 errors)
    const recentFailures = await SystemMetric.find({ success: false })
      .sort({ createdAt: -1 })
      .limit(15)
      .select("type endpoint durationMs statusCode errorCode errorMessage createdAt")
      .lean();

    // 5. Cloudinary Storage Metrics (safe fetch)
    let storageInfo: {
      plan?: string;
      storageBytes?: number;
      storageHuman?: string;
      imageCount?: number;
      creditsUsedPercent?: number;
      available: boolean;
    } = {
      available: false,
    };

    try {
      const usage = await cloudinary.api.usage();
      const storageBytes = usage.storage?.usage ?? 0;
      const storageMb = (storageBytes / (1024 * 1024)).toFixed(2);

      storageInfo = {
        available: true,
        plan: usage.plan,
        storageBytes,
        storageHuman: `${storageMb} MB`,
        imageCount: usage.objects?.usage ?? totalWardrobeItems,
        creditsUsedPercent: usage.credits?.percent_used ?? 0,
      };
    } catch {
      // Fallback if Cloudinary API usage call fails or is not supported on the current plan tier
      storageInfo = {
        available: false,
        imageCount: totalWardrobeItems,
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      overview: {
        dau: dauCount,
        totalUsers,
        totalRequests24h,
        totalFailures24h,
        successRate24h,
        recommendationAvgLatencyMs: recommendationStats.avgLatencyMs,
        recommendationMaxLatencyMs: recommendationStats.maxLatencyMs,
      },
      breakdown: summaryByType,
      sevenDayTrend,
      database: {
        totalUsers,
        totalWardrobeItems,
        totalSavedOutfits,
      },
      storage: storageInfo,
      recentFailures,
    });
  } catch (error) {
    console.error("[Admin Metrics API] Error fetching metrics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate system metrics.",
      },
      { status: 500 }
    );
  }
}

