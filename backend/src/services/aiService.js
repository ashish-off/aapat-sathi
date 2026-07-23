import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
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
      },
      required: ["urgency", "requiredCapabilities", "symptomsSummary"],
    },
  },
});

/**
 * Extracts structured urgency and required capabilities from a natural language emergency message.
 * @param {string} message - The raw distress message
 * @returns {Promise<{ urgency: string, requiredCapabilities: string[], symptomsSummary: string }>}
 */
export async function extractEmergencyDetails(message) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Returning fallback mock data.");
    return {
      urgency: "HIGH",
      requiredCapabilities: ["icu", "oxygen"],
      symptomsSummary: "Fallback summary due to missing API key.",
    };
  }

  const prompt = `
You are an expert emergency medical dispatcher. 
Analyze the following distress message and extract the urgency, required medical capabilities, and a short summary of the symptoms.

Distress Message:
"${message}"
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error in AI extraction:", error);
    throw new Error("Failed to process emergency message.");
  }
}
