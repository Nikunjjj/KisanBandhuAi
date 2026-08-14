import express from "express";
import { body } from "express-validator";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const profileRouter = express.Router();

profileRouter.use(authenticate, authorize("Farmer", "Admin"));

profileRouter.get("/", getProfile);

profileRouter.put(
  "/",
  [
    body("landSize").optional().isFloat({ min: 0 }).withMessage("Land size cannot be negative"),
    body("cropType").optional().isArray().withMessage("Crop type must be an array"),
    body("incomeCategory")
      .optional()
      .isIn(["Below Poverty Line", "Low Income", "Middle Income", "High Income", "Not Specified"])
      .withMessage("Invalid income category"),
    body("farmerCategory")
      .optional()
      .isIn(["Small", "Marginal", "Medium", "Large", "Tenant", "Women Farmer", "SC/ST Farmer", "Not Specified"])
      .withMessage("Invalid farmer category"),
    body("livestockDetails").optional().isArray().withMessage("Livestock details must be an array")
  ],
  validate,
  updateProfile
);
