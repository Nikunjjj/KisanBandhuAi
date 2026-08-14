import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const livestockSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true },
    count: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const farmerProfileSchema = new mongoose.Schema(
  {
    state: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    village: { type: String, trim: true, default: "" },
    landSize: { type: Number, min: 0, default: 0 },
    cropType: [{ type: String, trim: true }],
    incomeCategory: {
      type: String,
      enum: ["Below Poverty Line", "Low Income", "Middle Income", "High Income", "Not Specified"],
      default: "Not Specified"
    },
    farmerCategory: {
      type: String,
      enum: ["Small", "Marginal", "Medium", "Large", "Tenant", "Women Farmer", "SC/ST Farmer", "Not Specified"],
      default: "Not Specified"
    },
    livestockDetails: [livestockSchema],
    preferredLanguage: { type: String, trim: true, default: "English" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["Farmer", "Admin"], default: "Farmer" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtp: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    isPhoneVerified: { type: Boolean, default: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    profileImage: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, maxlength: 500, default: "" },
    farmingExperience: { type: Number, min: 0, default: 0 },
    profile: { type: farmerProfileSchema, default: () => ({}) },
    bookmarkedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scheme" }],
    groupsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    next(new Error("Either email or phone number is required for an account"));
  } else {
    next();
  }
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationOtp;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

export const User = mongoose.model("User", userSchema);
