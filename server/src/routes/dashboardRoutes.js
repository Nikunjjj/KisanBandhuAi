import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

export const dashboardRouter = express.Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/", getDashboard);
