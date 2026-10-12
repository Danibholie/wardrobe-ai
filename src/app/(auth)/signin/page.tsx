import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { auth, signIn } from "@/auth";
import { GoogleSignInButton } from "./GoogleSignInButton";

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/wardrobe";
  const authError = params?.error;

  // If already logged in, redirect directly to the requested page or wardrobe
  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-margin-mobile md:p-margin relative overflow-hidden bg-background">
      {/* Ambient background blur elements matching Home design */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-[600px] h-96 md:h-[600px] bg-gradient-to-tr from-surface-container via-surface-container-low to-secondary-container/20 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Navigation back to Home */}
        <div className="w-full flex items-center justify-between mb-6 px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-primary transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Editorial Sign-in Card */}
        <div className="w-full bg-surface-container-lowest/90 rounded-2xl md:rounded-3xl shadow-lg border border-outline-variant/30 backdrop-blur-md p-8 sm:p-10 flex flex-col items-center text-center">
          {/* Brand & Editorial Badge */}
          <div className="font-display-hero text-headline-md tracking-tight text-primary mb-2">
            Wardrobe AI
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary shadow-2xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
              Curated Style · Nigeria
            </span>
          </div>

          <h1 className="font-display-hero text-2xl sm:text-3xl text-on-surface tracking-tight leading-tight mb-2">
            Welcome to your wardrobe
          </h1>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-8">
            Sign in to upload your clothes, organise your wardrobe, and receive smart outfit recommendations for Lagos weather and occasions.
          </p>

          {/* Error alert if OAuth fails */}
          {authError && (
            <div
              role="alert"
              className="w-full mb-6 p-3.5 rounded-xl bg-error-container/30 border border-error/20 text-error text-body-sm text-left flex items-start gap-2.5"
            >
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p className="font-semibold">Sign-in could not be completed</p>
                <p className="text-xs mt-0.5 opacity-90">
                  Please try again with your Google account.
                </p>
              </div>
            </div>
          )}

          {/* Standard Google Sign-In Button with Interactive Loading State */}
          <form
            action={async () => {
              "use server";
              await signIn("google", {
                redirectTo: callbackUrl,
              });
            }}
            className="w-full"
          >
            <GoogleSignInButton />
          </form>

          {/* Features Highlights */}
          <div className="w-full mt-8 pt-6 border-t border-outline-variant/30 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-[#173B2A] flex-shrink-0" />
              <span>Instant AI identification of garments</span>
            </div>
            <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-[#173B2A] flex-shrink-0" />
              <span>Weather-calibrated outfit styling for Nigeria</span>
            </div>
            <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-[#173B2A] flex-shrink-0" />
              <span>Traditional &amp; contemporary wardrobe curation</span>
            </div>
          </div>
        </div>

        {/* Security & Privacy Microcopy */}
        <footer className="mt-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-on-surface-variant/80">
            <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
            <p className="font-body-sm text-xs">
              Secure authentication via Google. Your wardrobe items are private to you.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
