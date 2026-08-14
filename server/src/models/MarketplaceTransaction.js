import mongoose from "mongoose";

export const TRANSACTION_STATUSES = ["negotiating", "agreed", "completed", "cancelled"];

const marketplaceTransactionSchema = new mongoose.Schema(
  {
    cropListing: { type: mongoose.Schema.Types.ObjectId, ref: "CropListing" },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropName: { type: String, trim: true, required: true },
    quantity: { type: Number, min: 0, default: 0 },
    quantityUnit: { type: String, trim: true, default: "quintal" },
    agreedPrice: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: TRANSACTION_STATUSES, default: "negotiating" }
  },
  { timestamps: true }
);

marketplaceTransactionSchema.index({ buyer: 1, seller: 1, createdAt: -1 });

export const MarketplaceTransaction = mongoose.model("MarketplaceTransaction", marketplaceTransactionSchema);
