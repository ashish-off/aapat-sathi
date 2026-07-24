import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Extracts structured urgency and required capabilities from a natural language emergency message.
 * @param {string} message - The raw distress message
 * @param {object} [audioPart] - Audio part (Not supported natively by OpenRouter text models)
 * @returns {Promise<{ urgency: string, requiredCapabilities: string[], symptomsSummary: string, locationMentioned: string }>}
 */
export async function extractEmergencyDetails(message, audioPart = null) {

  console.log("aaaaaaaa", process.env.OPENROUTER_API_KEY);

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is missing. Returning fallback mock data.");
    return {
      urgency: "HIGH",
      requiredCapabilities: ["icu", "oxygen"],
      symptomsSummary: "Fallback summary due to missing API key.",
      locationMentioned: "",
    };
  }

  if (audioPart) {
    console.warn("Audio processing requested but OpenRouter text models do not support raw audio parts natively via OpenAI SDK format. Treating as text.");
  }

  const prompt = `
You are an expert emergency medical dispatcher. 
Analyze the following distress message and extract the urgency, required medical capabilities, a short summary of the symptoms, and any rough location mentioned by the user.

Respond with ONLY valid JSON, no markdown, no explanation.

Distress Message:
"${message}"

Format:
{
  "urgency": "CRITICAL", "HIGH", "MEDIUM", or "LOW",
  "requiredCapabilities": array of strings (e.g., ["trauma", "icu", "maternity", "cardiology"]),
  "symptomsSummary": "A short 1-2 sentence summary of the symptoms",
  "locationMentioned": "Any location mentioned in the text (e.g. 'Lakeside, Pokhara'). Return empty string if none."
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "openrouter/free", // auto-picks from free models
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error in AI extraction:", error);
    throw new Error("Failed to process emergency message.");
  }
}
