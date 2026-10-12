import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import SavedOutfit from "@/models/SavedOutfit";
import WardrobeItem from "@/models/WardrobeItem";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to view saved outfits." },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure WardrobeItem model is registered before populate
    if (!mongoose.models.WardrobeItem) {
      void WardrobeItem;
    }

    const outfits = await SavedOutfit.find({ userId })
      .populate({
        path: "itemIds",
        model: WardrobeItem,
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOutfits = outfits.map((outfit) => ({
      id: outfit._id.toString(),
      title: outfit.title,
      vibeDescription: outfit.vibeDescription || "",
      event: outfit.event || "",
      location: outfit.location || "",
      weather: outfit.weather || "",
      stylingTips: outfit.stylingTips || [],
      missingPiecesAdvice: outfit.missingPiecesAdvice || "",
      createdAt: outfit.createdAt,
      items: (Array.isArray(outfit.itemIds) ? outfit.itemIds : [])
        .filter((item: any) => item && typeof item === "object" && "_id" in item)
        .map((item: any) => ({
          id: item._id.toString(),
          name: item.name,
          category: item.category,
          subcategory: item.subcategory || "",
          color: item.color,
          style: item.style || "",
          imageUrl: item.imageUrl,
        })),
    }));

    return NextResponse.json({
      success: true,
      outfits: formattedOutfits,
    });
  } catch (error) {
    console.error("Fetch saved outfits error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load saved outfits." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to save outfits." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const vibeDescription =
      typeof body.vibeDescription === "string" ? body.vibeDescription.trim() : "";
    const event =
      typeof body.event === "string" ? body.event.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";
    const weather =
      typeof body.weather === "string" ? body.weather.trim() : "";
    const missingPiecesAdvice =
      typeof body.missingPiecesAdvice === "string"
        ? body.missingPiecesAdvice.trim()
        : "";
    const stylingTips = Array.isArray(body.stylingTips)
      ? body.stylingTips.filter((tip: unknown) => typeof tip === "string")
      : [];

    const rawItemIds = Array.isArray(body.itemIds) ? body.itemIds : [];
    const validItemIds = rawItemIds.filter(
      (id: unknown) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
    );

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Outfit title is required." },
        { status: 400 }
      );
    }

    if (validItemIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "An outfit must contain at least one valid wardrobe item.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newOutfit = await SavedOutfit.create({
      userId,
      title,
      vibeDescription,
      event,
      location,
      weather,
      stylingTips,
      itemIds: validItemIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      missingPiecesAdvice,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Outfit saved to your curated collection.",
        outfit: {
          id: newOutfit._id.toString(),
          title: newOutfit.title,
          vibeDescription: newOutfit.vibeDescription,
          event: newOutfit.event,
          location: newOutfit.location,
          weather: newOutfit.weather,
          stylingTips: newOutfit.stylingTips,
          missingPiecesAdvice: newOutfit.missingPiecesAdvice,
          createdAt: newOutfit.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save outfit error:", error);
    return NextResponse.json(
      { success: false, message: "Could not save this outfit." },
      { status: 500 }
    );
  }
}
