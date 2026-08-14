import mongoose from "mongoose";

const DBT_STATUSES = ["applied", "under_review", "approved", "disbursed", "rejected"];

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: DBT_STATUSES, required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const dbtApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    schemeName: { type: String, trim: true, required: true },
    schemeCategory: { type: String, trim: true, default: "General" },
    ministry: { type: String, trim: true, default: "Ministry of Agriculture" },
    appliedOn: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: DBT_STATUSES,
      default: "applied"
    },
    disbursedAmount: { type: Number, default: 0 }, // INR
    paymentDate: { type: Date },
    bankAccountMasked: { type: String, trim: true, default: "" }, // e.g. "XXXX XXXX 4521"
    ifscCode: { type: String, trim: true, default: "" },
    referenceNumber: { type: String, trim: true, unique: true, sparse: true },
    remarks: { type: String, trim: true, default: "" },
    timeline: [timelineEventSchema]
  },
  { timestamps: true }
);

export const DbtApplication = mongoose.model("DbtApplication", dbtApplicationSchema);
export { DBT_STATUSES };
