import { AnimalProfile } from "../models/AnimalProfile.js";
import { HealthRecord } from "../models/HealthRecord.js";
import { analyzeLivestockSymptoms } from "../services/livestockAiService.js";

// @desc    Get all livestock profiles for the logged in user
// @route   GET /api/livestock/profiles
// @access  Private
export const getProfiles = async (req, res, next) => {
  try {
    const profiles = await AnimalProfile.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new livestock profile
// @route   POST /api/livestock/profiles
// @access  Private
export const createProfile = async (req, res, next) => {
  try {
    const { name, tagNumber, species, breed, gender, dob, weight, pregnancyStatus, milkProduction, allergies, photoUrl } = req.body;

    const newProfile = new AnimalProfile({
      owner: req.user._id,
      name,
      tagNumber,
      species,
      breed,
      gender,
      dob,
      weight,
      pregnancyStatus,
      milkProduction,
      allergies,
      photoUrl
    });

    const savedProfile = await newProfile.save();
    res.status(201).json({ success: true, data: savedProfile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single profile with health timeline
// @route   GET /api/livestock/profiles/:id
// @access  Private
export const getProfileById = async (req, res, next) => {
  try {
    const profile = await AnimalProfile.findOne({ _id: req.params.id, owner: req.user._id });
    if (!profile) {
      const error = new Error("Animal profile not found");
      error.statusCode = 404;
      error.isOperational = true;
      return next(error);
    }

    const healthRecords = await HealthRecord.find({ animalId: profile._id }).sort({ date: -1 });
    
    res.json({ success: true, data: { profile, healthRecords } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update livestock profile
// @route   PUT /api/livestock/profiles/:id
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await AnimalProfile.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      const error = new Error("Animal profile not found");
      error.statusCode = 404;
      error.isOperational = true;
      return next(error);
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete livestock profile
// @route   DELETE /api/livestock/profiles/:id
// @access  Private
export const deleteProfile = async (req, res, next) => {
  try {
    const profile = await AnimalProfile.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!profile) {
      const error = new Error("Animal profile not found");
      error.statusCode = 404;
      error.isOperational = true;
      return next(error);
    }

    // Cascade delete health records
    await HealthRecord.deleteMany({ animalId: profile._id });

    res.json({ success: true, message: "Animal profile and related health records deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a health record to an animal
// @route   POST /api/livestock/profiles/:id/records
// @access  Private
export const addHealthRecord = async (req, res, next) => {
  try {
    const profile = await AnimalProfile.findOne({ _id: req.params.id, owner: req.user._id });
    if (!profile) {
      const error = new Error("Animal profile not found");
      error.statusCode = 404;
      error.isOperational = true;
      return next(error);
    }

    const record = new HealthRecord({
      ...req.body,
      animalId: profile._id
    });

    const savedRecord = await record.save();
    res.status(201).json({ success: true, data: savedRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze symptoms using AI
// @route   POST /api/livestock/analyze-symptoms
// @access  Private
export const analyzeSymptoms = async (req, res, next) => {
  try {
    const { animalDetails, symptomsText } = req.body;
    
    if (!animalDetails || !symptomsText) {
      const error = new Error("Animal details and symptoms are required");
      error.statusCode = 400;
      error.isOperational = true;
      return next(error);
    }

    const diagnosis = await analyzeLivestockSymptoms(animalDetails, symptomsText);
    res.json({ success: true, diagnosis });
  } catch (error) {
    next(error);
  }
};
