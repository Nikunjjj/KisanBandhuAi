import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    directKey: { type: String, trim: true, unique: true, sparse: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

export const Chat = mongoose.model("Chat", chatSchema);
