import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        urgency: {
          type: SchemaType.STRING,
          description: "Urgency level of the emergency",
          enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
        },
        requiredCapabilities: {
          type: SchemaType.ARRAY,
          description: "List of required medical capabilities based on the symptoms. Choose from common capabilities like: trauma, icu, maternity, burns, pediatrics, cardiology, neurology, orthopedics, oxygen, surgery, general.",
          items: {
            type: SchemaType.STRING,
          },
        },
        symptomsSummary: {
          type: SchemaType.STRING,
          description: "A short 1-2 sentence summary of the symptoms.",
        },
        locationMentioned: {
          type: SchemaType.STRING,
          description: "Any location mentioned in the text (e.g. 'Lakeside, Pokhara'). Return an empty string if no location is mentioned.",
        },
      },
      required: ["urgency", "requiredCapabilities", "symptomsSummary"],
    },
  },
});

/**
 * Extracts structured urgency and required capabilities from a natural language emergency message or audio.
 * @param {string} message - The raw distress message
 * @param {object} [audioPart] - Optional inlineData object for Gemini audio processing
 * @returns {Promise<{ urgency: string, requiredCapabilities: string[], symptomsSummary: string, locationMentioned: string }>}
 */
export async function extractEmergencyDetails(message, audioPart = null) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Returning fallback mock data.");
    return {
      urgency: "HIGH",
      requiredCapabilities: ["icu", "oxygen"],
      symptomsSummary: "Fallback summary due to missing API key.",
      locationMentioned: "",
    };
  }

  const prompt = `
You are an expert emergency medical dispatcher. 
Analyze the following distress message and extract the urgency, required medical capabilities, a short summary of the symptoms, and any rough location mentioned by the user.

Distress Message:
"${message}"
`;

  const contents = audioPart ? [prompt, audioPart] : [prompt];

  try {
    const result = await model.generateContent(contents);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error in AI extraction:", error);
    throw new Error("Failed to process emergency message.");
  }
}
