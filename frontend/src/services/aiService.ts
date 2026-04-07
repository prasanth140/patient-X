import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProductDescription = async (name: string, category: string): Promise<string> => {
  if (!ai) return "Authentic medical product for your healthcare needs.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional, medical-grade, and concise description (max 2 sentences) for a pharmacy product named "${name}" in the category "${category}". Focus on its clinical use and safety.`,
    });
    return response.text || "Authentic medical product.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Authentic medical product.";
  }
};
