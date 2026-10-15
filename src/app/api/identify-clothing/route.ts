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

    const clothing = await identifyClothing(imageUrl);

    return Response.json({ success: true, clothing });
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