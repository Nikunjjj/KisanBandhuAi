import mongoose from "mongoose";
import { SCHEME_CATEGORIES, SCHEME_STATUS } from "../constants/schemeConstants.js";

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    benefits: [{ type: String, required: true, trim: true }],
    eligibilityCriteria: [{ type: String, required: true, trim: true }],
    requiredDocuments: [{ type: String, required: true, trim: true }],
    applicationDeadline: { type: Date, required: true, index: true },
    stateApplicability: [{ type: String, required: true, trim: true, index: true }],
    ministryDepartment: { type: String, required: true, trim: true, index: true },
    applicationLink: { type: String, required: true, trim: true },
    category: { type: String, enum: SCHEME_CATEGORIES, required: true, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    status: { type: String, enum: SCHEME_STATUS, default: "Published", index: true },
    views: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

schemeSchema.index({
  schemeName: "text",
  description: "text",
  benefits: "text",
  eligibilityCriteria: "text",
  ministryDepartment: "text",
  category: "text"
});

export const Scheme = mongoose.model("Scheme", schemeSchema);
