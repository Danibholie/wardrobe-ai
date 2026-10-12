"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type ClothingDetails = {
  name: string;
  category: string;
  subcategory: string;
  color: string;
  style: string;
};

const categories = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "traditional",
];

export default function AddClothingPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ClothingDetails | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    setError(null);
    setUploadedUrl(null);
    setDetails(null);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function updateDetail(field: keyof ClothingDetails, value: string) {
    setDetails((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  async function handleUploadAndIdentify() {
    if (!image && !uploadedUrl) {
      setError("Please choose a photo first.");
      return;
    }

    setError(null);
    setDetails(null);

    let imageUrl = uploadedUrl;

    try {
      if (!imageUrl) {
        if (!image) {
          setError("Please choose a photo first.");
          return;
        }

        setUploading(true);

        // Step 1: Upload the photo to Cloudinary.
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success || !uploadData.imageUrl) {
          throw new Error(uploadData.message || "Photo upload failed.");
        }

        imageUrl = uploadData.imageUrl;
        setUploadedUrl(imageUrl);
        setUploading(false);
      }

      // Step 2: Ask Gemini to identify the clothing.
      setIdentifying(true);

      const identifyResponse = await fetch("/api/identify-clothing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const identifyData = await identifyResponse.json();

      if (!identifyResponse.ok || !identifyData.success) {
        throw new Error(
          identifyData.message || "Could not identify this clothing item.",
        );
      }

      setDetails({
        name: identifyData.clothing.name ?? "",
        category: identifyData.clothing.category ?? "tops",
        subcategory: identifyData.clothing.subcategory ?? "",
        color: identifyData.clothing.color ?? "",
        style: identifyData.clothing.style ?? "",
      });
    } catch (err) {
      console.error("Upload or identification error:", err);
      let errorMsg = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          errorMsg = parsed?.error?.message || err.message;
        } catch {
          errorMsg = err.message;
        }
      }
      setError(errorMsg);
    } finally {
      setUploading(false);
      setIdentifying(false);
    }
  }

  async function handleSaveToWardrobe() {
    if (!details || !uploadedUrl) {
      setError("Upload and identify a clothing photo first.");
      return;
    }

    if (!details.name.trim() || !details.category || !details.color.trim()) {
      setError("Please provide the item name, category, and colour.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          imageUrl: uploadedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save this item.");
      }

      window.location.href = "/wardrobe";
    } catch (err) {
      console.error("Save clothing error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetSelection() {
    setImage(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setDetails(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/wardrobe"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#68736D] hover:text-[#173B2A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to wardrobe</span>
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium text-[#315343]">
            Add to your collection
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#17231D]">
            Add clothing
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#68736D]">
            Upload a clear photo of one item. Our AI will identify it, and you
            can review the details before saving it.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {!previewUrl ? (
            <label className="flex min-h-90 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8DDD8] px-6 text-center transition hover:border-[#315343] group">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF1EC] text-[#173B2A] transition group-hover:scale-105">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#17231D]">
                Upload a clothing photo
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#68736D]">
                Choose a clear photo showing one item. A plain background works
                best.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white transition group-hover:bg-[#24543D]">
                <UploadCloud className="w-4 h-4" />
                <span>Choose photo</span>
              </span>

              <p className="mt-4 text-xs text-[#8A938E]">
                JPG, PNG or WEBP · One item at a time
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl bg-[#F7F5F0] relative">
                <img
                  src={previewUrl}
                  alt="Selected clothing"
                  className="mx-auto max-h-125 w-full object-contain"
                />

                {(uploading || identifying) && (
                  <div className="absolute inset-0 bg-[#173B2A]/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center">
                    {uploading ? (
                      <>
                        <Loader2 className="w-10 h-10 animate-spin text-white mb-3" />
                        <p className="text-base font-semibold">Uploading photo securely...</p>
                        <p className="text-xs text-white/80 mt-1">Preparing image for AI analysis</p>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-3 flex items-center justify-center">
                          <Loader2 className="w-12 h-12 animate-spin text-white opacity-40" />
                          <Sparkles className="w-6 h-6 text-secondary-container absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <p className="text-base font-semibold">AI analysing garment...</p>
                        <p className="text-xs text-white/80 mt-1">Detecting category, main colour &amp; Nigerian styling</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetSelection}
                  disabled={uploading || identifying}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8DDD8] px-6 py-3 text-sm font-medium text-[#315343] hover:bg-[#F7F5F0] transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Choose another</span>
                </button>

                <button
                  type="button"
                  onClick={handleUploadAndIdentify}
                  disabled={uploading || identifying || !!details}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24543D] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading photo...</span>
                    </>
                  ) : identifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Identifying clothing...</span>
                    </>
                  ) : details ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Identification complete</span>
                    </>
                  ) : uploadedUrl ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Retry identification</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Upload and identify</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {(uploading || identifying) && (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#68736D]">
              <Loader2 className="w-4 h-4 animate-spin text-[#173B2A]" />
              <span>
                {uploading
                  ? "Uploading your photo securely..."
                  : "Analysing the visible clothing details with AI..."}
              </span>
            </p>
          )}

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 w-full">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {details && (
            <section className="mt-8 border-t border-[#E7E9E4] pt-6">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#315343]">
                <Sparkles className="w-4 h-4" />
                <span>AI identification</span>
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#17231D]">
                Review your item
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#68736D]">
                Check the details below. You can correct anything Gemini
                identified incorrectly.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-[#17231D]">
                    Item name *
                  </span>
                  <input
                    value={details.name}
                    onChange={(e) => updateDetail("name", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#D8DDD8] px-4 py-3 text-sm outline-none focus:border-[#315343]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#17231D]">
                    Category *
                  </span>
                  <select
                    value={details.category}
                    onChange={(e) => updateDetail("category", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#D8DDD8] bg-white px-4 py-3 text-sm outline-none focus:border-[#315343]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#17231D]">
                    Item type
                  </span>
                  <input
                    value={details.subcategory}
                    onChange={(e) =>
                      updateDetail("subcategory", e.target.value)
                    }
                    placeholder="e.g. polo, jeans, sneakers"
                    className="mt-2 w-full rounded-xl border border-[#D8DDD8] px-4 py-3 text-sm outline-none focus:border-[#315343]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#17231D]">
                    Main colour *
                  </span>
                  <input
                    value={details.color}
                    onChange={(e) => updateDetail("color", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#D8DDD8] px-4 py-3 text-sm outline-none focus:border-[#315343]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#17231D]">
                    Style
                  </span>
                  <input
                    value={details.style}
                    onChange={(e) => updateDetail("style", e.target.value)}
                    placeholder="e.g. casual, formal, traditional"
                    className="mt-2 w-full rounded-xl border border-[#D8DDD8] px-4 py-3 text-sm outline-none focus:border-[#315343]"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-xl bg-[#EEF1EC] px-4 py-3">
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#173B2A]">
                  <Check className="w-4 h-4 text-[#173B2A]" />
                  <span>Details ready for review</span>
                </p>
                <p className="mt-1 text-xs leading-5 text-[#68736D]">
                  Your photo has been uploaded. The next step is to save to
                  wardrobe.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveToWardrobe}
                disabled={saving || uploading || identifying}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24543D] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to wardrobe...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save to Wardrobe</span>
                  </>
                )}
              </button>
            </section>
          )}

          {uploadedUrl && (
            <p className="mt-4 break-all text-xs text-[#8A938E]">
              Image URL: {uploadedUrl}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
