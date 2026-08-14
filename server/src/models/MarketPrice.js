import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true, trim: true, index: true },
    category: { type: String, trim: true, index: true },
    district: { type: String, required: true, trim: true, index: true },
    mandi: { type: String, trim: true },
    currentPrice: { type: Number, required: true },
    previousPrice: Number,
    minPrice: Number,
    maxPrice: Number,
    averagePrice: Number,
    unit: { type: String, default: "quintal" },
    trend: { type: String, enum: ["up", "down", "stable"], default: "stable" },
    changePercent: Number,
    recommendation: String
  },
  { timestamps: true }
);

marketPriceSchema.index({ cropName: "text", district: "text", mandi: "text", category: "text" });

export const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);
