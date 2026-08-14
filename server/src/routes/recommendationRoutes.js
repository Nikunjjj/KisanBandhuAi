import express from "express";
import { checkSchemeEligibility, getRecommendations } from "../controllers/recommendationController.js";
import { authenticate } from "../middleware/auth.js";

export const recommendationRouter = express.Router();

recommendationRouter.use(authenticate);

recommendationRouter.get("/", getRecommendations);
recommendationRouter.get("/eligibility/:schemeId", checkSchemeEligibility);
