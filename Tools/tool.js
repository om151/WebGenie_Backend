
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
const asyncExecute = promisify(exec);



export const writeToFile = async ({ path, content }) => {
  try {
    fs.writeFileSync(path, content, "utf8");
    return `✅ Successfully wrote to ${path}`;
  } catch (err) {
    return `❌ Error writing to file: ${err.message}`;
  }
};

export const executeCommand = async ({ command }) => {
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



export const writeFileDeclaration = {
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

export const executeDeclaration = {
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