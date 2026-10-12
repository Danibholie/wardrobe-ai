import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import SavedOutfit from "@/models/SavedOutfit";
import mongoose from "mongoose";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to manage outfits." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid outfit identifier." },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await SavedOutfit.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Outfit not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Outfit successfully removed from your saved archive.",
    });
  } catch (error) {
    console.error("Delete outfit error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete outfit." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please sign in to update outfits." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid outfit identifier." },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json().catch(() => ({}));
    const countIncrement = typeof body.increment === "number" ? body.increment : 1;

    const updated = await SavedOutfit.findOneAndUpdate(
      { _id: id, userId },
      {
        $inc: { wearCount: countIncrement },
        $set: { lastWorn: new Date() },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Outfit not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Wear logged successfully.",
      wearCount: updated.wearCount,
      lastWorn: updated.lastWorn,
    });
  } catch (error) {
    console.error("Update outfit wear error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log outfit wear." },
      { status: 500 }
    );
  }
}

