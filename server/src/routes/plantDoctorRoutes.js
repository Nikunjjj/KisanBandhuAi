import express from "express";
import { authenticate } from "../middleware/auth.js";
import { analyzePlant } from "../controllers/plantDoctorController.js";

const router = express.Router();

router.use(authenticate);
router.post("/analyze", analyzePlant);

export default router;
