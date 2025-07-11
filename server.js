import express from "express";
import fs from "fs";
import path from "path";
import os from "os";
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import bodyParser from "body-parser";
import cors from "cors";

const asyncExecute = promisify(exec);
const ai = new GoogleGenAI({
  apiKey: "AIzaSyDZXuSEzK8vwdgJGA-RqMoMiWVV8MFzb6o",
});

const app = express();
const platform = os.platform();

app.use(express.json()); 

app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
};

app.use(cors(corsOptions));

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempRoot = path.join(__dirname, "tempSites");


const writeToFile = async ({ path, content }) => {
  try {
    fs.writeFileSync(path, content, "utf8");
    return `✅ Successfully wrote to ${path}`;
  } catch (err) {
    return `❌ Error writing to file: ${err.message}`;
  }
};

const executeCommand = async ({ command }) => {
    try {
    const { stdout, stderr } = await asyncExecute(command);

    if (stderr) {
      return `Error : ${stderr}`;
    }

    return `Success : ${stdout}`;
  } catch (err) {
    return `Error : ${err}`;
  }
};

const allTools = { writeToFile: writeToFile, executeCommand: executeCommand };

const writeFileDeclaration = {
  name: "writeToFile",
  description:
    "Write full HTML, CSS, or JavaScript code to a file. Use this after the file has been created.",
  parameters: {
    type: "OBJECT",
    properties: {
      path: {
        type: "STRING",
        description: "Path of the file to write, e.g., 'calculator/index.html'",
      },
      content: {
        type: "STRING",
        description: "The full code content to write into the file.",
      },
    },
    required: ["path", "content"],
  },
};

const executeDeclaration = {
  name: "executeCommand",
  description:
    "Execute a single terminal or shell command. A command can be to create folder , file , write in file , update or delete file. ",
  parameters: {
    type: "OBJECT",
    properties: {
      command: {
        type: "STRING",
        description: `It will be a single terminal command Example : "mkdir"`,
      },
    },
    required: ["command"],
  },
};

// Ensure tempSites directory exists before serving static files
if (!fs.existsSync(tempRoot)) {
  fs.mkdirSync(tempRoot, { recursive: true });
}

app.use("/site", express.static(tempRoot));

app.post("/generate", async (req, res) => {
  try {
    const messages = req.body.messages;
    console.log("📥 Received messages:", messages);
    if (!messages) return res.status(400).json({ error: "Messages are required." });

    console.log("📥 Received messages:", messages);

    const userId = Date.now().toString();
    const userDir = path.join(tempRoot, userId);
    fs.mkdirSync(userDir, { recursive: true });

    while (true) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
        config: {
          tools: [
            { functionDeclarations: [writeFileDeclaration, executeDeclaration] },
          ],
          systemInstruction: `
You are an website builder expert . You have to create the frontend of the website. You have access of tool , which can run or execute any shell or terminal command

       <--What is you job -->
      1: Analyze the user query to see what type of website the user wants to build.
      2:Give then command one by one , step by step
      3:Use avilable tool executeCommand to execute the command and writeToFile to write the content in file.

      4:When user send you code and say to change some thing in previous code then your work is to create the full project again in this new folder with the menttion changes

Rules:
1: Dont create a folder to the project name to the give path to you because when new prompt comes it will create a new folder with new userId automatticaly
2:You have to create file directly

    🛠️ Tools Available:
1. executeCommand – for shell commands like mkdir or touch
2. writeToFile – to write full HTML, CSS, or JS code into any file

🚫 NEVER use 'echo', '>', or '>>' to write code into files.
✅ ALWAYS use writeToFile tool to write content.

When user send you code and say to change some thing in previous code 

then your work is to create the full project again in this new folder with the menttion changes



`,
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const { name, args } = response.functionCalls[0];

        // ✅ FIXED: only apply path.join if path is not absolute
        if (args.path && !path.isAbsolute(args.path)) {
          args.path = path.join(userDir, args.path);
        }

        console.log(`🧠 AI Function Call: ${name}`);
        console.log("🔧 Raw Args:", args);

        const toolResponse = await allTools[name](args);

        console.log(`✅ Tool response: ${toolResponse}`);

        messages.push({ role: "model", parts: [{ functionCall: response.functionCalls[0] }] });
        messages.push({
          role: "user",
          parts: [{ functionResponse: { name, response: { result: toolResponse } } }],
        });
      } else {
        // messages.push({ role: "ai", parts: [{ text: response.candidates[0].parts[0].text }] });
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
    res.status(500).json({ error: "Failed to generate website" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
