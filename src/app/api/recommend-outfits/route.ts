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
        : "Smart Casual / Day Outing";

    const stylePreference =
      typeof body.stylePreference === "string" && body.stylePreference.trim()
        ? body.stylePreference.trim()
        : "Smart Casual";

    const vibe =
      typeof body.vibe === "string" && body.vibe.trim()
        ? body.vibe.trim()
        : "Breathable, elegant, and comfortable";

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

    let contextualVibe = vibe;
    if (anchorItemId) {
      const anchorItem = userItems.find(
        (it) => it._id.toString() === anchorItemId
      );
      if (anchorItem) {
        contextualVibe += `. Anchor Piece to build around: Must include item ID ${anchorItemId} ("${anchorItem.name}", ${anchorItem.color} ${anchorItem.category}).`;
      }
    }

    const recommendation = await recommendOutfits({
      items: wardrobeSummaries,
      location,
      weather,
      event,
      stylePreference,
      vibe: contextualVibe,
    });

    const itemMap = new Map(
      wardrobeSummaries.map((it) => [it.id, it])
    );

    const enrichedOutfits = recommendation.outfits.map((outfit) => {
      // Map item IDs to the full item summary
      const itemsMatched = outfit.itemIds
        .map((id) => itemMap.get(id))
        .filter(Boolean) as WardrobeItemSummary[];

      return {
        ...outfit,
        items: itemsMatched,
      };
    });

    return NextResponse.json({
      success: true,
      outfits: enrichedOutfits,
      totalWardrobeCount: userItems.length,
      criteria: {
        location,
        weather,
        event,
        stylePreference,
        vibe,
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
