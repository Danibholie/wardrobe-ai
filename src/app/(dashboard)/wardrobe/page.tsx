export default function WardrobePage() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
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
            className="rounded-full bg-[#173B2A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24543D]"
          >
            + Add clothing
          </a>
        </div>

        {/* Categories */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {["All", "Tops", "Bottoms", "Shoes", "Accessories"].map(
            (category, index) => (
              <button
                key={category}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium ${
                  index === 0
                    ? "bg-[#173B2A] text-white"
                    : "bg-white text-[#68736D] ring-1 ring-black/5"
                }`}
              >
                {category}
              </button>
            ),
          )}
        </div>

        {/* Empty state */}
        <section className="mt-8 flex min-h-105 items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
          <div className="max-w-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF1EC] text-3xl">
              👕
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-[#17231D]">
              Your wardrobe is empty
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#68736D]">
              Start by adding a few clothes you already own. Once they&apos;re
              here, Wardrobe AI can use them to create outfits for you.
            </p>

            <a
              href="/wardrobe/add"
              className="mt-7 inline-flex rounded-full bg-[#173B2A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24543D]"
            >
              Add your first item
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
