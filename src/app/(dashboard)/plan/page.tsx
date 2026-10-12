"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CloudSun,
  Sunrise,
  Sun,
  Moon,
  Pencil,
  Check,
  Heart,
  RotateCw,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shirt,
  Plus,
  Compass,
  Calendar as CalendarIcon,
  MapPin,
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

const OUTING_SUGGESTIONS = [
  "Dinner at upscale restaurant",
  "Executive boardroom meeting",
  "Sunday service & fellowship",
  "Casual brunch & café",
  "Owambe wedding reception",
  "Night out & drinks",
  "Outdoor day festival",
];

const DATE_OPTIONS = ["Today", "Tomorrow", "This weekend"];

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

const LOCATION_PRESETS = [
  { label: "Lagos (Island)", loc: "Victoria Island, Lagos", w: "31°C · Humid · Island breeze" },
  { label: "Lagos (Mainland)", loc: "Ikeja, Lagos", w: "32°C · Warm & Tropical" },
  { label: "Abuja", loc: "Abuja, Nigeria", w: "29°C · Sunny & Dry" },
  { label: "Port Harcourt", loc: "Port Harcourt, Nigeria", w: "28°C · Rain showers" },
  { label: "London", loc: "London, UK", w: "16°C · Mild & Overcast" },
];

// Helper to determine the editorial flat-lay grid column span and aspect ratio
function getItemGridProps(index: number, total: number) {
  if (total === 1) {
    return {
      gridClass: "col-span-2 md:col-span-12",
      aspectClass: "aspect-[16/9] md:aspect-[21/9]",
    };
  }
  if (total === 2) {
    return {
      gridClass: index === 0 ? "col-span-2 md:col-span-7" : "col-span-2 md:col-span-5",
      aspectClass: "aspect-[4/3]",
    };
  }
  // Odd item at the end gets full width banner span
  if (total % 2 !== 0 && index === total - 1) {
    return {
      gridClass: "col-span-2 md:col-span-12",
      aspectClass: "aspect-[16/9] md:aspect-[21/9]",
    };
  }
  // Alternating asymmetric 7-col and 5-col pairing for high-fashion editorial flat lay
  const pairIndex = Math.floor(index / 2);
  const isFirstInPair = index % 2 === 0;
  if (pairIndex % 2 === 0) {
    return {
      gridClass: isFirstInPair ? "col-span-2 md:col-span-7" : "col-span-1 md:col-span-5",
      aspectClass: isFirstInPair ? "aspect-[4/3]" : "aspect-square",
    };
  } else {
    return {
      gridClass: isFirstInPair ? "col-span-1 md:col-span-5" : "col-span-2 md:col-span-7",
      aspectClass: isFirstInPair ? "aspect-square" : "aspect-[4/3]",
    };
  }
}

export default function PlanPage() {
  // User plans state
  const [occasion, setOccasion] = useState("Work");
  const [outing, setOuting] = useState("");
  const [planDate, setPlanDate] = useState("Today");
  const [timeOfDay, setTimeOfDay] = useState("Afternoon");
  const [style, setStyle] = useState("Smart casual");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [weather, setWeather] = useState("31°C · Humid · Rain possible");
  const [notes, setNotes] = useState("");

  // Location & Weather editing
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState("");
  const [customWeatherInput, setCustomWeatherInput] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Wardrobe readiness & submission state
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [hasWardrobeItems, setHasWardrobeItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recommendations state
  const [outfits, setOutfits] = useState<CuratedOutfit[] | null>(null);
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
  const [savedOutfits, setSavedOutfits] = useState<Record<number, boolean>>({});
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Real-time GPS and Live Open-Meteo Weather Detection
  function handleDetectLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Fetch reverse geocode and live meteorological data in parallel
          const [geoRes, weatherRes] = await Promise.all([
            fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            )
              .then((r) => r.json())
              .catch(() => null),
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`
            )
              .then((r) => r.json())
              .catch(() => null),
          ]);

          let resolvedLocation = "Lagos, Nigeria";
          if (geoRes?.locality || geoRes?.city) {
            const locality = geoRes.locality || geoRes.city;
            const region = geoRes.principalSubdivision || geoRes.countryName;
            resolvedLocation = [locality, region].filter(Boolean).join(", ");
          }

          let resolvedWeather = "31°C · Humid · Tropical breeze";
          if (weatherRes?.current) {
            const temp = Math.round(weatherRes.current.temperature_2m);
            const humidity = weatherRes.current.relative_humidity_2m;
            const code = weatherRes.current.weather_code;
            let condition = "Clear";
            if (code >= 51 && code <= 67) condition = "Rain possible";
            else if (code >= 80) condition = "Showers";
            else if (code >= 1 && code <= 3) condition = "Partly cloudy";
            else if (code === 0) condition = "Clear sky";

            resolvedWeather = `${temp}°C · ${condition} · ${humidity}% humidity`;
          }

          setLocation(resolvedLocation);
          setWeather(resolvedWeather);
          setCustomLocationInput(resolvedLocation);
          setCustomWeatherInput(resolvedWeather);
        } catch (err) {
          console.warn("Location detection fallback:", err);
          setLocation("Lagos, Nigeria");
          setWeather("31°C · Humid · Tropical breeze");
        } finally {
          setDetectingLocation(false);
          setIsEditingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        setIsEditingLocation(true);
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

  function handleApplyPreset(preset: typeof LOCATION_PRESETS[0]) {
    setLocation(preset.loc);
    setWeather(preset.w);
    setCustomLocationInput(preset.loc);
    setCustomWeatherInput(preset.w);
    setIsEditingLocation(false);
  }

  async function fetchRecommendations() {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/recommend-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          outing: outing.trim(),
          date: planDate,
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
      setActiveOutfitIndex(0);
      setSavedOutfits({});

      window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetchRecommendations();
  }

  async function handleSaveCurrentOutfit() {
    if (!outfits || !outfits[activeOutfitIndex]) return;
    const currentOutfit = outfits[activeOutfitIndex];
    const isCurrentlySaved = !!savedOutfits[activeOutfitIndex];

    if (isCurrentlySaved) {
      setSavedOutfits((prev) => ({ ...prev, [activeOutfitIndex]: false }));
      return;
    }

    setSavingIndex(activeOutfitIndex);
    try {
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentOutfit.title,
          vibeDescription: currentOutfit.vibeDescription,
          event: `${occasion}${outing ? ` · ${outing}` : ""} (${planDate} ${timeOfDay})`,
          location,
          weather,
          stylingTips: currentOutfit.stylingTips,
          itemIds: currentOutfit.items.map((i) => i.id),
          missingPiecesAdvice: currentOutfit.missingPiecesAdvice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not save outfit.");
      }

      setSavedOutfits((prev) => ({ ...prev, [activeOutfitIndex]: true }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save outfit.");
    } finally {
      setSavingIndex(null);
    }
  }

  async function handleTryAnother() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);

    // If there are multiple pre-fetched outfits, cycle to next
    if (outfits && outfits.length > 1 && activeOutfitIndex < outfits.length - 1) {
      setActiveOutfitIndex((prev) => prev + 1);
      return;
    }

    // Otherwise generate a fresh curation from the API
    await fetchRecommendations();
  }

  function handleChangeOccasion() {
    setOutfits(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const currentOutfit = outfits && outfits.length > 0 ? outfits[activeOutfitIndex] : null;
  const isSaved = !!savedOutfits[activeOutfitIndex];
  const isSaving = savingIndex === activeOutfitIndex;

  // Build rationale description for the "Why this works" card
  const whyThisWorksText = currentOutfit
    ? [currentOutfit.weatherSuitability, currentOutfit.eventSuitability]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <main className="w-full pt-16 pb-24 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full space-y-space-xl">
          {/* ============================================================== */}
          {/* RESULT VIEW: Rendered when outfit recommendations are ready   */}
          {/* ============================================================== */}
          {currentOutfit ? (
            <>
              {/* Top Context & Header Banner */}
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg pt-space-xs">
                <div className="space-y-space-sm max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps tracking-wider uppercase shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-on-secondary-container" />
                    <span>Made from your wardrobe</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                    Your outfit is ready.
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {location} · {weather} | {occasion}
                    {outing ? ` (${outing})` : ""} · {planDate} {timeOfDay} / {style}
                  </p>
                </div>

                {/* Option Switch Pills if multiple looks generated */}
                {outfits && outfits.length > 1 && (
                  <div className="flex items-center gap-2 self-start md:self-end">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
                      Looks:
                    </span>
                    <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
                      {outfits.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveOutfitIndex(idx)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            activeOutfitIndex === idx
                              ? "bg-primary text-on-primary shadow-xs"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          Option {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Visual Outfit Composition (Editorial Flat-Lay Architecture) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
                {/* Asymmetric Flat Lay Canvas (8 Cols) */}
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-md space-y-space-md relative overflow-hidden">
                  <div className="grid grid-cols-2 md:grid-cols-12 gap-space-md">
                    {currentOutfit.items.map((item, idx) => {
                      const { gridClass, aspectClass } = getItemGridProps(
                        idx,
                        currentOutfit.items.length
                      );

                      return (
                        <div
                          key={item.id || idx}
                          className={`${gridClass} bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between shadow-sm group`}
                        >
                          <div
                            className={`${aspectClass} w-full overflow-hidden rounded-md bg-surface-container flex items-center justify-center relative`}
                          >
                            {item.imageUrl ? (
                              <img
                                alt={item.name}
                                className="w-full h-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                                src={item.imageUrl}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-outline">
                                <Shirt className="w-10 h-10" />
                              </div>
                            )}
                          </div>
                          <div className="pt-space-sm">
                            <h3 className="font-title-md text-title-md text-on-surface truncate">
                              {item.name}
                            </h3>
                            <span className="font-body-sm text-body-sm text-on-surface-variant capitalize">
                              {item.category}
                              {item.subcategory ? ` · ${item.subcategory}` : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Editorial Rationale & Action Column (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-space-md">
                  {/* "Why this works" Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md space-y-space-md relative">
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                      Why this works
                    </h2>
                    <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm space-y-2.5">
                      <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                        {whyThisWorksText ||
                          `Tailored for ${occasion} in ${location} (${weather}) to ensure optimal breathability, polish, and comfort.`}
                      </p>
                      {currentOutfit.vibeDescription && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant italic border-t border-outline-variant/15 pt-2">
                          &ldquo;{currentOutfit.vibeDescription}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actionable Styling Tips */}
                    {currentOutfit.stylingTips && currentOutfit.stylingTips.length > 0 && (
                      <div className="bg-surface-container-low rounded-lg p-space-md shadow-sm space-y-2">
                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold block">
                          Styling Direction
                        </span>
                        <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
                          {currentOutfit.stylingTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-secondary font-bold leading-none mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Piece Finisher if suggested */}
                    {currentOutfit.missingPiecesAdvice && (
                      <div className="bg-secondary/10 rounded-lg p-space-md border border-secondary/20">
                        <span className="font-label-caps text-label-caps text-[#835336] font-bold uppercase tracking-wider block mb-1">
                          Finishing Touch (Not in wardrobe)
                        </span>
                        <p className="font-body-sm text-body-sm text-[#835336]">
                          {currentOutfit.missingPiecesAdvice}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Interaction and Action Control Stack */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md space-y-space-md">
                    <div className="space-y-space-sm">
                      {/* Primary CTA: Save Outfit */}
                      <button
                        type="button"
                        id="saveBtn"
                        onClick={handleSaveCurrentOutfit}
                        disabled={isSaving}
                        className={`w-full h-12 ${
                          isSaved
                            ? "bg-primary-container text-on-primary"
                            : "bg-primary hover:bg-primary-container text-on-primary"
                        } active:scale-[0.99] font-title-md text-title-md rounded-lg shadow-md flex items-center justify-center gap-space-xs transition-all cursor-pointer`}
                      >
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSaved ? (
                          <>
                            <Check className="w-5 h-5 text-secondary-container" id="saveIcon" />
                            <span id="saveLabel">Outfit saved</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-5 h-5 fill-current" id="saveIcon" />
                            <span id="saveLabel">Save outfit</span>
                          </>
                        )}
                      </button>

                      {/* Secondary CTA: Try Another */}
                      <button
                        type="button"
                        id="regenerateBtn"
                        onClick={handleTryAnother}
                        disabled={submitting}
                        className="w-full h-12 bg-surface-container hover:bg-surface-container-high active:scale-[0.99] text-on-surface font-title-md text-title-md rounded-lg shadow-sm flex items-center justify-center gap-space-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw
                          id="refreshIcon"
                          className={`w-4 h-4 transition-transform duration-500 ${
                            isRefreshing ? "rotate-180 animate-spin" : ""
                          }`}
                        />
                        <span>{submitting ? "Curating look..." : "Try another"}</span>
                      </button>
                    </div>

                    {/* Change Occasion Context Link */}
                    <div className="text-center pt-space-xs">
                      <button
                        type="button"
                        onClick={handleChangeOccasion}
                        className="inline-flex items-center gap-1 font-body-sm text-body-sm text-secondary hover:text-on-secondary-container transition-colors py-space-xs group cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="underline underline-offset-4 decoration-secondary/50 hover:decoration-secondary">
                          Change occasion or time
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Supplemental Desktop Footer */}
              <footer className="hidden md:block w-full bg-surface-container-low py-space-xl mt-space-xl rounded-xl border border-outline-variant/20">
                <div className="px-margin flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm text-headline-sm text-primary font-medium">
                      Wardrobe AI
                    </span>
                    <span className="mx-space-xs text-outline-variant">·</span>
                    <span>Curated Wardrobe Architecture</span>
                  </div>
                  <div>© 2025 Wardrobe AI. All rights reserved. Lagos &amp; Global.</div>
                </div>
              </footer>
            </>
          ) : (
            /* ============================================================== */
            /* PLANNING CRITERIA FORM VIEW                                     */
            /* ============================================================== */
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

                  {/* Inline Location & Weather Editor Drawer */}
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
                          <span>Detect GPS &amp; Live Weather</span>
                        </button>
                      </div>

                      {/* Quick Location Presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {LOCATION_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="px-2.5 py-1 text-[11px] rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                            City / District
                          </label>
                          <input
                            value={customLocationInput}
                            onChange={(e) => setCustomLocationInput(e.target.value)}
                            placeholder="e.g. Victoria Island, Lagos, Abuja"
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
                            placeholder="e.g. 31°C Humid, Rain possible, 22°C A/C"
                            className="w-full text-xs rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingLocation(false)}
                          className="px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveLocation}
                          className="px-3.5 py-1.5 text-xs bg-primary text-on-primary font-medium rounded-lg hover:bg-primary-container cursor-pointer"
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
                    Tell us your plans. We&apos;ll curate the perfect outfit strictly from clothes you own.
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
                      Please add your shirts, trousers, traditional pieces, or shoes first so the AI stylist can combine items from your personal collection.
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

                  {/* 2. Specific Outing / Venue (e.g. Dinner, Meeting, Church service) */}
                  <div className="space-y-space-xs">
                    <label className="font-headline-sm text-headline-sm text-primary font-medium block">
                      Outing &amp; Venue
                    </label>
                    <input
                      type="text"
                      value={outing}
                      onChange={(e) => setOuting(e.target.value)}
                      placeholder="e.g. Dinner at RSVP Victoria Island, Executive Boardroom pitch, Church Thanksgiving"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md rounded-lg p-space-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150 border border-outline-variant/20 shadow-inner"
                    />
                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {OUTING_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setOuting(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium transition-colors cursor-pointer"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Date & Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                    {/* Date Selection */}
                    <div className="space-y-space-sm">
                      <label className="font-headline-sm text-headline-sm text-primary font-medium flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-secondary" />
                        <span>Date</span>
                      </label>
                      <div className="grid grid-cols-3 gap-space-xs">
                        {DATE_OPTIONS.map((d) => {
                          const isSelected = planDate === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setPlanDate(d)}
                              className={`py-2 px-2 text-center rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-primary-container text-on-primary shadow-sm font-semibold"
                                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium"
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time of Day */}
                    <div className="space-y-space-sm">
                      <label className="font-headline-sm text-headline-sm text-primary font-medium">
                        Time of Day
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
                  </div>

                  {/* 4. Preferred Style */}
                  <div className="space-y-space-sm">
                    <label className="font-headline-sm text-headline-sm text-primary font-medium">
                      Preferred Style
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

                  {/* 5. Anything else? (Optional) */}
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
                      placeholder="e.g. I'll be in air-conditioned rooms all day, or I want to wear my white sneakers"
                      rows={2}
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

                  {/* 6. Action Button */}
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
                      Ensembles selected strictly from pieces catalogued in your personal wardrobe.
                    </span>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
