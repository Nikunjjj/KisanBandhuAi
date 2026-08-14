import express from "express";
import { body } from "express-validator";
import {
  createScheme,
  deleteScheme,
  getBookmarkedSchemes,
  getSchemeById,
  getSchemeMeta,
  listSchemes,
  toggleBookmark,
  updateScheme
} from "../controllers/schemeController.js";
import { SCHEME_CATEGORIES, SCHEME_STATUS } from "../constants/schemeConstants.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const schemeRouter = express.Router();

const schemeValidation = [
  body("schemeName").trim().isLength({ min: 3 }).withMessage("Scheme name must be at least 3 characters"),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
  body("benefits").isArray({ min: 1 }).withMessage("At least one benefit is required"),
  body("eligibilityCriteria").isArray({ min: 1 }).withMessage("At least one eligibility criterion is required"),
  body("requiredDocuments").isArray({ min: 1 }).withMessage("At least one required document is required"),
  body("applicationDeadline").isISO8601().withMessage("Valid application deadline is required"),
  body("stateApplicability").isArray({ min: 1 }).withMessage("At least one applicable state is required"),
  body("ministryDepartment").trim().notEmpty().withMessage("Ministry or department is required"),
  body("applicationLink").isURL({ require_protocol: true }).withMessage("Valid application link is required"),
  body("category").isIn(SCHEME_CATEGORIES).withMessage("Invalid scheme category"),
  body("status").optional().isIn(SCHEME_STATUS).withMessage("Invalid scheme status"),
  body("isTrending").optional().isBoolean().withMessage("Trending flag must be true or false")
];

schemeRouter.use(authenticate);

schemeRouter.get("/meta", getSchemeMeta);
schemeRouter.get("/bookmarks", getBookmarkedSchemes);
schemeRouter.get("/", listSchemes);
schemeRouter.get("/:id", getSchemeById);
schemeRouter.post("/:id/bookmark", toggleBookmark);

schemeRouter.post("/", authorize("Admin"), schemeValidation, validate, createScheme);
schemeRouter.put("/:id", authorize("Admin"), schemeValidation, validate, updateScheme);
schemeRouter.delete("/:id", authorize("Admin"), deleteScheme);
