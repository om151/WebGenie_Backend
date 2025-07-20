import express from "express";
import {handleGenerate,handleEnhance} from "../controllers/generateController.js";

const router = express.Router();

router.post("/generate", handleGenerate);
router.post("/enhance", handleEnhance);

export const generateRoutes = router;
