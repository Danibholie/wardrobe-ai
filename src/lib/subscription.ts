import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import WardrobeItem from "@/models/WardrobeItem";
import SavedOutfit from "@/models/SavedOutfit";

export const STARTER_ITEM_LIMIT = 20;
export const STARTER_DAILY_GENERATIONS = 1;
export const STARTER_ACTIVE_WARDROBE_WINDOW = 20;
export const STARTER_SAVED_OUTFIT_LIMIT = 5;
export const PRO_PRICE_MONTHLY_NGN = 1500;
export const PRO_DURATION_DAYS_MONTHLY = 30;
export const PRO_PRICE_ANNUAL_NGN = 15000;
export const PRO_DURATION_DAYS_ANNUAL = 365;

export const PRO_ONLY_OCCASIONS = [
  "wedding",
  "owambe",
  "date",
  "interview",
  "gala",
  "red carpet",
];

export function isProOnlyOccasion(occasionOrEvent: string): boolean {
  if (!occasionOrEvent) return false;
  const lower = occasionOrEvent.toLowerCase();
  return PRO_ONLY_OCCASIONS.some((term) => lower.includes(term));
}

// Backward compatibility aliases
export const PRO_PRICE_NGN = PRO_PRICE_MONTHLY_NGN;
export const PRO_DURATION_DAYS = PRO_DURATION_DAYS_MONTHLY;

export type BillingCycle = "monthly" | "annual";

export interface PlanDetails {
  cycle: BillingCycle;
  priceNgn: number;
  durationDays: number;
  title: string;
  description: string;
  productKey: string;
}

export function getPlanDetails(cycle: BillingCycle = "monthly"): PlanDetails {
  if (cycle === "annual") {
    return {
      cycle: "annual",
      priceNgn: PRO_PRICE_ANNUAL_NGN,
      durationDays: PRO_DURATION_DAYS_ANNUAL,
      title: "Wardrobe Pro (Annual)",
      description: "365-Day Pass: Unlimited clothes & daily AI styling (2 months free)",
      productKey: "wardrobe_pro_365_days",
    };
  }
  return {
    cycle: "monthly",
    priceNgn: PRO_PRICE_MONTHLY_NGN,
    durationDays: PRO_DURATION_DAYS_MONTHLY,
    title: "Wardrobe Pro (Monthly)",
    description: "30-Day Pass: Unlimited clothes & daily AI styling",
    productKey: "wardrobe_pro_30_days",
  };
}

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
  savedOutfitCount: number;
  maxSavedOutfits: number;
  canSaveMoreOutfits: boolean;
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
      savedOutfitCount: 0,
      maxSavedOutfits: STARTER_SAVED_OUTFIT_LIMIT,
      canSaveMoreOutfits: true,
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

  const [itemCount, savedOutfitCount] = await Promise.all([
    WardrobeItem.countDocuments({ userId: user._id }),
    SavedOutfit.countDocuments({ userId: user._id }),
  ]);
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
  const canSaveMoreOutfits = isPro || savedOutfitCount < STARTER_SAVED_OUTFIT_LIMIT;

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
    savedOutfitCount,
    maxSavedOutfits: isPro ? Infinity : STARTER_SAVED_OUTFIT_LIMIT,
    canSaveMoreOutfits,
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

export async function canSaveOutfit(
  userId: string
): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  isPro: boolean;
  reason?: string;
}> {
  const sub = await getUserSubscription(userId);
  if (!sub.canSaveMoreOutfits) {
    return {
      allowed: false,
      currentCount: sub.savedOutfitCount,
      limit: sub.maxSavedOutfits,
      isPro: sub.isPro,
      reason: `You have reached the ${STARTER_SAVED_OUTFIT_LIMIT}-outfit limit for Starter Wardrobe. Upgrade to Wardrobe Pro to save unlimited outfits.`,
    };
  }
  return {
    allowed: true,
    currentCount: sub.savedOutfitCount,
    limit: sub.maxSavedOutfits,
    isPro: sub.isPro,
  };
}

export async function canTrackWears(
  userId: string
): Promise<{
  allowed: boolean;
  isPro: boolean;
  reason?: string;
}> {
  const sub = await getUserSubscription(userId);
  if (!sub.isPro) {
    return {
      allowed: false,
      isPro: false,
      reason:
        "Outfit History & wear counting is exclusive to Wardrobe Pro. Upgrade to track how often you rotate your looks.",
    };
  }
  return {
    allowed: true,
    isPro: true,
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

  // Cap maximum prepaid subscription duration at 730 days (2 years) to support stackable annual extensions safely
  const maxAllowedFuture = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
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

