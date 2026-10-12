"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wind,
  Shirt,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Briefcase,
  Footprints,
  CloudSun,
  Pencil,
  Trash2,
  X,
  Loader2,
  RotateCw,
  AlertCircle,
  Check,
  Watch,
  SearchX,
} from "lucide-react";
import { OutfitRecommenderModal } from "@/components/OutfitRecommenderModal";

type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  style: string;
  imageUrl: string;
  createdAt: string;
};

type ClothingForm = {
  name: string;
  category: string;
  subcategory: string;
  color: string;
  style: string;
};

const categories = [
  { label: "All", value: "all" },
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Shoes", value: "shoes" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Traditional", value: "traditional" },
  { label: "Accessories", value: "accessories" },
  { label: "Dresses", value: "dresses" },
];

const clothingCategories = categories.filter(
  (category) => category.value !== "all",
);

const emptyForm: ClothingForm = {
  name: "",
  category: "tops",
  subcategory: "",
  color: "",
  style: "",
};

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

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [editForm, setEditForm] = useState<ClothingForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [stylistOpen, setStylistOpen] = useState(false);
  const [stylistAnchorItem, setStylistAnchorItem] = useState<string | undefined>(undefined);

  function openStylist(anchorId?: string) {
    setStylistAnchorItem(anchorId);
    setStylistOpen(true);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("stylist") === "open" || params.get("openStylist") === "true") {
        setStylistOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    async function loadWardrobe() {
      try {
        const response = await fetch("/api/wardrobe");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load your wardrobe.");
        }

        setItems(data.items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your wardrobe.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadWardrobe();
  }, []);

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    categories.forEach((cat) => {
      if (cat.value !== "all") {
        counts[cat.value] = items.filter(
          (item) => item.category.toLowerCase() === cat.value,
        ).length;
      }
    });
    return counts;
  }, [items]);

  // Filtered items based on search query and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "all" ||
        item.category.toLowerCase() === activeCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
        (item.style && item.style.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  // Dynamic capsule health stats
  const capsuleStats = useMemo(() => {
    const breathable = items.filter((i) =>
      ["tops", "traditional"].includes(i.category.toLowerCase()),
    ).length;
    const tailored = items.filter((i) =>
      ["bottoms"].includes(i.category.toLowerCase()),
    ).length;
    const layering = items.filter((i) =>
      ["outerwear", "shoes", "accessories"].includes(i.category.toLowerCase()),
    ).length;
    const total = items.length || 1;

    return {
      breathable,
      tailored,
      layering,
      breathablePct: Math.round((breathable / total) * 100) || 50,
      tailoredPct: Math.round((tailored / total) * 100) || 30,
      layeringPct: Math.round((layering / total) * 100) || 20,
    };
  }, [items]);

  function openEditForm(item: WardrobeItem) {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || "",
      color: item.color,
      style: item.style || "",
    });
    setActionError(null);
    setSuccessMessage(null);
  }

  function closeEditForm() {
    if (saving) return;
    setEditingItem(null);
    setActionError(null);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/wardrobe/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update this item.");
      }

      const updatedItem: WardrobeItem = {
        ...editingItem,
        ...data.item,
        id: String(data.item.id ?? data.item._id ?? editingItem.id),
      };

      setItems((current) =>
        current.map((item) =>
          item.id === editingItem.id ? updatedItem : item,
        ),
      );

      setEditingItem(null);
      setSuccessMessage("Garment details updated successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: WardrobeItem) {
    const confirmed = window.confirm(
      `Delete "${item.name}" from your wardrobe? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/wardrobe/${item.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete this item.");
      }

      setItems((current) => current.filter((i) => i.id !== item.id));

      if (editingItem?.id === item.id) {
        setEditingItem(null);
      }

      setSuccessMessage(`"${item.name}" was removed from your wardrobe.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full">
          {/* Atmospheric Lagos Climate & Wardrobe Intelligence Bar */}
          <div className="w-full bg-surface-container-low rounded-xl px-space-md py-space-sm mb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm shadow-sm">
            <div className="flex items-center gap-space-sm text-on-surface">
              <Wind className="w-5 h-5 text-secondary flex-shrink-0" />
              <div className="flex flex-wrap items-center gap-x-space-sm">
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-semibold">
                  Lagos, 31°C · 78% Humidity
                </span>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Optimal breathability: linen, relaxed cottons, and open weaves
                  recommended today
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => openStylist()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/15 hover:bg-secondary/25 text-secondary text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                title="Generate weather-smart outfit"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Style Today</span>
              </button>
              <div className="hidden sm:flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Header & Top Action Tier */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
            <div>
              <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
                <Shirt className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold">
                  Curated Archive
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
                My Wardrobe
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                <span className="font-semibold text-on-surface" id="item-count">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>{" "}
                catalogued in your personal collection
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                type="button"
                onClick={() => openStylist()}
                className="flex items-center justify-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/30 px-space-md sm:px-space-lg py-3 rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                id="open-stylist-btn"
              >
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="font-title-md text-title-md tracking-wide">
                  Recommend outfit
                </span>
              </button>

              <Link
                href="/wardrobe/add"
                className="flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md sm:px-space-lg py-3 rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
                id="open-upload-btn"
              >
                <Plus className="w-5 h-5 text-on-primary" />
                <span className="font-title-md text-title-md tracking-wide">
                  Add clothing
                </span>
              </Link>
            </div>
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <div
              role="status"
              className="mb-space-md rounded-xl border border-[#C8DCCB] bg-[#EDF4EC] px-4 py-3 text-sm text-[#24543D] flex items-center justify-between"
            >
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-[#24543D] hover:opacity-75"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {actionError && !editingItem && (
            <div
              role="alert"
              className="mb-space-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between"
            >
              <span>{actionError}</span>
              <button
                onClick={() => setActionError(null)}
                className="text-red-700 hover:opacity-75"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Controls Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-space-md top-1/2 -translate-y-1/2 text-outline pointer-events-none w-5 h-5" />
                <input
                  className="w-full h-12 pl-11 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:bg-surface-container-lowest transition-colors shadow-inner"
                  id="wardrobe-search"
                  placeholder="Search clothes (e.g. polo, linen, black, agbada)..."
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

              {/* Reset/Filter Indicator */}
              {(searchQuery || activeCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="h-12 px-space-md bg-surface-container-low hover:bg-surface-container text-on-surface font-title-md text-title-md rounded-lg flex items-center justify-center gap-space-xs transition-colors shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-secondary" />
                  <span>Reset filters</span>
                  <span className="w-2 h-2 rounded-full bg-secondary ml-1" />
                </button>
              )}
            </div>

            {/* Category Pills Navigation */}
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pt-space-xs pb-1">
              {categories.map((cat) => {
                const count = categoryCounts[cat.value] ?? 0;
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`category-pill whitespace-nowrap px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-on-primary shadow-sm font-medium"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium"
                    }`}
                  >
                    {cat.label}{" "}
                    <span
                      className={`font-normal ml-1 ${
                        isActive ? "opacity-80" : "text-outline"
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Skeleton Grid */}
          {loading ? (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-4 text-sm text-[#68736D]">
                <Loader2 className="w-4 h-4 animate-spin text-[#173B2A]" />
                <span>Loading your curated archive...</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-sm md:gap-space-md">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm animate-pulse flex flex-col"
                  >
                    <div className="aspect-[4/5] w-full bg-[#EAE8E2]" />
                    <div className="p-space-sm md:p-space-md space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-3 bg-[#EAE8E2] rounded w-1/2" />
                        <div className="h-4 bg-[#EAE8E2] rounded w-3/4" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-3 bg-[#EAE8E2] rounded w-1/3" />
                        <div className="h-3 bg-[#EAE8E2] rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <section className="mt-4 rounded-2xl bg-white px-6 py-16 text-center shadow-sm border border-outline-variant/30">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-[#17231D]">
                We couldn&apos;t load your wardrobe
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
            </section>
          ) : filteredItems.length === 0 ? (
            /* Empty State */
            <div
              className="flex flex-col items-center justify-center text-center py-space-xl px-space-md bg-surface-container-lowest rounded-xl my-space-sm shadow-sm border border-outline-variant/20"
              id="empty-state"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-space-md">
                {items.length === 0 ? (
                  <Shirt className="w-8 h-8 text-secondary" />
                ) : (
                  <SearchX className="w-8 h-8 text-outline" />
                )}
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-medium">
                {items.length === 0
                  ? "Your wardrobe is empty"
                  : "No garments match your filter"}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1 mb-space-lg">
                {items.length === 0
                  ? "Start by adding a few clothes you already own. Wardrobe AI will catalog them and recommend weather-smart outfits."
                  : `Try searching with broader terms or clear your search to view all ${items.length} garments.`}
              </p>
              {items.length === 0 ? (
                <Link
                  href="/wardrobe/add"
                  className="px-space-lg py-2.5 bg-primary text-on-primary font-title-md text-title-md rounded-lg shadow-sm hover:bg-primary-container transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add your first piece</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="px-space-lg py-2.5 bg-primary text-on-primary font-title-md text-title-md rounded-lg shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
                  id="reset-filter-btn"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            /* Garment Responsive Grid */
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-sm md:gap-space-md"
              id="wardrobe-grid"
            >
              {filteredItems.map((item) => {
                const colorHex = getColorHex(item.color);
                return (
                  <div
                    key={item.id}
                    className="wardrobe-card group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-outline-variant/15"
                    data-cat={item.category}
                    data-color={item.color}
                    data-title={item.name}
                  >
                    {/* Garment Image Container */}
                    <div className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={item.name}
                        src={item.imageUrl}
                        loading="lazy"
                      />
                      {/* Top Category Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-primary font-label-caps text-label-caps uppercase tracking-wider font-semibold shadow-xs">
                          {item.subcategory || item.category}
                        </span>
                      </div>

                      {/* Card Action Overlay Buttons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={() => openStylist(item.id)}
                          className="w-8 h-8 rounded-full bg-surface/90 hover:bg-surface text-secondary flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                          title="Style an outfit around this piece"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="w-8 h-8 rounded-full bg-surface/90 hover:bg-surface text-primary flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                          title="Edit clothing"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="w-8 h-8 rounded-full bg-surface/90 hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                          title="Delete clothing"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-space-sm md:p-space-md flex flex-col flex-1 justify-between gap-space-xs">
                      <div>
                        <div className="flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps mb-1">
                          <span className="uppercase tracking-wider">
                            {item.subcategory || item.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: colorHex }}
                            />
                            <span className="capitalize">{item.color}</span>
                          </span>
                        </div>
                        <h3 className="font-title-md text-title-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {/* Meta Footer Row */}
                      <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-body-sm text-body-sm border-t border-outline-variant/20 mt-1">
                        <span className="flex items-center gap-1 text-secondary font-medium">
                          {item.category === "tops" ? (
                            <Sun className="w-3.5 h-3.5" />
                          ) : item.category === "bottoms" ? (
                            <Briefcase className="w-3.5 h-3.5" />
                          ) : item.category === "shoes" ? (
                            <Footprints className="w-3.5 h-3.5" />
                          ) : item.category === "traditional" ? (
                            <Sparkles className="w-3.5 h-3.5" />
                          ) : item.category === "accessories" ? (
                            <Watch className="w-3.5 h-3.5" />
                          ) : (
                            <CloudSun className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">
                            {item.style || "Versatile"}
                          </span>
                        </span>

                        <span className="text-outline text-xs capitalize">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Clothing Modal Dialog */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-inverse-surface/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-clothing-title"
            className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl sm:p-8 border border-outline-variant/30"
          >
            <div className="flex items-start justify-between gap-4 pb-2 border-b border-outline-variant/20">
              <div>
                <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-widest">
                  Update Collection
                </span>
                <h2
                  id="edit-clothing-title"
                  className="font-headline-sm text-headline-sm text-primary font-medium mt-1"
                >
                  Edit Garment Details
                </h2>
                <p className="mt-1 text-sm text-[#68736D]">
                  Correct attributes identified by AI. Your photo stays the
                  same.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                aria-label="Close edit form"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1.5 block text-sm font-medium text-[#17231D]"
                >
                  Garment Name *
                </label>
                <input
                  id="edit-name"
                  required
                  maxLength={100}
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-category"
                    className="mb-1.5 block text-sm font-medium text-[#17231D]"
                  >
                    Category *
                  </label>
                  <select
                    id="edit-category"
                    required
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-colors"
                  >
                    {clothingCategories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-subcategory"
                    className="mb-1.5 block text-sm font-medium text-[#17231D]"
                  >
                    Subcategory / Fabric
                  </label>
                  <input
                    id="edit-subcategory"
                    maxLength={80}
                    value={editForm.subcategory}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subcategory: e.target.value })
                    }
                    placeholder="e.g. Linen, Polo, Denim"
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-color"
                    className="mb-1.5 block text-sm font-medium text-[#17231D]"
                  >
                    Main Colour *
                  </label>
                  <input
                    id="edit-color"
                    required
                    maxLength={60}
                    value={editForm.color}
                    onChange={(e) =>
                      setEditForm({ ...editForm, color: e.target.value })
                    }
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-style"
                    className="mb-1.5 block text-sm font-medium text-[#17231D]"
                  >
                    Style / Occasion
                  </label>
                  <input
                    id="edit-style"
                    maxLength={80}
                    value={editForm.style}
                    onChange={(e) =>
                      setEditForm({ ...editForm, style: e.target.value })
                    }
                    placeholder="e.g. Casual, Formal, Traditional"
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm outline-none focus:bg-white focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {actionError && (
                <p role="alert" className="text-sm text-red-700">
                  {actionError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row justify-end">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface font-title-md text-title-md hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-title-md text-title-md shadow-md hover:bg-primary-container transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* AI Outfit Recommender Modal */}
      <OutfitRecommenderModal
        isOpen={stylistOpen}
        onClose={() => {
          setStylistOpen(false);
          setStylistAnchorItem(undefined);
        }}
        wardrobeItems={items}
        preselectedAnchorItemId={stylistAnchorItem}
      />
    </main>
  );
}
