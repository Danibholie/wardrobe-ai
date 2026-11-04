import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { CATALOG_ITEMS, CatalogItem } from "@/lib/social-catalog";

export const dynamic = "force-dynamic";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

interface SocialDropResponse {
  city: string;
  dayOfWeek: string;
  themeTitle: string;
  culturalVibe: string;
  weatherSummary: string;
  temperature: string;
  humidity: string;
  fragranceProfile: string;
  herLook: {
    title: string;
    description: string;
    itemIds: string[];
    stylingNotes: string;
  };
  hisLook: {
    title: string;
    description: string;
    itemIds: string[];
    stylingNotes: string;
  };
  socialPosts: {
    twitter: string;
    instagram: string;
    linkedin: string;
    tiktokScript: string;
  };
}

const CITY_WEATHER_DEFAULTS: Record<string, { temp: string; humidity: string; desc: string }> = {
  Lagos: { temp: "32°C", humidity: "82%", desc: "Humid coastal heat with afternoon sun" },
  Abuja: { temp: "34°C", humidity: "45%", desc: "Clear sunny skies with dry heat" },
  "Port Harcourt": { temp: "29°C", humidity: "88%", desc: "Overcast with scattered coastal showers" },
  Ibadan: { temp: "31°C", humidity: "75%", desc: "Warm tropical afternoon breeze" },
};

const DAY_THEMES: Record<string, { title: string; vibe: string; defaultHer: string[]; defaultHis: string[] }> = {
  Monday: {
    title: "The Executive Power Move",
    vibe: "High-stakes corporate presence, client pitches, board meetings",
    defaultHer: ["women-blazer-camel", "women-blouse-silk-cream", "women-trousers-taupe", "women-shoes-heels-block", "women-acc-tote-leather"],
    defaultHis: ["men-blazer-navy", "men-shirt-white", "men-trousers-charcoal", "men-shoes-monkstraps", "men-acc-watch-gold"],
  },
  Tuesday: {
    title: "Agile Business Sharp",
    vibe: "High productivity, internal syncs, versatile desk-to-field movement",
    defaultHer: ["women-knit-sage", "women-skirt-midi-emerald", "women-shoes-mules-nude", "women-acc-earrings-gold", "women-acc-tote-leather"],
    defaultHis: ["men-polo-olive", "men-chinos-khaki", "men-shoes-loafers-tan", "men-acc-watch-gold", "men-acc-sunglasses"],
  },
  Wednesday: {
    title: "Hump Day Smart Casual",
    vibe: "Modern relaxed tailoring, breathable comfort, halfway mark",
    defaultHer: ["women-blouse-silk-cream", "women-denim-straight", "women-shoes-sneakers-white", "women-acc-sunglasses", "women-acc-earrings-gold"],
    defaultHis: ["men-shirt-linen-beige", "men-linen-pants-cream", "men-shoes-sneakers-white", "men-acc-sunglasses", "men-acc-watch-gold"],
  },
  Thursday: {
    title: "Desk-to-Dinner Island",
    vibe: "Polished office wear transitioning effortlessly to evening mixers in Victoria Island",
    defaultHer: ["women-blazer-camel", "women-skirt-slip-black", "women-shoes-sandals-gold", "women-acc-earrings-gold"],
    defaultHis: ["men-shirt-black", "men-denim-indigo", "men-shoes-loafers-tan", "men-acc-watch-gold"],
  },
  Friday: {
    title: "Corporate Native & TGIF",
    vibe: "The crown jewel of Nigerian corporate fashion — bespoke traditional cuts ready for 6:00 PM rooftop drinks",
    defaultHer: ["women-ankara-wrap", "women-shoes-sandals-gold", "women-acc-earrings-gold", "women-acc-sunglasses"],
    defaultHis: ["men-kaftan-slate", "men-shoes-slides-leather", "men-acc-watch-gold", "men-acc-sunglasses"],
  },
  Saturday: {
    title: "Owambe Glam & Weekend Groove",
    vibe: "High-society celebration elegance and lively party atmosphere",
    defaultHer: ["women-ankara-wrap", "women-shoes-sandals-gold", "women-acc-earrings-gold", "women-acc-sunglasses"],
    defaultHis: ["men-kaftan-white", "men-shoes-slides-leather", "men-acc-watch-gold", "men-acc-sunglasses"],
  },
  Sunday: {
    title: "Sunday Best & Thanksgiving",
    vibe: "Elegance for church, family lunches, serene afternoon brunch",
    defaultHer: ["women-dress-linen-terracotta", "women-shoes-mules-nude", "women-acc-sunglasses", "women-acc-earrings-gold"],
    defaultHis: ["men-kaftan-white", "men-shoes-slides-leather", "men-acc-watch-gold"],
  },
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email?.toLowerCase();

    if (!session || !userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    const dbUser = await User.findOne({ email: userEmail }).lean();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const isAuthorized =
      (adminEmail && userEmail === adminEmail) || dbUser?.role === "admin";

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const city = (typeof body.city === "string" && body.city.trim()) || "Lagos";

    // Determine current day of week in West Africa Time (UTC+1)
    const todayWAT = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Lagos",
      weekday: "long",
    }).format(new Date());

    const dayOfWeek =
      (typeof body.dayOfWeek === "string" && body.dayOfWeek.trim()) || todayWAT;

    const cityWeather =
      CITY_WEATHER_DEFAULTS[city] || CITY_WEATHER_DEFAULTS["Lagos"];
    const weatherSummary = body.weather || `${cityWeather.temp}, ${cityWeather.desc} (${cityWeather.humidity} humidity)`;
    const dayTheme = DAY_THEMES[dayOfWeek] || DAY_THEMES["Friday"];

    // Available catalog items summary for Gemini prompt
    const menItemsList = Object.values(CATALOG_ITEMS)
      .filter((i) => i.gender === "men" || i.gender === "unisex")
      .map((i) => `${i.id}: ${i.name} (${i.category}, ${i.color})`)
      .join("\n");

    const womenItemsList = Object.values(CATALOG_ITEMS)
      .filter((i) => i.gender === "women" || i.gender === "unisex")
      .map((i) => `${i.id}: ${i.name} (${i.category}, ${i.color})`)
      .join("\n");

    const prompt = `You are the lead fashion director and editorial stylist for "Wardrobe AI" in Nigeria.
Your job is to curate the official "Daily Naija Blueprint" outfit recommendation for ${dayOfWeek} in ${city}, Nigeria.

CONTEXT:
• City: ${city}, Nigeria
• Day: ${dayOfWeek}
• Cultural Theme: ${dayTheme.title} — ${dayTheme.vibe}
• Live Weather: ${weatherSummary}

AVAILABLE CATALOG ITEMS (You MUST select EXACT item IDs from this list only):

MEN'S CATALOG:
${menItemsList}

WOMEN'S CATALOG:
${womenItemsList}

REQUIREMENTS:
1. Select 3 to 5 matching itemIds from the Men's Catalog for His Look.
2. Select 3 to 5 matching itemIds from the Women's Catalog for Her Look.
3. Recommend 1 cohesive fragrance profile note suitable for Nigerian tropical heat (e.g. "Crisp Bergamot, Cardamom & Cedarwood").
4. Write 4 platform-ready social media posts:
   - twitter: Punchy hook, mentions ${city} temperature, touches on the commute vs office split AC contrast, asks a poll or engagement question. Under 280 chars if possible or punchy 2-sentence hook.
   - instagram: Editorial tone, breakdown of both outfits, styling rationale (why this fabric beats the humidity), and exactly 10-15 hashtags including #WardrobeAI #NaijaFashion #LagosStyle.
   - linkedin: Professional workplace focus, executive presence in 30°C+ climate, fabric choices (linen vs polyester), subtle mention of how Wardrobe AI helps professionals streamline morning prep.
   - tiktokScript: Fast 15-second script with [0-3s] HOOK, [3-8s] HER LOOK, [8-12s] HIS LOOK, [12-15s] CTA.

Return ONLY a valid JSON object matching this exact schema:
{
  "themeTitle": "${dayTheme.title}",
  "culturalVibe": "${dayTheme.vibe}",
  "temperature": "${cityWeather.temp}",
  "humidity": "${cityWeather.humidity}",
  "fragranceProfile": "Fragrance name & top notes",
  "herLook": {
    "title": "Title for her outfit",
    "description": "Short 1-sentence description",
    "itemIds": ["women-..."],
    "stylingNotes": "Key advice for wearability, climate, or commute"
  },
  "hisLook": {
    "title": "Title for his outfit",
    "description": "Short 1-sentence description",
    "itemIds": ["men-..."],
    "stylingNotes": "Key advice for wearability, climate, or commute"
  },
  "socialPosts": {
    "twitter": "...",
    "instagram": "...",
    "linkedin": "...",
    "tiktokScript": "..."
  }
}`;

    let aiResult: Partial<SocialDropResponse> = {};

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const text = response.text?.trim();
      if (text) {
        aiResult = JSON.parse(text);
      }
    } catch (aiErr) {
      console.warn("[Social Drop] Gemini AI generation error, using curated fallback:", aiErr);
    }

    // Merge with high-quality fallback defaults so response is always 100% complete
    const responsePayload: SocialDropResponse = {
      city,
      dayOfWeek,
      themeTitle: aiResult.themeTitle || dayTheme.title,
      culturalVibe: aiResult.culturalVibe || dayTheme.vibe,
      weatherSummary,
      temperature: aiResult.temperature || cityWeather.temp,
      humidity: aiResult.humidity || cityWeather.humidity,
      fragranceProfile:
        aiResult.fragranceProfile || "Calabrian Bergamot, Pink Pepper & Smoked Cedar",
      herLook: {
        title: aiResult.herLook?.title || `${dayOfWeek} Editorial Edit (Her)`,
        description:
          aiResult.herLook?.description ||
          "A balanced, breathable silhouette designed for humid commutes and freezing office AC.",
        itemIds:
          Array.isArray(aiResult.herLook?.itemIds) && aiResult.herLook.itemIds.length > 0
            ? aiResult.herLook.itemIds.filter((id) => CATALOG_ITEMS[id])
            : dayTheme.defaultHer,
        stylingNotes:
          aiResult.herLook?.stylingNotes ||
          "Stow the structured blazer during transit; drape over shoulders once inside the air-conditioned office.",
      },
      hisLook: {
        title: aiResult.hisLook?.title || `${dayOfWeek} Tailored Blueprint (His)`,
        description:
          aiResult.hisLook?.description ||
          "Sharp, heat-calibrated modern tailoring that commands respect without trapping humidity.",
        itemIds:
          Array.isArray(aiResult.hisLook?.itemIds) && aiResult.hisLook.itemIds.length > 0
            ? aiResult.hisLook.itemIds.filter((id) => CATALOG_ITEMS[id])
            : dayTheme.defaultHis,
        stylingNotes:
          aiResult.hisLook?.stylingNotes ||
          "Pair with breathable invisible socks or artisanal leather slides for effortless transit.",
      },
      socialPosts: {
        twitter:
          aiResult.socialPosts?.twitter ||
          `${dayOfWeek} in ${city}. Outside is ${cityWeather.temp} with ${cityWeather.humidity} humidity, but your office split AC is set to Canadian winter.\n\nToday's AI Blueprint: ${dayTheme.title}.\n\nWho wore it better today? Her tailored fit or His modern cut? 🧵👇`,
        instagram:
          aiResult.socialPosts?.instagram ||
          `THE DAILY NAIJA FIT CHECK · ${dayOfWeek.toUpperCase()} IN ${city.toUpperCase()} 🇳🇬\n\nToday's Theme: ${dayTheme.title}\n🌡️ Weather: ${cityWeather.temp} · ${cityWeather.humidity} Humidity\n\n✨ HER BLUEPRINT:\nCrafted for high-powered presence without suffering in the afternoon heat. Lightweight breathable textures keep you fresh in traffic, while structured layers handle freezing boardrooms.\n\n✨ HIS BLUEPRINT:\nModern Nigerian tailoring at its finest. Clean lines, rich neutral tones, and artisanal footwear that seamlessly transition from morning meetings to evening unwind.\n\n🌿 SCENT PAIRING: ${aiResult.fragranceProfile || "Bergamot & Smoked Cedar"}\n\nHave similar pieces in your wardrobe? Upload your clothes to Wardrobe AI and let the AI style your personalized looks every morning. Link in bio.\n\n#WardrobeAI #NaijaFashion #LagosStyle #${city}Style #NigerianFashion #DailyOutfitInspo #OOTDNigeria #CorporateNative #MenswearNG #WomenswearNG`,
        linkedin:
          aiResult.socialPosts?.linkedin ||
          `How do you maintain executive presence when outside temperatures hit ${cityWeather.temp} with ${cityWeather.humidity} humidity?\n\nIn Nigerian corporate hubs like ${city}, professional dressing requires thoughtful climate strategy. Today's AI-curated blueprint for ${dayOfWeek} focuses on:\n\n1. Natural breathable textiles (linen, wool-silk blends) over heat-trapping synthetics.\n2. Smart temperature regulation: lightweight base pieces paired with an intentional blazer for cold conference rooms.\n3. Celebrating contemporary African corporate aesthetics without sacrificing formality.\n\nWhat is your go-to fabric for beating the heat while staying board-ready?\n\nCurated by Wardrobe AI — intelligent wardrobe management for busy professionals.`,
        tiktokScript:
          aiResult.socialPosts?.tiktokScript ||
          `[0-3s HOOK] What to wear in ${city} today: ${dayOfWeek} ${cityWeather.temp} Edit!\n[3-7s HER LOOK] Quick cut: Wide-leg trousers + chic knit + nude mules. Keep the blazer in your tote until you hit the AC!\n[7-11s HIS LOOK] Quick cut: Sharp tailoring + woven leather loafers + gold timepiece. Clean and commanding.\n[11-15s CTA] Don't know what to wear tomorrow? Upload your closet to Wardrobe AI. Link in bio!`,
      },
    };

    return NextResponse.json({
      success: true,
      data: responsePayload,
    });
  } catch (error) {
    console.error("[Social Drop API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate social drop." },
      { status: 500 }
    );
  }
}

