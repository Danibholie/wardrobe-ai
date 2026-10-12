export default function SignInLoading() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-margin-mobile md:p-margin relative overflow-hidden bg-background">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Back link skeleton */}
        <div className="w-full flex items-center justify-between mb-6 px-1">
          <div className="h-4 w-28 bg-[#E8E6E0] rounded-md animate-pulse" />
        </div>

        {/* Card skeleton */}
        <div className="w-full bg-surface-container-lowest/90 rounded-2xl md:rounded-3xl shadow-lg border border-outline-variant/30 backdrop-blur-md p-8 sm:p-10 flex flex-col items-center text-center animate-pulse">
          <div className="h-7 w-36 bg-[#E8E6E0] rounded-md mb-3" />
          <div className="h-6 w-32 bg-[#E8E6E0] rounded-full mb-6" />

          <div className="h-8 w-64 bg-[#E8E6E0] rounded-lg mb-3" />
          <div className="h-4 w-full bg-[#E8E6E0] rounded mb-2" />
          <div className="h-4 w-4/5 bg-[#E8E6E0] rounded mb-8" />

          {/* Button skeleton */}
          <div className="w-full h-12 bg-[#E8E6E0] rounded-xl mb-8" />

          {/* Highlights skeleton */}
          <div className="w-full space-y-3 pt-6 border-t border-outline-variant/30">
            <div className="h-4 w-3/4 bg-[#E8E6E0] rounded" />
            <div className="h-4 w-4/5 bg-[#E8E6E0] rounded" />
            <div className="h-4 w-2/3 bg-[#E8E6E0] rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
