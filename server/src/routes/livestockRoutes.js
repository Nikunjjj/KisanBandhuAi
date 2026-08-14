import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getProfiles,
  createProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
  addHealthRecord,
  analyzeSymptoms
} from "../controllers/livestockController.js";

const router = express.Router();

router.use(authenticate);

router.route("/profiles")
  .get(getProfiles)
  .post(createProfile);

router.route("/profiles/:id")
  .get(getProfileById)
  .put(updateProfile)
  .delete(deleteProfile);

router.post("/profiles/:id/records", addHealthRecord);

router.post("/analyze-symptoms", analyzeSymptoms);

export default router;
