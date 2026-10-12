"use client";

import { useEffect, useState } from "react";

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
  { label: "Dresses", value: "dresses" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Shoes", value: "shoes" },
  { label: "Accessories", value: "accessories" },
  { label: "Traditional", value: "traditional" },
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

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [editForm, setEditForm] = useState<ClothingForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

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
        headers: {
          "Content-Type": "application/json",
        },
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

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingItem.id ? updatedItem : item,
        ),
      );

      setEditingItem(null);
      setSuccessMessage("Clothing details updated successfully.");
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

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      );

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
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[#315343]">
              Your collection
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#17231D]">
              My Wardrobe
            </h1>

            <p className="mt-2 text-sm text-[#68736D]">
              Add the clothes you own and we&apos;ll help you put them together.
            </p>
          </div>

          <a
            href="/wardrobe/add"
            className="self-start rounded-full bg-[#173B2A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24543D]"
          >
            + Add clothing
          </a>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-[#C8DCCB] bg-[#EDF4EC] px-4 py-3 text-sm text-[#24543D]"
          >
            {successMessage}
          </div>
        )}

        {actionError && !editingItem && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                activeCategory === category.value
                  ? "bg-[#173B2A] text-white"
                  : "bg-white text-[#68736D] ring-1 ring-black/5 hover:text-[#173B2A]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <section className="mt-8 rounded-3xl bg-white px-6 py-20 text-center shadow-sm">
            <p className="text-sm text-[#68736D]">Loading your wardrobe...</p>
          </section>
        ) : error ? (
          <section className="mt-8 rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#17231D]">
              We couldn&apos;t load your wardrobe
            </h2>

            <p className="mt-3 text-sm text-red-700">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-[#173B2A] px-5 py-3 text-sm text-white"
            >
              Try again
            </button>
          </section>
        ) : filteredItems.length === 0 ? (
          <section className="mt-8 flex min-h-80 items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
            <div className="max-w-md">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF1EC] text-3xl">
                👕
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-[#17231D]">
                {items.length === 0
                  ? "Your wardrobe is empty"
                  : "No items in this category"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#68736D]">
                {items.length === 0
                  ? "Start by adding a few clothes you already own. Wardrobe AI can then use those items to suggest outfits."
                  : "Try another category or add more clothes to your collection."}
              </p>

              {items.length === 0 && (
                <a
                  href="/wardrobe/add"
                  className="mt-7 inline-flex rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24543D]"
                >
                  Add your first item
                </a>
              )}
            </div>
          </section>
        ) : (
          <>
            <p className="mt-6 text-sm text-[#68736D]">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex aspect-[4/5] items-center justify-center bg-[#EEECE6]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <h2 className="font-semibold text-[#17231D]">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm capitalize text-[#68736D]">
                      {[item.color, item.subcategory || item.category]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    {item.style && (
                      <p className="mt-2 text-xs capitalize text-[#315343]">
                        {item.style}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className="flex-1 rounded-full border border-[#D8DED8] px-3 py-2 text-sm font-medium text-[#173B2A] transition hover:bg-[#EEF1EC]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="flex-1 rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-clothing-title"
            className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#F7F5F0] p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#315343]">
                  Update your collection
                </p>
                <h2
                  id="edit-clothing-title"
                  className="mt-1 text-2xl font-semibold text-[#17231D]"
                >
                  Edit clothing
                </h2>
                <p className="mt-2 text-sm text-[#68736D]">
                  Correct any details that need changing. Your photo will stay
                  the same.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                aria-label="Close edit form"
                className="rounded-full px-3 py-2 text-xl text-[#68736D] hover:bg-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1.5 block text-sm font-medium text-[#17231D]"
                >
                  Clothing name *
                </label>
                <input
                  id="edit-name"
                  required
                  maxLength={100}
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm({ ...editForm, name: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8DED8] bg-white px-4 py-3 text-sm outline-none focus:border-[#315343]"
                />
              </div>

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
                  onChange={(event) =>
                    setEditForm({ ...editForm, category: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8DED8] bg-white px-4 py-3 text-sm outline-none focus:border-[#315343]"
                >
                  {clothingCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-subcategory"
                  className="mb-1.5 block text-sm font-medium text-[#17231D]"
                >
                  Subcategory
                </label>
                <input
                  id="edit-subcategory"
                  maxLength={80}
                  value={editForm.subcategory}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      subcategory: event.target.value,
                    })
                  }
                  placeholder="e.g. T-shirt, jeans, sneakers"
                  className="w-full rounded-xl border border-[#D8DED8] bg-white px-4 py-3 text-sm outline-none focus:border-[#315343]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-color"
                  className="mb-1.5 block text-sm font-medium text-[#17231D]"
                >
                  Main color *
                </label>
                <input
                  id="edit-color"
                  required
                  maxLength={60}
                  value={editForm.color}
                  onChange={(event) =>
                    setEditForm({ ...editForm, color: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8DED8] bg-white px-4 py-3 text-sm outline-none focus:border-[#315343]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-style"
                  className="mb-1.5 block text-sm font-medium text-[#17231D]"
                >
                  Style
                </label>
                <input
                  id="edit-style"
                  maxLength={80}
                  value={editForm.style}
                  onChange={(event) =>
                    setEditForm({ ...editForm, style: event.target.value })
                  }
                  placeholder="e.g. casual, formal, streetwear"
                  className="w-full rounded-xl border border-[#D8DED8] bg-white px-4 py-3 text-sm outline-none focus:border-[#315343]"
                />
              </div>

              {actionError && (
                <p role="alert" className="text-sm text-red-700">
                  {actionError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="flex-1 rounded-full border border-[#D8DED8] bg-white px-5 py-3 text-sm font-medium text-[#173B2A] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-[#173B2A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24543D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
