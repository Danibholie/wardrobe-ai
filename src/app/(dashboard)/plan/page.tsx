"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  CloudSun,
  Sunrise,
  Sun,
  Moon,
  MapPin,
  Pencil,
  Check,
  Bookmark,
  Loader2,
  AlertCircle,
  Shirt,
  RotateCw,
  Plus,
  Compass,
} from "lucide-react";

type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  style?: string;
  imageUrl?: string;
};

type CuratedOutfit = {
  title: string;
  vibeDescription: string;
  eventSuitability: string;
  weatherSuitability: string;
  stylingTips: string[];
  itemIds: string[];
  missingPiecesAdvice?: string;
  items: WardrobeItem[];
};

const OCCASIONS = [
  "Work",
  "School",
  "Church",
  "Date",
  "Wedding",
  "Hangout",
  "Errands",
  "Other",
];

const TIME_OPTIONS = [
  { label: "Morning", icon: Sunrise },
  { label: "Afternoon", icon: Sun },
  { label: "Evening", icon: Moon },
];

const STYLE_OPTIONS = [
  "Casual",
  "Smart casual",
  "Formal",
  "Traditional",
  "Surprise me",
];

export default function PlanPage() {
  const [occasion, setOccasion] = useState("Work");
  const [timeOfDay, setTimeOfDay] = useState("Afternoon");
  const [style, setStyle] = useState("Smart casual");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [weather, setWeather] = useState("31°C · Humid · Rain possible");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState("");
  const [customWeatherInput, setCustomWeatherInput] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [notes, setNotes] = useState("");

  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [hasWardrobeItems, setHasWardrobeItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [outfits, setOutfits] = useState<CuratedOutfit[] | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<Record<number, boolean>>({});
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const paramOccasion = new URLSearchParams(window.location.search).get("occasion");
      if (paramOccasion && OCCASIONS.includes(paramOccasion)) {
        setOccasion(paramOccasion);
      }
    }

    async function checkWardrobe() {
      try {
        const res = await fetch("/api/wardrobe");
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setHasWardrobeItems(data.items.length > 0);
        }
      } catch {
        setHasWardrobeItems(true);
      } finally {
        setLoadingWardrobe(false);
      }
    }
    checkWardrobe();
  }, []);

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`Lagos Region (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E)`);
        setWeather("31°C · Humid · Tropical breeze");
        setDetectingLocation(false);
        setIsEditingLocation(false);
      },
      () => {
        setLocation("Lagos, Nigeria");
        setWeather("31°C · Humid · Rain possible");
        setDetectingLocation(false);
      }
    );
  }

  function handleSaveLocation() {
    if (customLocationInput.trim()) {
      setLocation(customLocationInput.trim());
    }
    if (customWeatherInput.trim()) {
      setWeather(customWeatherInput.trim());
    }
    setIsEditingLocation(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/recommend-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          timeOfDay,
          style: style === "Surprise me" ? "Versatile, expressive & fashionable" : style,
          location,
          weather,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to curate an outfit.");
      }

      setOutfits(data.outfits || []);
      setSavedOutfits({});

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while curating your outfit."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveOutfit(outfit: CuratedOutfit, index: number) {
    setSavingIndex(index);
    try {
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outfit.title,
          vibeDescription: outfit.vibeDescription,
          event: `${occasion} (${timeOfDay})`,
          location,
          weather,
          stylingTips: outfit.stylingTips,
          itemIds: outfit.items.map((i) => i.id),
          missingPiecesAdvice: outfit.missingPiecesAdvice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not save outfit.");
      }

      setSavedOutfits((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save outfit.");
    } finally {
      setSavingIndex(null);
    }
  }

  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full">
          <div className="relative py-space-sm sm:py-space-md">
            <div className="max-w-2xl mx-auto w-full py-space-sm sm:py-space-md space-y-space-lg">
              {/* Top Atmospheric Header */}
              <div className="text-center space-y-space-xs">
                {/* Weather & Location Pill */}
                <div className="inline-flex items-center gap-2 bg-surface-container-high px-space-md py-1.5 rounded-full text-on-surface mb-space-xs border border-outline-variant/30 shadow-2xs">
                  <CloudSun className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="font-label-caps text-label-caps font-semibold tracking-wider">
                    {location} · {weather}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingLocation(!isEditingLocation);
                      setCustomLocationInput(location);
                      setCustomWeatherInput(weather);
                    }}
                    className="text-secondary hover:text-primary transition-colors p-0.5 rounded cursor-pointer"
                    title="Change location or weather"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Location Editor Drawer */}
                {isEditingLocation && (
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm max-w-lg mx-auto text-left space-y-3 mb-space-sm animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
                        Customise Location &amp; Climate
                      </span>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="text-xs text-primary hover:text-secondary inline-flex items-center gap-1 font-medium cursor-pointer"
                      >
                        {detectingLocation ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" />
                        )}
                        <span>Detect GPS</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                          City / District
                        </label>
                        <input
                          value={customLocationInput}
                          onChange={(e) => setCustomLocationInput(e.target.value)}
                          placeholder="e.g. Lagos, Abuja, London"
                          className="w-full text-xs rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                          Weather Condition
                        </label>
                        <input
                          value={customWeatherInput}
                          onChange={(e) => setCustomWeatherInput(e.target.value)}
                          placeholder="e.g. 32°C Sunny, Harmattan breeze, Rain"
                          className="w-full text-xs rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingLocation(false)}
                        className="px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveLocation}
                        className="px-3.5 py-1.5 text-xs bg-primary text-on-primary font-medium rounded-lg hover:bg-primary-container"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-primary tracking-tight font-medium">
                  What are you wearing today?
                </h1>
                <p className="font-body-lg text-body-md sm:text-body-lg text-on-surface-variant max-w-lg mx-auto">
                  Tell us a few quick details. We&apos;ll pick an outfit from clothes you own.
                </p>
              </div>

              {/* Empty Wardrobe Guard Alert */}
              {!loadingWardrobe && !hasWardrobeItems && (
                <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/30 text-center space-y-3 shadow-sm">
                  <Shirt className="w-8 h-8 text-secondary mx-auto" />
                  <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                    Your wardrobe is empty
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                    Please add a few clothing pieces first so the AI stylist can combine items from your personal collection.
                  </p>
                  <Link
                    href="/wardrobe/add"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add your first piece</span>
                  </Link>
                </div>
              )}

              {/* Form Card */}
              <form
                onSubmit={handleSubmit}
                className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-[0_4px_20px_-2px_rgba(54,69,59,0.04)] border border-outline-variant/20 space-y-space-lg"
              >
                {/* 1. Occasion Group */}
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <label className="font-headline-sm text-headline-sm text-primary font-medium">
                      Occasion
                    </label>
                    <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
                      Required
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-space-xs sm:gap-space-sm" id="occasion-group">
                    {OCCASIONS.map((occ) => {
                      const isSelected = occasion === occ;
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setOccasion(occ)}
                          className={`px-space-md py-2 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "bg-primary-container text-on-primary shadow-sm font-semibold"
                              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium"
                          }`}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. When & Style Group Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  {/* When? Group */}
                  <div className="space-y-space-sm">
                    <label className="font-headline-sm text-headline-sm text-primary font-medium">
                      When?
                    </label>
                    <div className="grid grid-cols-3 gap-space-xs" id="time-group">
                      {TIME_OPTIONS.map((t) => {
                        const Icon = t.icon;
                        const isSelected = timeOfDay === t.label;
                        return (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => setTimeOfDay(t.label)}
                            className={`flex flex-col items-center justify-center p-space-sm rounded-lg font-label-md text-label-md transition-all duration-200 gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-primary-container text-on-primary shadow-sm font-semibold"
                                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium"
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* What's your style? Group */}
                  <div className="space-y-space-sm">
                    <label className="font-headline-sm text-headline-sm text-primary font-medium">
                      What&apos;s your style?
                    </label>
                    <div className="flex flex-wrap gap-space-xs" id="style-group">
                      {STYLE_OPTIONS.map((st) => {
                        const isSelected = style === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStyle(st)}
                            className={`px-space-md py-2 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-primary-container text-on-primary shadow-sm font-semibold"
                                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Anything else? (Optional) */}
                <div className="space-y-space-xs">
                  <label
                    className="font-headline-sm text-headline-sm text-primary cursor-pointer font-medium block"
                    htmlFor="context-input"
                  >
                    Anything else?{" "}
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="context-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. I'll be outside most of the day, or in AC, or I want to wear my white polo"
                    rows={3}
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md rounded-lg p-space-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150 resize-none border border-outline-variant/20 shadow-inner"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 4. Action Button */}
                <div className="pt-space-xs flex flex-col items-center gap-space-xs">
                  <button
                    type="submit"
                    id="submit-plan-btn"
                    disabled={submitting || !hasWardrobeItems}
                    className="w-full py-space-md bg-primary hover:bg-primary-container text-on-primary rounded-lg font-title-md text-title-md transition-all duration-200 shadow-md flex items-center justify-center gap-space-sm active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Curating outfit from your wardrobe...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-secondary-container" />
                        <span>Find my outfit</span>
                      </>
                    )}
                  </button>
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-center pt-1">
                    Ensembles selected exclusively from items catalogued in your personal wardrobe.
                  </span>
                </div>
              </form>

              {/* Curated Results Section */}
              {outfits && outfits.length > 0 && (
                <div ref={resultsRef} className="pt-space-lg space-y-space-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                    <div>
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold">
                        AI Recommended Ensembles
                      </span>
                      <h2 className="font-headline-md text-headline-md text-primary font-medium">
                        Curated for {occasion} · {timeOfDay}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs text-secondary hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Adjust details</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {outfits.map((outfit, index) => {
                      const isSaved = !!savedOutfits[index];
                      const isSaving = savingIndex === index;

                      return (
                        <div
                          key={index}
                          className="p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm space-y-4"
                        >
                          {/* Look Header & Save Action */}
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

                          {/* Short Explanation of Why the Combination Fits */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/15">
                              <span className="font-bold text-primary block mb-0.5">
                                ✨ Why it fits {occasion}:
                              </span>
                              <p className="text-on-surface-variant leading-relaxed">
                                {outfit.eventSuitability}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/15">
                              <span className="font-bold text-primary block mb-0.5">
                                ☀️ Weather &amp; Climate Match:
                              </span>
                              <p className="text-on-surface-variant leading-relaxed">
                                {outfit.weatherSuitability}
                              </p>
                            </div>
                          </div>

                          {/* Actual Clothing Photos & Details Grid */}
                          <div>
                            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold block mb-2.5">
                              Items from Your Closet ({outfit.items.length})
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {outfit.items.map((item, itemIdx) => (
                                <div
                                  key={item.id || itemIdx}
                                  className="rounded-xl overflow-hidden bg-surface border border-outline-variant/20 shadow-2xs flex flex-col group"
                                >
                                  <div className="aspect-[4/5] w-full bg-surface-container overflow-hidden relative">
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-outline">
                                        <Shirt className="w-6 h-6" />
                                      </div>
                                    )}
                                    <div className="absolute top-1.5 left-1.5">
                                      <span className="px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-xs text-[10px] font-semibold text-primary uppercase">
                                        {item.category}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-2.5 bg-surface">
                                    <p className="text-xs font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant capitalize mt-0.5">
                                      {item.color} {item.subcategory ? `· ${item.subcategory}` : ""}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actionable Styling Tips */}
                          {outfit.stylingTips && outfit.stylingTips.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/20">
                              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold block mb-1.5">
                                Stylist Notes &amp; Advice
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

                          {/* Finishing touch recommendation if any missing piece */}
                          {outfit.missingPiecesAdvice && (
                            <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-[#835336]">
                              <strong className="block font-semibold mb-0.5">
                                Finishing Touch:
                              </strong>
                              <span>{outfit.missingPiecesAdvice}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
