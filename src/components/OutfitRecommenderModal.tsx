"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CloudSun,
  MapPin,
  Calendar,
  Layers,
  Check,
  Bookmark,
  BookmarkCheck,
  RotateCw,
  X,
  Loader2,
  AlertCircle,
  Shirt,
  Flame,
  Umbrella,
  Wind,
  Glasses,
  Plus,
} from "lucide-react";
import { formatAiError } from "@/lib/errors";
import { useLocationWeather, detectLocationAndWeather } from "@/hooks/useLocationWeather";

export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  style?: string;
  imageUrl?: string;
};

export type CuratedOutfit = {
  title: string;
  vibeDescription: string;
  eventSuitability: string;
  weatherSuitability: string;
  stylingTips: string[];
  itemIds: string[];
  missingPiecesAdvice?: string;
  items: WardrobeItem[];
};

interface OutfitRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobeItems: WardrobeItem[];
  preselectedAnchorItemId?: string;
}

const WEATHER_PRESETS = [
  {
    label: "Lagos Heat & Humidity (31°C · 78%)",
    value: "Lagos, 31°C · Sunny & Humid (78% humidity)",
    icon: Flame,
    desc: "Lightweight, breathable linen & open weaves",
  },
  {
    label: "Tropical Rain & Downpour (26°C)",
    value: "26°C, overcast with heavy tropical downpour & puddles",
    icon: Umbrella,
    desc: "Splash-resistant dark bottoms & quick-dry layers",
  },
  {
    label: "Harmattan Breeze (24°C · Dry)",
    value: "24°C, dry harmattan breeze, cooler morning & dusty haze",
    icon: Wind,
    desc: "Breathable layering & structured light jackets",
  },
  {
    label: "Frigid Indoor A/C (20°C)",
    value: "20°C air-conditioned indoor office / boardroom setting",
    icon: CloudSun,
    desc: "Tailored overshirts, blazers, and sharp layers",
  },
];

const EVENT_PRESETS = [
  { label: "Owambe / Traditional Wedding", value: "Owambe / Traditional Nigerian Wedding & Reception" },
  { label: "Corporate Work / Boardroom", value: "Corporate Office / Executive Business Meeting" },
  { label: "Casual Weekend / Brunch", value: "Casual Weekend Brunch & Café Outing" },
  { label: "Date Night / Romantic Dinner", value: "Date Night / Upscale Restaurant Dinner" },
  { label: "Sunday Best / Church", value: "Sunday Best / Religious Service & Fellowship" },
  { label: "Beach / Island Day", value: "Beach Day / Ilashe Boat Cruise & Relaxation" },
];

const STYLE_VIBES = [
  { label: "Smart Casual & Polished", value: "Smart Casual & Polished" },
  { label: "Traditional Majesty (Senator/Kaftan)", value: "Traditional Majesty (Senator, Kaftan, Agbada elegance)" },
  { label: "Clean Minimalist", value: "Clean Minimalist (Understated luxury, neutral palette)" },
  { label: "Effortless & Relaxed", value: "Effortless, airy, and ultra-comfortable" },
  { label: "Old Money Tailored", value: "Old Money Classic (Tailored trousers, polo, quiet luxury)" },
  { label: "Modern Streetwear", value: "Modern African Streetwear (Contemporary, elevated, confident)" },
];

export function OutfitRecommenderModal({
  isOpen,
  onClose,
  wardrobeItems,
  preselectedAnchorItemId,
}: OutfitRecommenderModalProps) {
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [selectedWeather, setSelectedWeather] = useState(WEATHER_PRESETS[0].value);
  const [customWeather, setCustomWeather] = useState("");
  const [isCustomWeather, setIsCustomWeather] = useState(false);

  const { fullLocation: autoLocation, weatherSummary: autoWeather } = useLocationWeather();
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (autoLocation && location === "Lagos, Nigeria") {
      setLocation(autoLocation);
    }
    if (autoWeather && !customWeather) {
      setCustomWeather(autoWeather);
      setIsCustomWeather(true);
    }
  }, [autoLocation, autoWeather]);

  async function handleAutoDetect() {
    setDetectingLocation(true);
    try {
      const res = await detectLocationAndWeather(true);
      setLocation(res.fullLocation);
      setCustomWeather(res.weatherSummary);
      setIsCustomWeather(true);
    } catch (e) {
      console.warn("Auto detect error:", e);
    } finally {
      setDetectingLocation(false);
    }
  }

  const [selectedEvent, setSelectedEvent] = useState(EVENT_PRESETS[0].value);
  const [customEvent, setCustomEvent] = useState("");
  const [isCustomEvent, setIsCustomEvent] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState(STYLE_VIBES[0].value);
  const [anchorItemId, setAnchorItemId] = useState<string>(preselectedAnchorItemId || "");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curatedOutfits, setCuratedOutfits] = useState<CuratedOutfit[]>([]);
  const [savedOutfitIndexes, setSavedOutfitIndexes] = useState<Record<number, boolean>>({});
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [viewStep, setViewStep] = useState<"form" | "results">("form");

  if (!isOpen) return null;

  const effectiveWeather = isCustomWeather ? customWeather : selectedWeather;
  const effectiveEvent = isCustomEvent ? customEvent : selectedEvent;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (wardrobeItems.length === 0) {
      setError("Please add at least 1-2 garments to your wardrobe before requesting recommendations.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/recommend-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          weather: effectiveWeather,
          event: effectiveEvent,
          stylePreference: selectedStyle,
          vibe: selectedStyle,
          anchorItemId: anchorItemId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to curate outfit.");
      }

      setCuratedOutfits(data.outfits || []);
      setSavedOutfitIndexes({});
      setViewStep("results");
    } catch (err) {
      setError(formatAiError(err, "Something went wrong styling your outfits."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveOutfit(outfit: CuratedOutfit, index: number) {
    setSavingIndex(index);
    try {
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outfit.title,
          vibeDescription: outfit.vibeDescription,
          event: effectiveEvent,
          location,
          weather: effectiveWeather,
          stylingTips: outfit.stylingTips,
          itemIds: outfit.items.map((i) => i.id),
          missingPiecesAdvice: outfit.missingPiecesAdvice,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save outfit.");
      }

      setSavedOutfitIndexes((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save outfit.");
    } finally {
      setSavingIndex(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-inverse-surface/50 backdrop-blur-md p-3 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !generating) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-stylist-title"
        className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-surface p-5 sm:p-8 shadow-2xl border border-outline-variant/30 flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-outline-variant/20 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-secondary">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-widest">
                AI Luxury Stylist
              </span>
            </div>
            <h2
              id="ai-stylist-title"
              className="font-headline-sm text-headline-sm text-primary font-medium mt-1 tracking-tight"
            >
              Curate Your Perfect Look
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Generating bespoke ensembles from your {wardrobeItems.length} catalogued pieces, adapted for Nigerian climate & occasions.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={generating}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {viewStep === "form" ? (
          <form onSubmit={handleGenerate} className="mt-5 space-y-6">
            {wardrobeItems.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface-container-low text-center border border-outline-variant/20">
                <Shirt className="w-10 h-10 text-secondary mx-auto mb-2" />
                <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                  Your wardrobe is empty
                </h4>
                <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mt-1 mb-4">
                  Please add at least a couple of shirts, trousers, or traditional pieces so the AI stylist can combine them.
                </p>
                <Link
                  href="/wardrobe/add"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add your first clothing item</span>
                </Link>
              </div>
            ) : (
              <>
                {/* 1. Location & Weather Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <span>Location</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={detectingLocation}
                      className="text-xs text-secondary hover:underline cursor-pointer font-medium flex items-center gap-1 disabled:opacity-60"
                    >
                      <Sparkles className="w-3 h-3 text-secondary" />
                      <span>{detectingLocation ? "Detecting..." : "Auto-detect"}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      "Lagos, Nigeria",
                      "Abuja, Nigeria",
                      "Port Harcourt",
                      "London, UK",
                    ].map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                          location === loc
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Or enter custom city / district (e.g. Lekki Phase 1, Lagos)"
                    className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:bg-white focus:border-primary"
                  />
                </div>

                {/* 2. Weather & Climate Condition */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-secondary" />
                      <span>Weather & Climate</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomWeather(!isCustomWeather)}
                      className="text-xs text-secondary hover:underline cursor-pointer font-medium"
                    >
                      {isCustomWeather ? "Pick Preset" : "+ Custom Weather"}
                    </button>
                  </div>

                  {!isCustomWeather ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {WEATHER_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = selectedWeather === preset.value;
                        return (
                          <div
                            key={preset.label}
                            onClick={() => setSelectedWeather(preset.value)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? "bg-primary-container/10 border-primary shadow-xs"
                                : "bg-surface-container-low border-outline-variant/20 hover:border-outline-variant"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-on-surface leading-tight">
                                {preset.label}
                              </p>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">
                                {preset.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customWeather}
                      onChange={(e) => setCustomWeather(e.target.value)}
                      placeholder="e.g. 33°C bright sun, humid afternoon with mild evening breeze"
                      className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:bg-white focus:border-primary"
                      required
                    />
                  )}
                </div>

                {/* 3. Occasion / Event */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span>Occasion / Event</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomEvent(!isCustomEvent)}
                      className="text-xs text-secondary hover:underline cursor-pointer font-medium"
                    >
                      {isCustomEvent ? "Pick Preset" : "+ Custom Event"}
                    </button>
                  </div>

                  {!isCustomEvent ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EVENT_PRESETS.map((event) => {
                        const isSelected = selectedEvent === event.value;
                        return (
                          <button
                            type="button"
                            key={event.label}
                            onClick={() => setSelectedEvent(event.value)}
                            className={`p-2.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary text-on-primary shadow-xs"
                                : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                            }`}
                          >
                            {event.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customEvent}
                      onChange={(e) => setCustomEvent(e.target.value)}
                      placeholder="e.g. Art exhibition opening in Victoria Island, dinner afterward"
                      className="w-full text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:bg-white focus:border-primary"
                      required
                    />
                  )}
                </div>

                {/* 4. Style Aesthetic / Vibe */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <Glasses className="w-4 h-4 text-secondary" />
                    <span>Style Aesthetic & Vibe</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STYLE_VIBES.map((style) => {
                      const isSelected = selectedStyle === style.value;
                      return (
                        <div
                          key={style.label}
                          onClick={() => setSelectedStyle(style.value)}
                          className={`p-2.5 rounded-lg text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-primary-container/10 border-primary font-semibold text-primary"
                              : "bg-surface-container-low border-outline-variant/20 hover:border-outline-variant text-on-surface"
                          }`}
                        >
                          {style.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Anchor Piece (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-secondary" />
                      <span>Anchor Piece (Optional)</span>
                    </span>
                    <span className="text-[11px] font-normal text-on-surface-variant">
                      Build look around a specific item
                    </span>
                  </label>
                  <select
                    value={anchorItemId}
                    onChange={(e) => setAnchorItemId(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-xs text-on-surface outline-none focus:bg-white focus:border-primary"
                  >
                    <option value="">AI Choice (Style freely from entire wardrobe)</option>
                    {wardrobeItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.color} {item.category})
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 leading-relaxed shadow-2xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-md hover:bg-primary-container transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Curating Ensembles with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Outfits</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          /* Results View */
          <div className="mt-5 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold">
                {curatedOutfits.length} Curated {curatedOutfits.length === 1 ? "Look" : "Looks"} for {effectiveEvent}
              </span>
              <button
                type="button"
                onClick={() => setViewStep("form")}
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Adjust Context & Regenerate</span>
              </button>
            </div>

            <div className="space-y-6">
              {curatedOutfits.map((outfit, index) => {
                const isSaved = !!savedOutfitIndexes[index];
                const isSaving = savingIndex === index;

                return (
                  <div
                    key={index}
                    className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm space-y-4"
                  >
                    {/* Outfit Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold uppercase tracking-wider mb-1">
                          Option {index + 1}
                        </span>
                        <h3 className="font-headline-sm text-headline-sm text-primary font-medium tracking-tight">
                          {outfit.title}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant italic mt-1">
                          &ldquo;{outfit.vibeDescription}&rdquo;
                        </p>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveOutfit(outfit, index)}
                        disabled={isSaved || isSaving}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer self-start shrink-0 ${
                          isSaved
                            ? "bg-[#EDF4EC] text-[#24543D] border border-[#C8DCCB]"
                            : "bg-primary text-on-primary hover:bg-primary-container shadow-xs"
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#24543D]" />
                            <span>Saved to Lookbook</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save Look</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Suitability notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                        <span className="font-bold text-primary block mb-0.5">
                          ☀️ Climate Compatibility:
                        </span>
                        <p className="text-on-surface-variant">{outfit.weatherSuitability}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                        <span className="font-bold text-primary block mb-0.5">
                          ✨ Occasion Match:
                        </span>
                        <p className="text-on-surface-variant">{outfit.eventSuitability}</p>
                      </div>
                    </div>

                    {/* Garment Cards Flat-lay */}
                    <div>
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
                        Pieces from Your Wardrobe ({outfit.items.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {outfit.items.map((item, itemIdx) => (
                          <div
                            key={item.id || itemIdx}
                            className="rounded-xl overflow-hidden bg-surface border border-outline-variant/20 shadow-2xs flex flex-col"
                          >
                            <div className="aspect-[4/5] w-full bg-surface-container overflow-hidden relative">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline">
                                  <Shirt className="w-6 h-6" />
                                </div>
                              )}
                              <div className="absolute top-1 left-1">
                                <span className="px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-xs text-[10px] font-semibold text-primary uppercase">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            <div className="p-2 bg-surface">
                              <p className="text-xs font-semibold text-on-surface line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-on-surface-variant capitalize">
                                {item.color} {item.subcategory ? `· ${item.subcategory}` : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Styling Directives */}
                    {outfit.stylingTips && outfit.stylingTips.length > 0 && (
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/20">
                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold block mb-1">
                          Styling Tips
                        </span>
                        <ul className="space-y-1">
                          {outfit.stylingTips.map((tip, tipIdx) => (
                            <li
                              key={tipIdx}
                              className="text-xs text-on-surface-variant flex items-start gap-1.5"
                            >
                              <span className="text-secondary font-bold leading-none mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Piece Finisher */}
                    {outfit.missingPiecesAdvice && (
                      <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-[#835336]">
                        <strong className="block font-semibold mb-0.5">
                          Finishing Touch (Not in archive):
                        </strong>
                        <span>{outfit.missingPiecesAdvice}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setViewStep("form")}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
              >
                ← Back to Criteria
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
