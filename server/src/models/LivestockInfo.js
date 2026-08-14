import mongoose from "mongoose";

const livestockInfoSchema = new mongoose.Schema(
  {
    animal: { type: String, required: true, trim: true, index: true },
    feeding: [String],
    vaccination: [String],
    hygiene: [String],
    breeding: String,
    prevention: String,
    emergency: String
  },
  { timestamps: true }
);

livestockInfoSchema.index({ animal: "text", feeding: "text", prevention: "text" });

export const LivestockInfo = mongoose.model("LivestockInfo", livestockInfoSchema);
