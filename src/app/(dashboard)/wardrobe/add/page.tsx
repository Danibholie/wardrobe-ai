"use client";

import { ChangeEvent, useState } from "react";

export default function AddClothingPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setUploadedUrl(null);
    setImage(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  async function handleUpload() {
    if (!image) {
      setError("Please choose a photo first.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      setUploadedUrl(data.imageUrl);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <a
          href="/wardrobe"
          className="text-sm font-medium text-[#68736D] hover:text-[#173B2A]"
        >
          ← Back to wardrobe
        </a>

        <div className="mt-8">
          <p className="text-sm font-medium text-[#315343]">
            Add to your collection
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#17231D]">
            Add clothing
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#68736D]">
            Upload a clear photo of one clothing item. We&apos;ll identify it
            and let you confirm the details before adding it to your wardrobe.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {!previewUrl ? (
            <label className="flex min-h-90 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8DDD8] px-6 text-center transition hover:border-[#315343]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF1EC] text-2xl">
                +
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#17231D]">
                Upload a clothing photo
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#68736D]">
                Choose a clear photo showing one item. A simple photo on a plain
                background works best.
              </p>

              <span className="mt-6 rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white">
                Choose photo
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
            <div>
              <div className="overflow-hidden rounded-2xl bg-[#F7F5F0]">
                <img
                  src={previewUrl}
                  alt="Selected clothing"
                  className="mx-auto max-h-125 w-full object-contain"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl(null);
                    setUploadedUrl(null);
                    setError(null);
                  }}
                  className="rounded-full border border-[#D8DDD8] px-6 py-3 text-sm font-medium text-[#315343]"
                >
                  Choose another
                </button>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload photo"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {uploadedUrl && (
            <div className="mt-5 rounded-xl bg-[#EEF1EC] px-4 py-3">
              <p className="text-sm font-medium text-[#173B2A]">
                Photo uploaded successfully.
              </p>

              <p className="mt-1 break-all text-xs text-[#68736D]">
                {uploadedUrl}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
