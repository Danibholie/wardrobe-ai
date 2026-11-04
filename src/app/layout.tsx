import type { Metadata, Viewport } from "next";
import { SITE_CONFIG } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#183325",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — Smart Outfit Planner & AI Stylist in Nigeria`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
  generator: "Next.js",
  keywords: [...SITE_CONFIG.keywords],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.company.name,
  category: "Lifestyle & Fashion",
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "en-NG": SITE_CONFIG.url,
      en: SITE_CONFIG.url,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/wardrobe-ai-logo.webp", type: "image/webp" },
    ],
    shortcut: ["/wardrobe-ai-logo.webp"],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/wardrobe-ai-logo.webp", sizes: "512x512", type: "image/webp" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — Smart Outfit Planner & AI Stylist in Nigeria`,
    description: SITE_CONFIG.description,
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
    title: `${SITE_CONFIG.name} — Smart Outfit Planner & AI Stylist in Nigeria`,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.social.twitterHandle,
    site: SITE_CONFIG.social.twitterHandle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wardrobe AI" />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
