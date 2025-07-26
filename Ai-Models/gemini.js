import { GoogleGenAI } from "@google/genai";
import os from "os";
import { executeDeclaration, writeFileDeclaration } from "../Tools/tool.js";
import dotenv from "dotenv";
dotenv.config();

const platform = os.platform();

const ai = new GoogleGenAI({
  apiKey: process.env.GEN_AI_API,
});

const systemInstruction =  process.env.GEMINI_SI;

async function geminiRequest(messages) {
  return await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: messages,
    config: {
      tools: [
        { functionDeclarations: [writeFileDeclaration, executeDeclaration] },
      ],
      systemInstruction: systemInstruction,
    },
  });
}



export { geminiRequest };
