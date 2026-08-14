import express from "express";
import { body } from "express-validator";
import {
  addComment,
  addReply,
  blockUser,
  createGroup,
  createPost,
  deleteMessage,
  deletePost,
  getGroup,
  joinGroup,
  leaveGroup,
  listChats,
  listComments,
  listConnections,
  listConnectionRequests,
  listFarmers,
  listGroups,
  listMessages,
  listNotifications,
  listPosts,
  markNotificationsRead,
  openChat,
  pinPost,
  reportPost,
  respondConnectionRequest,
  sendConnectionRequest,
  sendMessage,
  suggestedFarmers,
  toggleCommentReaction,
  toggleFollow,
  togglePostReaction,
  toggleSavePost,
  updatePost,
  uploadAttachment
} from "../controllers/socialController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const socialRouter = express.Router();

socialRouter.use(authenticate, authorize("Farmer", "Admin"));

socialRouter.post(
  "/uploads",
  [body("dataUri").isString().isLength({ min: 20 }).withMessage("Upload data is required")],
  validate,
  uploadAttachment
);

socialRouter.get("/groups", listGroups);
socialRouter.post(
  "/groups",
  [
    body("groupName").trim().isLength({ min: 3 }).withMessage("Group name must be at least 3 characters"),
    body("privacy").optional().isIn(["public", "private"]).withMessage("Invalid group privacy")
  ],
  validate,
  createGroup
);
socialRouter.get("/groups/:groupId", getGroup);
socialRouter.post("/groups/:groupId/join", joinGroup);
socialRouter.post("/groups/:groupId/leave", leaveGroup);

socialRouter.get("/groups/:groupId/posts", listPosts);
socialRouter.post(
  "/groups/:groupId/posts",
  [body("content").trim().isLength({ min: 2 }).withMessage("Post content is required")],
  validate,
  createPost
);
socialRouter.put("/posts/:postId", [body("content").optional().trim().isLength({ min: 2 })], validate, updatePost);
socialRouter.delete("/posts/:postId", deletePost);
socialRouter.post("/posts/:postId/react", togglePostReaction);
socialRouter.post("/posts/:postId/save", toggleSavePost);
socialRouter.post("/posts/:postId/pin", pinPost);
socialRouter.post("/posts/:postId/report", reportPost);

socialRouter.get("/posts/:postId/comments", listComments);
socialRouter.post(
  "/posts/:postId/comments",
  [body("comment").trim().isLength({ min: 1 }).withMessage("Comment is required")],
  validate,
  addComment
);
socialRouter.post(
  "/comments/:commentId/replies",
  [body("comment").trim().isLength({ min: 1 }).withMessage("Reply is required")],
  validate,
  addReply
);
socialRouter.post("/comments/:commentId/react", toggleCommentReaction);

socialRouter.get("/farmers", listFarmers);
socialRouter.get("/farmers/suggestions", suggestedFarmers);
socialRouter.post("/connections/:userId", sendConnectionRequest);
socialRouter.get("/connections", listConnections);
socialRouter.get("/connections/requests", listConnectionRequests);
socialRouter.patch("/connections/:connectionId", [body("status").isIn(["accepted", "rejected"])], validate, respondConnectionRequest);
socialRouter.post("/farmers/:userId/follow", toggleFollow);
socialRouter.post("/farmers/:userId/block", blockUser);

socialRouter.get("/chats", listChats);
socialRouter.post("/chats/with/:userId", openChat);
socialRouter.get("/chats/:chatId/messages", listMessages);
socialRouter.post("/chats/:chatId/messages", sendMessage);
socialRouter.delete("/messages/:messageId", deleteMessage);

socialRouter.get("/notifications", listNotifications);
socialRouter.patch("/notifications/read", markNotificationsRead);
