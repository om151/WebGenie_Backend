import OpenAI from "openai";
import dotenv from "dotenv";
import { executeDeclaration, writeFileDeclaration } from "../Tools/tool.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemInstruction = process.env.GPT_SI;



async function chatGPTRequest(messages) {
 return await openai.chat.completions.create({
    model: "gpt-4o", // or gpt-4 if you don't have gpt-4o access
    messages: [
      { role: "system", content: systemInstruction },
      ...messages,
    ],
    tools: [executeDeclaration, writeFileDeclaration],
    tool_choice: "auto",
  });

}

export { chatGPTRequest };
