import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

const equipmentRentalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    equipmentType: {
      type: String,
      enum: ["tractor", "harvester", "rotavator", "sprayer", "water_pump", "drone", "seeder", "thresher", "other"],
      required: true
    },
    description: { type: String, trim: true, maxlength: 1200, default: "" },
    images: [{ type: String, trim: true }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, trim: true, default: "Equipment owner" },
    phone: { type: String, trim: true, default: "" },
    hourlyRate: { type: Number, min: 0, default: 0 },
    dailyRate: { type: Number, min: 0, default: 0 },
    deposit: { type: Number, min: 0, default: 0 },
    availableDates: [{ type: Date }],
    bookingMode: { type: String, enum: ["instant", "request"], default: "request" },
    rating: { type: Number, min: 0, max: 5, default: 4.4 },
    verified: { type: Boolean, default: false },
    address: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    location: { type: pointSchema, required: true },
    status: { type: String, enum: ["active", "paused"], default: "active" }
  },
  { timestamps: true }
);

equipmentRentalSchema.index({ location: "2dsphere" });
equipmentRentalSchema.index({ equipmentType: 1, status: 1 });
equipmentRentalSchema.index({ name: "text", description: "text", district: "text" });

export const EquipmentRental = mongoose.model("EquipmentRental", equipmentRentalSchema);
