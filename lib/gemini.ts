// import { GoogleGenAI, Type } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// export type Draft = {
//   hook: string;
//   headline: string;
//   captionBn: string;
//   hashtags: string[];
//   imagePrompt: string;
// };

// const SYSTEM = `You write Facebook posts in natural, warm, conversational Bengali (Bangladesh) for "বাসা সাজাই", a home decor page.
// Rules:
// - captionBn structure: (1) a curiosity/question HOOK line, (2) one short intro line, (3) 4-5 numbered tips with one emoji each and a short reason, (4) a comment CTA that asks the reader to reply with a number or choice, (5) a "save this post" line, (6) a line inviting people to follow বাসা সাজাই. No hashtags inside captionBn.
// - headline: max 7 words, Bengali, punchy, shown on top of the image.
// - hashtags: 5 to 6 Bengali/English hashtags, always including #বাসাসাজাই.
// - imagePrompt: English. Photorealistic, 1:1, South Asian home setting, bright natural light, clean composition, empty space at the top third for text overlay, no people, no text, no watermark. Describe the exact scene the tips would create.
// - Practical for typical Bangladeshi apartments and budgets. Never invent prices for products.`;

// export async function writeDraft(topic: string): Promise<Draft> {
//   const res = await ai.models.generateContent({
//     model: process.env.GEMINI_TEXT_MODEL!,
//     contents: `Topic: ${topic}`,
//     config: {
//       systemInstruction: SYSTEM,
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           hook: { type: Type.STRING },
//           headline: { type: Type.STRING },
//           captionBn: { type: Type.STRING },
//           hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
//           imagePrompt: { type: Type.STRING },
//         },
//         required: ["hook", "headline", "captionBn", "hashtags", "imagePrompt"],
//       },
//     },
//   });
//   const d = JSON.parse(res.text!) as Draft;
//   if (!d.captionBn || !d.headline || !d.imagePrompt) throw new Error("Incomplete draft from Gemini");
//   return d;
// }

// export async function suggestTopic(recent: string[]): Promise<string> {
//   const res = await ai.models.generateContent({
//     model: process.env.GEMINI_TEXT_MODEL!,
//     contents: `Suggest ONE new home decor post topic in Bengali for a Bangladeshi audience (small flats, budget-friendly, seasonal where relevant). It must be clearly different from these recent topics:\n${recent.join("\n") || "(none)"}\nReturn only the topic text.`,
//   });
//   return res.text!.trim();
// }

// export async function generateImage(prompt: string): Promise<Buffer> {
//   // Imagen has been shut down; images now come from the Gemini ("Nano Banana") models via the Interactions API.
//   const interaction = await ai.interactions.create({
//     model: process.env.GEMINI_IMAGE_MODEL!,
//     input: prompt,
//     response_format: { type: "image", aspect_ratio: "1:1" },
//   });
//   const data = interaction.output_image?.data;
//   if (!data) throw new Error("Gemini returned no image (possibly blocked by the safety filter)");
//   return Buffer.from(data, "base64");
// }
