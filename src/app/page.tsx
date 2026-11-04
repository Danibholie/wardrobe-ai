import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LandingPage, { faqs } from "@/components/LandingPage";
import { JsonLd } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wardrobe AI — Stop Wondering What to Wear",
  description:
    "Your wardrobe already has the answer. Intelligent outfit curation strictly from clothes you own, tailored for Nigerian weather and occasions.",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: "Wardrobe AI — Stop Wondering What to Wear",
    description:
      "Your wardrobe already has the answer. Intelligent outfit curation strictly from clothes you own, tailored for Nigerian weather and occasions.",
    images: [
      {
        url: "/og-image.png",
        secureUrl: SITE_CONFIG.ogImage,
        width: 1672,
        height: 941,
        alt: `${SITE_CONFIG.name} · Your Wardrobe. Your Weather. Your Day.`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wardrobe AI — Stop Wondering What to Wear",
    description:
      "Your wardrobe already has the answer. Intelligent outfit curation strictly from clothes you own, tailored for Nigerian weather and occasions.",
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.social.twitterHandle,
  },
};

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/home");
  }

  return (
    <>
      <JsonLd faqs={faqs} />
      <LandingPage />
    </>
  );
}
