export default function HomeLoading() {
  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="flex flex-col w-full space-y-space-xl">
          {/* Greeting skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-[#EAE8E2] rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-[#EAE8E2] rounded animate-pulse" />
            </div>
            <div className="h-5 w-44 bg-[#EAE8E2] rounded animate-pulse" />
          </div>

          {/* Curated Planner Card skeleton */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm border border-outline-variant/20 space-y-4">
            <div className="h-4 w-36 bg-[#EAE8E2] rounded animate-pulse" />
            <div className="h-7 w-80 bg-[#EAE8E2] rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-[#EAE8E2] rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-20 bg-[#EAE8E2] rounded-full animate-pulse"
                />
              ))}
            </div>
            <div className="h-12 w-48 bg-[#EAE8E2] rounded-lg animate-pulse pt-2" />
          </div>

          {/* Wardrobe Preview skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-[#EAE8E2] rounded animate-pulse" />
              <div className="h-4 w-28 bg-[#EAE8E2] rounded animate-pulse" />
            </div>
            <div className="flex gap-space-md overflow-x-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-48 p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-3 shrink-0"
                >
                  <div className="aspect-square bg-[#EAE8E2] rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-[#EAE8E2] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#EAE8E2] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
