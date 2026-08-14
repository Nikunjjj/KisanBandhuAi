import mongoose from "mongoose";

const DOCUMENT_TYPES = ["aadhaar", "land_ownership", "income_certificate", "farmer_verification"];

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    label: { type: String, trim: true }, // Human readable label stored at upload time
    fileName: { type: String, trim: true, required: true },
    mimeType: { type: String, trim: true, required: true },
    size: { type: Number, required: true }, // bytes
    // Primary storage: base64 data URI (≤5 MB). When Cloudinary is configured,
    // dataUri is cleared and cloudinaryUrl is set instead.
    dataUri: { type: String, select: false }, // excluded from list queries
    cloudinaryUrl: { type: String, trim: true, default: "" },
    cloudinaryPublicId: { type: String, trim: true, default: "" },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    verificationNote: { type: String, trim: true, default: "" },
    verifiedAt: { type: Date },
    verifiedBy: { type: String, trim: true, default: "" },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound unique index: one active document per type per user
documentSchema.index({ userId: 1, type: 1, isDeleted: 1 });

export const Document = mongoose.model("Document", documentSchema);
export { DOCUMENT_TYPES };
