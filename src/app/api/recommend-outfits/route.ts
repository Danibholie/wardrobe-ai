import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import WardrobeItem from "@/models/WardrobeItem";
import { recommendOutfits, WardrobeItemSummary } from "@/lib/ai";
import { parseAiError } from "@/lib/errors";
import { trackMetric } from "@/lib/telemetry";
import {
  tryConsumeDailyGeneration,
  refundDailyGeneration,
  STARTER_ACTIVE_WARDROBE_WINDOW,
  isProOnlyOccasion,
} from "@/lib/subscription";

export const maxDuration = 60;

export async function POST(request: Request) {
  const reqStartTime = performance.now();
  let aiStartTime = 0;
  let currentUserId: string | undefined;
  let quotaClaimed = false;

  try {
    const session = await auth();
    const userId = session?.user?.id;
    currentUserId = userId;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign in to receive outfit recommendations.",
        },
        { status: 401 },
      );
    }

    // Atomically claim today's generation quota to prevent race condition bypass
    const genCheck = await tryConsumeDailyGeneration(userId);
    if (!genCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          limitReached: true,
          message: genCheck.reason,
          countToday: genCheck.countToday,
          limit: genCheck.limit,
        },
        { status: 403 },
      );
    }
    if (!genCheck.isPro) {
      quotaClaimed = true;
    }

    const body = await request.json().catch(() => ({}));

    const location =
      typeof body.location === "string" && body.location.trim()
        ? body.location.trim()
        : "Lagos, Nigeria";

    const weather =
      typeof body.weather === "string" && body.weather.trim()
        ? body.weather.trim()
        : "31°C, sunny & humid (78% humidity)";

    const occasion =
      typeof body.occasion === "string" && body.occasion.trim()
        ? body.occasion.trim()
        : typeof body.event === "string" && body.event.trim()
          ? body.event.trim()
          : "Smart Casual";

    const outing =
      typeof body.outing === "string" && body.outing.trim()
        ? body.outing.trim()
        : "";

    const date =
      typeof body.date === "string" && body.date.trim() ? body.date.trim() : "";

    const timeOfDay =
      typeof body.timeOfDay === "string" && body.timeOfDay.trim()
        ? body.timeOfDay.trim()
        : "";

    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : "";

    // Build comprehensive plan descriptor
    const planComponents = [occasion];
    if (outing) planComponents.push(`Specific Outing: ${outing}`);
    if (date || timeOfDay)
      planComponents.push(
        `When: ${[date, timeOfDay].filter(Boolean).join(" ")}`,
      );
    const effectiveEvent = planComponents.join(" · ");

    // Enforce occasion gating for special events (Owambe, Weddings, Dates)
    if (
      !genCheck.isPro &&
      (isProOnlyOccasion(occasion) ||
        isProOnlyOccasion(outing) ||
        isProOnlyOccasion(effectiveEvent))
    ) {
      if (quotaClaimed && currentUserId) {
        await refundDailyGeneration(currentUserId);
        quotaClaimed = false;
      }
      return NextResponse.json(
        {
          success: false,
          proRequired: true,
          message:
            "Special event styling (Owambe, Weddings, and Date nights) is exclusive to Wardrobe Pro. Upgrade to Pro to unlock special event styling.",
        },
        { status: 403 }
      );
    }

    const stylePreference =
      typeof body.stylePreference === "string" && body.stylePreference.trim()
        ? body.stylePreference.trim()
        : typeof body.style === "string" && body.style.trim()
          ? body.style.trim()
          : "Smart Casual";

    const baseVibe =
      typeof body.vibe === "string" && body.vibe.trim()
        ? body.vibe.trim()
        : stylePreference;

    const contextualVibeParts = [baseVibe];
    if (outing) {
      contextualVibeParts.push(`Venue/Outing: "${outing}"`);
    }
    if (notes) {
      contextualVibeParts.push(`Styling notes: "${notes}"`);
    }

    const anchorItemId =
      typeof body.anchorItemId === "string" && body.anchorItemId.trim()
        ? body.anchorItemId.trim()
        : undefined;

    await connectDB();

    const userItems = await WardrobeItem.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!userItems || userItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your wardrobe is currently empty. Please add at least 1-2 garments to your collection first so AI can style outfits from them.",
          needsItems: true,
        },
        { status: 400 },
      );
    }

    const isPro = genCheck.isPro;
    const isWardrobeCapped =
      !isPro && userItems.length > STARTER_ACTIVE_WARDROBE_WINDOW;

    // Apply Active Wardrobe Window for Starter users (Top 20 active items)
    let itemsToStyle = userItems;
    if (!isPro) {
      if (anchorItemId) {
        const anchor = userItems.find((it) => it._id.toString() === anchorItemId);
        const rest = userItems.filter((it) => it._id.toString() !== anchorItemId);
        itemsToStyle = anchor
          ? [anchor, ...rest.slice(0, STARTER_ACTIVE_WARDROBE_WINDOW - 1)]
          : userItems.slice(0, STARTER_ACTIVE_WARDROBE_WINDOW);
      } else {
        itemsToStyle = userItems.slice(0, STARTER_ACTIVE_WARDROBE_WINDOW);
      }
    }

    const wardrobeSummaries: WardrobeItemSummary[] = itemsToStyle.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      subcategory: item.subcategory ?? "",
      color: item.color,
      style: item.style ?? "",
      imageUrl: item.imageUrl,
    }));

    if (anchorItemId) {
      const anchorItem = userItems.find(
        (it) => it._id.toString() === anchorItemId,
      );
      if (anchorItem) {
        contextualVibeParts.push(
          `Anchor Piece to build around: Must include item ID ${anchorItemId} ("${anchorItem.name}", ${anchorItem.color} ${anchorItem.category}).`,
        );
      }
    }

    aiStartTime = performance.now();
    const recommendation = await recommendOutfits({
      items: wardrobeSummaries,
      location,
      weather,
      event: effectiveEvent,
      stylePreference,
      vibe: contextualVibeParts.join(". "),
    });
    const aiDurationMs = performance.now() - aiStartTime;

    // CRITICAL SERVER-SIDE ENFORCEMENT:
    // Only items authentically belonging to the user's database can be returned.
    const itemMap = new Map(wardrobeSummaries.map((it) => [it.id, it]));

    const enrichedOutfits = recommendation.outfits
      .map((outfit) => {
        // Enforce that every single item belongs to the user
        const itemsMatched = outfit.itemIds
          .map((id) => itemMap.get(id))
          .filter(Boolean) as WardrobeItemSummary[];

        return {
          ...outfit,
          itemIds: itemsMatched.map((i) => i.id),
          items: itemsMatched,
        };
      })
      .filter((outfit) => outfit.items.length > 0);

    // Record non-blocking telemetry
    void trackMetric({
      type: "ai_recommendation",
      endpoint: "/api/recommend-outfits",
      userId,
      durationMs: aiDurationMs,
      success: true,
      statusCode: 200,
      metadata: {
        totalWardrobeCount: userItems.length,
        outfitsReturned: enrichedOutfits.length,
        hasAnchorItem: Boolean(anchorItemId),
        occasion,
        isPro,
        isWardrobeCapped,
      },
    });

    return NextResponse.json({
      success: true,
      outfits: enrichedOutfits,
      totalWardrobeCount: userItems.length,
      activeItemCount: itemsToStyle.length,
      isWardrobeCapped,
      isPro,
      criteria: {
        location,
        weather,
        event: effectiveEvent,
        occasion,
        stylePreference,
        vibe: baseVibe,
      },
    });
  } catch (error) {
    // If quota was claimed but generation failed unexpectedly, refund it
    if (quotaClaimed && currentUserId) {
      void refundDailyGeneration(currentUserId).catch((refundErr) => {
        console.error("Failed to refund daily generation quota:", refundErr);
      });
    }

    const errorDuration = aiStartTime > 0 ? performance.now() - aiStartTime : performance.now() - reqStartTime;
    console.error("Outfit recommendation error:", error);

    const { friendlyMessage, statusCode } = parseAiError(
      error,
      "Failed to generate outfit recommendations.",
    );

    // Record failure in telemetry
    void trackMetric({
      type: "ai_recommendation",
      endpoint: "/api/recommend-outfits",
      userId: currentUserId,
      durationMs: errorDuration,
      success: false,
      statusCode,
      errorCode: (error as Error)?.name || "RECOMMENDATION_FAILED",
      errorMessage: (error as Error)?.message || friendlyMessage,
    });

    return NextResponse.json(
      {
        success: false,
        message: friendlyMessage,
      },
      { status: statusCode },
    );
  }
}
