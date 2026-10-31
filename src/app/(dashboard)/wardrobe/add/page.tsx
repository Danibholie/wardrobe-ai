"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
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
  FolderOpen,
  SwitchCamera,
  Shirt,
  SlidersHorizontal,
  ChevronRight,
  Lock,
  Grid,
  Zap,
  ZapOff,
} from "lucide-react";
import { formatAiError } from "@/lib/errors";

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

  // Camera and file selection state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl]);

  // Connect camera stream to video element whenever camera is opened
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
      });
    }
  }, [isCameraOpen]);

  // Lock background scroll when full-screen viewfinder is open
  useEffect(() => {
    if (isCameraOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCameraOpen]);

  // Keyboard accessibility: Escape to close camera, Space/Enter to capture photo
  useEffect(() => {
    if (!isCameraOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopCamera();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        capturePhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCameraOpen, facingMode]);

  async function startCamera(mode: "environment" | "user" = facingMode) {
    setCameraError(null);
    setCameraStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Live camera is not supported in this browser. Please use 'Choose from files' or the phone camera option.",
        );
      }

      // Stop any existing stream before starting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setFacingMode(mode);

      // Check if torch/flashlight is supported
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === "function") {
        const capabilities = videoTrack.getCapabilities() as {
          torch?: boolean;
        };
        setHasTorch(Boolean(capabilities?.torch));
        setTorchOn(false);
      } else {
        setHasTorch(false);
        setTorchOn(false);
      }

      setIsCameraOpen(true);
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj.name === "NotAllowedError" ||
        errorObj.name === "PermissionDeniedError"
      ) {
        setCameraError(
          "Camera access was denied. Please grant permission in your browser or select an image from your files.",
        );
      } else if (
        errorObj.name === "NotFoundError" ||
        errorObj.name === "DevicesNotFoundError"
      ) {
        setCameraError("No camera device was found on your current device.");
      } else {
        setCameraError(
          errorObj.message ||
            "Could not access camera. You can select an image from your files.",
        );
      }
      setIsCameraOpen(false);
    } finally {
      setCameraStarting(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
    setHasTorch(false);
    setIsCameraOpen(false);
    setCameraStarting(false);
  }

  function toggleCameraFacing() {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    startCamera(nextMode);
  }

  async function toggleTorch() {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchOn;
      // @ts-expect-error torch is not in standard MediaTrackConstraints TypeScript definitions
      await track.applyConstraints({ advanced: [{ torch: nextTorch }] });
      setTorchOn(nextTorch);
    } catch (err) {
      console.error("Torch error:", err);
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    // Haptic feedback if available
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch {
        // Ignore if restricted
      }
    }

    // Trigger visual shutter flash effect
    setShutterFlashing(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setShutterFlashing(false);
      return;
    }

    // Flip horizontally if using front/user-facing camera for natural mirror feel
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setShutterFlashing(false);
          return;
        }
        const file = new File([blob], `garment-snap-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setTimeout(() => {
          setShutterFlashing(false);
          stopCamera();
          processImage(file);
        }, 140);
      },
      "image/jpeg",
      0.92,
    );
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Please choose a JPG, PNG, or WEBP image.");
        return;
      }
      processImage(file);
    }
  }

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
          identifyData.message || "Could not identify this clothing item.",
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
      const errorMsg = formatAiError(
        err,
        "Failed to identify clothing automatically. You can still enter details manually below.",
      );
      setError(errorMsg);
      // If photo was successfully uploaded, automatically enable manual mode so user doesn't lose work
      if (currentImageUrl && !details) {
        setIsManualMode(true);
        setDetails({
          name: "",
          category: "tops",
          subcategory: "",
          color: "",
          style: "Casual / Smart casual",
        });
      }
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
      current ? { ...current, [field]: value } : current,
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
        err instanceof Error
          ? err.message
          : "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetSelection() {
    stopCamera();
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

  const currentColorHex = details?.color
    ? getColorHex(details.color)
    : "#c3c8c2";

  return (
    <main className="w-full pt-20 pb-24 md:pb-12 bg-background min-h-screen">
      {/* Full-Screen Immersive Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Camera viewfinder"
          className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none touch-none h-screen h-[100dvh]"
        >
          {/* Full Screen Live Video Element */}
          <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              onLoadedMetadata={(e) => {
                (e.target as HTMLVideoElement).play().catch(() => {});
              }}
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />
          </div>

          {/* Shutter Flash Animation Overlay */}
          {shutterFlashing && (
            <div className="absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 animate-out fade-out" />
          )}

          {/* Subtle Contrast Gradients for Controls */}
          <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 inset-x-0 h-52 bg-linear-to-t from-black/95 via-black/55 to-transparent pointer-events-none z-10" />

          {/* Top Header Bar */}
          <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 pt-safe pt-4 pb-2">
            {/* Studio Tag */}
            <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Studio Viewfinder
              </span>
            </div>

            {/* Top Action Buttons Cluster */}
            <div className="flex items-center gap-2">
              {/* Torch Toggle (if supported on device) */}
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  title={torchOn ? "Turn flash off" : "Turn flash on"}
                  className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border cursor-pointer active:scale-95 ${
                    torchOn
                      ? "bg-amber-400 text-black border-amber-300 shadow-md"
                      : "bg-black/45 text-white hover:bg-black/65 border-white/15"
                  }`}
                >
                  {torchOn ? (
                    <Zap className="w-4 h-4 fill-current" />
                  ) : (
                    <ZapOff className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Grid / Guide Toggle */}
              <button
                type="button"
                onClick={() => setShowGrid((prev) => !prev)}
                title={showGrid ? "Hide framing guides" : "Show framing guides"}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border cursor-pointer active:scale-95 ${
                  showGrid
                    ? "bg-white/30 text-white border-white/40"
                    : "bg-black/45 text-white/70 hover:bg-black/65 border-white/15"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Flip Camera */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                title="Flip camera"
                className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/15 cursor-pointer active:scale-95"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              {/* Close Viewfinder */}
              <button
                type="button"
                onClick={stopCamera}
                title="Close camera (Esc)"
                className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/15 cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Framing Guides */}
          <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 pointer-events-none">
            {showGrid && (
              <div className="relative w-full max-w-sm sm:max-w-md aspect-3/4 max-h-[62vh] rounded-2xl border border-white/20 flex flex-col justify-between p-4 shadow-2xl transition-opacity">
                {/* Subtle rule-of-thirds grid line indicators */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>

                {/* Glowing framing corners */}
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-t-3 border-l-3 border-white rounded-tl-lg shadow-sm" />
                  <div className="w-7 h-7 border-t-3 border-r-3 border-white rounded-tr-lg shadow-sm" />
                </div>

                {/* Center hint pill */}
                <div className="text-center self-center">
                  <span className="inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md text-white/95 text-xs font-medium px-4 py-1.5 rounded-full border border-white/20 shadow-md">
                    <Shirt className="w-3.5 h-3.5 text-secondary" />
                    <span>Center garment inside frame</span>
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="w-7 h-7 border-b-3 border-l-3 border-white rounded-bl-lg shadow-sm" />
                  <div className="w-7 h-7 border-b-3 border-r-3 border-white rounded-br-lg shadow-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Control Bar */}
          <div className="relative z-20 flex flex-col items-center pb-safe pb-8 px-6 gap-3.5">
            <p className="text-white/80 text-xs font-medium tracking-wide drop-shadow text-center">
              Lay flat or hang on plain background • Tap shutter to snap
            </p>

            <div className="w-full max-w-sm flex items-center justify-around pt-1">
              {/* Left: Gallery Fallback Option */}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  fileInputRef.current?.click();
                }}
                title="Pick photo from files instead"
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 group-hover:bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform group-active:scale-95">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-medium tracking-wide">
                  Files
                </span>
              </button>

              {/* Center: Hero Shutter Button */}
              <button
                type="button"
                onClick={capturePhoto}
                title="Capture photo (Space)"
                className="group relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-white/95 bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center shadow-2xl cursor-pointer"
              >
                <span className="w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-white transition-transform group-hover:scale-95 group-active:scale-90 shadow-md" />
              </button>

              {/* Right: Phone Native Camera Option */}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  nativeCameraInputRef.current?.click();
                }}
                title="Use device's native camera app"
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 group-hover:bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform group-active:scale-95">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-medium tracking-wide">
                  Phone app
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                <Sparkles className="w-4 h-4 text-secondary shrink-0" />
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  Garment Digitizer · Studio Engine
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
                Add clothing
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
                Take a quick photo or upload. AI detects the item details
                automatically.
              </p>
            </div>

            {/* Quick Meta Pill
            <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full self-start md:self-auto shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
                Powered by Gemini AI
              </span>
            </div> */}
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
                  /* Dual Choice Hub: Camera Snap vs File Upload */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`min-h-95 sm:min-h-110 flex flex-col justify-between rounded-xl border-2 border-dashed p-6 transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[0.99]"
                        : "border-outline-variant/60 bg-surface-container-low/40"
                    }`}
                  >
                    {/* Top Header */}
                    <div className="text-center pt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                        <Camera className="w-3.5 h-3.5 text-secondary" />
                        <span>Garment Input</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                        Add a clothing photo
                      </h3>
                      <p className="mt-1 max-w-sm mx-auto font-body-sm text-body-sm text-on-surface-variant">
                        Snap a photo directly with your camera, or choose an
                        existing photo from your device.
                      </p>
                    </div>

                    {/* Camera error message if permission failed */}
                    {cameraError && (
                      <div className="my-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{cameraError}</p>
                          <p className="mt-0.5 text-red-600">
                            You can select a photo from your files below
                            instead.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCameraError(null)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Dual Action Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
                      {/* OPTION 1: Snap Photo with Camera */}
                      <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all group">
                        <div className="space-y-2">
                          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                            <Camera className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                              Snap with camera
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
                              Open full-screen camera viewfinder with framing
                              guides.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            disabled={cameraStarting}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-title-md text-sm text-on-primary hover:bg-primary-container transition-all shadow-xs cursor-pointer disabled:opacity-75"
                          >
                            {cameraStarting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Starting camera...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4" />
                                <span>Open camera</span>
                              </>
                            )}
                          </button>

                          {/* Native mobile camera fallback trigger */}
                          <label className="text-center text-xs text-secondary hover:underline cursor-pointer py-1 font-medium">
                            <span>Or use device camera app</span>
                            <input
                              ref={nativeCameraInputRef}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* OPTION 2: Choose from Files */}
                      <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all group">
                        <div className="space-y-2">
                          <div className="w-11 h-11 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center transition-transform group-hover:scale-105">
                            <FolderOpen className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                              Choose from files
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
                              Select an image from your device storage, photo
                              gallery, or folders.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-surface-container-high px-4 py-2.5 font-title-md text-sm text-on-surface hover:bg-surface-container-highest transition-all shadow-xs cursor-pointer border border-outline-variant/30"
                          >
                            <UploadCloud className="w-4 h-4 text-primary" />
                            <span>Select from file</span>
                          </button>
                          <span className="text-center text-xs text-on-surface-variant py-1">
                            Supports JPG, PNG, WEBP
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Drop Prompt */}
                    <div className="text-center pt-2 border-t border-outline-variant/20">
                      <p className="font-label-caps text-label-caps text-outline uppercase tracking-wider text-[11px]">
                        Or drag & drop an image here · Plain background
                        recommended
                      </p>
                    </div>
                  </div>
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
                      <button
                        onClick={() => {
                          resetSelection();
                          startCamera();
                        }}
                        disabled={uploading || identifying}
                        className="w-9 h-9 rounded-full bg-surface/90 hover:bg-surface text-on-surface-variant hover:text-primary backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-outline-variant/20 disabled:opacity-50"
                        title="Snap another photo"
                        type="button"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || identifying}
                        className="w-9 h-9 rounded-full bg-surface/90 hover:bg-surface text-on-surface-variant hover:text-primary backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-outline-variant/20 disabled:opacity-50"
                        title="Choose different file"
                        type="button"
                      >
                        <UploadCloud className="w-4 h-4" />
                      </button>
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
                    <div className="relative w-full aspect-4/5 bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center group">
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
                                Detecting category, main colour &amp; Nigerian
                                styling
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

                    {/* Switch Photo Action Strip */}
                    <div className="mt-space-md bg-surface-container-low rounded-lg p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border border-outline-variant/15">
                      <div className="flex items-center gap-space-sm w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                          <RefreshCw className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-title-md text-title-md text-on-surface leading-tight font-medium">
                            Change photo
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                            Snap a new photo or select from your files
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            resetSelection();
                            startCamera();
                          }}
                          disabled={uploading || identifying}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-xs transition-colors cursor-pointer border border-outline-variant/30"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Snap new</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading || identifying}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>From files</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
                      Upload a photo on the left. The studio vision engine will
                      automatically detect and populate the garment attributes.
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
                              onClick={() =>
                                updateDetail("category", cat.value)
                              }
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
                            onChange={(e) =>
                              updateDetail("color", e.target.value)
                            }
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
                          onChange={(e) =>
                            updateDetail("style", e.target.value)
                          }
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
                        disabled={
                          saving || uploading || identifying || !uploadedUrl
                        }
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
                    Your private closet photos are encrypted &amp; never
                    publicly indexed
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
