import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
    try {
        console.log("Testing gemini-1.5-flash...");
        const res1 = await model1.generateContent("hello");
        console.log("Success:", res1.response.text());
    } catch (e) {
        console.error("Failed model1:", e);
    }
}
test();
