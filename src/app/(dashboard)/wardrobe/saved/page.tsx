"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MoreVertical,
  Trash2,
  Calendar,
  Check,
  Shirt,
  History,
  PlusCircle,
  X,
  Star,
  Flame,
  Briefcase,
  Utensils,
  Sun,
  TrendingUp,
  Loader2,
  Sparkles,
  Plus,
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

type SavedOutfit = {
  id: string;
  title: string;
  vibeDescription?: string;
  event?: string;
  location?: string;
  weather?: string;
  stylingTips: string[];
  missingPiecesAdvice?: string;
  wearCount?: number;
  lastWorn?: string | null;
  createdAt: string;
  items: WardrobeItem[];
};

type TimelineItem = {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  badge?: {
    text: string;
    icon: typeof Star | typeof Flame | typeof CheckCircle2;
  };
  dotColor?: string;
};

// Categorization helper for filter tabs
function getOutfitCategory(
  outfit: SavedOutfit,
): "work" | "casual" | "traditional" {
  const text =
    `${outfit.event || ""} ${outfit.title} ${outfit.vibeDescription || ""}`.toLowerCase();
  if (
    text.includes("traditional") ||
    text.includes("church") ||
    text.includes("service") ||
    text.includes("wedding") ||
    text.includes("owambe") ||
    text.includes("kaftan") ||
    text.includes("senator") ||
    text.includes("agbada")
  ) {
    return "traditional";
  }
  if (
    text.includes("work") ||
    text.includes("pitch") ||
    text.includes("client") ||
    text.includes("meeting") ||
    text.includes("office") ||
    text.includes("boardroom") ||
    text.includes("formal") ||
    text.includes("business")
  ) {
    return "work";
  }
  return "casual";
}

// Badge data helper for each card
function getCardBadge(
  outfit: SavedOutfit,
  category: "work" | "casual" | "traditional",
) {
  if (category === "work") {
    return {
      icon: Briefcase,
      text: outfit.event || "Business formal • Lagos Island",
      statusText: "High impact",
      statusIcon: TrendingUp,
    };
  }
  if (category === "traditional") {
    return {
      icon: Sun,
      text: outfit.event || "Traditional / Elegant",
      statusText: "Sunday classic",
      statusIcon: Sparkles,
    };
  }
  return {
    icon: Utensils,
    text: outfit.event || "Smart casual • Date",
    statusText: "Ready to deploy",
    statusIcon: Check,
  };
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

export default function SavedOutfitsPage() {
  const [userName, setUserName] = useState("Bolu");
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "work" | "casual" | "traditional"
  >("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick check-in modal state
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [modalOutfitId, setModalOutfitId] = useState<string>("");
  const [modalNotes, setModalNotes] = useState<string>("");

  // Recently worn timeline entries
  const [timelineEntries, setTimelineEntries] = useState<TimelineItem[]>([
    {
      id: "t-1",
      title: "Friday Dinner",
      timestamp: "Yesterday • Oct 24",
      description: "Victoria Island • Worn with Tom Ford Ombré Leather scent",
      badge: { text: "Rated 5/5", icon: Star },
      dotColor: "bg-secondary",
    },
    {
      id: "t-2",
      title: "Sunday Service",
      timestamp: "Last Sunday • Oct 20",
      description: "Lekki Phase 1 • Emerald Kaftan received 4 compliments",
      badge: { text: "High rotation", icon: Flame },
      dotColor: "bg-primary-container",
    },
    {
      id: "t-3",
      title: "Island Client Pitch",
      timestamp: "Oct 14",
      description: "Marina Business District • Successful Q4 pitch meeting",
      badge: { text: "Formal win", icon: CheckCircle2 },
      dotColor: "bg-outline-variant",
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionRes, outfitsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/outfits"),
        ]);

        const session = await sessionRes.json().catch(() => null);
        if (session?.user?.name) {
          const first = session.user.name.split(" ")[0];
          setUserName(first);
        }

        const data = await outfitsRes.json();
        if (data.success && Array.isArray(data.outfits)) {
          setOutfits(data.outfits);
          if (data.outfits.length > 0) {
            setModalOutfitId(data.outfits[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading saved outfits:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleGlobalClick() {
      setOpenDropdownId(null);
    }
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }

  async function handleDelete(outfit: SavedOutfit) {
    try {
      const res = await fetch(`/api/outfits/${outfit.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove outfit");
      }

      setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
      showToast(`Removed "${outfit.title}" from saved library.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove outfit");
    } finally {
      setOpenDropdownId(null);
    }
  }

  async function handleLogWear(outfit: SavedOutfit) {
    // 1. Optimistic wear increment
    setOutfits((prev) =>
      prev.map((o) =>
        o.id === outfit.id ? { ...o, wearCount: (o.wearCount || 0) + 1 } : o,
      ),
    );

    // 2. Prepend timeline entry
    const newEntry: TimelineItem = {
      id: `wear-${Date.now()}`,
      title: outfit.title,
      timestamp: "Today • Lagos",
      description: `${outfit.location || "Lagos"} • Logged via instant wear dock`,
      badge: { text: "Just logged", icon: CheckCircle2 },
      dotColor: "bg-secondary",
    };
    setTimelineEntries((prev) => [newEntry, ...prev]);

    showToast(`Selected "${outfit.title}" for today! Added to rotation.`);

    // 3. Persist wear count to MongoDB
    try {
      await fetch(`/api/outfits/${outfit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: 1 }),
      });
    } catch (err) {
      console.error("Wear log persist error:", err);
    }
  }

  async function handleQuickCheckinSubmit() {
    if (!modalOutfitId) return;
    const outfit = outfits.find((o) => o.id === modalOutfitId);
    if (!outfit) return;

    const notes = modalNotes.trim() || "Daily rotation check-in";

    // 1. Optimistic wear increment
    setOutfits((prev) =>
      prev.map((o) =>
        o.id === outfit.id ? { ...o, wearCount: (o.wearCount || 0) + 1 } : o,
      ),
    );

    // 2. Add to timeline
    const newEntry: TimelineItem = {
      id: `checkin-${Date.now()}`,
      title: outfit.title,
      timestamp: "Today • Lagos",
      description: notes,
      badge: { text: "Just logged", icon: CheckCircle2 },
      dotColor: "bg-secondary",
    };
    setTimelineEntries((prev) => [newEntry, ...prev]);

    setCheckinModalOpen(false);
    setModalNotes("");
    showToast(`Logged "${outfit.title}" to your timeline!`);

    // 3. Persist wear to MongoDB
    try {
      await fetch(`/api/outfits/${outfit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: 1 }),
      });
    } catch (err) {
      console.error("Check-in persist error:", err);
    }
  }

  // Filtered lists and metrics counts
  const categoryCounts = useMemo(() => {
    let work = 0;
    let casual = 0;
    let traditional = 0;
    outfits.forEach((o) => {
      const cat = getOutfitCategory(o);
      if (cat === "work") work++;
      else if (cat === "traditional") traditional++;
      else casual++;
    });
    return {
      all: outfits.length,
      work,
      casual,
      traditional,
    };
  }, [outfits]);

  const filteredOutfits = useMemo(() => {
    if (activeCategory === "all") return outfits;
    return outfits.filter((o) => getOutfitCategory(o) === activeCategory);
  }, [outfits, activeCategory]);

  return (
    <main className="w-full pt-16 pb-24 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full">
          {/* Subtle ambient top gradient & Editorial Header */}
          <section className="relative mb-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-semibold">
                    Archive • Vol. 04
                  </span>
                  <span className="h-1 w-1 rounded-full bg-secondary"></span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Lagos Collection
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
                  Saved outfits
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-xl">
                  Outfits you&apos;ve curated and loved, ready for any day.
                </p>
              </div>

              {/* Quick Wardrobe Metrics Indicator */}
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full shadow-sm self-start md:self-auto border border-outline-variant/30">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {outfits.length}{" "}
                    {outfits.length === 1 ? "Archival Look" : "Archival Looks"}
                  </span>
                </div>
                <span className="text-outline-variant font-light">|</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Optimal for 29°C – 33°C
                </span>
              </div>
            </div>

            {/* Filter Tabs (Pill Controls) */}
            <div
              className="mt-space-lg flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-space-xs"
              id="filter-tab-bar"
            >
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 shrink-0 cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                All ({categoryCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("work")}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 shrink-0 cursor-pointer ${
                  activeCategory === "work"
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                Work ({categoryCounts.work})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("casual")}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 shrink-0 cursor-pointer ${
                  activeCategory === "casual"
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                Casual &amp; Hangouts ({categoryCounts.casual})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("traditional")}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 shrink-0 cursor-pointer ${
                  activeCategory === "traditional"
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                Traditional &amp; Church ({categoryCounts.traditional})
              </button>
            </div>
          </section>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/15 space-y-4 animate-pulse"
                >
                  <div className="h-5 w-1/3 bg-[#EAE8E2] rounded" />
                  <div className="h-6 w-2/3 bg-[#EAE8E2] rounded" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-[3/4] bg-[#EAE8E2] rounded-lg" />
                    <div className="aspect-[3/4] bg-[#EAE8E2] rounded-lg" />
                    <div className="aspect-[3/4] bg-[#EAE8E2] rounded-lg" />
                  </div>
                  <div className="h-4 w-full bg-[#EAE8E2] rounded" />
                </div>
              ))}
            </div>
          ) : filteredOutfits.length === 0 ? (
            /* Empty State */
            <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm border border-outline-variant/20 space-y-space-md my-space-md">
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mx-auto">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                  {outfits.length === 0
                    ? "No saved outfits yet"
                    : `No ${activeCategory} outfits in your archive`}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mt-1">
                  {outfits.length === 0
                    ? "Plan looks from your wardrobe pieces and save your favorites here for effortless morning dressing."
                    : `You don't have any outfits categorized as ${activeCategory}. Switch to "All" or curate a new look!`}
                </p>
              </div>
              <div className="pt-space-xs">
                {outfits.length === 0 ? (
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-2 px-space-lg py-3 rounded-lg bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-secondary-container" />
                    <span>Plan today&apos;s outfit</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container transition-all cursor-pointer"
                  >
                    Show all outfits
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Saved Outfits Cards Grid */
            <section
              className="grid grid-cols-1 md:grid-cols-2 gap-space-lg"
              id="outfits-grid"
            >
              {filteredOutfits.map((outfit) => {
                const category = getOutfitCategory(outfit);
                const badge = getCardBadge(outfit, category);
                const BadgeIcon = badge.icon;
                const StatusIcon = badge.statusIcon;
                const wearCount = outfit.wearCount || 0;

                return (
                  <article
                    key={outfit.id}
                    className="outfit-card group relative bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-outline-variant/15"
                    data-category={category}
                  >
                    <div className="p-space-md">
                      {/* Card Header Info */}
                      <div className="flex items-start justify-between gap-space-sm mb-space-md">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider mb-space-xs">
                            <BadgeIcon className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                            <span>{badge.text}</span>
                          </div>
                          <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight">
                            {outfit.title}
                          </h3>
                        </div>

                        {/* Menu dropdown wrapper */}
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Card options"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(
                                openDropdownId === outfit.id ? null : outfit.id,
                              );
                            }}
                            className="h-8 w-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openDropdownId === outfit.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1 w-36 bg-surface-container-lowest rounded-lg shadow-xl py-1 z-30 border border-outline-variant/20 animate-in fade-in duration-150"
                            >
                              <button
                                type="button"
                                className="w-full text-left px-space-sm py-1.5 font-label-md text-label-md text-error hover:bg-error-container/20 flex items-center gap-2 cursor-pointer"
                                onClick={() => handleDelete(outfit)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Garment Collage Layout */}
                      <div
                        className={`grid ${
                          outfit.items.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        } gap-space-xs mb-space-md`}
                      >
                        {outfit.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className={`${
                              outfit.items.length === 2
                                ? "aspect-[4/3]"
                                : "aspect-[3/4]"
                            } rounded-lg overflow-hidden bg-surface-container relative`}
                          >
                            {item.imageUrl ? (
                              <img
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                alt={item.name}
                                src={item.imageUrl}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-outline">
                                <Shirt className="w-6 h-6" />
                              </div>
                            )}
                            <span className="absolute bottom-1 left-1.5 font-label-caps text-[9px] text-on-surface bg-surface-bright/80 backdrop-blur-sm px-1 rounded font-medium truncate max-w-[85%]">
                              {item.subcategory || item.category}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Ensemble composition line */}
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate mb-space-sm">
                        {outfit.items.map((i) => i.name).join(" • ") ||
                          outfit.vibeDescription}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-space-sm text-on-surface-variant font-label-caps text-label-caps uppercase">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Saved {formatDate(outfit.createdAt)}</span>
                        </span>
                        <span>•</span>
                        <span
                          className={
                            wearCount > 0
                              ? "text-secondary font-semibold"
                              : "text-on-surface-variant"
                          }
                        >
                          {wearCount > 0
                            ? `Worn ${wearCount} ${wearCount === 1 ? "time" : "times"}`
                            : "Unworn this month"}
                        </span>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-space-md bg-surface-container-low/70 flex items-center justify-between gap-space-sm border-t border-surface-variant/20">
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                        <StatusIcon className="w-4 h-4 text-tertiary flex-shrink-0" />
                        <span>{badge.statusText}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLogWear(outfit)}
                        className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Shirt className="w-4 h-4" />
                        <span>Wear today</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* Recently Worn Timeline & Quick Check-In Log */}
          <section className="mt-space-xl pt-space-lg">
            {/* Header of the timeline section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
              <div>
                <div className="flex items-center gap-space-xs">
                  <History className="w-5 h-5 text-secondary flex-shrink-0" />
                  <h2 className="font-headline-sm text-headline-sm text-primary font-medium">
                    Recently worn timeline
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Quick rotation tracker &amp; wear frequency for {userName} in
                  Lagos
                </p>
              </div>

              {/* Quick log interactive trigger */}
              <div className="flex items-center gap-space-xs mt-2 sm:mt-0">
                <button
                  type="button"
                  id="quick-log-btn"
                  onClick={() => setCheckinModalOpen(true)}
                  className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Quick check-in</span>
                </button>
              </div>
            </div>

            {/* Timeline Entries Container */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/15">
              <div
                className="relative pl-6 space-y-space-md"
                id="timeline-list"
              >
                {/* Connecting vertical subtle line */}
                <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-surface-variant rounded-full"></div>

                {timelineEntries.map((entry) => {
                  const BadgeIcon = entry.badge?.icon;
                  return (
                    <div
                      key={entry.id}
                      className="relative flex items-start justify-between gap-space-md group animate-in fade-in duration-300"
                    >
                      <div
                        className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full ${
                          entry.dotColor || "bg-secondary"
                        } ring-4 ring-surface-container-lowest`}
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-space-xs">
                          <span className="font-title-md text-title-md text-primary font-semibold">
                            {entry.title}
                          </span>
                          <span className="font-label-caps text-label-caps text-on-surface-variant">
                            {entry.timestamp}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {entry.description}
                        </p>
                      </div>

                      {entry.badge && BadgeIcon && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-caps text-[10px] font-medium">
                          <BadgeIcon className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                          <span>{entry.badge.text}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
              <div>
                © {new Date().getFullYear()} Wardrobe AI. All rights reserved.
                Lagos &amp; Global.
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Interactive Toast Notification Component */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-space-sm bg-primary text-on-primary px-space-md py-space-sm rounded-lg shadow-xl animate-in slide-in-from-bottom-5 duration-300"
        >
          <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Quick Check-In Dialog / Modal */}
      {checkinModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCheckinModalOpen(false);
          }}
        >
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-space-lg shadow-2xl relative border border-outline-variant/30">
            <div className="flex items-center justify-between mb-space-md">
              <h3 className="font-headline-sm text-headline-sm text-primary font-medium">
                Log outfit wear
              </h3>
              <button
                type="button"
                className="h-8 w-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer transition-colors"
                onClick={() => setCheckinModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-space-md">
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-space-xs font-semibold">
                  Select Outfit
                </label>
                <select
                  className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  value={modalOutfitId}
                  onChange={(e) => setModalOutfitId(e.target.value)}
                >
                  {outfits.length === 0 ? (
                    <option value="">No outfits available</option>
                  ) : (
                    outfits.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} ({o.event || "Saved Look"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-space-xs font-semibold">
                  Occasion / Location
                </label>
                <input
                  className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  id="modal-notes"
                  placeholder="e.g. Ikoyi Lunch Meeting, dry weather"
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </div>

              <div className="pt-space-xs flex justify-end gap-space-xs">
                <button
                  type="button"
                  className="px-space-md py-2.5 rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container cursor-pointer transition-colors"
                  onClick={() => setCheckinModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm cursor-pointer transition-colors"
                  onClick={handleQuickCheckinSubmit}
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
