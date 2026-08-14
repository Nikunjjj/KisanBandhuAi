import express from "express";
import { getDashboardStats, getAllUsers, updateUserStatus, getAllJobs, deleteAdminJob, getAllCrops, deleteAdminCrop, getAllPosts, deleteAdminPost, getAllLocations, deleteAdminLocation, getAllSchemes, deleteAdminScheme } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { User } from "../models/User.js";

export const adminRouter = express.Router();

// Middleware to check if user is Admin
const authorizeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && user.role === "Admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Super Admin privileges required." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during authorization." });
  }
};

adminRouter.use(authenticate);
adminRouter.use(authorizeAdmin);

adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/users", getAllUsers);
adminRouter.put("/users/:id/status", updateUserStatus);

// Jobs
adminRouter.get("/jobs", getAllJobs);
adminRouter.delete("/jobs/:id", deleteAdminJob);

// Marketplace
adminRouter.get("/marketplace", getAllCrops);
adminRouter.delete("/marketplace/:id", deleteAdminCrop);

// Community
adminRouter.get("/community", getAllPosts);
adminRouter.delete("/community/:id", deleteAdminPost);

// Map Directory
adminRouter.get("/locations", getAllLocations);
adminRouter.delete("/locations/:id", deleteAdminLocation);

// Schemes
adminRouter.get("/schemes", getAllSchemes);
adminRouter.delete("/schemes/:id", deleteAdminScheme);
