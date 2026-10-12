export default function SavedOutfitsLoading() {
  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#EAE8E2] rounded animate-pulse" />
            <div className="h-9 w-60 bg-[#EAE8E2] rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-[#EAE8E2] rounded animate-pulse" />
          </div>
          <div className="h-11 w-44 bg-[#EAE8E2] rounded-lg animate-pulse self-start" />
        </div>

        {/* Saved Outfits Card Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/20 animate-pulse flex flex-col space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-3/4">
                  <div className="h-5 bg-[#EAE8E2] rounded w-2/3" />
                  <div className="h-3 bg-[#EAE8E2] rounded w-full" />
                </div>
                <div className="h-8 w-8 rounded-full bg-[#EAE8E2]" />
              </div>

              {/* Garment row thumbnails */}
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-[3/4] bg-[#EAE8E2] rounded-lg" />
                <div className="aspect-[3/4] bg-[#EAE8E2] rounded-lg" />
                <div className="aspect-[3/4] bg-[#EAE8E2] rounded-lg" />
              </div>

              <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                <div className="h-3 bg-[#EAE8E2] rounded w-1/2" />
                <div className="h-3 bg-[#EAE8E2] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
