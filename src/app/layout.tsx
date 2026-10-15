import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://lbd-wardrobe-ai.netlify.app";
const brandLogoUrl =
  "https://lbd-wardrobe-ai.netlify.app/wardrobe-ai-logo.webp";

const ogImageUrl = `${siteUrl}/og-image.png`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#202f26",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wardrobe AI · Curated Wardrobe Architecture",
    template: "%s | Wardrobe AI",
  },
  description:
    "Your wardrobe already has the answer. Intelligent outfit recommendations for Lagos weather, occasions, and everyday life in Nigeria.",
  applicationName: "Wardrobe AI",
  authors: [{ name: "Wardrobe AI" }],
  generator: "Next.js",
  keywords: [
    "Wardrobe AI",
    "AI Stylist",
    "Lagos Fashion",
    "Outfit Recommendations",
    "Capsule Wardrobe",
    "Nigerian Fashion",
    "Owambe",
    "Senator Wear",
    "Kaftan",
    "Weather Adaptive Styling",
  ],
  creator: "Wardrobe AI",
  publisher: "Wardrobe AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: brandLogoUrl, type: "image/png" }],
    shortcut: [brandLogoUrl],
    apple: [{ url: brandLogoUrl, sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    title: "Wardrobe AI · Curated Wardrobe Architecture",
    description:
      "Your wardrobe already has the answer. Intelligent outfit recommendations for Lagos weather, occasions, and everyday life in Nigeria.",
    siteName: "Wardrobe AI",
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
    title: "Wardrobe AI · Curated Wardrobe Architecture",
    description:
      "Intelligent outfit recommendations strictly curated from clothes you already own.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#121212" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/wardrobe-ai-logo.webp" type="image/png" />
        <link rel="apple-touch-icon" href="/wardrobe-ai-logo.webp" />
        <meta name="apple-mobile-web-app-title" content="Wardrobe AI" />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
