import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

const marketplaceListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    listingType: { type: String, enum: ["buy", "sell"], required: true },
    category: {
      type: String,
      enum: ["crop", "fruit", "vegetable", "grain", "dairy", "livestock", "fertilizer", "seed", "pesticide", "tool", "irrigation", "machinery", "feed", "used_equipment"],
      required: true
    },
    description: { type: String, trim: true, maxlength: 1200, default: "" },
    quantity: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "" },
    price: { type: Number, min: 0, default: 0 },
    priceUnit: { type: String, trim: true, default: "" },
    negotiable: { type: Boolean, default: true },
    availableFrom: { type: Date, default: Date.now },
    availableUntil: Date,
    images: [{ type: String, trim: true }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, trim: true, default: "Verified farmer" },
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 4.3 },
    verified: { type: Boolean, default: false },
    auctionEnabled: { type: Boolean, default: false },
    currentBid: { type: Number, min: 0, default: 0 },
    pickupAddress: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    location: { type: pointSchema, required: true },
    status: { type: String, enum: ["active", "paused", "closed"], default: "active" }
  },
  { timestamps: true }
);

marketplaceListingSchema.index({ location: "2dsphere" });
marketplaceListingSchema.index({ listingType: 1, category: 1, status: 1 });
marketplaceListingSchema.index({ title: "text", description: "text", district: "text" });

export const MarketplaceListing = mongoose.model("MarketplaceListing", marketplaceListingSchema);
