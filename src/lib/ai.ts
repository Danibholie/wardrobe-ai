import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in .env.local");
}

const ai = new GoogleGenAI({ apiKey });

const clothingSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A short, descriptive clothing item name.",
    },
    category: {
      type: Type.STRING,
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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
}
