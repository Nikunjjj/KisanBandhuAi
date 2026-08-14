import mongoose from "mongoose";

const animalProfileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    tagNumber: { type: String, trim: true },
    species: {
      type: String,
      required: true,
      enum: ["Cow", "Buffalo", "Goat", "Sheep", "Poultry", "Pig", "Other"]
    },
    breed: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    dob: { type: Date },
    weight: { type: Number }, // in kg
    pregnancyStatus: { type: String, enum: ["Not Pregnant", "Pregnant", "Lactating", "Dry"] },
    milkProduction: { type: Number }, // liters per day
    allergies: [String],
    photoUrl: { type: String }
  },
  { timestamps: true }
);

animalProfileSchema.index({ owner: 1, species: 1 });

export const AnimalProfile = mongoose.model("AnimalProfile", animalProfileSchema);
