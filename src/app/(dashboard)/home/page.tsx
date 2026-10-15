"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  CloudRain,
  CloudSun,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  ArrowUpRight,
  Shirt,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { OutfitRecommenderModal } from "@/components/OutfitRecommenderModal";
import { useLocationWeather } from "@/hooks/useLocationWeather";

type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  style?: string;
  imageUrl?: string;
  createdAt?: string;
};

type SavedOutfit = {
  id: string;
  title: string;
  vibeDescription?: string;
  event?: string;
  location?: string;
  weather?: string;
  stylingTips: string[];
  missingPiecesAdvice?: string;
  createdAt: string;
  items: WardrobeItem[];
};

const OCCASIONS = [
  { label: "Work", value: "Corporate Office / Executive Business Meeting" },
  { label: "Church", value: "Sunday Best / Religious Service & Fellowship" },
  { label: "Date", value: "Date Night / Upscale Restaurant Dinner" },
  { label: "Hangout", value: "Casual Weekend Brunch & Café Outing" },
  { label: "Wedding", value: "Owambe / Traditional Nigerian Wedding & Reception" },
  { label: "Other", value: "Smart Casual / Day Outing" },
];

export default function DashboardHomePage() {
  const [userName, setUserName] = useState("Bolu");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [planningActive, setPlanningActive] = useState(false);
  const [stylistOpen, setStylistOpen] = useState(false);
  const [anchorItemId, setAnchorItemId] = useState<string | undefined>(undefined);

  // Dynamic time-based greeting and date
  const [greeting, setGreeting] = useState("Good morning");
  const [currentDateFormatted, setCurrentDateFormatted] = useState("Thursday, October 24");

  // Auto-detected location & weather
  const {
    fullLocation,
    weatherSummary,
    isLoading: weatherLoading,
  } = useLocationWeather();

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    const formatted = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setCurrentDateFormatted(formatted);

    // Fetch current user session name
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user?.name) {
          const firstName = session.user.name.split(" ")[0];
          setUserName(firstName);
        }
      } catch (e) {
        console.error("Session load error:", e);
      }
    }

    // Fetch user's wardrobe items
    async function loadWardrobe() {
      try {
        const res = await fetch("/api/wardrobe");
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setWardrobeItems(data.items);
        }
      } catch (e) {
        console.error("Wardrobe load error:", e);
      } finally {
        setLoadingWardrobe(false);
      }
    }

    // Fetch user's saved outfits
    async function loadSavedOutfits() {
      try {
        const res = await fetch("/api/outfits");
        const data = await res.json();
        if (data.success && Array.isArray(data.outfits)) {
          setSavedOutfits(data.outfits);
        }
      } catch (e) {
        console.error("Saved outfits load error:", e);
      } finally {
        setLoadingSaved(false);
      }
    }

    loadSession();
    loadWardrobe();
    loadSavedOutfits();
  }, []);

  function handlePlanClick() {
    setPlanningActive(true);
    setTimeout(() => {
      const locParam = encodeURIComponent(fullLocation);
      const weatherParam = encodeURIComponent(weatherSummary);
      window.location.href = `/plan?occasion=${encodeURIComponent(selectedOccasion.label)}&location=${locParam}&weather=${weatherParam}`;
    }, 200);
  }

  function handleItemClick(itemId: string) {
    setAnchorItemId(itemId);
    setStylistOpen(true);
  }

  return (
    <main className="w-full pt-20 pb-24 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full space-y-space-xl">
          {/* Top Greeting & Atmospheric Context */}
          <section className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
              <div className="space-y-space-xs">
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
                  {greeting}, {userName}
                </h1>
                <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md flex-wrap">
                  <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>
                    {weatherLoading ? "Detecting location..." : fullLocation}
                  </span>
                  <span className="text-outline-variant font-light">·</span>
                  <CloudSun className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-on-surface font-medium">
                    {weatherLoading ? "Checking weather..." : weatherSummary}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>
          </section>

          {/* Core Action Card: Curated Planner */}
          <section className="relative bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm border border-outline-variant/20 overflow-hidden">
            <div className="relative z-10 flex flex-col gap-space-md max-w-2xl">
              <div className="space-y-space-xs">
                <div className="inline-flex items-center gap-1.5 text-secondary font-label-caps text-label-caps uppercase tracking-widest font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  <span>Intelligent Styling</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary tracking-tight font-medium">
                  What are you wearing today?
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Choose an occasion and let AI curate a look from clothes you own.
                </p>
              </div>

              {/* Occasion Pills */}
              <div className="space-y-space-xs">
                <label className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
                  Select Occasion
                </label>
                <div className="flex flex-wrap gap-2 pt-1" id="occasion-container">
                  {OCCASIONS.map((occ) => {
                    const isSelected = selectedOccasion.label === occ.label;
                    return (
                      <button
                        key={occ.label}
                        type="button"
                        onClick={() => setSelectedOccasion(occ)}
                        className={`occasion-chip px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-primary text-on-primary shadow-sm font-semibold"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {occ.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="pt-space-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
                <button
                  type="button"
                  id="plan-trigger"
                  onClick={handlePlanClick}
                  disabled={planningActive}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-space-lg py-3.5 bg-primary text-on-primary rounded-lg font-title-md text-title-md shadow-md hover:bg-primary-container transition-all duration-200 active:scale-[0.99] cursor-pointer"
                >
                  {planningActive ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-on-primary" />
                      <span>Composing for {selectedOccasion.label}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-secondary-container transition-transform group-hover:rotate-12" />
                      <span>Plan my outfit</span>
                    </>
                  )}
                </button>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">
                  Tailored to 31°C Island &amp; Mainland conditions
                </span>
              </div>
            </div>
          </section>

          {/* Wardrobe Preview Section */}
          <section className="flex flex-col gap-space-md">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-space-sm">
                <h2 className="font-headline-md text-headline-md text-primary font-medium">
                  Your wardrobe
                </h2>
                <span className="px-2.5 py-0.5 bg-surface-container-high rounded-full font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
                  {loadingWardrobe ? "..." : `${wardrobeItems.length} items`}
                </span>
              </div>
              <Link
                href="/wardrobe"
                className="group inline-flex items-center gap-1 font-title-md text-title-md text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <span>Browse all items</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Horizontal scroll items */}
            {loadingWardrobe ? (
              <div className="flex gap-space-md overflow-x-hidden pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-48 bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/15 space-y-3 shrink-0 animate-pulse"
                  >
                    <div className="aspect-square bg-[#EAE8E2] rounded-lg" />
                    <div className="h-4 w-3/4 bg-[#EAE8E2] rounded" />
                    <div className="h-3 w-1/2 bg-[#EAE8E2] rounded" />
                  </div>
                ))}
              </div>
            ) : wardrobeItems.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-space-md text-center sm:text-left">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                      Your wardrobe catalog is empty
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Upload your clothes so our AI stylist can create personalized ensembles.
                    </p>
                  </div>
                </div>
                <Link
                  href="/wardrobe/add"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container transition-all shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add clothing</span>
                </Link>
              </div>
            ) : (
              <div className="relative -mx-margin-mobile md:-mx-margin px-margin-mobile md:px-margin overflow-x-auto no-scrollbar pb-2">
                <div className="flex gap-space-md min-w-max">
                  {wardrobeItems.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="group flex flex-col w-48 bg-surface-container-lowest rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-outline-variant/15"
                      title="Click to style an outfit with this item"
                    >
                      <div className="relative w-full aspect-square rounded-lg bg-surface-container-low overflow-hidden mb-3">
                        {item.imageUrl ? (
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={item.name}
                            src={item.imageUrl}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-outline">
                            <Shirt className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface/90 backdrop-blur-md font-label-caps text-label-caps text-primary uppercase font-semibold shadow-2xs">
                          {item.category}
                        </span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface truncate group-hover:text-secondary transition-colors font-medium">
                        {item.name}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate capitalize">
                        {item.subcategory || item.color || item.style || "Versatile piece"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Recently Saved Ensembles Section */}
          <section className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-primary font-medium">
                Recently saved
              </h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold">
                Curated Archive
              </span>
            </div>

            {loadingSaved ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/15 space-y-3 animate-pulse"
                  >
                    <div className="h-4 w-32 bg-[#EAE8E2] rounded" />
                    <div className="h-6 w-3/4 bg-[#EAE8E2] rounded" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-[4/5] bg-[#EAE8E2] rounded-lg" />
                      <div className="aspect-[4/5] bg-[#EAE8E2] rounded-lg" />
                      <div className="aspect-[4/5] bg-[#EAE8E2] rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : savedOutfits.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/20 text-center py-10 space-y-3">
                <Sparkles className="w-8 h-8 text-secondary mx-auto" />
                <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                  No saved ensembles yet
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                  When you plan an outfit above, you can save your favorite looks to build your personal capsule archive.
                </p>
                <button
                  type="button"
                  onClick={handlePlanClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Plan your first outfit</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {savedOutfits.slice(0, 4).map((outfit) => (
                  <article
                    key={outfit.id}
                    className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-outline-variant/15"
                  >
                    <div className="p-space-md flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-caps text-label-caps uppercase font-semibold">
                          {outfit.event || "Curated Look"}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Saved{" "}
                          {new Date(outfit.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-medium">
                          {outfit.title}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-1">
                          {outfit.items.map((i) => i.name).join(" + ") || outfit.vibeDescription}
                        </p>
                      </div>
                    </div>

                    {/* Garments Visual Thumbnails */}
                    <div
                      className={`grid gap-1.5 p-space-md pt-0 ${
                        outfit.items.length >= 3
                          ? "grid-cols-3"
                          : outfit.items.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {outfit.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="aspect-[4/5] rounded-lg bg-surface-container overflow-hidden relative"
                        >
                          {item.imageUrl ? (
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              alt={item.name}
                              src={item.imageUrl}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <Shirt className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Card Footer */}
                    <div className="bg-surface-container-low px-space-md py-3 flex items-center justify-between border-t border-surface-variant/30">
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
                        <Clock className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        <span>Curated Look</span>
                      </div>
                      <Link
                        href="/wardrobe/saved"
                        className="inline-flex items-center gap-1 text-primary font-label-md text-label-md hover:text-secondary transition-colors font-semibold cursor-pointer"
                      >
                        <span>View ensemble</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Integrated AI Outfit Recommender Modal */}
      <OutfitRecommenderModal
        isOpen={stylistOpen}
        onClose={() => {
          setStylistOpen(false);
          setAnchorItemId(undefined);
        }}
        wardrobeItems={wardrobeItems}
        preselectedAnchorItemId={anchorItemId}
      />
    </main>
  );
}
