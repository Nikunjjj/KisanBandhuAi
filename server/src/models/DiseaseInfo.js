import mongoose from "mongoose";

const diseaseInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ["Plant", "Livestock"], required: true, index: true },
    symptoms: [String],
    causes: [String],
    prevention: [String],
    treatment: String,
    recommendedPesticides: [String],
    vaccination: String
  },
  { timestamps: true }
);

diseaseInfoSchema.index({ name: "text", symptoms: "text", treatment: "text", type: "text" });

export const DiseaseInfo = mongoose.model("DiseaseInfo", diseaseInfoSchema);
