import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, trim: true, default: "" },
    groupImage: { type: String, trim: true, default: "" },
    bannerImage: { type: String, trim: true, default: "" },
    privacy: { type: String, enum: ["public", "private"], default: "public" },
    tags: [{ type: String, trim: true, lowercase: true }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    guidelines: {
      type: String,
      default: "Be respectful, share verified farming advice, and report harmful or spam content."
    }
  },
  { timestamps: true }
);

groupSchema.index({ groupName: "text", description: "text", tags: "text" });
groupSchema.index({ members: 1 });

export const Group = mongoose.model("Group", groupSchema);
