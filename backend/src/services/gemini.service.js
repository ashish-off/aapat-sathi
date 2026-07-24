import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function extractEmergencyData(rawText) {
  const prompt = `Analyze this message and determine if it's an emergency or general medical inquiry. Respond with ONLY valid JSON, no markdown, no explanation.
Message: "${rawText}"
Format:
{
  "isEmergency": boolean (true if life-threatening, urgent care needed; false if general medical question),
  "emergencyType": if isEmergency is true, one of ["cardiac_arrest", "stroke", "severe_bleeding", "respiratory_distress", "accident", "fire", "other"], otherwise null,
  "medicalCondition": if isEmergency is false, the medical condition or specialty needed (e.g., "diabetes", "cardiology", "orthopedics", "general_checkup"), otherwise null,
  "requiredCapabilities": array of medical capabilities needed (e.g., ["endocrinology", "diabetes_care", "cardiology", "icu", "trauma"]),
  "locationText": the most specific location/landmark mentioned, or null if none found,
  "urgency": "critical", "high", "medium", or "low"
}`;

  const completion = await client.chat.completions.create({
    model: "openrouter/free", // auto-picks from whatever free models are live right now
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content);
}
