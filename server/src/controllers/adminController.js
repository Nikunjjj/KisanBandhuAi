import { User } from "../models/User.js";
import { JobListing } from "../models/JobListing.js";
import { CropListing } from "../models/CropListing.js";
import { Scheme } from "../models/Scheme.js";
import { Post } from "../models/Post.js";
import { AgriLocation } from "../models/AgriLocation.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await JobListing.countDocuments();
    const totalCrops = await CropListing.countDocuments();
    const totalSchemes = await Scheme.countDocuments();
    
    // Growth analytics mockup (last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const userGrowth = [400, 600, 800, 1200, 1500, totalUsers];
    const jobGrowth = [120, 200, 350, 400, 450, totalJobs];
    const cropGrowth = [50, 100, 200, 300, 350, totalCrops];

    const growthData = months.map((month, idx) => ({
      name: month,
      users: userGrowth[idx] || 0,
      jobs: jobGrowth[idx] || 0,
      crops: cropGrowth[idx] || 0
    }));

    res.json({
      overview: {
        totalUsers,
        totalJobs,
        totalCrops,
        totalSchemes
      },
      growthData
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, limit = 50, page = 1 } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
      
    const total = await User.countDocuments(query);
    
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'active', 'suspended'
    
    // In our model we might not have a 'status' field yet, let's just assume we add it or handle roles
    // We'll update the document directly.
    const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// Jobs Moderation
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await JobListing.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

export const deleteAdminJob = async (req, res) => {
  try {
    await JobListing.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};

// Marketplace Moderation
export const getAllCrops = async (req, res) => {
  try {
    const crops = await CropListing.find().sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch crops", error: error.message });
  }
};

export const deleteAdminCrop = async (req, res) => {
  try {
    await CropListing.findByIdAndDelete(req.params.id);
    res.json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete crop", error: error.message });
  }
};

// Community Moderation
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

export const deleteAdminPost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

// Map Directory Moderation
export const getAllLocations = async (req, res) => {
  try {
    const locations = await AgriLocation.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch locations", error: error.message });
  }
};

export const deleteAdminLocation = async (req, res) => {
  try {
    await AgriLocation.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete location", error: error.message });
  }
};

// Schemes Management
export const getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schemes", error: error.message });
  }
};

export const deleteAdminScheme = async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: "Scheme deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete scheme", error: error.message });
  }
};
