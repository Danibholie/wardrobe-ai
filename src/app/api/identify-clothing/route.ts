import { identifyClothing } from "@/lib/ai";

export async function POST(request: Request) {
  try {
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

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
      },
      { status: 500 }
    );
  }
}

// https://res.cloudinary.com/dk3294qvk/image/upload/v1791645210/wardrobe-ai/pp96jguhif5jvxcwadds.jpg

// fetch("/api/identify-clothing", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     imageUrl: "PASTE_YOUR_CLOUDINARY_IMAGE_URL_HERE",
//   }),
// })
//   .then(async (response) => {
//     const body = await response.text();

//     console.log("HTTP status:", response.status);
//     console.log("Response body:", body || "(empty response)");
//   })
//   .catch(console.error);