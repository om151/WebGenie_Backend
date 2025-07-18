import express from "express";
import {handleGenerate} from "../controllers/generateController.js";

const router = express.Router();

router.post("/generate", handleGenerate);

export const generateRoutes = router;
