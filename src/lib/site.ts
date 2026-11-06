const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.wardrobeai.com.ng";

export const SITE_CONFIG = {
  name: "Wardrobe AI",
  shortName: "Wardrobe AI",
  domain: "www.wardrobeai.com.ng",
  url: BASE_URL,
  ogImage: `${BASE_URL}/og-image.png`,
  logo: `${BASE_URL}/wardrobe-ai-logo.webp`,
  title: "Wardrobe AI — Smart Outfit Planner & AI Stylist in Nigeria",
  tagline: "Your Wardrobe. Your Weather. Your Day.",
  description:
    "Stop wondering what to wear. Wardrobe AI curates personalized outfits exclusively from clothes you already own, matched to live Nigerian weather (Lagos, Abuja) and occasions.",
  keywords: [
    "Wardrobe AI",
    "AI Stylist Nigeria",
    "Lagos Outfit Planner",
    "Digital Wardrobe App Nigeria",
    "Capsule Wardrobe Nigeria",
    "What to Wear in Lagos",
    "Nigerian Fashion AI",
    "Owambe Outfit Planner",
    "Senator Wear Styling",
    "Kaftan Outfit Combinations",
    "Weather Adaptive Styling Lagos",
    "Closet Organizer Nigeria",
    "Smart Dressing Assistant",
    "Daily Outfit Recommendations",
    "Personal Stylist Lagos",
    "Sustainable Fashion Nigeria",
    "Virtual Closet Nigeria",
    "Outfit Generator from My Clothes",
    "Wardrobe Management App",
    "Nigerian Men Style Guide",
    "Nigerian Women Style Guide",
  ],
  author: {
    name: "Wardrobe AI",
    url: BASE_URL,
  },
  company: {
    name: "LBD Digital Hub",
    url: BASE_URL,
  },
  social: {
    twitter: "https://twitter.com/WardrobeAI",
    twitterHandle: "@WardrobeAI",
    instagram: "https://instagram.com/WardrobeAI",
    linkedin: "https://linkedin.com/company/wardrobe-ai",
  },
  locale: "en_NG",
} as const;
