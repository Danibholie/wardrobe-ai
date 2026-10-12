export default function PlanLoading() {
  return (
    <main className="w-full pt-20 pb-20 md:pb-12 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-md">
        <div className="max-w-2xl mx-auto w-full py-space-sm sm:py-space-md space-y-space-lg">
          {/* Header skeleton */}
          <div className="text-center space-y-3">
            <div className="h-7 w-64 bg-[#EAE8E2] rounded-full mx-auto animate-pulse" />
            <div className="h-10 w-80 bg-[#EAE8E2] rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-96 bg-[#EAE8E2] rounded mx-auto animate-pulse" />
          </div>

          {/* Form card skeleton */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-outline-variant/20 space-y-6">
            <div className="space-y-3">
              <div className="h-5 w-28 bg-[#EAE8E2] rounded animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-20 bg-[#EAE8E2] rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-5 w-20 bg-[#EAE8E2] rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 bg-[#EAE8E2] rounded-lg animate-pulse" />
                  <div className="h-14 bg-[#EAE8E2] rounded-lg animate-pulse" />
                  <div className="h-14 bg-[#EAE8E2] rounded-lg animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-5 w-32 bg-[#EAE8E2] rounded animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-24 bg-[#EAE8E2] rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="h-24 bg-[#EAE8E2] rounded-lg animate-pulse" />
            <div className="h-12 bg-[#EAE8E2] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
