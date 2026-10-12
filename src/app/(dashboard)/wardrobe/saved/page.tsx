"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  CloudSun,
  MapPin,
  Trash2,
  ArrowRight,
  Shirt,
  X,
  Loader2,
  RotateCw,
  AlertCircle,
  Copy,
  Check,
  Search,
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
  createdAt: string;
  items: WardrobeItem[];
};

export default function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedOutfits() {
      try {
        const response = await fetch("/api/outfits");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load saved outfits.");
        }

        setOutfits(data.outfits || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong loading your saved outfits."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSavedOutfits();
  }, []);

  async function handleDelete(outfit: SavedOutfit) {
    const confirmed = window.confirm(
      `Remove "${outfit.title}" from your saved outfits?`
    );
    if (!confirmed) return;

    setDeletingId(outfit.id);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/outfits/${outfit.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete outfit.");
      }

      setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
      setActionSuccess(`"${outfit.title}" removed from your archive.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete outfit.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy(outfit: SavedOutfit) {
    const textToCopy = `Outfit: ${outfit.title}
${outfit.event ? `Occasion: ${outfit.event}` : ""}
${outfit.weather ? `Weather: ${outfit.weather}` : ""}
${outfit.vibeDescription ? `Vibe: ${outfit.vibeDescription}` : ""}

Garments:
${outfit.items.map((i) => `• ${i.name} (${i.color} ${i.category})`).join("\n")}

Styling Tips:
${outfit.stylingTips.map((tip) => `• ${tip}`).join("\n")}
${outfit.missingPiecesAdvice ? `\nFinishing Touch: ${outfit.missingPiecesAdvice}` : ""}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(outfit.id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  const filteredOutfits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return outfits;

    return outfits.filter(
      (outfit) =>
        outfit.title.toLowerCase().includes(q) ||
        (outfit.event && outfit.event.toLowerCase().includes(q)) ||
        (outfit.weather && outfit.weather.toLowerCase().includes(q)) ||
        (outfit.vibeDescription &&
          outfit.vibeDescription.toLowerCase().includes(q)) ||
        outfit.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.color.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
    );
  }, [outfits, searchQuery]);

  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
              <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold">
                Lookbook & Archive
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
              Saved Outfits
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              <span className="font-semibold text-on-surface">
                {outfits.length} {outfits.length === 1 ? "look" : "looks"}
              </span>{" "}
              curated by AI from your personal wardrobe
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <Link
              href="/wardrobe?stylist=open"
              className="flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-lg py-3 rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-on-primary" />
              <span className="font-title-md text-title-md tracking-wide">
                Style New Look
              </span>
            </Link>
          </div>
        </div>

        {/* Feedback message */}
        {actionSuccess && (
          <div
            role="status"
            className="mb-space-md rounded-xl border border-[#C8DCCB] bg-[#EDF4EC] px-4 py-3 text-sm text-[#24543D] flex items-center justify-between"
          >
            <span>{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-[#24543D] hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar when outfits exist */}
        {outfits.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg">
            <div className="relative">
              <Search className="absolute left-space-md top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
              <input
                className="w-full h-12 pl-11 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:bg-surface-container-lowest transition-colors shadow-inner"
                placeholder="Search saved looks (e.g. wedding, linen, casual, rain)..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-space-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#68736D] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#173B2A]" />
            <p className="text-sm">Retrieving your curated lookbook...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm border border-outline-variant/30">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-[#17231D]">
              Couldn&apos;t load saved outfits
            </h2>
            <p className="mt-3 text-sm text-red-700 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173B2A] px-5 py-3 text-sm text-white cursor-pointer hover:bg-[#24543D] transition shadow-sm"
            >
              <RotateCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-space-xl px-space-md bg-surface-container-lowest rounded-2xl my-space-sm shadow-sm border border-outline-variant/20">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-space-md">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium">
              {outfits.length === 0
                ? "No saved outfits yet"
                : "No matching looks found"}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 mb-space-lg">
              {outfits.length === 0
                ? "Let the AI stylist recommend weather-smart outfits from your wardrobe. You can save your favorite ensembles here for quick daily dressing."
                : `No looks match "${searchQuery}". Clear your search to browse all saved combinations.`}
            </p>
            {outfits.length === 0 ? (
              <Link
                href="/wardrobe?stylist=open"
                className="px-space-lg py-3 bg-primary text-on-primary font-title-md text-title-md rounded-lg shadow-sm hover:bg-primary-container transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Style an outfit with AI</span>
              </Link>
            ) : (
              <button
                onClick={() => setSearchQuery("")}
                className="px-space-lg py-2.5 bg-primary text-on-primary font-title-md text-title-md rounded-lg shadow-sm hover:bg-primary-container transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Saved Outfits Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {filteredOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-outline-variant/20 flex flex-col justify-between"
              >
                {/* Outfit Header */}
                <div className="p-space-md sm:p-space-lg border-b border-outline-variant/15">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold">
                      {outfit.event || "Curated Look"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(outfit)}
                        className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                        title="Copy outfit breakdown"
                      >
                        {copiedId === outfit.id ? (
                          <Check className="w-3.5 h-3.5 text-secondary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(outfit)}
                        disabled={deletingId === outfit.id}
                        className="w-8 h-8 rounded-full bg-surface-container hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete saved look"
                      >
                        {deletingId === outfit.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-headline-sm text-headline-sm text-primary font-medium tracking-tight mb-2">
                    {outfit.title}
                  </h3>

                  {outfit.vibeDescription && (
                    <p className="font-body-md text-body-md text-on-surface-variant italic mb-3">
                      &ldquo;{outfit.vibeDescription}&rdquo;
                    </p>
                  )}

                  {/* Contextual Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {outfit.weather && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface font-medium">
                        <CloudSun className="w-3.5 h-3.5 text-secondary" />
                        <span>{outfit.weather}</span>
                      </span>
                    )}
                    {outfit.location && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface font-medium">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        <span>{outfit.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Clothing Items Visual Showcase */}
                <div className="p-space-md sm:p-space-lg bg-surface-container-low/40">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-semibold block mb-3">
                    Wardrobe Pieces Included ({outfit.items.length})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {outfit.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="group relative rounded-xl bg-surface overflow-hidden border border-outline-variant/20 shadow-2xs flex flex-col"
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
                            <span className="px-1.5 py-0.5 rounded bg-surface/90 backdrop-blur-xs text-[10px] font-semibold text-primary uppercase tracking-wide">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-surface">
                          <p className="text-xs font-medium text-on-surface line-clamp-1">
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

                {/* Styling Notes & Advice */}
                <div className="p-space-md sm:p-space-lg border-t border-outline-variant/15 flex flex-col gap-3">
                  {outfit.stylingTips && outfit.stylingTips.length > 0 && (
                    <div>
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary font-bold block mb-1.5">
                        Styling Directives
                      </span>
                      <ul className="space-y-1.5">
                        {outfit.stylingTips.map((tip, index) => (
                          <li
                            key={index}
                            className="text-xs text-on-surface-variant flex items-start gap-2"
                          >
                            <span className="text-secondary font-bold leading-none mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {outfit.missingPiecesAdvice && (
                    <div className="mt-1 p-2.5 rounded-lg bg-secondary/10 border border-secondary/20 text-xs text-[#835336]">
                      <strong className="font-semibold block mb-0.5">
                        Stylist Finishing Note:
                      </strong>
                      <span>{outfit.missingPiecesAdvice}</span>
                    </div>
                  )}

                  <div className="pt-2 text-right">
                    <span className="text-[11px] text-outline flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Saved on{" "}
                        {new Date(outfit.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
