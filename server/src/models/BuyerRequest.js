import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

export const BUYER_REQUEST_STATUSES = ["open", "fulfilled", "closed", "cancelled"];

const buyerRequestSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true, trim: true },
    cropCategory: { type: String, trim: true, default: "other" },
    quantityNeeded: { type: Number, min: 0, required: true },
    quantityUnit: { type: String, enum: ["kg", "quintal", "ton", "crate", "bag"], default: "quintal" },
    maxPricePerUnit: { type: Number, min: 0, default: 0 },
    preferredOrganic: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    location: { type: pointSchema, required: true },
    village: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    neededBy: { type: Date },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true, default: "" },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: { type: String, trim: true, default: "" },
    buyerType: {
      type: String,
      enum: ["retailer", "wholesaler", "hotel", "restaurant", "processor", "consumer", "other"],
      default: "other"
    },
    status: { type: String, enum: BUYER_REQUEST_STATUSES, default: "open", index: true },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

buyerRequestSchema.index({ location: "2dsphere" });
buyerRequestSchema.index({ cropName: "text", description: "text", district: "text" });

export const BuyerRequest = mongoose.model("BuyerRequest", buyerRequestSchema);
