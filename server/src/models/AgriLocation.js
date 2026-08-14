import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    userName: { type: String, trim: true, default: "Farmer" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, trim: true, maxlength: 500, default: "" },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const agriLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "fertilizer",
        "seed",
        "pesticide",
        "organic",
        "irrigation",
        "machinery_dealer",
        "equipment_rental",
        "veterinary",
        "livestock_market",
        "dairy",
        "warehouse",
        "cold_storage",
        "bank",
        "cooperative",
        "government_office",
        "kvk",
        "soil_lab",
        "seed_center",
        "procurement_center",
        "service_center",
        "farmer"
      ]
    },
    address: { type: String, trim: true, default: "" },
    village: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    workingHours: { type: String, trim: true, default: "9:00 AM - 6:00 PM" },
    services: [{ type: String, trim: true }],
    products: [{ type: String, trim: true }],
    priceHighlights: [{ type: String, trim: true }],
    rating: { type: Number, min: 0, max: 5, default: 4.2 },
    reviewCount: { type: Number, min: 0, default: 0 },
    reviews: [reviewSchema],
    verified: { type: Boolean, default: false },
    liveInventory: [
      {
        item: { type: String, trim: true },
        quantity: { type: String, trim: true },
        price: { type: Number, min: 0 },
        updatedAt: { type: Date, default: Date.now }
      }
    ],
    governmentMeta: {
      department: { type: String, trim: true, default: "" },
      mspCrops: [{ type: String, trim: true }],
      update: { type: String, trim: true, default: "" }
    },
    location: { type: pointSchema, required: true }
  },
  { timestamps: true }
);

agriLocationSchema.index({ location: "2dsphere" });
agriLocationSchema.index({ category: 1, district: 1, pincode: 1 });
agriLocationSchema.index({ name: "text", address: "text", services: "text", products: "text" });

export const AgriLocation = mongoose.model("AgriLocation", agriLocationSchema);
