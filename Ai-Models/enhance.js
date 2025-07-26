import { GoogleGenAI } from "@google/genai";
import os from "os";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEN_AI_API,
});

const systemInstruction =  process.env.ENHENCE_SI;


async function geminiEnhance(message) {
  return await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Enhance the following user prompt by transforming it into a clear, detailed, and professional instruction suitable for an AI to execute.

Original Prompt: ${message}`,
    config: {
      systemInstruction: systemInstruction,
    },
  });
}



export { geminiEnhance };
