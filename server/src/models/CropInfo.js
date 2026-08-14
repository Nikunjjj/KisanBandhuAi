import mongoose from "mongoose";

const cropInfoSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true, trim: true, index: true },
    scientificName: String,
    season: { type: String, trim: true, index: true },
    overview: String,
    soil: String,
    water: String,
    idealTemperature: String,
    fertilizers: [String],
    guidance: {
      landPreparation: String,
      seedSelection: String,
      irrigation: String,
      harvest: String
    },
    timeline: [String]
  },
  { timestamps: true }
);

cropInfoSchema.index({ cropName: "text", overview: "text", season: "text" });

export const CropInfo = mongoose.model("CropInfo", cropInfoSchema);
