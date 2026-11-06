import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(userId);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Failed to fetch user subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load subscription status." },
      { status: 500 }
    );
  }
}

