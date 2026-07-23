// services/gemini.service.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseEmergencyWithGemini(rawText) {
  const prompt = `
Extract structured data from this emergency SMS. Respond with ONLY valid JSON, no markdown, no explanation.

SMS: "${rawText}"

Format:
{
  "emergencyType": one of ["cardiac_arrest", "stroke", "severe_bleeding", "respiratory_distress", "accident", "fire", "other"],
  "locationText": the location/area mentioned, or null if none found
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text.trim().replace(/```json|```/g, "");

  try {
    return JSON.parse(text);
  } catch {
    return null; // fall back to your regex parser if Gemini's output isn't valid JSON
  }
}
