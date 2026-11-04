import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_CONFIG.name}`,
  description:
    "Learn how Wardrobe AI collects, protects, and handles your digital wardrobe photos, account data, and styling information in compliance with the Nigeria Data Protection Act (NDPA).",
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 4, 2026";

  return (
    <div className="bg-ivory-100 text-stone-800 font-sans antialiased min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-ivory-100/90 backdrop-blur-md border-b border-ivory-300/80 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Document Header */}
        <div className="border-b border-ivory-300 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory-200 border border-ivory-300 text-xs font-semibold uppercase tracking-wider text-forest mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            NDPA &amp; Global Privacy Standards
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            Last updated: <span className="font-medium text-stone-800">{lastUpdated}</span> · Operated by{" "}
            <span className="font-medium text-stone-800">{SITE_CONFIG.company.name}</span>
          </p>
        </div>

        {/* Quick Highlights Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-sm mb-12 space-y-4">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-forest" />
            Our Privacy Guarantees at a Glance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">Your Photos Are Private</span>
              Your wardrobe photos are accessible only by you. We never publish or sell your images.
            </div>
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">No Public AI Training</span>
              Your clothing photos are never used to train public third-party foundation models.
            </div>
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">Full User Control</span>
              You can edit, export, or permanently delete any clothing item or look at any time.
            </div>
          </div>
        </div>

        {/* Policy Body */}
        <article className="prose prose-stone max-w-none space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              1. Introduction
            </h2>
            <p>
              Wardrobe AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an intelligent digital wardrobe assistant operated by{" "}
              <strong>{SITE_CONFIG.company.name}</strong>, with our primary digital service hosted at{" "}
              <strong>{SITE_CONFIG.domain}</strong>.
            </p>
            <p>
              We respect your privacy and are committed to protecting your personal data in accordance with the{" "}
              <strong>Nigeria Data Protection Act 2023 (NDPA)</strong>, the Nigeria Data Protection Regulation (NDPR), and relevant international privacy laws. This Privacy Policy explains how we collect, store, process, and safeguard your personal information when you use our website and mobile progressive web application.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              2. Information We Collect
            </h2>
            <p>To provide personalized wardrobe management and outfit styling, we collect:</p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>
                <strong>Account Information:</strong> When you sign in using Google OAuth or email, we receive your name, email address, and profile avatar to create and authenticate your account.
              </li>
              <li>
                <strong>Wardrobe &amp; Garment Media:</strong> Photographs of clothing, footwear, and accessories you upload via device camera or file selection, along with associated item metadata (category, subcategory, color palette, and styling notes).
              </li>
              <li>
                <strong>Location &amp; Climate Information:</strong> Approximate city or regional location (e.g. Lagos Island, Ikeja, Abuja) to fetch real-time weather and humidity data. Precise GPS coordinates are requested strictly with your explicit browser permission and are never stored permanently.
              </li>
              <li>
                <strong>Outfit Preferences &amp; Activity:</strong> Selected occasions (Work, School, Church, Date, Owambe Wedding, Hangout, Errands), saved outfits, and wear counters logged by you.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              3. How We Use Your Information
            </h2>
            <p>We process your data strictly to deliver and enhance the Wardrobe AI service:</p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>
                <strong>AI Clothing Recognition:</strong> Processing uploaded photos using the Google Gemini Vision API to detect clothing types, colors, and styles while rejecting non-clothing images (e.g. furniture, food).
              </li>
              <li>
                <strong>Outfit Recommendations:</strong> Harmonizing items strictly from your owned collection based on the day&apos;s weather forecast and chosen occasion.
              </li>
              <li>
                <strong>Digital Wardrobe Archive:</strong> Maintaining your personal digital closet and saved outfits library.
              </li>
              <li>
                <strong>Service Communication:</strong> Providing account verification, transaction receipts, security notices, and service updates.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              4. Third-Party Service Providers
            </h2>
            <p>
              We do not sell your personal data. We engage reliable third-party infrastructure providers strictly to execute essential operational functions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>
                <strong>Google Gemini API:</strong> Used for secure computer vision analysis and outfit generation. Media transmitted is processed transiently via secure API endpoints and is not added to public model training data.
              </li>
              <li>
                <strong>Cloudinary:</strong> Provides secure, encrypted cloud media storage and content delivery for your wardrobe photos.
              </li>
              <li>
                <strong>MongoDB Atlas:</strong> Encrypted database infrastructure storing user profiles, closet tags, and saved looks.
              </li>
              <li>
                <strong>Open-Meteo Weather API:</strong> Fetches local temperatures, humidity, and rainfall radar without transmitting personal identifiers.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              5. Data Retention &amp; Deletion
            </h2>
            <p>
              You maintain complete autonomy over your wardrobe data. When you delete a clothing item or saved outfit from your dashboard, the associated records and cloud media assets are permanently removed from our databases.
            </p>
            <p>
              If you wish to delete your entire account and all associated wardrobe history, you can request full erasure by contacting us at{" "}
              <a className="text-forest font-semibold underline" href="mailto:privacy@wardrobeai.com.ng">
                privacy@wardrobeai.com.ng
              </a>
              . Account deletions are processed within 14 business days.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              6. Security Measures
            </h2>
            <p>
              We implement industry-standard administrative, technical, and physical safeguards:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>All web traffic is encrypted end-to-end via Transport Layer Security (TLS/HTTPS).</li>
              <li>Database connections and cloud image buckets use authenticated, access-controlled APIs.</li>
              <li>Authentication tokens are securely managed via encrypted sessions.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              7. Your Legal Rights (NDPA &amp; GDPR)
            </h2>
            <p>Under applicable data protection legislation, you are entitled to:</p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>Access and receive a copy of your personal data.</li>
              <li>Rectify inaccurate or incomplete wardrobe information.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to or restrict the processing of your data.</li>
              <li>Withdraw consent at any time where processing relies on consent.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              8. Contact Us
            </h2>
            <p>
              If you have any questions, inquiries, or data requests regarding this Privacy Policy, please reach out to our privacy desk:
            </p>
            <div className="bg-white p-5 rounded-xl border border-ivory-300 text-sm space-y-1 mt-3">
              <p><strong>Entity:</strong> {SITE_CONFIG.company.name} (Wardrobe AI)</p>
              <p><strong>Website:</strong> {SITE_CONFIG.url}</p>
              <p><strong>Email:</strong> <a className="text-forest font-medium hover:underline" href="mailto:privacy@wardrobeai.com.ng">privacy@wardrobeai.com.ng</a></p>
              <p><strong>Location:</strong> Lagos, Nigeria</p>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Wardrobe AI. A product by {SITE_CONFIG.company.name}. All rights reserved.</div>
          <div className="flex gap-6">
            <Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <Link className="text-white font-medium" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-white transition-colors" href="/">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

