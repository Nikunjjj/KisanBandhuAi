import { CropListing } from "../models/CropListing.js";

// Create a new crop listing
export const createCropListing = async (req, res) => {
  try {
    const cropData = {
      ...req.body,
      seller: req.user._id,
      sellerName: req.user.name || "Farmer",
    };
    
    const newCrop = await CropListing.create(cropData);
    res.status(201).json(newCrop);
  } catch (error) {
    res.status(500).json({ message: "Failed to list crop", error: error.message });
  }
};

// Get current user's crop listings
export const getUserCropListings = async (req, res) => {
  try {
    const crops = await CropListing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your crop listings", error: error.message });
  }
};

// Get all crop listings with filters
export const getCropListings = async (req, res) => {
  try {
    const { cropType, location, maxPrice, status = "available" } = req.query;
    let query = { status };

    if (cropType) query.cropName = new RegExp(cropType, 'i');
    if (maxPrice) query.pricePerUnit = { $lte: Number(maxPrice) };
    if (location) {
      query.$text = { $search: location };
    }

    const crops = await CropListing.find(query).sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch crop listings", error: error.message });
  }
};

// Get crop listing by ID
export const getCropById = async (req, res) => {
  try {
    const crop = await CropListing.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop listing not found" });
    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch crop listing", error: error.message });
  }
};

// Update a crop listing
export const updateCropListing = async (req, res) => {
  try {
    const crop = await CropListing.findOne({ _id: req.params.id, seller: req.user._id });
    if (!crop) return res.status(404).json({ message: "Crop listing not found or unauthorized" });

    const updatedCrop = await CropListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: "Failed to update crop listing", error: error.message });
  }
};

// Delete a crop listing
export const deleteCropListing = async (req, res) => {
  try {
    const crop = await CropListing.findOne({ _id: req.params.id, seller: req.user._id });
    if (!crop) return res.status(404).json({ message: "Crop listing not found or unauthorized" });

    await crop.deleteOne();
    res.json({ message: "Crop listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete crop listing", error: error.message });
  }
};
