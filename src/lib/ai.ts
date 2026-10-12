import { GoogleGenAI, Type } from "@google/genai";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

const clothingSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A short, descriptive clothing item name.",
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
      ],
      description:
        "One of: tops, bottoms, dresses, outerwear, shoes, accessories, traditional.",
    },
    subcategory: {
      type: Type.STRING,
      description: "Specific item type, such as polo, jeans, or sneakers.",
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
  required: ["name", "category", "subcategory", "color", "style"],
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
                text: `Identify the main clothing item in this image.

Return its visible attributes only. Do not invent a brand, fabric,
material, or other details that cannot be determined visually.

Use one category from:
tops, bottoms, dresses, outerwear, shoes, accessories, traditional.

Recognise Nigerian clothing where applicable, including agbada,
senator wear, kaftan, Ankara and Aso-Ebi.

If the image does not clearly show a clothing item, do not guess.
Provide the best concise description supported by the image.

Return only valid JSON with these fields:

{
"name": "string",
"category": "string",
"subcategory": "string",
"color": "string",
"style": "string"
}

Rules:
- Identify only what is visibly present.
- Do not invent details that cannot reasonably be determined.
- Use simple clothing terminology.
- Category should normally be one of:
tops, bottoms, dresses, outerwear, shoes, accessories, traditional
- For Nigerian traditional clothing, examples include:
agbada, senator, kaftan, ankara, aso-ebi.
- Keep the values concise.
`,
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

  throw (
    lastError ??
    new Error(
      "AI models are currently experiencing high demand. Please try again in a few moments."
    )
  );
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

  const systemPrompt = `You are a world-class luxury fashion stylist and outfit curator specialising in Nigerian and tropical climate wardrobe planning.

YOUR PRIMARY GOAL:
Recommend 1 to 3 distinct, exceptionally styled outfit combinations created EXCLUSIVELY by combining items from the user's personal wardrobe catalog.

USER CONTEXT & CRITERIA:
- Location: ${location}
- Weather Conditions: ${weather}
- Occasion / Event: ${event}
- Style Preference: ${stylePreference}
- Look & Vibe Desired: ${vibe}

USER'S WARDROBE COLLECTION:
${JSON.stringify(formattedItems, null, 2)}

STRICT RULES:
1. ONLY use items from the user's wardrobe list above. In each outfit's "itemIds" array, include the exact "id" strings of the items chosen.
2. Build harmonious, practical outfits (e.g. Top + Bottom + Shoes, or Traditional + Shoes + Accessory, or Dress + Layer + Shoes).
3. If the user is missing a category (for example they have tops and bottoms but no shoes logged yet), select the best matching pieces they DO have, and use "missingPiecesAdvice" to suggest what footwear or finishing touch would complete it.
4. Deeply respect the location (${location}) and weather (${weather}):
   - In hot or humid Nigerian weather (e.g. Lagos), prioritize breathability, linen, cotton pique, lightweight tailoring, and heat resilience.
   - For Nigerian cultural events (e.g., Owambe, wedding, Sunday service, Friday mosque), favor traditional attire (Kaftan, Agbada, Senator, Ankara) or polished sharp looks.
   - For office settings (Victoria Island, Ikoyi, Marina, Abuja), balance air-conditioned indoor comfort with tropical outdoor heat.
5. Provide actionable, high-taste editorial styling tips for each look.
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

  throw (
    lastError ??
    new Error(
      "AI recommendation service is momentarily busy. Please try again shortly."
    )
  );
}
