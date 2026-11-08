"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SocialLinks } from "@/components/SocialLinks";

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "What exactly is Wardrobe AI?",
    answer:
      "Wardrobe AI is an intelligent digital wardrobe assistant that catalogues the clothes you already own. Powered by Google Gemini, it curates cohesive outfit combinations each morning adapted to your real-time local weather, occasion, and personal style.",
  },
  {
    question: "How does Wardrobe AI recommend outfits?",
    answer:
      "Gemini AI analyzes color harmony, formality codes, garment types, and your live local temperature and humidity. It selects strictly from your uploaded clothes to generate practical, stylish combinations with custom styling tips and rationales.",
  },
  {
    question: "Does Wardrobe AI recommend clothes I don't own?",
    answer:
      "No! The outfit engine is strictly locked to your personal wardrobe collection. It never fabricates clothes you do not own and never suggests external shopping. Every ensemble is styled 100% from your catalogued pieces.",
  },
  {
    question: "How do I add clothes to my digital wardrobe?",
    answer:
      "You can snap a photo directly using your phone's live camera or upload an existing image. Gemini AI automatically verifies that it is a genuine wearable garment, auto-detects the item name, category (Tops, Bottoms, Shoes, Outerwear, Traditional, Dresses, Accessories), color, and style.",
  },
  {
    question: "What happens if I accidentally upload a non-clothing image?",
    answer:
      "Wardrobe AI includes smart item verification. If an uploaded image contains furniture, food, pets, or electronics, the AI politely detects the object and declines cataloguing it, keeping your wardrobe clean and organized.",
  },
  {
    question: "Does Wardrobe AI consider my location and weather?",
    answer:
      "Yes. The app automatically syncs live temperature, humidity, and rainfall conditions using real-time weather data for cities across Nigeria (Lagos Island, Ikeja Mainland, Abuja, Port Harcourt, and more) as well as global locations.",
  },
  {
    question:
      "Can I use Wardrobe AI for work, casual outings, and special occasions?",
    answer:
      "Yes. You can select specific occasions including Corporate Work, School, Sunday Church, Dinner Dates, Owambe Weddings, Casual Hangouts, and Errands, complete with time of day (Morning, Afternoon, Evening) and venue details.",
  },
  {
    question: "What is 'Style Around This' (Anchor Item)?",
    answer:
      "If there is a particular piece you know you want to wear today—such as your favorite linen shirt, new trousers, or traditional senator wear—you can pick it as your anchor piece. The AI will curate a complete matching look around that specific item.",
  },
  {
    question: "Is Wardrobe AI free to use?",
    answer:
      "Yes! Our Starter Wardrobe plan is completely free. It covers up to 15–20 wardrobe items, 3 AI outfit generations per week (or 1 daily), up to 5 saved outfits, and standard daily occasion support.",
  },
  {
    question: "What extra features do I get with Wardrobe Pro?",
    answer:
      "Wardrobe Pro (₦1,500 / month) unlocks unlimited wardrobe items, unlimited daily outfit generations, full-wardrobe styling, special event styling (Owambe, Weddings, Interviews), priority reasoning via Gemini 3.8 Flash, and unlimited saved looks with outfit wear counters.",
  },
  {
    question: "Are my wardrobe photos private?",
    answer:
      "Yes, completely. Your wardrobe photos and outfit records are encrypted, privately stored, and strictly tied to your account. They are never shared publicly or used to train third-party public datasets.",
  },
  {
    question: "Can I use Wardrobe AI on my phone?",
    answer:
      "Yes! Wardrobe AI is built as a fast, responsive progressive web application that runs smoothly on Safari, Chrome, and all iOS and Android devices, with direct live camera integration.",
  },
];

interface ComparisonRow {
  feature: string;
  starter: string;
  pro: string;
}

const comparisonTable: ComparisonRow[] = [
  {
    feature: "Target User",
    starter: "Casual users trying the app, building habit",
    pro: "Fashion-conscious users, daily outfit planning",
  },
  {
    feature: "Wardrobe Item Limit",
    starter: "Up to 15 – 20 items",
    pro: "Unlimited items",
  },
  {
    feature: "AI Outfit Recommendations",
    starter: "1 Outfit Recommendation per day",
    pro: "Unlimited Outfit Recommendations",
  },
  {
    feature: "Occasion Support",
    starter: "Standard daily occasions (Casual, Work)",
    pro: "All occasions + Event Styling (Weddings, Owambe, Dates, Interviews)",
  },
  {
    feature: "AI Model & Intelligence",
    starter: "Gemini 3.8 Flash multimodal reasoning",
    pro: "Gemini 3.8 Flash with unlimited priority runs",
  },
  {
    feature: "Wardrobe Scope",
    starter: "Top 20 active items",
    pro: "Full wardrobe cataloguing & styling",
  },
  {
    feature: "Saved Outfits",
    starter: "Up to 5 saved outfits",
    pro: "Unlimited saved outfits + Outfit History & wear counter",
  },
  {
    feature: "Real-Time Weather",
    starter: "Standard local weather sync",
    pro: "Hyper-local weather adaptation (heat index, humidity & rainfall)",
  },
];

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-ivory-100 text-stone-800 font-sans antialiased selection:bg-forest selection:text-white min-h-screen">
      {/* BEGIN: Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-ivory-100/90 backdrop-blur-md border-b border-ivory-300/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link className="flex items-center gap-2.5 group" href="/">
            <span className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/wardrobe-ai-logo.webp"
                alt="Wardrobe AI Logo"
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </span>
            <span className="font-editorial text-2xl md:text-3xl font-bold tracking-tight text-forest">
              Wardrobe AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a
              className="hover:text-forest transition-colors"
              href="#how-it-works"
            >
              How It Works
            </a>
            <a className="hover:text-forest transition-colors" href="#features">
              Features
            </a>
            <a className="hover:text-forest transition-colors" href="#demo">
              Experience
            </a>
            <a className="hover:text-forest transition-colors" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-forest transition-colors" href="#faqs">
              FAQs
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              className="hidden sm:inline-flex text-sm font-semibold text-forest hover:opacity-80 transition-opacity"
              href="/signin?callbackUrl=/home"
            >
              Sign In
            </Link>
            <Link
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-forest text-white hover:bg-forest-dark transition-all shadow-sm hover:shadow"
              href="/signin?callbackUrl=/home"
            >
              Get Started Free
            </Link>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 focus:outline-none"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-ivory-100 border-b border-ivory-300 px-4 pt-2 pb-6 space-y-3">
            <a
              className="block py-2 text-base font-medium text-stone-700 hover:text-forest"
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              className="block py-2 text-base font-medium text-stone-700 hover:text-forest"
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              className="block py-2 text-base font-medium text-stone-700 hover:text-forest"
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
            >
              Experience
            </a>
            <a
              className="block py-2 text-base font-medium text-stone-700 hover:text-forest"
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              className="block py-2 text-base font-medium text-stone-700 hover:text-forest"
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQs
            </a>
            <div className="pt-2 border-t border-ivory-300 flex flex-col gap-2">
              <Link
                className="py-2 text-base font-semibold text-forest"
                href="/signin?callbackUrl=/home"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>
      {/* END: Sticky Navigation */}

      <main>
        {/* BEGIN: Hero Section */}
        <section
          className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-ivory-100"
          data-purpose="hero-section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ivory-200 border border-ivory-300/80 text-xs font-semibold tracking-wider text-stone-700 uppercase mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-terracotta"></span>
              Your wardrobe. Your weather. Your day.
            </div>

            {/* Main Heading */}
            <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 tracking-tight leading-[1.08] max-w-4xl mx-auto">
              Stop wondering what to wear.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Your wardrobe already has the answer. Let AI help you find it.
              Discover personalized outfit recommendations based on the clothes
              you already own, your local weather, and today’s occasion.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-forest text-white text-base font-semibold hover:bg-forest-dark transition-all shadow-md hover:shadow-lg"
                href="/signin?callbackUrl=/home"
              >
                <svg
                  className="w-4 h-4 text-emerald-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Build My Wardrobe
              </Link>
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white border border-ivory-300 text-stone-800 text-base font-medium hover:bg-ivory-50 transition-all"
                href="#how-it-works"
              >
                See How It Works
              </a>
            </div>

            {/* Geographic Context Pill */}
            <p className="mt-5 text-xs sm:text-sm text-stone-500 flex items-center justify-center gap-1.5 font-medium">
              <span>📍</span> Designed for weather, occasions, and everyday life
              in Nigeria.
            </p>

            {/* Hero Showcase Frame */}
            <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-white p-3 sm:p-5 shadow-2xl border border-ivory-300">
              <div className="relative rounded-2xl overflow-hidden shadow-inner bg-stone-900 group">
                <Image
                  alt="Wardrobe AI curated outfit showcase for Lagos Island weather and lifestyle"
                  className="w-full h-auto object-cover max-h-140 mx-auto filter saturate-105"
                  width={1000}
                  height={1000}
                  src="/wardrobeai-page.png"
                />
                {/* Realtime Context Overlay Bar */}
                <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto bg-stone-900/80 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-medium">
                    CURATED FOR LAGOS ISLAND • 31°C SUNNY
                  </span>
                  <span className="text-stone-400 hidden sm:inline">|</span>
                  <span className="text-stone-300 hidden sm:inline">
                    Light breathable linens suggested
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Hero Section */}

        {/* BEGIN: Problem vs Solution */}
        <section
          className="py-20 bg-ivory-200 border-y border-ivory-300/80"
          data-purpose="problem-solution"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900">
                You have clothes. You just need the right combination.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-stone-600">
                Most people wear only 20% of their wardrobe 80% of the time.
                Wardrobe AI unlocks the remaining 80% so you feel confident
                everyday.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-7 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4">
                    ✕
                  </div>
                  <h3 className="font-semibold text-lg text-stone-900 mb-2">
                    Decision Fatigue
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Staring into a full wardrobe every morning for 15 minutes,
                    feeling stressed before your day even starts.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-ivory-200 text-xs font-semibold text-forest">
                  AI Solution: Curated in seconds
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white p-7 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4">
                    ✕
                  </div>
                  <h3 className="font-semibold text-lg text-stone-900 mb-2">
                    Outfit Repetition
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Defaulting to the same two pairs of trousers and safe shirts
                    because pairing new combos feels uncertain.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-ivory-200 text-xs font-semibold text-forest">
                  AI Solution: Fresh unexpected pairings
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white p-7 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4">
                    ✕
                  </div>
                  <h3 className="font-semibold text-lg text-stone-900 mb-2">
                    Closet Blindness
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Forgetting great pieces you already paid good money for
                    because they sit hidden in folded piles.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-ivory-200 text-xs font-semibold text-forest">
                  AI Solution: Complete visual catalog
                </div>
              </div>
              {/* Card 4 */}
              <div className="bg-white p-7 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4">
                    ✕
                  </div>
                  <h3 className="font-semibold text-lg text-stone-900 mb-2">
                    Weather Mismatch
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Leaving home looking sharp only to suffer heavy fabric under
                    Lagos humidity or sudden drizzle.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-ivory-200 text-xs font-semibold text-forest">
                  AI Solution: Live climate &amp; rain sync
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Problem vs Solution */}

        {/* BEGIN: How It Works Section */}
        <section
          className="py-24 bg-ivory-100"
          data-purpose="how-it-works"
          id="how-it-works"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-forest uppercase tracking-widest">
                Effortless Workflow
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-2">
                How Wardrobe AI Styles You
              </h2>
              <p className="mt-3 text-stone-600 text-lg">
                Four simple steps to effortlessly elevated dressing every day.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-soft relative flex flex-col">
                <span className="w-8 h-8 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center mb-4">
                  1
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
                  Snap &amp; Digitize
                </h3>
                <p className="text-stone-600 text-sm mb-6 flex-grow">
                  Take photos with your phone camera or upload images. Gemini AI
                  verifies your garment, auto-detecting category, subcategory,
                  color, and style.
                </p>
                <div className="bg-ivory-100 rounded-xl p-3 border border-ivory-300 text-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span>Detected: Crisp Linen Shirt</span>
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                      Tops · Off-White
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-forest"></div>
                  </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-soft relative flex flex-col">
                <span className="w-8 h-8 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center mb-4">
                  2
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
                  Pick Today&apos;s Plan
                </h3>
                <p className="text-stone-600 text-sm mb-6 flex-grow">
                  Choose your occasion: Work, Church, Date, Owambe Wedding,
                  Hangout, or Errands and time of day. We automatically sync
                  your live local weather.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 text-xs rounded-full bg-forest text-white font-medium">
                    Work
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-full bg-ivory-200 text-stone-700 font-medium">
                    Church
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-full bg-ivory-200 text-stone-700 font-medium">
                    Date
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-full bg-ivory-200 text-stone-700 font-medium">
                    Owambe
                  </span>
                </div>
              </div>
              {/* Step 3 */}
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-soft relative flex flex-col">
                <span className="w-8 h-8 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center mb-4">
                  3
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
                  Gemini Curation
                </h3>
                <p className="text-stone-600 text-sm mb-6 flex-grow">
                  Google Gemini pairs color harmonies, formality rules, and
                  climate suitability strictly using clothes in your closet. No
                  fabricated items.
                </p>
                <div className="bg-ivory-100 p-3 rounded-xl border border-ivory-300 text-xs text-stone-600 flex items-center gap-2">
                  <span className="text-forest text-base font-bold">✨</span>
                  <span>
                    Harmonizing owned pieces for 31°C heat &amp; humidity
                  </span>
                </div>
              </div>
              {/* Step 4 */}
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-soft relative flex flex-col">
                <span className="w-8 h-8 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center mb-4">
                  4
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
                  Wear &amp; Track
                </h3>
                <p className="text-stone-600 text-sm mb-6 flex-grow">
                  Get styled outfit flat-lays with tailored styling tips and
                  climate accommodation notes. Save favorites with wear rotation
                  counters.
                </p>
                <div className="bg-forest text-white text-xs px-3 py-2 rounded-xl text-center font-medium">
                  Complete Blueprint in Seconds
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: How It Works Section */}

        {/* BEGIN: Live Dashboard Preview */}
        <section
          className="py-20 bg-ivory-200/70 border-y border-ivory-300"
          data-purpose="dashboard-preview"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest">
                  Authentic Product UI
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                  Your Daily Morning Command Center
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-stone-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Syncs with real-time temperature &amp; rainfall radar
              </div>
            </div>
            {/* Dashboard Replica Container */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-ivory-300">
              <div className="rounded-2xl overflow-hidden border border-ivory-300 shadow-sm">
                <Image
                  alt="Wardrobe AI Live Dashboard Interface — daily morning outfit command center with real-time weather"
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-cover"
                  src="/wardrobeai-homepage.png"
                />
              </div>
              {/* Feature Annotations under UI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-ivory-200">
                <div className="flex items-start gap-3">
                  <span className="text-xl">☀️</span>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      Weather-Driven Styling
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Adapts outfit breathability automatically to humid rains
                      or dry sunny heat.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      Instant Occasion Filters
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Toggle between Corporate Work, Sunday Service, Owambe,
                      Date Night, or Casual.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">👟</span>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">
                      Zero Added Purchases
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Focuses purely on the shoes, tops, and pants already
                      hanging in your closet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Live Dashboard Preview */}

        {/* BEGIN: First Outfit Journey (Stepper) */}
        <section className="py-20 bg-ivory-100" data-purpose="onboarding-flow">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900">
              Your first outfit is just a few steps away.
            </h2>
            <p className="mt-3 text-stone-600 text-lg">
              From sign-up to styled in under three minutes.
            </p>
            {/* Stepper Visual */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
              <div className="bg-white p-5 rounded-2xl border border-ivory-300">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  Step 01
                </div>
                <h4 className="font-semibold text-stone-900 text-base">
                  Create Free Account
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Takes 30 seconds with email or Google.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-ivory-300">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  Step 02
                </div>
                <h4 className="font-semibold text-stone-900 text-base">
                  Add 3–5 Items
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Upload tops, bottoms, shoes, or traditional wear.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-ivory-300">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  Step 03
                </div>
                <h4 className="font-semibold text-stone-900 text-base">
                  Pick Today&apos;s Vibe
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Select your city, occasion, and outing time.
                </p>
              </div>
              <div className="bg-forest text-white p-5 rounded-2xl shadow-md">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                  Step 04
                </div>
                <h4 className="font-semibold text-white text-base">
                  Generate Outfit
                </h4>
                <p className="text-xs text-stone-200 mt-1">
                  Receive tailored combinations from owned items.
                </p>
              </div>
            </div>
            <div className="mt-10">
              <Link
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-forest text-white font-semibold text-sm hover:bg-forest-dark transition-all shadow-md"
                href="/signin?callbackUrl=/home"
              >
                Create Your First Outfit Now
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
        {/* END: First Outfit Journey */}

        {/* BEGIN: 8 Features Grid */}
        <section
          className="py-24 bg-white border-t border-ivory-300"
          data-purpose="features-grid"
          id="features"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Engineered for Daily Confidence
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-2">
                Intelligent Features Made for Real Life
              </h2>
              <p className="mt-3 text-stone-600 text-lg">
                Purpose-built tools designed to make personal styling fast,
                practical, and stress-free.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  ✨
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  AI Outfit Recommendations
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Curates flattering, cohesive outfits strictly constructed from
                  the clothes you already own.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  📸
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  Smart Garment Recognition
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Snap with camera or upload. Gemini AI verifies wearable
                  clothes and auto-tags categories, colors, and styles.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  🌦️
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  Weather-Aware Intelligence
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Live Open-Meteo climate sync. Adjusts breathability and
                  layering for Lagos Island heatwaves or rain showers.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  👔
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  Occasion &amp; Event Rules
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Dedicated codes for corporate office, Sunday church, owambe
                  weddings, dinner dates, and casual hangouts.
                </p>
              </div>
              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  ⚓
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  Style Around Any Piece
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Pick any single anchor piece, a shirt, shoes, or kaftan, and
                  let AI curate an entire harmonious look around it.
                </p>
              </div>
              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  🔒
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  100% Owned Clothes Only
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Every recommendation is built strictly from clothes you own.
                  Zero external shopping links, zero ads, zero pressure to buy
                  new pieces.
                </p>
              </div>
              {/* Feature 7 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  💡
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  Actionable Styling Tips
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Actionable advice on cuffing, tucking, footwear pairings, and
                  why each outfit harmonizes effectively.
                </p>
              </div>
              {/* Feature 8 */}
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 hover:border-forest/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold mb-4">
                  📖
                </div>
                <h3 className="font-semibold text-lg text-stone-900 mb-1.5">
                  Saved Looks &amp; Wear Tracker
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Save favorite combinations, log wear dates, and monitor your
                  wear counters to rotate your wardrobe sustainably.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: 8 Features Grid */}

        {/* BEGIN: Interactive Demo: Before vs After */}
        <section
          className="py-24 bg-ivory-200"
          data-purpose="interactive-demo"
          id="demo"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                The AI Transformation
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-2">
                From disconnected clothes to curated style.
              </h2>
              <p className="mt-3 text-stone-600 text-lg">
                See how Wardrobe AI transforms items sitting separated in your
                closet into a cohesive outfit.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Left: Before (Random Items) */}
              <div className="bg-white p-7 rounded-3xl border border-ivory-300 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-bold uppercase mb-5">
                    Before: Scattered in Your Wardrobe
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2 font-editorial">
                    Individual Pieces
                  </h3>
                  <p className="text-stone-600 text-sm mb-6">
                    Sitting unworn because matching feels like mental effort.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-ivory-100 border border-ivory-300">
                      <span className="font-medium text-stone-800 text-sm">
                        Off-White Crisp Linen Shirt
                      </span>
                      <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                        Tops
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-ivory-100 border border-ivory-300">
                      <span className="font-medium text-stone-800 text-sm">
                        Olive Tailored Chino Trousers
                      </span>
                      <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                        Bottoms
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-ivory-100 border border-ivory-300">
                      <span className="font-medium text-stone-800 text-sm">
                        Minimalist Low-Top Sneakers
                      </span>
                      <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                        Shoes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-ivory-200 text-stone-500 text-xs italic">
                  Result: You wear the same black graphic tee instead.
                </div>
              </div>

              {/* Right: After (AI Recommended Look) */}
              <div className="bg-forest text-white p-7 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-900/60 text-emerald-300 text-xs font-bold uppercase mb-5 border border-emerald-500/20">
                    ✨ After: Curated by Wardrobe AI
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-editorial">
                    Lagos Afternoon Smart Casual
                  </h3>
                  {/* Weather & Occasion Badge */}
                  <div className="flex items-center gap-2 my-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-200">
                      ☀️ Lagos Island • 31°C
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-200">
                      💼 Work Hangout
                    </span>
                  </div>
                  {/* AI Rationale Card */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-sm leading-relaxed text-stone-200 my-4">
                    <span className="font-semibold text-white block mb-1 text-xs uppercase tracking-wider">
                      AI Rationale:
                    </span>
                    &ldquo;The lightweight off-white linen provides maximum
                    airflow against 72% coastal humidity. Olive chinos add
                    structural contrast, and clean minimalist sneakers strike
                    the perfect smart-casual balance for an afternoon client
                    lunch.&rdquo;
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300/80">
                  <span>Ready in seconds</span>
                  <span className="font-semibold">
                    Harmonized for Lagos Weather
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Interactive Demo */}

        {/* BEGIN: User Personas */}
        <section className="py-20 bg-ivory-100" data-purpose="personas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900">
                Who Is Wardrobe AI For?
              </h2>
              <p className="mt-2 text-stone-600 text-base">
                Tailored for everyone who wants to look their best with minimal
                friction.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm">
                <div className="text-3xl mb-3">💼</div>
                <h4 className="font-semibold text-stone-900 text-lg">
                  The Busy Professional
                </h4>
                <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                  Needs polished 8:00 AM work outfits without spending 20
                  minutes agonizing before early morning traffic.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm">
                <div className="text-3xl mb-3">🎓</div>
                <h4 className="font-semibold text-stone-900 text-lg">
                  The Smart Student
                </h4>
                <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                  Wants fresh, fashionable weekly combinations on campus without
                  spending allowance on fast fashion.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm">
                <div className="text-3xl mb-3">🥂</div>
                <h4 className="font-semibold text-stone-900 text-lg">
                  The Weekend Socialite
                </h4>
                <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                  Juggling brunch, Sunday church service, and owambe wedding
                  receptions with occasion-perfect outfits every time.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm">
                <div className="text-3xl mb-3">🌿</div>
                <h4 className="font-semibold text-stone-900 text-lg">
                  The Intentional Minimalist
                </h4>
                <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                  Curates a compact capsule closet and aims to maximize the
                  wear-per-item ratio sustainably.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: User Personas */}

        {/* BEGIN: Pricing Section */}
        <section
          className="py-24 bg-ivory-200 border-t border-ivory-300"
          data-purpose="pricing-section"
          id="pricing"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Clear &amp; Honest Pricing
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-2">
                Start Free. Upgrade for Daily Polish.
              </h2>
              <p className="mt-3 text-stone-600 text-base sm:text-lg">
                Transparent limits designed for genuine wardrobe satisfaction.
                No surprise fees.
              </p>

              {/* Interactive Billing Toggle */}
              <div
                className="mt-8 inline-flex items-center gap-3 bg-white p-1.5 rounded-full border border-ivory-300 shadow-sm"
                data-purpose="billing-toggle-container"
              >
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    billingCycle === "monthly"
                      ? "bg-forest text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  id="monthlyBtn"
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    billingCycle === "annual"
                      ? "bg-forest text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  id="annualBtn"
                >
                  Annual Billing
                  <span className="text-terracotta font-bold text-xs ml-1">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white p-8 rounded-3xl border border-ivory-300 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-stone-900">
                        Starter Wardrobe
                      </h3>
                      <p className="text-stone-500 text-xs mt-1">
                        Casual users trying the app, building habit
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-ivory-200 text-stone-700 text-xs font-bold">
                      Free
                    </span>
                  </div>
                  <div className="my-6">
                    <span className="text-4xl font-bold text-stone-900">
                      ₦0
                    </span>
                    <span className="text-stone-500 text-sm"> / month</span>
                  </div>
                  <ul className="space-y-3.5 text-sm text-stone-600 mb-8">
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        <strong>15 – 20 items</strong> (enough for basic mixing
                        &amp; matching)
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        <strong>1 AI recommendation per day</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>Standard daily occasions (Casual, Work)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>Powered by <strong>Gemini 3.8 Flash</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>Basic styling tips only</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>Up to 5 saved outfits</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-stone-400">
                      <span className="text-stone-300 font-bold mt-0.5">✕</span>
                      <span>Special event styling (Owambe &amp; Weddings)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-stone-400">
                      <span className="text-stone-300 font-bold mt-0.5">✕</span>
                      <span>Outfit History &amp; wear counter</span>
                    </li>
                  </ul>
                </div>
                <Link
                  className="w-full text-center py-3 px-6 rounded-full border border-stone-800 text-stone-800 text-sm font-semibold hover:bg-stone-50 transition-colors"
                  href="/signin?callbackUrl=/home"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="bg-white p-8 rounded-3xl border-2 border-forest shadow-xl flex flex-col justify-between relative">
                <div className="absolute -top-3.5 right-6 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-stone-900">
                        Wardrobe Pro
                      </h3>
                      <p className="text-stone-500 text-xs mt-1">
                        Fashion-conscious users, daily outfit planning
                      </p>
                    </div>
                  </div>
                  <div className="my-6">
                    <span
                      className="text-4xl font-bold text-stone-900"
                      id="priceVal"
                    >
                      {billingCycle === "monthly" ? "₦1,500" : "₦15,000"}
                    </span>
                    <span className="text-stone-500 text-sm" id="pricePeriod">
                      {billingCycle === "monthly" ? " / month" : " / year"}
                    </span>
                  </div>
                  <ul className="space-y-3.5 text-sm text-stone-700 mb-8">
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        <strong>Unlimited items</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        <strong>Unlimited generations</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        All occasions + <strong>Event Styling</strong>{" "}
                        (Weddings, Owambe, Dates, Interviews)
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        Unlimited multimodal reasoning (
                        <strong>Gemini 3.8 Flash</strong>)
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        <strong>Full-wardrobe cataloguing</strong> without
                        active item limits
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        <strong>Unlimited saved outfits</strong> + Outfit
                        History &amp; wear counter
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-forest font-bold mt-0.5">✓</span>
                      <span>
                        Hyper-local weather adaptation &amp; heat index styling
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <Link
                    className="w-full block text-center py-3 px-6 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest-dark transition-colors shadow-md"
                    href={`/signin?callbackUrl=${encodeURIComponent(`/wardrobe?upgrade=${billingCycle}`)}`}
                  >
                    {billingCycle === "annual"
                      ? "Upgrade to Annual Pro (₦15,000)"
                      : "Start 7-Day Free Trial"}
                  </Link>
                  <p className="text-[11px] text-center text-stone-500 mt-2">
                    Includes 7-day full Pro trial on signup · No card required
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Comparison Table matching uploaded reference */}
            <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-sm overflow-hidden">
              <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-2">
                Plan Comparison
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mb-6">
                Detailed breakdown of features included in Starter vs. Pro
                tiers.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-ivory-300 text-stone-900">
                      <th className="py-3.5 pr-4 font-semibold">Feature</th>
                      <th className="py-3.5 px-4 font-semibold text-stone-700">
                        Starter Wardrobe (Free)
                      </th>
                      <th className="py-3.5 pl-4 font-semibold text-forest">
                        {billingCycle === "annual"
                          ? "Wardrobe Pro (₦15,000 / year)"
                          : "Wardrobe Pro (₦1,500 / month)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-200">
                    {comparisonTable.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-ivory-50/60 transition-colors"
                      >
                        <td className="py-3.5 pr-4 font-medium text-stone-900">
                          {row.feature}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {row.starter}
                        </td>
                        <td className="py-3.5 pl-4 text-stone-800 font-medium">
                          {row.pro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-center text-xs text-stone-500 mt-8">
              Recommendation limits refresh periodically. Transparent billing
              with no surprise card charges.
            </p>
          </div>
        </section>
        {/* END: Pricing Section */}

        {/* BEGIN: Testimonials & Social Proof */}
        <section className="py-20 bg-ivory-100" data-purpose="social-proof">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Beta Community
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-2">
                Making everyday dressing easier.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <p className="text-stone-700 text-sm leading-relaxed italic">
                  &ldquo;I love how Wardrobe AI makes getting dressed less
                  stressful. Instead of constantly thinking I have nothing to
                  wear, it helps me discover fresh outfit combinations from
                  clothes I already own. Such a smart and practical idea!&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest text-white font-bold flex items-center justify-center text-xs">
                    SL
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-stone-900">
                      Shola L.
                    </h5>
                    <span className="text-xs text-stone-500">
                      Ifo, Ogun • Verified Beta
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <p className="text-stone-700 text-sm leading-relaxed italic">
                  &ldquo;The weather check is what won me over. Lagos Island
                  heat is unforgiving, getting suggestions that consider light
                  linen instead of heavy polyester is a game changer.&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-xs">
                    CO
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-stone-900">
                      Chidinma O.
                    </h5>
                    <span className="text-xs text-stone-500">
                      Lekki, Lagos • Verified Beta
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-sm flex flex-col justify-between">
                <p className="text-stone-700 text-sm leading-relaxed italic">
                  &ldquo;I thought it would try to sell me fast fashion like
                  other apps. Knowing it ONLY recommends clothes already in my
                  own closet is refreshingly honest.&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-700 text-white font-bold flex items-center justify-center text-xs">
                    TA
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-stone-900">
                      Tunde A.
                    </h5>
                    <span className="text-xs text-stone-500">
                      Maitama, Abuja • Verified Beta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Testimonials & Social Proof */}

        {/* BEGIN: FAQ Accordion Section */}
        <section
          className="py-24 bg-ivory-200 border-t border-ivory-300"
          data-purpose="faq-accordion"
          id="faqs"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Got Questions?
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-2">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-stone-600 text-sm sm:text-base">
                Everything you need to know about Wardrobe AI.
              </p>
            </div>
            {/* Accordion Container */}
            <div className="space-y-3" id="faqAccordion">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-ivory-300 overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 text-left flex justify-between items-center gap-4 text-stone-900 font-semibold text-base sm:text-lg focus:outline-none cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="text-xl text-stone-400 font-normal transition-transform duration-200 shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-ivory-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* END: FAQ Accordion Section */}

        {/* BEGIN: Final CTA Banner */}
        <section className="py-20 bg-ivory-100" data-purpose="final-cta">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-forest rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight">
                  Your wardrobe is waiting. Let&apos;s put it to work.
                </h2>
                <p className="mt-4 text-stone-200 text-base sm:text-lg">
                  Join people rediscovering outfits they already love. Set up in
                  under 3 minutes.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-forest font-semibold text-sm hover:bg-ivory-50 transition-colors shadow"
                    href="/signin?callbackUrl=/home"
                  >
                    Build My Wardrobe Free
                  </Link>
                  <a
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition-colors"
                    href="#pricing"
                  >
                    Explore Pricing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Final CTA Banner */}
      </main>

      {/* BEGIN: Footer */}
      <footer
        className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800"
        data-purpose="footer"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <Image
                    src="/wardrobe-ai-logo.webp"
                    alt="Wardrobe AI Logo"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
                <span className="font-editorial text-2xl font-bold text-white">
                  Wardrobe AI
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Your wardrobe. Your weather. Your day. Realize the full
                potential of clothes you already own.
              </p>
            </div>
            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="#how-it-works"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="#features"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="#demo"
                  >
                    Live Demo
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    href="#pricing"
                  >
                    Pricing Plans
                  </a>
                </li>
              </ul>
            </div>
            {/* Col 3: Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-3">
                Company
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://lbd-digital-hub-new.vercel.app/about"
                  >
                    About LBD Digital Hub
                  </a>
                </li>
                <li>
                  <Link
                    className="hover:text-white transition-colors"
                    href="/privacy"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-white transition-colors"
                    href="/terms"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            {/* Col 4: Community & Socials */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-3">
                Follow &amp; Community
              </h4>
              <p className="text-xs text-stone-400 mb-3 leading-relaxed">
                Join our community for daily Nigerian fashion styling, outfit drops, and updates.
              </p>
              <div className="mb-4">
                <SocialLinks variant="icons" iconSize="sm" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                All AI Systems Operational
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              © {new Date().getFullYear()} Wardrobe AI. A product by LBD Digital
              Hub. All rights reserved.
            </div>
            <SocialLinks variant="compact" iconSize="sm" />
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}
