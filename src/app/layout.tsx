import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXTAUTH_URL || "https://wardrobe-ai.vercel.app";
const brandLogoUrl =
  "https://lh3.googleusercontent.com/aida/AEtjO1UP5D9xXg9-RbsyJsRklGTTI6IgxYcU26iq2pBzrBU0C1a1K7MzwKSWX7exJKVKdPCSW90_v3qojIqaGuFLctGorJgeYxpPdDbiePPnRFc2WZKJAFEyoiEejvdwl3gtNFF9oLGX8U5RYuTFTTES-lCYXd4-ttjj7YaHyqh48bxnY56_oO3SJ2rYqXarVWexvI58DmBMoZI54hDRmuur01j6H6hRgZh_o_n5nVK7Iij10AfSDbpfBiZ72lQ";

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
    icon: [
      { url: "/favicon.ico" },
      { url: brandLogoUrl, type: "image/png" },
    ],
    shortcut: [brandLogoUrl],
    apple: [
      { url: brandLogoUrl, sizes: "180x180", type: "image/png" },
    ],
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
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyTyR7C-4zaUSuvXIzIq7SvTiDxS0KjoxzQjadYn6XMPksZO-_qdyWdbR3pgs6VpRdAFl7Gl-ZVcRBSMKVT1s7DiMShn8TpuKwkIZWQBUhvn2nmupycaNcJaZdxP-SWQc1DnIOGJSkk19rd5xjY02xstr8vvgUJm3AxrpyqZRnW7Fkaxhcp0EmYzx5iBrnErpokFxvKwAh6W2icEoI0Dqgq7bDzTjA9YlNpx2NE6XWwGRghmSbyS3n",
        width: 1200,
        height: 630,
        alt: "Wardrobe AI Editorial Lookbook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wardrobe AI · Curated Wardrobe Architecture",
    description:
      "Intelligent outfit recommendations strictly curated from clothes you already own.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyTyR7C-4zaUSuvXIzIq7SvTiDxS0KjoxzQjadYn6XMPksZO-_qdyWdbR3pgs6VpRdAFl7Gl-ZVcRBSMKVT1s7DiMShn8TpuKwkIZWQBUhvn2nmupycaNcJaZdxP-SWQc1DnIOGJSkk19rd5xjY02xstr8vvgUJm3AxrpyqZRnW7Fkaxhcp0EmYzx5iBrnErpokFxvKwAh6W2icEoI0Dqgq7bDzTjA9YlNpx2NE6XWwGRghmSbyS3n",
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
        <meta name="apple-mobile-web-app-title" content="Wardrobe AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
