import { JobListing } from "../models/JobListing.js";

// Create a new job listing
export const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      farmer: req.user._id,
      farmerName: req.user.name || "Farmer",
    };
    
    const newJob = await JobListing.create(jobData);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to create job listing", error: error.message });
  }
};

// Get all jobs with filters
export const getJobs = async (req, res) => {
  try {
    const { category, location, wageMin, status = "active" } = req.query;
    let query = { status };

    if (category) query.workCategory = category;
    if (wageMin) query.wageAmount = { $gte: Number(wageMin) };
    if (location) {
      query.$text = { $search: location };
    }

    const jobs = await JobListing.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await JobListing.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

// Update a job listing
export const updateJob = async (req, res) => {
  try {
    const job = await JobListing.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    const updatedJob = await JobListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
};

// Delete a job listing
export const deleteJob = async (req, res) => {
  try {
    const job = await JobListing.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};
