import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import WardrobeItem from "@/models/WardrobeItem";
import { recommendOutfits, WardrobeItemSummary } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to receive outfit recommendations." },
        { status: 401 }
      );
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

    const event =
      typeof body.event === "string" && body.event.trim()
        ? body.event.trim()
        : typeof body.occasion === "string" && body.occasion.trim()
        ? body.occasion.trim()
        : "Smart Casual / Day Outing";

    const timeOfDay =
      typeof body.timeOfDay === "string" && body.timeOfDay.trim()
        ? body.timeOfDay.trim()
        : "";

    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : "";

    const effectiveEvent = timeOfDay ? `${event} (${timeOfDay})` : event;

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
    if (notes) {
      contextualVibeParts.push(`User notes/outing details: "${notes}"`);
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
        { status: 400 }
      );
    }

    const wardrobeSummaries: WardrobeItemSummary[] = userItems.map((item) => ({
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
        (it) => it._id.toString() === anchorItemId
      );
      if (anchorItem) {
        contextualVibeParts.push(
          `Anchor Piece to build around: Must include item ID ${anchorItemId} ("${anchorItem.name}", ${anchorItem.color} ${anchorItem.category}).`
        );
      }
    }

    const recommendation = await recommendOutfits({
      items: wardrobeSummaries,
      location,
      weather,
      event: effectiveEvent,
      stylePreference,
      vibe: contextualVibeParts.join(". "),
    });

    // CRITICAL SERVER-SIDE ENFORCEMENT:
    // Only items authentically belonging to the user's database can be returned.
    const itemMap = new Map(
      wardrobeSummaries.map((it) => [it.id, it])
    );

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

    return NextResponse.json({
      success: true,
      outfits: enrichedOutfits,
      totalWardrobeCount: userItems.length,
      criteria: {
        location,
        weather,
        event,
        stylePreference,
        vibe: baseVibe,
      },
    });
  } catch (error) {
    console.error("Outfit recommendation error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate outfit recommendations.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
