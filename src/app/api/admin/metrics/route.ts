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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel execution of all database metrics with safe fallbacks (Promise.allSettled)
    const [
      totalUsersRes,
      usersTodayRes,
      users7dRes,
      users30dRes,
      dauRes,
      wauRes,
      recentUsersRes,
      totalItemsRes,
      itemsTodayRes,
      items7dRes,
      categoriesRes,
      colorsRes,
      recentClothesRes,
      totalAiRunsRes,
      aiRunsTodayRes,
      aiRuns7dRes,
      aiOccasionsRes,
      aiLatencyRes,
      totalSavedRes,
      savedTodayRes,
      saved7dRes,
      wearsRes,
      mostWornRes,
      recentSavedRes,
      trendUsersRes,
      trendClothesRes,
      trendAiRes,
      trendSavedRes,
      metrics24hRes,
      recentFailuresRes,
    ] = await Promise.allSettled([
      // Users
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      User.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name email image role createdAt lastActiveAt location")
        .lean(),

      // Wardrobe Items
      WardrobeItem.countDocuments(),
      WardrobeItem.countDocuments({ createdAt: { $gte: startOfToday } }),
      WardrobeItem.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      WardrobeItem.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      WardrobeItem.aggregate([
        { $match: { color: { $exists: true, $ne: "" } } },
        { $group: { _id: "$color", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      WardrobeItem.find()
        .sort({ createdAt: -1 })
        .limit(12)
        .select("name category subcategory color imageUrl createdAt userId")
        .lean(),

      // AI Recommendations
      SystemMetric.countDocuments({ type: "ai_recommendation", success: true }),
      SystemMetric.countDocuments({
        type: "ai_recommendation",
        success: true,
        createdAt: { $gte: startOfToday },
      }),
      SystemMetric.countDocuments({
        type: "ai_recommendation",
        success: true,
        createdAt: { $gte: sevenDaysAgo },
      }),
      SystemMetric.aggregate([
        {
          $match: {
            type: "ai_recommendation",
            "metadata.occasion": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.occasion", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      SystemMetric.aggregate([
        { $match: { type: "ai_recommendation" } },
        {
          $group: {
            _id: null,
            avgLatency: { $avg: "$durationMs" },
            maxLatency: { $max: "$durationMs" },
          },
        },
      ]),

      // Saved Outfits & Wears
      SavedOutfit.countDocuments(),
      SavedOutfit.countDocuments({ createdAt: { $gte: startOfToday } }),
      SavedOutfit.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      SavedOutfit.aggregate([
        {
          $group: {
            _id: null,
            totalWears: { $sum: "$wearCount" },
            outfitsWithWears: {
              $sum: { $cond: [{ $gt: ["$wearCount", 0] }, 1, 0] },
            },
          },
        },
      ]),
      SavedOutfit.find({ wearCount: { $gt: 0 } })
        .sort({ wearCount: -1 })
        .limit(6)
        .select("title event wearCount lastWorn userId")
        .lean(),
      SavedOutfit.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("title event weather wearCount createdAt userId")
        .lean(),

      // 7-Day Activity Trends
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      WardrobeItem.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      SystemMetric.aggregate([
        {
          $match: {
            type: "ai_recommendation",
            success: true,
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      SavedOutfit.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 24h Telemetry
      SystemMetric.aggregate([
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
      ]),
      SystemMetric.find({ success: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("type endpoint durationMs statusCode errorCode errorMessage createdAt")
        .lean(),
    ]);

    // Extract values with fallbacks
    const totalUsers = totalUsersRes.status === "fulfilled" ? totalUsersRes.value : 0;
    const usersToday = usersTodayRes.status === "fulfilled" ? usersTodayRes.value : 0;
    const users7d = users7dRes.status === "fulfilled" ? users7dRes.value : 0;
    const users30d = users30dRes.status === "fulfilled" ? users30dRes.value : 0;
    const dauCount = dauRes.status === "fulfilled" ? dauRes.value : 0;
    const wauCount = wauRes.status === "fulfilled" ? wauRes.value : 0;
    const recentUsersRaw = recentUsersRes.status === "fulfilled" ? recentUsersRes.value : [];

    const totalWardrobeItems = totalItemsRes.status === "fulfilled" ? totalItemsRes.value : 0;
    const clothesAddedToday = itemsTodayRes.status === "fulfilled" ? itemsTodayRes.value : 0;
    const clothesAdded7d = items7dRes.status === "fulfilled" ? items7dRes.value : 0;
    const categoriesAggregate = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
    const colorsAggregate = colorsRes.status === "fulfilled" ? colorsRes.value : [];
    const recentClothesRaw = recentClothesRes.status === "fulfilled" ? recentClothesRes.value : [];

    const totalAiRuns = totalAiRunsRes.status === "fulfilled" ? totalAiRunsRes.value : 0;
    const aiRunsToday = aiRunsTodayRes.status === "fulfilled" ? aiRunsTodayRes.value : 0;
    const aiRuns7d = aiRuns7dRes.status === "fulfilled" ? aiRuns7dRes.value : 0;
    const aiOccasionAggregate = aiOccasionsRes.status === "fulfilled" ? aiOccasionsRes.value : [];
    const aiLatencyAggregate = aiLatencyRes.status === "fulfilled" ? aiLatencyRes.value : [];

    const totalSavedOutfits = totalSavedRes.status === "fulfilled" ? totalSavedRes.value : 0;
    const savedOutfitsToday = savedTodayRes.status === "fulfilled" ? savedTodayRes.value : 0;
    const savedOutfits7d = saved7dRes.status === "fulfilled" ? saved7dRes.value : 0;
    const wearsAggregate = wearsRes.status === "fulfilled" ? wearsRes.value : [];
    const mostWornRaw = mostWornRes.status === "fulfilled" ? mostWornRes.value : [];
    const recentSavedRaw = recentSavedRes.status === "fulfilled" ? recentSavedRes.value : [];

    const trendUsers = trendUsersRes.status === "fulfilled" ? trendUsersRes.value : [];
    const trendClothes = trendClothesRes.status === "fulfilled" ? trendClothesRes.value : [];
    const trendGenerations = trendAiRes.status === "fulfilled" ? trendAiRes.value : [];
    const trendSaved = trendSavedRes.status === "fulfilled" ? trendSavedRes.value : [];

    const metrics24h = metrics24hRes.status === "fulfilled" ? metrics24hRes.value : [];
    const recentFailures = recentFailuresRes.status === "fulfilled" ? recentFailuresRes.value : [];

    // Optional user wardrobe count lookup (non-blocking)
    const recentUsers = recentUsersRaw.map((u) => ({
      ...u,
      _id: String(u._id),
      wardrobeCount: 0,
    }));

    const recentClothes = recentClothesRaw.map((item) => ({
      _id: String(item._id),
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.color,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt,
      user: null,
    }));

    const categoryBreakdown = categoriesAggregate.map((c: { _id?: string; count: number }) => ({
      category: c._id || "Uncategorized",
      count: c.count,
    }));

    const colorBreakdown = colorsAggregate.map((c: { _id?: string; count: number }) => ({
      color: c._id || "Other",
      count: c.count,
    }));

    const estimatedTotalOutfitsGenerated = Math.max(totalAiRuns * 3, 0);

    const occasionBreakdown = aiOccasionAggregate.map((o: { _id?: string; count: number }) => ({
      occasion: o._id || "Smart Casual",
      count: o.count,
    }));

    const totalWearsLogged = wearsAggregate[0]?.totalWears || 0;
    const outfitsWithWearsCount = wearsAggregate[0]?.outfitsWithWears || 0;

    const mostWornOutfits = mostWornRaw.map((outfit) => ({
      _id: String(outfit._id),
      title: outfit.title,
      event: outfit.event,
      wearCount: outfit.wearCount || 0,
      lastWorn: outfit.lastWorn,
      user: null,
    }));

    const recentSavedOutfits = recentSavedRaw.map((outfit) => ({
      _id: String(outfit._id),
      title: outfit.title,
      event: outfit.event,
      weather: outfit.weather,
      wearCount: outfit.wearCount || 0,
      createdAt: outfit.createdAt,
      user: null,
    }));

    // Build 7-day trend map
    const dailyTrends: Array<{
      date: string;
      label: string;
      newUsers: number;
      clothesAdded: number;
      outfitsGenerated: number;
      outfitsSaved: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      const uMatch = trendUsers.find((x: { _id?: string; count?: number }) => x._id === dateStr)?.count || 0;
      const cMatch = trendClothes.find((x: { _id?: string; count?: number }) => x._id === dateStr)?.count || 0;
      const gMatch = trendGenerations.find((x: { _id?: string; count?: number }) => x._id === dateStr)?.count || 0;
      const sMatch = trendSaved.find((x: { _id?: string; count?: number }) => x._id === dateStr)?.count || 0;

      dailyTrends.push({
        date: dateStr,
        label: dayLabel,
        newUsers: uMatch,
        clothesAdded: cMatch,
        outfitsGenerated: gMatch,
        outfitsSaved: sMatch,
      });
    }

    // Telemetry aggregations
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

    const recommendationStats = summaryByType["ai_recommendation"] || {
      total: 0,
      successes: 0,
      failures: 0,
      avgLatencyMs: Math.round(aiLatencyAggregate[0]?.avgLatency || 0),
      maxLatencyMs: Math.round(aiLatencyAggregate[0]?.maxLatency || 0),
      minLatencyMs: 0,
    };

    // 7. Cloudinary Storage with strict 1.2-second timeout (never blocks the dashboard!)
    let storageInfo = {
      available: false,
      imageCount: totalWardrobeItems,
      storageHuman: "Available",
      plan: "Standard",
      creditsUsedPercent: 0,
    };

    try {
      const cloudinaryTimeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 1200)
      );
      const usage = await Promise.race([cloudinary.api.usage(), cloudinaryTimeoutPromise]);

      if (usage && typeof usage === "object") {
        const storageBytes = usage.storage?.usage ?? 0;
        const storageMb = (storageBytes / (1024 * 1024)).toFixed(2);
        storageInfo = {
          available: true,
          plan: usage.plan || "Standard",
          storageHuman: `${storageMb} MB`,
          imageCount: usage.objects?.usage ?? totalWardrobeItems,
          creditsUsedPercent: usage.credits?.percent_used ?? 0,
        };
      }
    } catch {
      // Silently fall back to closet item count
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      adminEmail: userEmail,
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: users7d,
        thisMonth: users30d,
        dau: dauCount,
        wau: wauCount,
        recent: recentUsers,
      },
      clothes: {
        total: totalWardrobeItems,
        today: clothesAddedToday,
        thisWeek: clothesAdded7d,
        avgPerUser: totalUsers > 0 ? (totalWardrobeItems / totalUsers).toFixed(1) : "0",
        categoryBreakdown,
        colorBreakdown,
        recent: recentClothes,
      },
      outfitsGenerated: {
        totalRuns: totalAiRuns,
        estimatedTotalOutfits: estimatedTotalOutfitsGenerated,
        today: aiRunsToday,
        thisWeek: aiRuns7d,
        avgLatencyMs: recommendationStats.avgLatencyMs,
        occasionBreakdown,
      },
      savedOutfits: {
        total: totalSavedOutfits,
        today: savedOutfitsToday,
        thisWeek: savedOutfits7d,
        totalWears: totalWearsLogged,
        outfitsWithWears: outfitsWithWearsCount,
        avgWearsPerOutfit:
          totalSavedOutfits > 0
            ? (totalWearsLogged / totalSavedOutfits).toFixed(1)
            : "0",
        mostWorn: mostWornOutfits,
        recent: recentSavedOutfits,
      },
      trends: dailyTrends,
      storage: storageInfo,
      health: {
        successRate24h,
        totalRequests24h,
        totalFailures24h,
        recommendationAvgLatencyMs: recommendationStats.avgLatencyMs,
        recommendationMaxLatencyMs: recommendationStats.maxLatencyMs,
        breakdown: summaryByType,
        recentFailures,
      },
    });
  } catch (error) {
    console.error("[Admin Metrics API] Error fetching metrics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate admin data dashboard metrics.",
      },
      { status: 500 }
    );
  }
}
