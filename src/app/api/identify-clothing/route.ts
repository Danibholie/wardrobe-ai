import { auth } from "@/auth";
import { identifyClothing } from "@/lib/ai";
import { parseAiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json(
        { success: false, message: "Please sign in to identify clothing." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return Response.json(
        { success: false, message: "Image URL is required." },
        { status: 400 }
      );
    }

    const result = await identifyClothing(imageUrl);

    // If Gemini determined the image is not a wearable clothing item or accessory
    if (!result.isClothing) {
      return Response.json({
        success: false,
        isClothing: false,
        detectedObject: result.detectedObject || "non-clothing item",
        rejectionReason:
          result.rejectionReason ||
          `We spotted a ${result.detectedObject || "non-clothing item"} instead of a wearable garment or fashion accessory.`,
        message:
          result.rejectionReason ||
          `No clothing detected (spotted: ${result.detectedObject || "non-clothing item"}).`,
      });
    }

    return Response.json({
      success: true,
      isClothing: true,
      clothing: {
        name: result.name || result.detectedObject || "Clothing Item",
        category: (result.category || "tops").toLowerCase(),
        subcategory: result.subcategory || "",
        color: result.color || "",
        style: result.style || "Casual / Smart casual",
      },
      detectedObject: result.detectedObject,
    });
  } catch (error) {
    console.error("Clothing identification error:", error);

    const { friendlyMessage, statusCode } = parseAiError(
      error,
      "Failed to identify clothing from this image."
    );

    return Response.json(
      {
        success: false,
        message: friendlyMessage,
      },
      { status: statusCode }
    );
  }
}