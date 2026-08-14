import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, default: "like" }
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video", "file"], default: "image" },
    name: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    attachments: [attachmentSchema],
    hashtags: [{ type: String, trim: true, lowercase: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [reactionSchema],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, trim: true, default: "Inappropriate content" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isPinned: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
    commentsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ content: "text", hashtags: "text" });
postSchema.index({ groupId: 1, isPinned: -1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
