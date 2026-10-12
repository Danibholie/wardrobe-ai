export default function AddClothingLoading() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back link skeleton */}
        <div className="h-4 w-36 bg-[#E8E6E0] rounded-md animate-pulse" />

        {/* Header skeleton */}
        <div className="mt-8 space-y-2.5">
          <div className="h-4 w-28 bg-[#E8E6E0] rounded animate-pulse" />
          <div className="h-8 w-44 bg-[#E8E6E0] rounded-lg animate-pulse" />
          <div className="h-4 w-full max-w-md bg-[#E8E6E0] rounded animate-pulse" />
        </div>

        {/* Upload dropzone skeleton */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 animate-pulse">
          <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8DDD8] px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-[#EEF1EC] mb-4" />
            <div className="h-5 w-48 bg-[#EEF1EC] rounded mb-2" />
            <div className="h-4 w-64 bg-[#EEF1EC] rounded mb-6" />
            <div className="h-11 w-36 bg-[#EEF1EC] rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
