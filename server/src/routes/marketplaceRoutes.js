import express from "express";
import { createCropListing, getCropListings, getCropById, updateCropListing, deleteCropListing, getUserCropListings } from "../controllers/marketplaceController.js";
import { authenticate } from "../middleware/auth.js";

export const marketplaceRouter = express.Router();

marketplaceRouter.use(authenticate);

marketplaceRouter.get("/my-listings", getUserCropListings);
marketplaceRouter.get("/", getCropListings);
marketplaceRouter.get("/:id", getCropById);
marketplaceRouter.post("/", createCropListing);
marketplaceRouter.put("/:id", updateCropListing);
marketplaceRouter.delete("/:id", deleteCropListing);
