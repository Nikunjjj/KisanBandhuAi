import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["message", "connection_request", "connection_accepted", "reply", "reaction", "group_invite", "mention", "moderation"],
      required: true
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
