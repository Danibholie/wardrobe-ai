import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";

const siteUrl = "https://lbd-wardrobe-ai.netlify.app";
const ogImageUrl = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  title: "Wardrobe AI · Stop Wondering What to Wear",
  description:
    "Your wardrobe already has the answer. Intelligent outfit curation strictly from clothes you own, tailored for Lagos weather and occasions.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Wardrobe AI",
    title: "Wardrobe AI · Stop Wondering What to Wear",
    description:
      "Your wardrobe already has the answer. Intelligent outfit curation strictly from clothes you own, tailored for Lagos weather and occasions.",
    images: [
      {
        url: "/og-image.png",
        secureUrl: ogImageUrl,
        width: 1672,
        height: 941,
        alt: "Wardrobe AI · Your wardrobe. Smarter.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wardrobe AI · Stop Wondering What to Wear",
    description:
      "Your wardrobe already has the answer. Intelligent outfit curation strictly from clothes you own, tailored for Lagos weather and occasions.",
    images: [
      {
        url: "/og-image.png",
        width: 1672,
        height: 941,
        alt: "Wardrobe AI · Your wardrobe. Smarter.",
      },
    ],
  },
};

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/home");
  }

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-margin-mobile md:p-margin relative">
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
              <h1 className="font-body-md text-display-hero-mobile md:text-display-hero text-on-surface tracking-tight leading-tight">
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
            <div className="absolute inset-0 bg-linear-to-tr from-surface-container via-surface-container-low to-surface-variant/30 rounded-xl blur-xl -z-10 opacity-70"></div>
            <div className="flex justify-center p-space-sm md:p-space-md bg-surface-container-lowest/80 rounded-xl shadow-md backdrop-blur-sm">
              {/* Main Highlight Outfit Card */}
              <div className="max-w-2xl w-full relative group overflow-hidden rounded-xl bg-surface-container-low shadow-xs">
                <div className="aspect-4/3 md:aspect-16/10 w-full overflow-hidden relative">
                  <Image
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt="Wardrobe AI mobile app interface mockup showing intelligent outfit curation for Lagos 31°C weather with digital wardrobe pieces and smart styling recommendations."
                    src="/hero-app-preview.jpg"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-space-md md:p-space-lg text-on-primary">
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
              <Link
                href="/signin?callbackUrl=/home"
                className="w-full sm:w-72 h-12 px-space-xl bg-primary text-on-primary font-title-md text-title-md rounded-xl shadow-md transition-all duration-300 hover:bg-primary-container hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
                id="btn-onboard"
              >
                <span>Build my wardrobe</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="pt-1">
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                href="/signin?callbackUrl=/home"
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
                <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                <p className="font-body-sm text-body-sm">
                  Designed for weather, occasions, and everyday life in Nigeria.
                </p>
              </div>
              <div className="pt-space-md w-full flex flex-col items-center gap-2 font-body-sm text-body-sm">
                <div className="text-label-sm text-on-surface-variant">
                  © {new Date().getFullYear()} Wardrobe AI. All rights reserved.
                </div>
                <div className="text-label-sm text-on-surface-variant">
                  A product by LBD Digital Hub
                </div>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
