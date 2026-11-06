import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import WardrobeItem from "@/models/WardrobeItem";

export const STARTER_ITEM_LIMIT = 20;
export const STARTER_DAILY_GENERATIONS = 1;
export const STARTER_ACTIVE_WARDROBE_WINDOW = 20;
export const PRO_PRICE_NGN = 1500;
export const PRO_DURATION_DAYS = 30;

export interface SubscriptionInfo {
  tier: "starter" | "pro";
  isPro: boolean;
  status: "active" | "expired";
  expiresAt: string | null;
  isTrial: boolean;
  daysRemaining: number;
  itemCount: number;
  maxItems: number;
  canUploadMore: boolean;
  generationsUsedToday: number;
  maxDailyGenerations: number;
  canGenerateOutfit: boolean;
  activeWardrobeWindow: number;
}

function getTodayString(): string {
  // Use UTC or local date formatted as YYYY-MM-DD
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export async function getUserSubscription(
  userId: string
): Promise<SubscriptionInfo> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return {
      tier: "starter",
      isPro: false,
      status: "active",
      expiresAt: null,
      isTrial: false,
      daysRemaining: 0,
      itemCount: 0,
      maxItems: STARTER_ITEM_LIMIT,
      canUploadMore: true,
      generationsUsedToday: 0,
      maxDailyGenerations: STARTER_DAILY_GENERATIONS,
      canGenerateOutfit: true,
      activeWardrobeWindow: STARTER_ACTIVE_WARDROBE_WINDOW,
    };
  }

  const todayStr = getTodayString();
  let needsSave = false;

  // Handle legacy users without subscription fields
  if (!user.subscriptionTier) {
    const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    if (accountAgeMs < threeDaysMs) {
      // Still within the 3-day trial window
      user.subscriptionTier = "pro";
      user.subscriptionStatus = "active";
      user.subscriptionExpiresAt = new Date(
        new Date(user.createdAt).getTime() + threeDaysMs
      );
      user.isTrial = true;
    } else {
      user.subscriptionTier = "starter";
      user.subscriptionStatus = "active";
      user.isTrial = false;
    }
    needsSave = true;
  }

  // Handle Pro expiration
  if (user.subscriptionTier === "pro") {
    const isPast =
      !user.subscriptionExpiresAt ||
      new Date(user.subscriptionExpiresAt).getTime() < Date.now();
    if (isPast) {
      user.subscriptionTier = "starter";
      user.subscriptionStatus = "expired";
      user.isTrial = false;
      needsSave = true;
    }
  }

  // Handle daily generations counter reset
  if (!user.dailyGenerations || user.dailyGenerations.date !== todayStr) {
    user.dailyGenerations = {
      count: 0,
      date: todayStr,
    };
    needsSave = true;
  }

  if (needsSave) {
    await user.save();
  }

  const itemCount = await WardrobeItem.countDocuments({ userId: user._id });
  const isPro = user.subscriptionTier === "pro";

  let daysRemaining = 0;
  if (user.subscriptionExpiresAt) {
    const msDiff =
      new Date(user.subscriptionExpiresAt).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  }

  const generationsUsedToday = user.dailyGenerations?.count || 0;
  const canGenerateOutfit =
    isPro || generationsUsedToday < STARTER_DAILY_GENERATIONS;
  const canUploadMore = isPro || itemCount < STARTER_ITEM_LIMIT;

  return {
    tier: isPro ? "pro" : "starter",
    isPro,
    status: user.subscriptionStatus || "active",
    expiresAt: user.subscriptionExpiresAt
      ? user.subscriptionExpiresAt.toISOString()
      : null,
    isTrial: Boolean(user.isTrial && isPro),
    daysRemaining,
    itemCount,
    maxItems: isPro ? Infinity : STARTER_ITEM_LIMIT,
    canUploadMore,
    generationsUsedToday,
    maxDailyGenerations: isPro ? Infinity : STARTER_DAILY_GENERATIONS,
    canGenerateOutfit,
    activeWardrobeWindow: isPro ? itemCount : Math.min(itemCount, STARTER_ACTIVE_WARDROBE_WINDOW),
  };
}

export async function canUploadClothing(
  userId: string
): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  isPro: boolean;
  reason?: string;
}> {
  const sub = await getUserSubscription(userId);
  if (!sub.canUploadMore) {
    return {
      allowed: false,
      currentCount: sub.itemCount,
      limit: sub.maxItems,
      isPro: sub.isPro,
      reason: `You have reached the ${STARTER_ITEM_LIMIT}-item limit for Starter Wardrobe. Upgrade to Wardrobe Pro to add unlimited clothing.`,
    };
  }
  return {
    allowed: true,
    currentCount: sub.itemCount,
    limit: sub.maxItems,
    isPro: sub.isPro,
  };
}

export async function canGenerateOutfit(
  userId: string
): Promise<{
  allowed: boolean;
  countToday: number;
  limit: number;
  isPro: boolean;
  reason?: string;
}> {
  const sub = await getUserSubscription(userId);
  if (!sub.canGenerateOutfit) {
    return {
      allowed: false,
      countToday: sub.generationsUsedToday,
      limit: sub.maxDailyGenerations,
      isPro: sub.isPro,
      reason: `You have used your ${STARTER_DAILY_GENERATIONS} free outfit recommendation for today. Upgrade to Wardrobe Pro for unlimited daily recommendations.`,
    };
  }
  return {
    allowed: true,
    countToday: sub.generationsUsedToday,
    limit: sub.maxDailyGenerations,
    isPro: sub.isPro,
  };
}

/**
 * Atomically checks and claims an outfit generation credit for today.
 * Prevents race condition attacks where multiple simultaneous requests
 * bypass the daily limit before any record is persisted.
 */
export async function tryConsumeDailyGeneration(
  userId: string
): Promise<{
  allowed: boolean;
  countToday: number;
  limit: number;
  isPro: boolean;
  reason?: string;
}> {
  await connectDB();
  const sub = await getUserSubscription(userId);

  // Pro users have unlimited generations
  if (sub.isPro) {
    return {
      allowed: true,
      countToday: sub.generationsUsedToday,
      limit: sub.maxDailyGenerations,
      isPro: true,
    };
  }

  const todayStr = getTodayString();

  // Atomically increment quota using a MongoDB pipeline update
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      subscriptionTier: { $ne: "pro" },
      $or: [
        { "dailyGenerations.date": { $ne: todayStr } },
        {
          "dailyGenerations.date": todayStr,
          "dailyGenerations.count": { $lt: STARTER_DAILY_GENERATIONS },
        },
        { dailyGenerations: { $exists: false } },
      ],
    },
    [
      {
        $set: {
          dailyGenerations: {
            date: todayStr,
            count: {
              $cond: {
                if: { $eq: ["$dailyGenerations.date", todayStr] },
                then: { $add: [{ $ifNull: ["$dailyGenerations.count", 0] }, 1] },
                else: 1,
              },
            },
          },
        },
      },
    ],
    { new: true }
  );

  if (!updatedUser) {
    return {
      allowed: false,
      countToday: sub.generationsUsedToday,
      limit: STARTER_DAILY_GENERATIONS,
      isPro: false,
      reason: `You have used your ${STARTER_DAILY_GENERATIONS} free outfit recommendation for today. Upgrade to Wardrobe Pro for unlimited daily recommendations.`,
    };
  }

  return {
    allowed: true,
    countToday: updatedUser.dailyGenerations?.count || 1,
    limit: STARTER_DAILY_GENERATIONS,
    isPro: false,
  };
}

/**
 * Refunds a daily generation quota if the AI model throws an unexpected error.
 */
export async function refundDailyGeneration(userId: string): Promise<void> {
  await connectDB();
  const todayStr = getTodayString();

  await User.updateOne(
    {
      _id: userId,
      subscriptionTier: { $ne: "pro" },
      "dailyGenerations.date": todayStr,
      "dailyGenerations.count": { $gt: 0 },
    },
    {
      $inc: { "dailyGenerations.count": -1 },
    }
  );
}

export async function recordOutfitGeneration(userId: string): Promise<void> {
  await connectDB();
  const todayStr = getTodayString();

  const user = await User.findById(userId);
  if (!user) return;

  if (!user.dailyGenerations || user.dailyGenerations.date !== todayStr) {
    user.dailyGenerations = {
      count: 1,
      date: todayStr,
    };
  } else {
    user.dailyGenerations.count += 1;
  }

  await user.save();
}

export async function grantProSubscription(
  userId: string,
  durationDays: number = PRO_DURATION_DAYS
): Promise<IUser | null> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  let baseDate = now;

  // If already active pro and expires in the future, extend it
  if (
    user.subscriptionTier === "pro" &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() > now.getTime()
  ) {
    baseDate = new Date(user.subscriptionExpiresAt);
  }

  // Cap maximum prepaid subscription duration at 365 days to prevent overflow or abuse
  const maxAllowedFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const targetExpiry = new Date(
    baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000
  );
  const newExpiry = targetExpiry > maxAllowedFuture ? maxAllowedFuture : targetExpiry;

  user.subscriptionTier = "pro";
  user.subscriptionStatus = "active";
  user.subscriptionExpiresAt = newExpiry;
  user.isTrial = false;

  await user.save();
  return user;
}

