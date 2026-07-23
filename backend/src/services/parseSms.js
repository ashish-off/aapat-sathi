import { parseEmergencyWithGemini } from "./gemini.service";

export async function parseSms(smsContent) {
  const content = smsContent.toLowerCase().split(" ");
  if (!content[0] === "help") {
    return { error: "Invalid command. Please start your message with 'HELP'." };
  }
  const disease = content[1];
  const location = content[2];
  if (!location.includes(",")) {
    return {
      error:
        "Invalid location format. Please provide location as 'tole,city/village'.",
    };
  }

  const data = parseEmergencyWithGemini(location);

  return {
    disease: disease,
    location: data,
  };
}
