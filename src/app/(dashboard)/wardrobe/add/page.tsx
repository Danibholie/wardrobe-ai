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
  X,
  Camera,
  Shirt,
  Leaf,
  SlidersHorizontal,
  ChevronRight,
  Lock,
} from "lucide-react";

type ClothingDetails = {
  name: string;
  category: string;
  subcategory: string;
  color: string;
  style: string;
};

const CATEGORIES = [
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Shoes", value: "shoes" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Traditional", value: "traditional" },
  { label: "Dresses", value: "dresses" },
  { label: "Accessories", value: "accessories" },
];

const STYLE_OPTIONS = [
  "Casual / Smart casual",
  "Strictly Formal / Business",
  "Traditional / Ceremony",
  "Weekend Loungewear",
  "Evening Social & Dinner",
];

function getColorHex(colorName: string): string {
  const map: Record<string, string> = {
    white: "#f8f9fa",
    black: "#1b1c1a",
    navy: "#1b263b",
    blue: "#3a86ff",
    olive: "#36453b",
    green: "#2a9d8f",
    emerald: "#1f3023",
    brown: "#835336",
    cognac: "#9a5b32",
    tan: "#d4a373",
    beige: "#e9d8a6",
    cream: "#f4f1de",
    grey: "#6c757d",
    gray: "#6c757d",
    red: "#e63946",
    burgundy: "#581845",
    pink: "#ffb4a2",
    yellow: "#ffb703",
    gold: "#d4af37",
    orange: "#fb8500",
    purple: "#7209b7",
  };
  const key = colorName.trim().toLowerCase();
  return map[key] || "#737873";
}

export default function AddClothingPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ClothingDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function processImage(file: File) {
    setError(null);
    setDetails(null);
    setUploadedUrl(null);
    setImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    let currentImageUrl: string | null = null;

    try {
      setUploading(true);

      // Step 1: Upload photo to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success || !uploadData.imageUrl) {
        throw new Error(uploadData.message || "Photo upload failed.");
      }

      currentImageUrl = uploadData.imageUrl;
      setUploadedUrl(currentImageUrl);
      setUploading(false);

      // Step 2: Identify clothing with Gemini AI
      setIdentifying(true);

      const identifyResponse = await fetch("/api/identify-clothing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: currentImageUrl }),
      });

      const identifyData = await identifyResponse.json();

      if (!identifyResponse.ok || !identifyData.success) {
        throw new Error(
          identifyData.message || "Could not identify this clothing item."
        );
      }

      setDetails({
        name: identifyData.clothing.name ?? "",
        category: (identifyData.clothing.category ?? "tops").toLowerCase(),
        subcategory: identifyData.clothing.subcategory ?? "",
        color: identifyData.clothing.color ?? "",
        style: identifyData.clothing.style ?? "Casual / Smart casual",
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    processImage(file);
  }

  function updateDetail(field: keyof ClothingDetails, value: string) {
    setDetails((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function handleSaveToWardrobe() {
    if (!uploadedUrl && !previewUrl) {
      setError("Please choose a clothing photo first.");
      return;
    }

    if (!details) {
      setError("Please fill in the clothing details.");
      return;
    }

    if (!details.name.trim() || !details.category || !details.color.trim()) {
      setError("Please provide item name, category, and colour.");
      return;
    }

    if (!uploadedUrl) {
      setError("Image is still uploading. Please wait a moment.");
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
        err instanceof Error ? err.message : "Something went wrong while saving."
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
    setIsManualMode(false);
  }

  function enableManualMode() {
    setIsManualMode(true);
    if (!details) {
      setDetails({
        name: "",
        category: "tops",
        subcategory: "",
        color: "",
        style: "Casual / Smart casual",
      });
    }
  }

  const currentColorHex = details?.color ? getColorHex(details.color) : "#c3c8c2";

  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full">
          {/* Back Navigation */}
          <div className="mb-space-md">
            <Link
              href="/wardrobe"
              className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to wardrobe</span>
            </Link>
          </div>

          {/* Top Editorial Header & Status */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
            <div>
              <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
                <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  Garment Digitizer · Studio Engine
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
                Add clothing
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
                Take a quick photo or upload. AI detects the item details automatically.
              </p>
            </div>

            {/* Quick Meta Pill */}
            <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full self-start md:self-auto shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
                Neural Vision v4.2
              </span>
            </div>
          </div>

          {/* Feedback Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-space-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-700 hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Dual Workspace (Editorial Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* LEFT PANEL: Image Upload Stage */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-md border border-outline-variant/20">
                {!previewUrl ? (
                  /* Empty Upload Stage */
                  <label className="flex min-h-[380px] sm:min-h-[440px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/60 hover:border-primary/60 bg-surface-container-low/50 p-6 text-center transition-all group">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-primary transition-transform group-hover:scale-105 shadow-xs">
                      <Camera className="w-7 h-7" />
                    </div>

                    <h3 className="mt-4 font-headline-sm text-headline-sm text-primary font-medium">
                      Upload a clothing photo
                    </h3>

                    <p className="mt-1.5 max-w-sm font-body-sm text-body-sm text-on-surface-variant">
                      Choose a clear photo showing one item. A plain background works best.
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-title-md text-title-md text-on-primary group-hover:bg-primary-container transition-all shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                      <span>Choose photo</span>
                    </span>

                    <p className="mt-3 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                      JPG, PNG or WEBP · Single garment
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  /* Active Image Canvas */
                  <>
                    {/* Live AI Status Floating Tag */}
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-surface/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs border border-outline-variant/20">
                      {identifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-secondary animate-spin" />
                          <span className="font-label-caps text-label-caps text-primary tracking-wide font-semibold">
                            AI analyzing garment...
                          </span>
                        </>
                      ) : uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-secondary animate-spin" />
                          <span className="font-label-caps text-label-caps text-primary tracking-wide font-semibold">
                            Uploading photo securely...
                          </span>
                        </>
                      ) : details ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-label-caps text-label-caps text-primary tracking-wide font-semibold">
                            AI identified garment
                          </span>
                        </>
                      ) : (
                        <span className="font-label-caps text-label-caps text-primary tracking-wide font-semibold">
                          Photo ready
                        </span>
                      )}
                    </div>

                    {/* Camera Retake & Remove Overlay Actions */}
                    <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5">
                      <label
                        className="w-9 h-9 rounded-full bg-surface/90 hover:bg-surface text-on-surface-variant hover:text-primary backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-outline-variant/20"
                        title="Retake or replace photo"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploading || identifying}
                        />
                      </label>
                      <button
                        onClick={resetSelection}
                        disabled={uploading || identifying}
                        className="w-9 h-9 rounded-full bg-surface/90 hover:bg-surface text-on-surface-variant hover:text-primary backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-outline-variant/20 disabled:opacity-50"
                        title="Remove image"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Canvas */}
                    <div className="relative w-full aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center group">
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        alt={details?.name || "Selected clothing piece"}
                        src={previewUrl}
                      />

                      {/* Loading State Overlay */}
                      {(uploading || identifying) && (
                        <div className="absolute inset-0 bg-primary/75 backdrop-blur-xs flex flex-col items-center justify-center text-on-primary p-6 text-center animate-in fade-in duration-200">
                          {uploading ? (
                            <>
                              <Loader2 className="w-10 h-10 animate-spin text-on-primary mb-3" />
                              <p className="font-headline-sm text-headline-sm font-medium">
                                Uploading photo securely...
                              </p>
                              <p className="font-body-sm text-body-sm text-on-primary/80 mt-1">
                                Preparing image for AI vision analysis
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="relative mb-3 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-on-primary opacity-40" />
                                <Sparkles className="w-6 h-6 text-secondary-container absolute inset-0 m-auto animate-pulse" />
                              </div>
                              <p className="font-headline-sm text-headline-sm font-medium">
                                AI analysing garment...
                              </p>
                              <p className="font-body-sm text-body-sm text-on-primary/80 mt-1">
                                Detecting category, main colour &amp; Nigerian styling
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      {/* Bounding Box Visual & AI Anchors overlay */}
                      {details && !uploading && !identifying && (
                        <div className="absolute inset-5 rounded-lg pointer-events-none opacity-90 flex flex-col justify-between p-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="bg-primary/90 text-on-primary font-label-caps text-label-caps px-2.5 py-1 rounded tracking-widest backdrop-blur-sm uppercase font-semibold">
                              {details.category} · CONFIRMED
                            </span>
                            {details.subcategory && (
                              <span className="bg-surface/90 text-primary font-label-caps text-label-caps px-2 py-0.5 rounded shadow-sm uppercase font-semibold">
                                {details.subcategory}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-end gap-2">
                            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface/90 px-2 py-0.5 rounded uppercase font-semibold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: currentColorHex }}
                              />
                              <span>{details.color}</span>
                            </span>
                            <span className="bg-surface/90 p-1 rounded text-primary">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Switch Photo Trigger Strip */}
                    <label className="mt-space-md bg-surface-container-low rounded-lg p-space-md flex items-center justify-between gap-space-sm hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/15">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                          <Camera className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-title-md text-title-md text-on-surface leading-tight font-medium">
                            Switch photo
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Camera snapshot or PNG / JPG files
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading || identifying}
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Sustainability & Care Hint Card */}
              <div className="bg-surface-container-low p-space-md rounded-xl flex items-start gap-space-sm border border-outline-variant/15">
                <Leaf className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-bold">
                    Wardrobe Lifecycle Insight
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Breathable tailoring and open weaves. Hand washing or cold cycles preserves collar structure and reduces fiber wear in tropical Nigerian climate.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: AI-Suggested Editable Form Elements */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md md:p-space-lg flex flex-col gap-space-md border border-outline-variant/20">
                <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
                  <div className="flex items-center gap-space-xs">
                    <SlidersHorizontal className="w-4 h-4 text-secondary" />
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold">
                      Detected Garment Specs
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    {details ? "TAP TO EDIT" : "AWAITING INPUT"}
                  </span>
                </div>

                {!details && !isManualMode ? (
                  /* Waiting for Upload Prompt */
                  <div className="py-8 text-center space-y-3">
                    <Shirt className="w-10 h-10 text-outline mx-auto" />
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-medium">
                      No garment selected yet
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                      Upload a photo on the left. The studio vision engine will automatically detect and populate the garment attributes.
                    </p>
                    <button
                      type="button"
                      onClick={enableManualMode}
                      className="text-xs text-secondary hover:underline cursor-pointer font-semibold pt-2"
                    >
                      Or enter details manually without photo
                    </button>
                  </div>
                ) : (
                  /* Form Fields */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveToWardrobe();
                    }}
                    className="flex flex-col gap-space-md"
                  >
                    {/* Field 1: Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                        <span>Item Name *</span>
                        <span className="text-secondary font-medium">
                          {isManualMode ? "Manual entry" : "Auto-generated"}
                        </span>
                      </label>
                      <input
                        required
                        maxLength={100}
                        value={details?.name || ""}
                        onChange={(e) => updateDetail("name", e.target.value)}
                        placeholder="e.g. Crisp white cotton polo, Navy senator"
                        className="w-full h-12 bg-surface rounded-lg px-space-md font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner border border-outline-variant/20"
                      />
                    </div>

                    {/* Field 2: Category Chips Quick Selector */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                        <span>Category *</span>
                        <span className="text-on-surface-variant lowercase font-normal">
                          {CATEGORIES.length} options
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((cat) => {
                          const isSelected = details?.category === cat.value;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => updateDetail("category", cat.value)}
                              className={`h-8 px-3 rounded-full font-label-md text-label-md transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-primary-container text-on-primary shadow-xs font-semibold"
                                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                              }`}
                            >
                              <span>{cat.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Field 3: Subcategory / Item Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                        Subcategory / Item Type
                      </label>
                      <input
                        maxLength={80}
                        value={details?.subcategory || ""}
                        onChange={(e) =>
                          updateDetail("subcategory", e.target.value)
                        }
                        placeholder="e.g. Polo, Jeans, Chinos, Kaftan, Agbada"
                        className="w-full h-12 bg-surface rounded-lg px-space-md font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner border border-outline-variant/20"
                      />
                    </div>

                    {/* Field 4: Colour with Tone Palette preview */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                        Dominant Colour &amp; Shade *
                      </label>
                      <div className="h-12 bg-surface rounded-lg px-space-md flex items-center justify-between shadow-inner border border-outline-variant/20 gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: currentColorHex }}
                          />
                          <input
                            required
                            maxLength={50}
                            value={details?.color || ""}
                            onChange={(e) => updateDetail("color", e.target.value)}
                            placeholder="e.g. White, Navy, Olive, Burgundy"
                            className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
                          />
                        </div>
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase shrink-0">
                          Live Swatch
                        </span>
                      </div>
                    </div>

                    {/* Field 5: Style / Occasion Alignment */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                        Style &amp; Versatility
                      </label>
                      <div className="relative">
                        <select
                          value={details?.style || STYLE_OPTIONS[0]}
                          onChange={(e) => updateDetail("style", e.target.value)}
                          className="w-full h-12 bg-surface rounded-lg px-space-md font-body-md text-body-md text-on-surface focus:outline-none appearance-none cursor-pointer shadow-inner border border-outline-variant/20"
                        >
                          {STYLE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-on-surface-variant absolute right-3.5 top-4 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    {/* Primary & Secondary Action Block */}
                    <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-sm mt-space-xs">
                      <button
                        type="submit"
                        disabled={saving || uploading || identifying || !uploadedUrl}
                        className="w-full sm:flex-1 h-12 bg-primary text-on-primary rounded-lg font-title-md text-title-md flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding to wardrobe...</span>
                          </>
                        ) : (
                          <>
                            <Shirt className="w-4 h-4" />
                            <span>Add to wardrobe</span>
                          </>
                        )}
                      </button>

                      <Link
                        href="/wardrobe"
                        className="w-full sm:w-auto px-6 h-12 bg-surface-container text-on-surface rounded-lg font-body-md text-body-md hover:bg-surface-container-high transition-colors flex items-center justify-center"
                      >
                        Cancel
                      </Link>
                    </div>

                    {/* Switch to manual entry without AI identification */}
                    {!isManualMode && (
                      <div className="text-center pt-space-xs">
                        <button
                          type="button"
                          onClick={enableManualMode}
                          className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/40 cursor-pointer"
                        >
                          Switch to manual entry without AI identification
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Quick Guidance Microcopy Drawer */}
              <div className="px-space-md py-space-sm flex items-center justify-between text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-outline shrink-0" />
                  <span className="font-body-sm text-body-sm">
                    Your private closet photos are encrypted &amp; never publicly indexed
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                  SECURE ARCHIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
