import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

export const JOB_CATEGORIES = [
  "harvesting",
  "planting",
  "irrigation",
  "pesticide_spraying",
  "machinery_operation",
  "livestock_care",
  "fruit_picking",
  "vegetable_picking",
  "warehouse_loading",
  "seasonal_farm_work",
  "other"
];

export const JOB_STATUSES = ["active", "filled", "expired", "cancelled"];

const jobListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    workCategory: { type: String, enum: JOB_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    workersNeeded: { type: Number, min: 1, default: 1 },
    location: { type: pointSchema, required: true },
    address: { type: String, trim: true, default: "" },
    village: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    preferredDate: { type: Date, required: true },
    workingHours: { type: String, trim: true, default: "" },
    duration: { type: String, trim: true, default: "" },
    paymentMethod: { type: String, enum: ["hourly", "daily"], required: true },
    wageAmount: { type: Number, min: 0, required: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true, default: "" },
    requirements: { type: String, trim: true, maxlength: 1000, default: "" },
    experienceRequired: { type: Boolean, default: false },
    equipmentNeeded: { type: String, trim: true, default: "" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerName: { type: String, trim: true, default: "" },
    status: { type: String, enum: JOB_STATUSES, default: "active", index: true },
    expiresAt: { type: Date },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

jobListingSchema.index({ location: "2dsphere" });
jobListingSchema.index({ status: 1, workCategory: 1, preferredDate: 1 });
jobListingSchema.index({ title: "text", description: "text", village: "text", district: "text" });

export const JobListing = mongoose.model("JobListing", jobListingSchema);
