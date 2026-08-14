import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnimalProfile",
      required: true,
      index: true
    },
    recordType: {
      type: String,
      required: true,
      enum: ["Vaccination", "Deworming", "Illness", "Checkup", "Treatment", "Pregnancy", "Other"]
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    title: { type: String, required: true },
    description: { type: String },
    medicineAdministered: { type: String },
    nextDueDate: { type: Date, index: true }, // Used for reminders
    veterinarian: { type: String },
    cost: { type: Number },
    status: {
      type: String,
      enum: ["Completed", "Upcoming", "Missed"],
      default: "Completed"
    }
  },
  { timestamps: true }
);

healthRecordSchema.index({ animalId: 1, date: -1 });

export const HealthRecord = mongoose.model("HealthRecord", healthRecordSchema);
