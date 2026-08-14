import express from "express";
import { createJob, getJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController.js";
import { authenticate } from "../middleware/auth.js";

export const jobRouter = express.Router();

// Public routes (or semi-public depending on requirement, assuming all authenticated for now)
jobRouter.use(authenticate);

jobRouter.get("/", getJobs);
jobRouter.get("/:id", getJobById);
jobRouter.post("/", createJob);
jobRouter.put("/:id", updateJob);
jobRouter.delete("/:id", deleteJob);
