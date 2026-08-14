import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, default: "like" }
  },
  { _id: false }
);

const replySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    reactions: [reactionSchema],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    replies: [replySchema],
    reactions: [reactionSchema],
    isRemoved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
