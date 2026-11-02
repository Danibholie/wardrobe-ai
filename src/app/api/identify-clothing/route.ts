import { auth } from "@/auth";
import { identifyClothing } from "@/lib/ai";
import { parseAiError } from "@/lib/errors";
import { trackMetric } from "@/lib/telemetry";

export async function POST(request: Request) {
  const reqStartTime = performance.now();
  let aiStartTime = 0;
  let currentUserId: string | undefined;

  try {
    const session = await auth();
    const userId = session?.user?.id;
    currentUserId = userId;

    if (!userId) {
      return Response.json(
        { success: false, message: "Please sign in to identify clothing." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return Response.json(
        { success: false, message: "Image URL is required." },
        { status: 400 }
      );
    }

    aiStartTime = performance.now();
    const result = await identifyClothing(imageUrl);
    const durationMs = performance.now() - aiStartTime;

    // Track AI Vision completion
    void trackMetric({
      type: "clothing_identification",
      endpoint: "/api/identify-clothing",
      userId,
      durationMs,
      success: true,
      statusCode: 200,
      metadata: {
        isClothing: result.isClothing,
        detectedObject: result.detectedObject,
        category: result.category,
      },
    });

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
    const durationMs = aiStartTime > 0 ? performance.now() - aiStartTime : performance.now() - reqStartTime;
    console.error("Clothing identification error:", error);

    const { friendlyMessage, statusCode } = parseAiError(
      error,
      "Failed to identify clothing from this image."
    );

    void trackMetric({
      type: "clothing_identification",
      endpoint: "/api/identify-clothing",
      userId: currentUserId,
      durationMs,
      success: false,
      statusCode,
      errorCode: (error as Error)?.name || "IDENTIFY_CLOTHING_ERROR",
      errorMessage: (error as Error)?.message || friendlyMessage,
    });

    return Response.json(
      {
        success: false,
        message: friendlyMessage,
      },
      { status: statusCode }
    );
  }
}
