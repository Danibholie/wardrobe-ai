import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import WardrobeItem from "@/models/WardrobeItem";

const allowedCategories = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "traditional",
];

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to save clothing." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string"
        ? body.category.trim().toLowerCase()
        : "";
    const subcategory =
      typeof body.subcategory === "string" ? body.subcategory.trim() : "";
    const color = typeof body.color === "string" ? body.color.trim() : "";
    const style = typeof body.style === "string" ? body.style.trim() : "";
    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (!name || !category || !color || !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, category, colour, and clothing photo are required.",
        },
        { status: 400 },
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid clothing category." },
        { status: 400 },
      );
    }

    let parsedImageUrl: URL;

    try {
      parsedImageUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid image URL." },
        { status: 400 },
      );
    }

    if (
      parsedImageUrl.protocol !== "https:" ||
      parsedImageUrl.hostname !== "res.cloudinary.com"
    ) {
      return NextResponse.json(
        { success: false, message: "Please use a valid Cloudinary image." },
        { status: 400 },
      );
    }

    await connectDB();

    const item = await WardrobeItem.create({
      userId,
      name,
      category,
      subcategory,
      color,
      style,
      imageUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Clothing saved to your wardrobe.",
        item: {
          id: item._id.toString(),
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          color: item.color,
          style: item.style,
          imageUrl: item.imageUrl,
          createdAt: item.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Save wardrobe item error:", error);

    return NextResponse.json(
      { success: false, message: "Could not save this clothing item." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to view your wardrobe." },
        { status: 401 },
      );
    }

    await connectDB();

    const items = await WardrobeItem.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      items: items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        subcategory: item.subcategory ?? "",
        color: item.color,
        style: item.style ?? "",
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch wardrobe items error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load your wardrobe." },
      { status: 500 },
    );
  }
}
