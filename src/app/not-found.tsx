import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#fbf9f5] text-[#183325] relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-gradient-to-tr from-[#183325]/10 via-[#c15c3d]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto text-center flex flex-col items-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#eae6df] shadow-xs mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#c15c3d]" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#183325]">
            404 · Page Not Found
          </span>
        </div>

        {/* Large stylized 404 number */}
        <div className="font-editorial text-7xl sm:text-8xl font-bold tracking-tight text-[#183325] leading-none mb-2">
          404
        </div>

        {/* Headline */}
        <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#183325] tracking-tight mb-3">
          Lost in the collection
        </h1>

        {/* Description */}
        <p className="text-sm text-[#183325]/70 max-w-sm mb-8 leading-relaxed">
          The piece or page you are looking for does not exist, has been moved, or is no longer accessible.
        </p>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/wardrobe"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#183325] text-white text-xs font-semibold hover:bg-[#234a36] transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Wardrobe</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#eae6df] text-[#183325] text-xs font-semibold hover:bg-[#faf8f5] transition shadow-xs cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#183325]/70" />
            <span>Go to Home</span>
          </Link>
        </div>

        {/* Brand footer watermark */}
        <div className="mt-14 text-xs font-mono text-[#183325]/40 tracking-wider">
          Wardrobe AI · Lagos, Nigeria
        </div>
      </div>
    </main>
  );
}

