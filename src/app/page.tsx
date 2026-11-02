import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LandingPage from "@/components/LandingPage";

const siteUrl = "https://lbd-wardrobe-ai.netlify.app";
const ogImageUrl = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  title: "Wardrobe AI — Your Wardrobe. Your Weather. Your Day.",
  description:
    "Your wardrobe already has the answer. Let AI help you find it. Discover personalized outfit recommendations based on the clothes you already own, your local weather, and today’s occasion.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Wardrobe AI",
    title: "Wardrobe AI — Your Wardrobe. Your Weather. Your Day.",
    description:
      "Your wardrobe already has the answer. Let AI help you find it. Discover personalized outfit recommendations based on the clothes you already own, your local weather, and today’s occasion.",
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
    title: "Wardrobe AI — Your Wardrobe. Your Weather. Your Day.",
    description:
      "Your wardrobe already has the answer. Let AI help you find it. Discover personalized outfit recommendations based on the clothes you already own, your local weather, and today’s occasion.",
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

  return <LandingPage />;
}
