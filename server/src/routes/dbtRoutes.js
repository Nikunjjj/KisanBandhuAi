import express from "express";
import { getDbtApplications, getDbtSummary } from "../controllers/dbtController.js";
import { authenticate } from "../middleware/auth.js";

export const dbtRouter = express.Router();

dbtRouter.use(authenticate);
dbtRouter.get("/", getDbtApplications);
dbtRouter.get("/summary", getDbtSummary);
