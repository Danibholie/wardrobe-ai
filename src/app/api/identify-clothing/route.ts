import { auth } from "@/auth";
import { identifyClothing } from "@/lib/ai";

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

    let message = "An error occurred while identifying clothing.";
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        } else {
          message = error.message;
        }
      } catch {
        message = error.message;
      }
    }

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}