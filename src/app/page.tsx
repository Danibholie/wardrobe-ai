"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOnboard = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/wardrobe");
    }, 900);
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-margin-mobile md:p-margin">
      <div className="flex flex-col w-full my-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          {/* Top Editorial Header & Badge */}
          <header className="flex flex-col items-center text-center space-y-space-md mb-space-lg">
            <div className="font-display-hero text-headline-md tracking-tight text-primary mb-1">
              Wardrobe AI
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high text-primary shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Your wardrobe. Your weather. Your day.
              </span>
            </div>
            <div className="space-y-space-xs max-w-2xl px-space-md">
              <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface tracking-tight leading-tight">
                Stop wondering what to wear.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-light max-w-lg mx-auto">
                Your wardrobe already has the answer. Let AI help you find it.
              </p>
            </div>
          </header>

          {/* Centerpiece Editorial Visual Montage */}
          <section className="w-full relative my-space-sm px-space-xs">
            {/* Soft ambient backdrop light */}
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container via-surface-container-low to-surface-variant/30 rounded-xl blur-xl -z-10 opacity-70"></div>
            <div className="flex justify-center p-space-sm md:p-space-md bg-surface-container-lowest/80 rounded-xl shadow-md backdrop-blur-sm">
              {/* Main Highlight Outfit Card */}
              <div className="max-w-2xl w-full relative group overflow-hidden rounded-xl bg-surface-container-low shadow-xs">
                <div className="aspect-[4/3] md:aspect-[16/10] w-full overflow-hidden relative">
                  <Image
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt="Editorial flat-lay styling on raw unbleached linen fabric background. Featuring an immaculately pressed crisp white cotton polo, olive tailored trousers, minimalist tan leather wrist watch with brass buckle, and clean off-white minimalist leather sneakers. Natural warm afternoon sunlight casting soft elegant shadows, luxury fashion magazine styling in forest olive and warm sand tones."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyTyR7C-4zaUSuvXIzIq7SvTiDxS0KjoxzQjadYn6XMPksZO-_qdyWdbR3pgs6VpRdAFl7Gl-ZVcRBSMKVT1s7DiMShn8TpuKwkIZWQBUhvn2nmupycaNcJaZdxP-SWQc1DnIOGJSkk19rd5xjY02xstr8vvgUJm3AxrpyqZRnW7Fkaxhcp0EmYzx5iBrnErpokFxvKwAh6W2icEoI0Dqgq7bDzTjA9YlNpx2NE6XWwGRghmSbyS3n"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-space-md md:p-space-lg text-on-primary">
                    <span className="font-label-caps text-label-caps uppercase tracking-wider text-surface-variant opacity-90 mb-1">
                      Curated For Lagos Island · 31°C
                    </span>
                    <p className="font-headline-sm text-headline-sm text-on-primary">
                      Breathable Linen &amp; Tailored Separates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Actions & Onboarding Entry Point */}
          <section className="w-full flex flex-col items-center text-center mt-space-lg space-y-space-md">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-space-sm justify-center">
              <button
                className="w-full sm:w-72 h-12 px-space-xl bg-primary text-on-primary font-title-md text-title-md rounded-xl shadow-md transition-all duration-300 hover:bg-primary-container hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-90"
                id="btn-onboard"
                onClick={handleOnboard}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">
                      progress_activity
                    </span>
                    <span>Preparing wardrobe canvas...</span>
                  </>
                ) : (
                  <>
                    <span>Build my wardrobe</span>
                    <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
            <div className="pt-1">
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                href="/signin"
              >
                <span>Already have an account?</span>
                <span className="text-secondary font-semibold group-hover:underline underline-offset-4">
                  Sign in
                </span>
              </Link>
            </div>
            {/* Trust & Cultural Context Microcopy */}
            <footer className="pt-space-md max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 text-on-surface-variant/80">
                <span className="material-symbols-outlined text-sm text-secondary">
                  verified_user
                </span>
                <p className="font-body-sm text-body-sm">
                  Designed for Lagos weather, occasions, and everyday life in
                  Nigeria.
                </p>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
