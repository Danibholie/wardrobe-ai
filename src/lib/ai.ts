import { GoogleGenAI, Type } from "@google/genai";
import { parseAiError } from "@/lib/errors";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

const clothingSchema = {
  type: Type.OBJECT,
  properties: {
    isClothing: {
      type: Type.BOOLEAN,
      description:
        "True ONLY if the primary subject in the image is a wearable garment (shirt, pants, dress, jacket, agbada, etc.), footwear (shoes, boots, sandals, heels), or wearable fashion accessory (hat, cap, bag, belt, sunglasses, scarf, jewelry, watch). False if the image depicts furniture, household items, animals/pets, food, electronics, vehicles, documents, nature, or other non-wearable objects.",
    },
    detectedObject: {
      type: Type.STRING,
      description:
        "Concise 2-4 word description of what is actually shown in the image (e.g. 'wooden coffee table', 'domestic cat', 'smartphone', 'cotton t-shirt', 'leather sneakers').",
    },
    rejectionReason: {
      type: Type.STRING,
      description:
        "If isClothing is false, a friendly explanation of why this was not recognized as clothing (e.g., 'This image appears to show furniture rather than clothing or accessories.'). Empty string if isClothing is true.",
    },
    name: {
      type: Type.STRING,
      description:
        "A short, descriptive clothing item name if isClothing is true (e.g. 'Oversized Linen Shirt'). Empty string if not clothing.",
    },
    category: {
      type: Type.STRING,
      enum: [
        "tops",
        "bottoms",
        "dresses",
        "outerwear",
        "shoes",
        "accessories",
        "traditional",
        "other",
      ],
      description:
        "One of: tops, bottoms, dresses, outerwear, shoes, accessories, traditional, other.",
    },
    subcategory: {
      type: Type.STRING,
      description:
        "Specific item type, such as polo, jeans, or sneakers. Empty string if not clothing.",
    },
    color: {
      type: Type.STRING,
      description: "The main visible color of the item.",
    },
    style: {
      type: Type.STRING,
      description:
        "A simple style description, such as casual, formal, or traditional.",
    },
  },
  required: [
    "isClothing",
    "detectedObject",
    "rejectionReason",
    "name",
    "category",
    "subcategory",
    "color",
    "style",
  ],
};

export async function identifyClothing(imageUrl: string) {
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error("Could not retrieve the clothing image.");
  }

  const contentType = imageResponse.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    throw new Error("The supplied URL is not an image.");
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const ai = getAI();
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert fashion stylist and digital wardrobe cataloguer.

TASK:
Analyze this image with high precision:

STEP 1: CLOTHING / FASHION VERIFICATION
Determine if the primary subject in this image is a genuine piece of clothing, footwear, headwear, or wearable fashion accessory.

- VALID CLOTHING & ACCESSORIES INCLUDE:
  - Tops (t-shirts, shirts, blouses, knitwear, sweaters, tank tops, vests)
  - Bottoms (trousers, jeans, shorts, skirts, sweatpants, chinos)
  - Dresses (day dresses, evening gowns, maxi dresses, sundresses)
  - Outerwear (jackets, blazers, coats, hoodies, cardigans, trench coats)
  - Shoes (sneakers, loafers, boots, heels, sandals, dress shoes, slides)
  - Accessories (handbags, backpacks, belts, hats, caps, watches, sunglasses, scarves, ties, jewelry)
  - Traditional / Cultural (Nigerian attire: Agbada, Senator wear, Kaftan, Ankara, Aso-Ebi, Iro & Buba, Dashiki)

- INVALID NON-CLOTHING OBJECTS INCLUDE:
  - Furniture (tables, chairs, desks, couches, beds, lamps)
  - Animals / Pets (dogs, cats, birds)
  - Electronics (smartphones, laptops, TVs, monitors)
  - Food & Drinks
  - Vehicles, architecture, landscapes, plants, documents, packaging, or random everyday household items.

STEP 2: OUTPUT RULES
- IF NOT CLOTHING:
  - Set "isClothing": false
  - Set "detectedObject": a concise name for what is shown (e.g., "wooden table", "domestic cat", "plate of food", "laptop")
  - Set "rejectionReason": a polite 1-sentence explanation why this cannot be catalogued in a clothing wardrobe.
  - Set "category": "other"
  - Set "name": ""
  - Set "subcategory": ""
  - Set "color": visible dominant color (or empty string)
  - Set "style": "other"

- IF IT IS CLOTHING OR A WEARABLE ACCESSORY:
  - Set "isClothing": true
  - Set "detectedObject": the garment name
  - Set "rejectionReason": ""
  - Populate "name", "category", "subcategory", "color", "style" accurately based only on what is visibly present.
  - Category must be one of: tops, bottoms, dresses, outerwear, shoes, accessories, traditional.
  - Do not invent brands, fabrics, or materials that cannot be confirmed visually.

Return valid JSON adhering strictly to the schema.`,
              },
              {
                inlineData: {
                  mimeType: contentType.split(";")[0],
                  data: imageBuffer.toString("base64"),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: clothingSchema,
          temperature: 0.1,
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return JSON.parse(text);
    } catch (err) {
      console.warn(`Model ${model} failed, trying next candidate:`, err);
      lastError = err;
    }
  }

  const { friendlyMessage } = parseAiError(
    lastError,
    "AI models are currently experiencing high demand. Please try again in a few moments."
  );
  throw new Error(friendlyMessage);
}

export type WardrobeItemSummary = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  style?: string;
  imageUrl?: string;
};

export type OutfitRecommendationParams = {
  items: WardrobeItemSummary[];
  location?: string;
  weather?: string;
  event?: string;
  stylePreference?: string;
  vibe?: string;
};

export type GeneratedOutfit = {
  title: string;
  vibeDescription: string;
  eventSuitability: string;
  weatherSuitability: string;
  stylingTips: string[];
  itemIds: string[];
  missingPiecesAdvice?: string;
};

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    outfits: {
      type: Type.ARRAY,
      description:
        "Array of 1 to 3 distinct curated outfits generated from the user's wardrobe items.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description:
              "Short editorial outfit headline (e.g. 'Breathable Linen & Tailored Separates').",
          },
          vibeDescription: {
            type: Type.STRING,
            description:
              "A 1-2 sentence description of the look, color balance, and aesthetic.",
          },
          eventSuitability: {
            type: Type.STRING,
            description:
              "Why this specific combination fits the event/occasion.",
          },
          weatherSuitability: {
            type: Type.STRING,
            description:
              "How this ensemble accommodates the location and weather (e.g. Lagos heat, rain, breeze, A/C).",
          },
          stylingTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "2-3 actionable styling suggestions (e.g. cuffing, tucking, footwear, jewelry).",
          },
          itemIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "The exact string IDs of items selected from the user's wardrobe collection.",
          },
          missingPiecesAdvice: {
            type: Type.STRING,
            description:
              "Optional suggestion for any finishing piece not in their closet (e.g. 'Add a woven leather belt or polarized shades').",
          },
        },
        required: [
          "title",
          "vibeDescription",
          "eventSuitability",
          "weatherSuitability",
          "stylingTips",
          "itemIds",
        ],
      },
    },
  },
  required: ["outfits"],
};

export async function recommendOutfits({
  items,
  location = "Lagos, Nigeria",
  weather = "31°C, sunny & humid",
  event = "Smart Casual / Day Outing",
  stylePreference = "Smart Casual",
  vibe = "Breathable, stylish, and comfortable",
}: OutfitRecommendationParams): Promise<{ outfits: GeneratedOutfit[] }> {
  if (!items || items.length === 0) {
    throw new Error("No wardrobe items provided for recommendation.");
  }

  const ai = getAI();

  const formattedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory || "",
    color: item.color,
    style: item.style || "",
  }));

  const systemPrompt = `You are an elite wardrobe stylist and outfit curator.

ABSOLUTE MANDATORY RULE:
You MUST ONLY recommend outfit combinations using the clothes provided in the USER'S WARDROBE COLLECTION below.
DO NOT INVENT, FABRICATE, OR ASSUME ANY CLOTHES THAT THE USER DOES NOT OWN.
Every single outfit's "itemIds" list MUST ONLY contain exact "id" strings from the user's wardrobe list.
If the user does not have a specific garment (e.g., they don't own a blazer, boots, or a kaftan), DO NOT invent one. Choose only from what they actually have.
The server strictly enforces this rule and will automatically discard any fabricated or unowned item IDs.

USER CONTEXT & CRITERIA:
- Location: ${location}
- Weather Conditions: ${weather}
- Occasion & Outing: ${event}
- Style Preference: ${stylePreference}
- Look & Vibe: ${vibe}

USER'S WARDROBE COLLECTION:
${JSON.stringify(formattedItems, null, 2)}

STRICT RULES:
1. EXCLUSIVE USE OF OWNED ITEMS: Every outfit must be constructed solely from the user's logged wardrobe items above. Every ID in itemIds must exist in the collection.
2. Select cohesive, stylish, and practical combinations (e.g. Top + Bottom, or Traditional piece + Loafers, or Top + Bottom + Shoes).
3. "missingPiecesAdvice": If the user is missing a category in their wardrobe (e.g. no shoes or accessories catalogued yet), choose the best owned pieces for itemIds, and use "missingPiecesAdvice" to suggest what finishing touch or footwear would complement it.
4. Deeply adapt to the location (${location}) and weather (${weather}) in fabric selection, breathability, and layering.
5. Provide actionable, high-taste styling tips for each look.
6. Return valid JSON strictly adhering to the schema.`;

  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: recommendationSchema,
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty recommendation response.");
      }

      const parsed = JSON.parse(text);
      if (!parsed.outfits || !Array.isArray(parsed.outfits)) {
        throw new Error("Invalid format returned by AI.");
      }

      return parsed;
    } catch (err) {
      console.warn(`Model ${model} failed for outfit recommendation:`, err);
      lastError = err;
    }
  }

  const { friendlyMessage } = parseAiError(
    lastError,
    "AI recommendation service is momentarily busy. Please try again shortly."
  );
  throw new Error(friendlyMessage);
}
