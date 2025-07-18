import path from "path";
import fs from "fs";
import { geminiRequest } from "../Ai-Models/gemini.js";
import { chatGPTRequest } from "../Ai-Models/gpt.js";
import { writeToFile, executeCommand } from "../Tools/tool.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempRoot = path.join(process.cwd(), "tempSites");
const allTools = { writeToFile: writeToFile, executeCommand: executeCommand };

if (!fs.existsSync(tempRoot)) {
  fs.mkdirSync(tempRoot, { recursive: true });
}

export async function handleGenerate(req, res) {
  try {
    const messages = req.body.messages;
    const selectedModel = req.body.model || "gemini";

    if (!messages) {
      return res.status(400).json({ error: "Messages are required." });
    }

    const userId = Date.now().toString();
    const userDir = path.join(tempRoot, userId);
    fs.mkdirSync(userDir, { recursive: true });

    while (true) {
      let response;

      if (selectedModel === "gemini") {
        response = await geminiRequest(messages);
      }else {
        throw new Error("Unsupported model selected");
      }

      if (response.functionCalls && response.functionCalls.length > 0) {
        const { name, args } = response.functionCalls[0];

        if (args.path && !path.isAbsolute(args.path)) {
          args.path = path.join(userDir, args.path);
        }

        const toolResponse = await allTools[name](args);

        messages.push({
          role: "model",
          parts: [{ functionCall: response.functionCalls[0] }],
        });
        messages.push({
          role: "user",
          parts: [
            { functionResponse: { name, response: { result: toolResponse } } },
          ],
        });
      } else {
        break;
      }
    }

    res.json({
      previewUrl: `/site/${userId}/index.html`,
      folderPath: `/site/${userId}`,
      messages: messages,
    });
  } catch (error) {
    console.error("❌ Server error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
