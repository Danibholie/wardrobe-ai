import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import { trackMetric } from "@/lib/telemetry";
import { canUploadClothing } from "@/lib/subscription";
import { connectDB } from "@/lib/db";
import WardrobeItem from "@/models/WardrobeItem";

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB limit
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60;

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

    const uploadCheck = await canUploadClothing(userId);
    if (!uploadCheck.allowed) {
      return Response.json(
        {
          success: false,
          limitReached: true,
          message: uploadCheck.reason,
          currentCount: uploadCheck.currentCount,
          limit: uploadCheck.limit,
        },
        { status: 403 }
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

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          success: false,
          message: "File exceeds 12MB size limit. Please upload a smaller photo.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return Response.json(
        {
          success: false,
          message: "Invalid image format. Supported formats: JPG, PNG, WEBP, HEIC.",
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
          folder: `wardrobe-ai/${userId}`,
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

    const { publicId } = await request.json().catch(() => ({}));

    if (!publicId || typeof publicId !== "string") {
      return Response.json(
        { success: false, message: "Missing or invalid publicId" },
        { status: 400 }
      );
    }

    // IDOR Protection: Verify publicId is in user's namespace or belongs to user's wardrobe item
    const isUserNamespace =
      publicId.startsWith(`wardrobe-ai/${userId}/`) ||
      publicId === `wardrobe-ai/${userId}`;

    if (!isUserNamespace) {
      await connectDB();
      const escapedPublicId = publicId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const ownsItem = await WardrobeItem.exists({
        userId,
        imageUrl: { $regex: escapedPublicId },
      });

      if (!ownsItem) {
        return Response.json(
          { success: false, message: "Unauthorized. You cannot delete this media asset." },
          { status: 403 }
        );
      }
    }

    await cloudinary.uploader.destroy(publicId);
    return Response.json({ success: true, message: "Image removed from storage." });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return Response.json(
      { success: false, message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
