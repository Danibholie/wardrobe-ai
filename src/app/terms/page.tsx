import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Scale,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE_CONFIG.name}`,
  description:
    "Read the Terms of Service governing your use of Wardrobe AI, including account creation, subscriptions (Free Starter & Wardrobe Pro), AI styling recommendations, user content rights, and governing laws.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
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
            <Scale className="w-3.5 h-3.5 text-forest" />
            Legal Terms &amp; Conditions
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            Last updated:{" "}
            <span className="font-medium text-stone-800">{lastUpdated}</span> ·
            Operated by{" "}
            <span className="font-medium text-stone-800">
              {SITE_CONFIG.company.name}
            </span>
          </p>
        </div>

        {/* Quick Highlights Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-sm mb-12 space-y-4">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest" />
            Terms Summary at a Glance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">
                100% Photo Ownership
              </span>
              You retain full intellectual property ownership of all wardrobe
              photos and closet metadata you upload.
            </div>
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">
                Clear Subscriptions
              </span>
              Starter is free forever. Wardrobe Pro is ₦1,500/month with zero
              hidden fees and instant cancellation anytime.
            </div>
            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">
                Styling Advisory
              </span>
              Recommendations are creative lifestyle suggestions crafted by AI
              and local weather signals to inspire your daily looks.
            </div>
          </div>
        </div>

        {/* Terms Body */}
        <article className="prose prose-stone max-w-none space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to <strong>Wardrobe AI</strong> (&ldquo;Service&rdquo;,
              &ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;), operated by{" "}
              <strong>{SITE_CONFIG.company.name}</strong>. By accessing or using
              our web application located at{" "}
              <a
                className="text-forest font-medium hover:underline"
                href={SITE_CONFIG.url}
              >
                {SITE_CONFIG.domain}
              </a>{" "}
              or any associated APIs, mobile interfaces, or Progressive Web
              Apps, you confirm that you have read, understood, and agreed to be
              legally bound by these Terms of Service (&ldquo;Terms&rdquo;) and
              our{" "}
              <Link
                className="text-forest font-medium hover:underline"
                href="/privacy"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              If you do not agree to these Terms, you must discontinue using the
              Service immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              2. Description of the Service
            </h2>
            <p>
              Wardrobe AI provides digital wardrobe organization, AI-assisted
              outfit synthesis, hyper-local weather styling integration, wear
              count analytics, and capsule wardrobe recommendations. The core
              features include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>
                <strong>Wardrobe Digitization:</strong> Uploading, cataloging,
                categorizing, and tagging personal clothing items.
              </li>
              <li>
                <strong>AI Stylist Engine:</strong> Algorithmic generation of
                outfit combinations strictly utilizing user-owned wardrobe
                pieces, powered by Google Gemini multimodal intelligence.
              </li>
              <li>
                <strong>Weather Adaptation:</strong> Incorporating real-time
                atmospheric data (temperature, rain probability, humidity) to
                propose climate-appropriate attire.
              </li>
              <li>
                <strong>Saved Looks &amp; Wear Tracking:</strong> Saving curated
                outfits and incrementing wear counts to encourage conscious,
                sustainable garment rotation.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              3. User Accounts and Eligibility
            </h2>
            <p>
              To use Wardrobe AI, you must be at least 13 years of age (or the
              minimum legal age for digital consent in your jurisdiction). When
              creating an account via Google OAuth or email sign-in:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>
                You agree to provide true, accurate, and current information.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                You are solely responsible for all activities and uploads
                conducted through your account.
              </li>
              <li>
                You must immediately notify us of any unauthorized use or
                security breach involving your account.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              4. Subscription Plans and Payment Terms
            </h2>
            <p>
              Wardrobe AI provides both free and paid subscription tiers with
              clear, transparent parameters:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 not-prose">
              <div className="bg-white p-5 rounded-xl border border-ivory-300">
                <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
                  Starter Wardrobe
                </h3>
                <div className="text-2xl font-bold text-forest mb-3">
                  ₦0{" "}
                  <span className="text-xs font-normal text-stone-500">
                    / forever
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-stone-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Up to
                    15–20 wardrobe items
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> 3 AI
                    outfit generations per week
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Casual
                    and Work daily occasions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Up to 5
                    saved outfits
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />{" "}
                    Standard Gemini AI reasoning
                  </li>
                </ul>
              </div>

              <div className="bg-forest text-white p-5 rounded-xl border border-forest">
                <h3 className="font-editorial text-xl font-bold text-ivory-100 mb-1">
                  Wardrobe Pro
                </h3>
                <div className="text-2xl font-bold text-gold-400 mb-3">
                  ₦1,500{" "}
                  <span className="text-xs font-normal text-ivory-300">
                    / month
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-ivory-200">
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Unlimited
                    wardrobe items (up to 300 cap)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Unlimited
                    daily outfit generations
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Event
                    styling (Owambe, Weddings, Dates)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Priority
                    AI reasoning (Gemini 3.8 Flash)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Unlimited
                    saved looks &amp; wear counter
                  </li>
                </ul>
              </div>
            </div>

            <p>
              <strong>Billing &amp; Renewals:</strong> Pro subscriptions are
              billed on a recurring monthly cycle via secure Nigerian and
              international payment processors (such as Paystack or
              Flutterwave). Prices are quoted in Nigerian Naira (NGN) inclusive
              of applicable digital taxes.
            </p>
            <p>
              <strong>Cancellations &amp; Refunds:</strong> You may cancel your
              Pro subscription at any time from your account settings.
              Cancellation halts future billings at the end of your current
              active billing month. Subscription fees already incurred are
              non-refundable, except where required under applicable Nigerian
              consumer protection law.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              5. User Content and Intellectual Property Rights
            </h2>
            <p>
              <strong>You Own Your Content:</strong> You retain 100%
              intellectual property ownership of all photos, apparel images,
              notes, and wardrobe details you upload to the Platform.
            </p>
            <p>
              <strong>Limited Processing License:</strong> By uploading wardrobe
              photos, you grant Wardrobe AI and {SITE_CONFIG.company.name} a
              limited, worldwide, non-exclusive, royalty-free license solely to
              host, store, crop, resize, analyze, and process the imagery
              through our AI models strictly for the purpose of delivering
              styling recommendations and digital closet services to you.
            </p>
            <p>
              <strong>We Do Not Sell or Publicly Train on Your Photos:</strong>{" "}
              We do not publish your private closet images, sell your
              photographs to data brokers, or use your private photos to train
              public foundation models without your explicit opt-in consent.
            </p>
            <p>
              <strong>Platform Intellectual Property:</strong> The Wardrobe AI
              name, logos, visual designs, user interfaces, proprietary
              algorithms, style taxonomy, and software code are the exclusive
              intellectual property of {SITE_CONFIG.company.name} and are
              protected under Nigerian and international copyright and trademark
              laws.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              6. Acceptable Use and Community Standards
            </h2>
            <p>You agree not to use Wardrobe AI to:</p>
            <ul className="list-disc pl-6 space-y-2 text-stone-700">
              <li>
                Upload pornography, sexually explicit content, unlawful imagery,
                hate speech, or content infringing another person&apos;s
                copyright or privacy rights.
              </li>
              <li>
                Attempt to decompile, reverse engineer, probe, scrape, or
                extract source code, styling weights, or prompts from the
                Platform.
              </li>
              <li>
                Circumvent account limits, free-tier quotas, authentication
                systems, or rate limiters using automated bots or scrapers.
              </li>
              <li>
                Impersonate another person or misrepresent your affiliation with
                any individual or entity.
              </li>
            </ul>
            <p>
              Violation of these acceptable use policies may result in immediate
              suspension or termination of your account without notice.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              7. AI Stylist &amp; Weather Information Disclaimers
            </h2>
            <p>
              <strong>Advisory Nature:</strong> Outfit suggestions generated by
              Wardrobe AI are powered by generative artificial intelligence
              models. While our algorithms strive to synthesize color harmony,
              formality, and climate relevance, styling recommendations are
              creative suggestions for personal inspiration only.
            </p>
            <p>
              <strong>Weather Signals:</strong> Weather and meteorological data
              are derived from third-party global forecasting providers. While
              reliable, forecasts are subject to natural variations,
              microclimates, and sudden shifts. Wardrobe AI is not liable for
              unexpected weather changes or individual comfort preferences.
            </p>
            <p>
              <strong>No Warranty:</strong> The service is provided on an
              &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without
              warranties of any kind, whether express, statutory, or implied.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, in no event
              shall {SITE_CONFIG.company.name}, its directors, employees, or
              partners be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits,
              data, or personal goodwill, arising from or related to your use of
              or inability to use the Platform.
            </p>
            <p>
              Our aggregate liability for any claims arising from these Terms or
              the Service shall not exceed the amount you paid to Wardrobe AI in
              the twelve (12) months preceding the event giving rise to
              liability.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              9. Termination
            </h2>
            <p>
              You may terminate your account at any time by requesting deletion
              through your profile settings or by emailing{" "}
              <a
                className="text-forest font-medium hover:underline"
                href="mailto:privacy@wardrobeai.com.ng"
              >
                privacy@wardrobeai.com.ng
              </a>
              . Upon termination, your right to access the Service immediately
              ceases, and your wardrobe catalog and photos will be permanently
              deleted from our primary databases in accordance with our Privacy
              Policy.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              10. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by, construed, and enforced in
              accordance with the laws of the{" "}
              <strong>Federal Republic of Nigeria</strong>, without regard to
              its conflict of law principles.
            </p>
            <p>
              Any dispute, controversy, or claim arising out of or relating to
              these Terms or the breach thereof shall first be addressed through
              informal, good-faith consultations between the parties. If
              unresolved within thirty (30) days, the dispute shall be submitted
              to the exclusive jurisdiction of the competent courts of Lagos
              State, Nigeria.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              11. Changes to These Terms
            </h2>
            <p>
              We reserve the right to revise or update these Terms at any time.
              When substantial changes occur, we will post the updated terms on
              this page with an updated &ldquo;Last updated&rdquo; timestamp and
              notify active users via email or in-app alert. Your continued use
              of the Service following such updates constitutes full acceptance
              of the revised Terms.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              12. Contact Information
            </h2>
            <p>
              If you have any questions or concerns regarding these Terms of
              Service, please contact our legal and customer team:
            </p>
            <div className="bg-white p-5 rounded-xl border border-ivory-300 text-sm space-y-1 mt-3">
              <p>
                <strong>Operating Entity:</strong> {SITE_CONFIG.company.name}{" "}
                (Wardrobe AI)
              </p>
              <p>
                <strong>Official Domain:</strong>{" "}
                <a
                  className="text-forest font-medium hover:underline"
                  href={SITE_CONFIG.url}
                >
                  {SITE_CONFIG.domain}
                </a>
              </p>
              <p>
                <strong>Legal &amp; Support Email:</strong>{" "}
                <a
                  className="text-forest font-medium hover:underline"
                  href="mailto:legal@wardrobeai.com.ng"
                >
                  legal@wardrobeai.com.ng
                </a>
              </p>
              <p>
                <strong>General Support:</strong>{" "}
                <a
                  className="text-forest font-medium hover:underline"
                  href="mailto:support@wardrobeai.com.ng"
                >
                  support@wardrobeai.com.ng
                </a>
              </p>
              <p>
                <strong>Headquarters:</strong> Lagos, Nigeria
              </p>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Wardrobe AI. A product by{" "}
            {SITE_CONFIG.company.name}. All rights reserved.
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex gap-6">
              <Link className="text-white font-medium" href="/terms">
                Terms of Service
              </Link>
              <Link
                className="hover:text-white transition-colors"
                href="/privacy"
              >
                Privacy Policy
              </Link>
              <Link className="hover:text-white transition-colors" href="/">
                Home
              </Link>
            </div>
            <SocialLinks variant="compact" iconSize="sm" />
          </div>
        </div>
      </footer>
    </div>
  );
}
