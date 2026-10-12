export default function WardrobeLoading() {
  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        {/* Climate Intelligence Bar skeleton */}
        <div className="w-full bg-[#EAE8E2] h-12 rounded-xl mb-space-lg animate-pulse" />

        {/* Top Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#EAE8E2] rounded animate-pulse" />
            <div className="h-9 w-52 bg-[#EAE8E2] rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-[#EAE8E2] rounded animate-pulse" />
          </div>

          <div className="h-11 w-36 bg-[#EAE8E2] rounded-lg animate-pulse self-start" />
        </div>

        {/* Search & Category Pills Bar skeleton */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg space-y-4">
          <div className="h-12 bg-[#EAE8E2] rounded-lg animate-pulse w-full" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 bg-[#EAE8E2] rounded-full flex-shrink-0 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Guidance banner skeleton */}
        <div className="h-28 w-full bg-[#EAE8E2] rounded-xl mb-space-xl animate-pulse" />

        {/* Clothing Items Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-sm md:gap-space-md">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
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
    </main>
  );
}
