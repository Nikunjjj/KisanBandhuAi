import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

export const CROP_CATEGORIES = [
  "cereal",
  "pulse",
  "vegetable",
  "fruit",
  "spice",
  "commercial",
  "fodder",
  "organic",
  "other"
];

export const QUALITY_GRADES = ["A", "B", "C", "mixed", "not_graded"];
export const DELIVERY_OPTIONS = ["pickup", "delivery", "both"];
export const CROP_LISTING_STATUSES = ["available", "low_stock", "sold_out", "paused", "removed"];

const cropListingSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true, trim: true },
    cropCategory: { type: String, enum: CROP_CATEGORIES, required: true },
    quantity: { type: Number, min: 0, required: true },
    quantityUnit: { type: String, enum: ["kg", "quintal", "ton", "crate", "bag"], default: "quintal" },
    pricePerUnit: { type: Number, min: 0, required: true },
    qualityGrade: { type: String, enum: QUALITY_GRADES, default: "not_graded" },
    harvestDate: { type: Date, default: Date.now },
    isOrganic: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1500, default: "" },
    images: [{ type: String, trim: true }],
    location: { type: pointSchema, required: true },
    pickupAddress: { type: String, trim: true, default: "" },
    village: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    deliveryOption: { type: String, enum: DELIVERY_OPTIONS, default: "pickup" },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true, default: "" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, trim: true, default: "" },
    sellerRating: { type: Number, min: 0, max: 5, default: 0 },
    status: { type: String, enum: CROP_LISTING_STATUSES, default: "available", index: true },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

cropListingSchema.index({ location: "2dsphere" });
cropListingSchema.index({ cropCategory: 1, status: 1, pricePerUnit: 1 });
cropListingSchema.index({ cropName: "text", description: "text", village: "text", district: "text" });

export const CropListing = mongoose.model("CropListing", cropListingSchema);
