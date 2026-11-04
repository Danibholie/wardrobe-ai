"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Download, RefreshCw, Sparkles, Check } from "lucide-react";
import { CATALOG_ITEMS, CatalogItem } from "@/lib/social-catalog";

interface SocialCanvasCardProps {
  gender: "men" | "women";
  city: string;
  dayOfWeek: string;
  themeTitle: string;
  temperature: string;
  humidity: string;
  fragranceProfile: string;
  look: {
    title: string;
    description: string;
    itemIds: string[];
    stylingNotes: string;
  };
}

export function SocialCanvasCard({
  gender,
  city,
  dayOfWeek,
  themeTitle,
  temperature,
  humidity,
  fragranceProfile,
  look,
}: SocialCanvasCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Renders the high-resolution 1080x1350 editorial flat-lay
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // 1. Warm Luxury Ivory Backdrop
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height * 0.35,
      100,
      width / 2,
      height / 2,
      width * 0.8
    );
    bgGrad.addColorStop(0, "#FCFAF6");
    bgGrad.addColorStop(0.6, "#FAF7F2");
    bgGrad.addColorStop(1, "#F3EFE7");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Double Border Frame
    ctx.strokeStyle = "rgba(180, 160, 140, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = "rgba(180, 160, 140, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // 2. Top Header Bar
    // Left: Brand Tag
    ctx.font = "600 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#173B2A";
    ctx.letterSpacing = "2px";
    ctx.fillText("WARDROBE AI  ·  DAILY BLUEPRINT", 72, 86);

    // Right: Weather Pill
    const weatherText = `${city.toUpperCase()} · ${temperature} · ${humidity} HUMIDITY`;
    ctx.font = "600 12px 'Plus Jakarta Sans', sans-serif";
    const weatherMetrics = ctx.measureText(weatherText);
    const pillWidth = weatherMetrics.width + 36;
    const pillX = width - 72 - pillWidth;
    const pillY = 66;

    ctx.fillStyle = "rgba(23, 59, 42, 0.06)";
    ctx.strokeStyle = "rgba(23, 59, 42, 0.15)";
    ctx.lineWidth = 1;
    roundRect(ctx, pillX, pillY, pillWidth, 30, 15, true, true);

    ctx.fillStyle = "#173B2A";
    ctx.fillText(weatherText, pillX + 18, pillY + 19);

    // 3. Editorial Typography Block
    ctx.font = "bold 44px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#0F172A";
    ctx.letterSpacing = "-0.5px";
    ctx.fillText(look.title, 72, 165);

    const subhead = `${dayOfWeek.toUpperCase()} IN ${city.toUpperCase()}  ·  ${gender === "women" ? "HER EDITION" : "HIS EDITION"}  ·  ${themeTitle}`;
    ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(subhead, 72, 195);

    // 4. Resolve and Load Item SVGs
    const items: CatalogItem[] = look.itemIds
      .map((id) => CATALOG_ITEMS[id])
      .filter(Boolean);

    const loadedImages: HTMLImageElement[] = await Promise.all(
      items.map(
        (item) =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            img.src = item.assetPath;
          })
      )
    );

    // 5. Intelligent Flat-Lay Positioning Grid
    // We position tops, bottoms, shoes, and accessories in an aesthetic Vogue/GQ arrangement
    const layoutPositions = calculateLayoutPositions(items, width, height);

    items.forEach((item, index) => {
      const img = loadedImages[index];
      const pos = layoutPositions[index];

      if (img && img.complete && img.naturalWidth > 0) {
        // Realistic Luxury Drop Shadow
        ctx.save();
        ctx.shadowColor = "rgba(23, 59, 42, 0.14)";
        ctx.shadowBlur = 32;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 18;

        ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
        ctx.restore();

        // Elegant Minimalist Label Under Item
        ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "#334155";
        ctx.letterSpacing = "0.5px";
        const labelText = item.name;
        const textW = ctx.measureText(labelText).width;
        const labelX = pos.x + pos.w / 2 - textW / 2;
        const labelY = pos.y + pos.h + 20;

        // Label background pill
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.strokeStyle = "rgba(180, 160, 140, 0.25)";
        ctx.lineWidth = 1;
        roundRect(ctx, labelX - 10, labelY - 14, textW + 20, 20, 10, true, true);

        ctx.fillStyle = "#1E293B";
        ctx.fillText(labelText, labelX, labelY);
      }
    });

    // 6. Fragrance & Sensory Note Banner
    const fragY = height - 150;
    const fragBoxW = width - 144;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "rgba(23, 59, 42, 0.12)";
    ctx.lineWidth = 1;
    roundRect(ctx, 72, fragY, fragBoxW, 46, 12, true, true);

    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#B45309";
    ctx.letterSpacing = "1.5px";
    ctx.fillText("🌿 SCENT PAIRING", 92, fragY + 28);

    ctx.font = "italic 13px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(fragranceProfile, 235, fragY + 28);

    // 7. Footer Watermark & Call-To-Action
    ctx.font = "500 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.letterSpacing = "1px";
    ctx.fillText("CURATED BY WARDROBE AI  ·  wardrobeai.com.ng", 72, height - 60);

    ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#173B2A";
    const ctaText = "Scan your closet & plan your week  →";
    const ctaW = ctx.measureText(ctaText).width;
    ctx.fillText(ctaText, width - 72 - ctaW, height - 60);

    setIsRendering(false);
  }, [gender, city, dayOfWeek, themeTitle, temperature, humidity, fragranceProfile, look]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    const sanitizedTitle = look.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `wardrobe-ai-${city.toLowerCase()}-${dayOfWeek.toLowerCase()}-${gender}-${sanitizedTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl border border-ivory-300 p-5 shadow-sm space-y-4">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest"></span>
          <span className="font-editorial text-xl font-bold text-stone-900">
            {gender === "women" ? "Her Look Card" : "His Look Card"}
          </span>
        </div>
        <span className="text-[11px] font-mono text-stone-500 bg-ivory-100 px-2.5 py-1 rounded-md border border-ivory-300">
          1080 × 1350 PNG
        </span>
      </div>

      {/* Responsive Canvas Container with 4:5 Aspect Ratio */}
      <div className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-ivory-300 bg-ivory-100 flex items-center justify-center">
        {isRendering && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-forest" />
            <span className="text-xs font-medium text-stone-600">Compositing 1080p Editorial Canvas...</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain cursor-zoom-in"
          title="Click 'Download Graphic' for full-resolution 1080x1350 image"
        />
      </div>

      {/* Outfit Piece Tags */}
      <div className="w-full text-xs space-y-1.5 pt-1">
        <p className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider">
          Pieces in this flat-lay:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {look.itemIds.map((id) => {
            const item = CATALOG_ITEMS[id];
            if (!item) return null;
            return (
              <span
                key={id}
                className="px-2 py-0.5 rounded-md bg-ivory-100 border border-ivory-300 text-[11px] text-stone-700"
              >
                {item.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex items-center gap-2 pt-2 border-t border-ivory-200">
        <button
          onClick={handleDownload}
          disabled={isRendering}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
            downloadSuccess
              ? "bg-emerald-600 text-white"
              : "bg-forest text-white hover:bg-forest-light"
          }`}
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Graphic (PNG)</span>
            </>
          )}
        </button>

        <button
          onClick={renderCanvas}
          title="Re-render Canvas"
          className="p-2.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-stone-600 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Utility: Canvas Rounded Rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Layout Position Calculator for Flat-lays
function calculateLayoutPositions(
  items: CatalogItem[],
  width: number,
  height: number
): Array<{ x: number; y: number; w: number; h: number }> {
  const count = items.length;

  if (count <= 3) {
    // 3 Items Layout (Top, Bottom, Shoes in a triangular or column balance)
    return [
      { x: 120, y: 270, w: 380, h: 380 }, // Top
      { x: 580, y: 270, w: 380, h: 380 }, // Bottom
      { x: 350, y: 690, w: 380, h: 380 }, // Shoes
    ];
  }

  if (count === 4) {
    // 4 Items Layout (2x2 Balanced Editorial Grid)
    return [
      { x: 100, y: 250, w: 410, h: 410 }, // Top / Dress
      { x: 570, y: 250, w: 410, h: 410 }, // Bottom / Outer
      { x: 100, y: 690, w: 410, h: 410 }, // Shoes
      { x: 570, y: 690, w: 410, h: 410 }, // Accessory / Bag
    ];
  }

  // 5 Items Layout (Hero Top Left, Bottom Right, Shoes Bottom Left, 2 Accessories)
  return [
    { x: 80, y: 240, w: 400, h: 400 }, // Top / One-piece
    { x: 560, y: 240, w: 400, h: 400 }, // Bottom
    { x: 80, y: 670, w: 380, h: 380 }, // Shoes
    { x: 530, y: 670, w: 300, h: 300 }, // Bag / Primary Accessory
    { x: 810, y: 730, w: 220, h: 220 }, // Watch / Shades / Jewelry
  ];
}

