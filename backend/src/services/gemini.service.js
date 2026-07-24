import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function extractEmergencyData(rawText) {
  const prompt = `Extract structured data from this emergency SMS. Respond with ONLY valid JSON, no markdown, no explanation.
SMS: "${rawText}"
Format:
{
  "emergencyType": one of ["cardiac_arrest", "stroke", "severe_bleeding", "respiratory_distress", "accident", "fire", "other"],
  "locationText": the most specific location/landmark mentioned, or null if none found
}`;

  const completion = await client.chat.completions.create({
    model: "openrouter/free", // auto-picks from whatever free models are live right now
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content);
}
