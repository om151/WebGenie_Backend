import express, { response } from "express";
import path from "path";

import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./routers/userRoutes.js"; // ✅ ESM

import { connectToDb } from "./db.js"; // ✅ named import
import cookieParser from "cookie-parser"; // ✅ ESM

import { fileURLToPath } from "url";
import { generateRoutes } from "./routers/generateRoutes.js"; // ✅ ESM

const app = express();

app.use(express.json());

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

connectToDb();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempRoot = path.join(__dirname, "tempSites");

// if (!fs.existsSync(tempRoot)) {
//   fs.mkdirSync(tempRoot, { recursive: true });
// }

// Ensure tempSites directory exists before serving static files

app.use("/site", express.static(tempRoot));
app.use("/", generateRoutes);

app.use("/users", userRouter);

app.get("/test", (req, res) => {
  res.send("Testing.....");
});

app.listen(3000, () => {
  // console.log("🚀 Server running...");
});
