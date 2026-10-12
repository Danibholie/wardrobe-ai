export default function WardrobeLoading() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Back link skeleton */}
        <div className="mb-4">
          <div className="h-4 w-28 bg-[#E8E6E0] rounded-md animate-pulse" />
        </div>

        {/* Top Header skeleton */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[#E8E6E0] rounded animate-pulse" />
            <div className="h-8 w-48 bg-[#E8E6E0] rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-[#E8E6E0] rounded animate-pulse" />
          </div>

          <div className="h-11 w-36 bg-[#E8E6E0] rounded-full animate-pulse self-start" />
        </div>

        {/* Categories Bar skeleton */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-[#E8E6E0] rounded-full flex-shrink-0 animate-pulse"
            />
          ))}
        </div>

        {/* Clothing Items Grid Skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 animate-pulse"
            >
              <div className="aspect-[4/5] w-full bg-[#EAE8E2]" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-[#EAE8E2] rounded-md w-3/4" />
                <div className="h-3 bg-[#EAE8E2] rounded-md w-1/2" />
                <div className="h-3 bg-[#EAE8E2] rounded-md w-1/3" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 bg-[#EAE8E2] rounded-full flex-1" />
                  <div className="h-8 bg-[#EAE8E2] rounded-full flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
