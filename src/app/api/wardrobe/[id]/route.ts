import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import WardrobeItem from "@/models/WardrobeItem";

const ALLOWED_CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "traditional",
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in first." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid clothing item ID." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, category, subcategory, color, style } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !ALLOWED_CATEGORIES.includes(category) ||
      typeof color !== "string" ||
      !color.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide a name, valid category, and color.",
        },
        { status: 400 },
      );
    }

    if (
      (subcategory != null && typeof subcategory !== "string") ||
      (style != null && typeof style !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid clothing details." },
        { status: 400 },
      );
    }

    await connectDB();

    const item = await WardrobeItem.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          name: name.trim(),
          category,
          subcategory:
            typeof subcategory === "string" ? subcategory.trim() : "",
          color: color.trim(),
          style: typeof style === "string" ? style.trim() : "",
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Clothing item not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Update wardrobe item error:", error);

    return NextResponse.json(
      { success: false, message: "Could not update clothing item." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in first." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid clothing item ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const item = await WardrobeItem.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Clothing item not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Clothing item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete wardrobe item error:", error);

    return NextResponse.json(
      { success: false, message: "Could not delete clothing item." },
      { status: 500 },
    );
  }
}
