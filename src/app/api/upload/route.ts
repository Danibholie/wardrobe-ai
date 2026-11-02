import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import { trackMetric } from "@/lib/telemetry";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const reqStartTime = performance.now();
  let uploadStartTime = 0;
  let currentUserId: string | undefined;

  try {
    const session = await auth();
    const userId = session?.user?.id;
    currentUserId = userId;

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Please sign in to upload photos.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "No file provided",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    uploadStartTime = performance.now();
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "wardrobe-ai",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });

    const durationMs = performance.now() - uploadStartTime;

    // Track successful upload
    void trackMetric({
      type: "image_upload",
      endpoint: "/api/upload",
      userId,
      durationMs,
      success: true,
      statusCode: 200,
      metadata: {
        fileSizeBytes: buffer.length,
        fileType: file.type,
      },
    });

    return Response.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    const durationMs = uploadStartTime > 0 ? performance.now() - uploadStartTime : performance.now() - reqStartTime;
    console.error("Cloudinary upload error:", error);

    void trackMetric({
      type: "image_upload",
      endpoint: "/api/upload",
      userId: currentUserId,
      durationMs,
      success: false,
      statusCode: 500,
      errorCode: (error as Error)?.name || "UPLOAD_FAILED",
      errorMessage: (error as Error)?.message || "Failed to upload image",
    });

    return Response.json(
      {
        success: false,
        message: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const { publicId } = await request.json();

    if (publicId && typeof publicId === "string") {
      await cloudinary.uploader.destroy(publicId);
      return Response.json({ success: true, message: "Image removed from storage." });
    }

    return Response.json(
      { success: false, message: "Missing publicId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return Response.json(
      { success: false, message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
