import mongoose from "mongoose";
import { Chat } from "../models/Chat.js";
import { Comment } from "../models/Comment.js";
import { Connection } from "../models/Connection.js";
import { Group } from "../models/Group.js";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { emitToChat, emitToUser, isUserOnline } from "../services/socketService.js";
import { uploadToStorage } from "../services/storageService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const userFields = "name email profileImage bio farmingExperience profile groupsJoined followers following connections";

function asId(id) {
  return new mongoose.Types.ObjectId(id);
}

function ensureObjectId(id, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(`Invalid ${label}`, 400);
}

function extractTags(content = "", extraTags = []) {
  const tags = Array.from(content.matchAll(/#([\w-]+)/g)).map((match) => match[1].toLowerCase());
  return Array.from(new Set([...tags, ...extraTags.map((tag) => String(tag).replace(/^#/, "").toLowerCase())])).filter(Boolean);
}

async function createNotification({ userId, actorId, type, title, body = "", link = "" }) {
  if (!userId || userId.toString() === actorId?.toString()) return null;
  const notification = await Notification.create({ userId, actorId, type, title, body, link });
  emitToUser(userId, "new_notification", notification);
  return notification;
}

async function requireGroupMember(groupId, userId) {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError("Group not found", 404);
  const isMember = group.members.some((member) => member.equals(userId));
  const isAdmin = group.admins.some((admin) => admin.equals(userId));
  if (group.privacy === "private" && !isMember && !isAdmin) {
    throw new AppError("Join this private group to view discussions", 403);
  }
  return group;
}

async function areConnected(userA, userB) {
  return Connection.exists({
    status: "accepted",
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA }
    ]
  });
}

function directChatParts(userA, userB) {
  const participantIds = [userA.toString(), userB.toString()].sort();
  return {
    participants: participantIds.map((id) => asId(id)),
    directKey: participantIds.join(":")
  };
}

async function getOrCreateDirectChat(userA, userB) {
  const { participants, directKey } = directChatParts(userA, userB);
  const existing = await Chat.findOne({
    $or: [
      { directKey },
      { participants: { $all: participants, $size: 2 } }
    ]
  });

  if (existing) {
    if (!existing.directKey) {
      existing.directKey = directKey;
      await existing.save();
    }
    return existing;
  }

  return Chat.create({ participants, directKey });
}

async function attachConnectionStatus(farmers, currentUserId) {
  const farmerIds = farmers.map((farmer) => farmer._id);
  const connections = await Connection.find({
    $or: [
      { senderId: currentUserId, receiverId: { $in: farmerIds } },
      { receiverId: currentUserId, senderId: { $in: farmerIds } }
    ]
  });

  return farmers.map((farmer) => {
    const relation = connections.find(
      (connection) => connection.senderId.equals(farmer._id) || connection.receiverId.equals(farmer._id)
    );
    const socialStatus = relation
      ? {
          connectionId: relation._id,
          status: relation.status,
          direction: relation.senderId.equals(currentUserId) ? "outgoing" : "incoming"
        }
      : { status: "none", direction: null };

    return { ...farmer.toObject(), socialStatus, online: isUserOnline(farmer._id) };
  });
}

export const listGroups = asyncHandler(async (req, res) => {
  const { search = "", privacy } = req.query;
  const filter = {};
  if (search) filter.$text = { $search: search };
  if (privacy) filter.privacy = privacy;

  const groups = await Group.find(filter)
    .populate("admins", "name profileImage")
    .sort({ createdAt: -1 })
    .limit(40);

  res.json({ success: true, groups });
});

export const createGroup = asyncHandler(async (req, res) => {
  const group = await Group.create({
    groupName: req.body.groupName,
    description: req.body.description,
    groupImage: req.body.groupImage,
    bannerImage: req.body.bannerImage,
    privacy: req.body.privacy || "public",
    tags: req.body.tags || [],
    admins: [req.user._id],
    moderators: [req.user._id],
    members: [req.user._id]
  });

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { groupsJoined: group._id } });
  res.status(201).json({ success: true, group });
});

export const getGroup = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.groupId, "group id");
  const group = await Group.findById(req.params.groupId)
    .populate("admins moderators members", "name profileImage profile district state");
  if (!group) throw new AppError("Group not found", 404);
  res.json({ success: true, group });
});

export const joinGroup = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.groupId, "group id");
  const group = await Group.findByIdAndUpdate(
    req.params.groupId,
    { $addToSet: { members: req.user._id } },
    { new: true }
  );
  if (!group) throw new AppError("Group not found", 404);
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { groupsJoined: group._id } });
  res.json({ success: true, group });
});

export const leaveGroup = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.groupId, "group id");
  const group = await Group.findById(req.params.groupId);
  if (!group) throw new AppError("Group not found", 404);
  if (group.admins.some((admin) => admin.equals(req.user._id)) && group.admins.length === 1) {
    throw new AppError("Add another admin before leaving this group", 400);
  }
  group.members.pull(req.user._id);
  group.admins.pull(req.user._id);
  group.moderators.pull(req.user._id);
  await group.save();
  await User.findByIdAndUpdate(req.user._id, { $pull: { groupsJoined: group._id } });
  res.json({ success: true, group });
});

export const listPosts = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.groupId, "group id");
  await requireGroupMember(req.params.groupId, req.user._id);
  const posts = await Post.find({ groupId: req.params.groupId, isRemoved: false })
    .populate("userId", "name profileImage profile")
    .populate("mentions", "name profileImage")
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(60);
  res.json({ success: true, posts });
});

export const createPost = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.groupId, "group id");
  const group = await requireGroupMember(req.params.groupId, req.user._id);
  if (!group.members.some((member) => member.equals(req.user._id))) {
    throw new AppError("Join the group before posting", 403);
  }

  const post = await Post.create({
    groupId: group._id,
    userId: req.user._id,
    content: req.body.content,
    attachments: req.body.attachments || [],
    hashtags: extractTags(req.body.content, req.body.hashtags || []),
    mentions: req.body.mentions || []
  });

  for (const mentionedUser of post.mentions) {
    await createNotification({
      userId: mentionedUser,
      actorId: req.user._id,
      type: "mention",
      title: `${req.user.name} mentioned you`,
      body: post.content.slice(0, 120),
      link: `/community?group=${group._id}&post=${post._id}`
    });
  }

  const populated = await post.populate("userId", "name profileImage profile");
  res.status(201).json({ success: true, post: populated });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  if (!post.userId.equals(req.user._id)) throw new AppError("Only the post author can edit this post", 403);
  post.content = req.body.content ?? post.content;
  post.attachments = req.body.attachments ?? post.attachments;
  post.hashtags = extractTags(post.content, req.body.hashtags || post.hashtags);
  await post.save();
  res.json({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  const group = await Group.findById(post.groupId);
  const canModerate = group?.admins.some((admin) => admin.equals(req.user._id)) || group?.moderators.some((mod) => mod.equals(req.user._id));
  if (!post.userId.equals(req.user._id) && !canModerate) throw new AppError("Not allowed to remove this post", 403);
  post.isRemoved = true;
  await post.save();
  res.json({ success: true, message: "Post removed" });
});

export const togglePostReaction = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  const current = post.reactions.find((reaction) => reaction.user.equals(req.user._id));
  if (current) {
    if (current.emoji === (req.body.emoji || "like")) post.reactions.pull(current);
    else current.emoji = req.body.emoji || "like";
  } else {
    post.reactions.push({ user: req.user._id, emoji: req.body.emoji || "like" });
  }
  await post.save();
  await createNotification({
    userId: post.userId,
    actorId: req.user._id,
    type: "reaction",
    title: `${req.user.name} reacted to your post`,
    body: post.content.slice(0, 120),
    link: `/community?group=${post.groupId}&post=${post._id}`
  });
  res.json({ success: true, reactions: post.reactions });
});

export const toggleSavePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  if (post.savedBy.some((user) => user.equals(req.user._id))) post.savedBy.pull(req.user._id);
  else post.savedBy.push(req.user._id);
  await post.save();
  res.json({ success: true, savedBy: post.savedBy });
});

export const pinPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  const group = await Group.findById(post.groupId);
  if (!group?.admins.some((admin) => admin.equals(req.user._id)) && !group?.moderators.some((mod) => mod.equals(req.user._id))) {
    throw new AppError("Only admins or moderators can pin posts", 403);
  }
  post.isPinned = !post.isPinned;
  await post.save();
  res.json({ success: true, post });
});

export const reportPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  post.reports.push({ user: req.user._id, reason: req.body.reason });
  await post.save();
  res.json({ success: true, message: "Report submitted for moderator review" });
});

export const listComments = asyncHandler(async (req, res) => {
  const sort = req.query.sort === "popular" ? { "reactions.length": -1, createdAt: -1 } : { createdAt: -1 };
  const comments = await Comment.find({ postId: req.params.postId, isRemoved: false })
    .populate("userId replies.userId", "name profileImage")
    .sort(sort)
    .limit(100);
  res.json({ success: true, comments });
});

export const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new AppError("Post not found", 404);
  const comment = await Comment.create({ postId: post._id, userId: req.user._id, comment: req.body.comment });
  post.commentsCount += 1;
  await post.save();
  await createNotification({
    userId: post.userId,
    actorId: req.user._id,
    type: "reply",
    title: `${req.user.name} replied to your discussion`,
    body: comment.comment.slice(0, 120),
    link: `/community?group=${post.groupId}&post=${post._id}`
  });
  res.status(201).json({ success: true, comment: await comment.populate("userId", "name profileImage") });
});

export const addReply = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  comment.replies.push({ userId: req.user._id, comment: req.body.comment });
  await comment.save();
  await createNotification({
    userId: comment.userId,
    actorId: req.user._id,
    type: "reply",
    title: `${req.user.name} replied to your comment`,
    body: req.body.comment.slice(0, 120),
    link: `/community?post=${comment.postId}`
  });
  res.status(201).json({ success: true, comment: await comment.populate("userId replies.userId", "name profileImage") });
});

export const toggleCommentReaction = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  const current = comment.reactions.find((reaction) => reaction.user.equals(req.user._id));
  if (current) comment.reactions.pull(current);
  else comment.reactions.push({ user: req.user._id, emoji: req.body.emoji || "like" });
  await comment.save();
  res.json({ success: true, reactions: comment.reactions });
});

export const listFarmers = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;
  const filter = { _id: { $ne: req.user._id }, role: "Farmer" };
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { "profile.district": new RegExp(search, "i") },
      { "profile.state": new RegExp(search, "i") },
      { "profile.cropType": new RegExp(search, "i") }
    ];
  }
  const farmers = await User.find(filter).select(userFields).limit(50);
  res.json({ success: true, farmers: await attachConnectionStatus(farmers, req.user._id) });
});

export const suggestedFarmers = asyncHandler(async (req, res) => {
  const current = req.user;
  const crops = current.profile?.cropType || [];
  const livestock = current.profile?.livestockDetails?.map((item) => item.type).filter(Boolean) || [];
  const filters = [
    { "profile.state": current.profile?.state },
    { "profile.district": current.profile?.district },
    { "profile.cropType": { $in: crops } },
    { "profile.livestockDetails.type": { $in: livestock } },
    { groupsJoined: { $in: current.groupsJoined || [] } }
  ].filter((item) => Object.values(item)[0] && !(Array.isArray(Object.values(item)[0]?.$in) && Object.values(item)[0].$in.length === 0));

  const farmers = await User.find({
    _id: { $ne: current._id, $nin: current.blockedUsers || [] },
    role: "Farmer",
    ...(filters.length ? { $or: filters } : {})
  })
    .select(userFields)
    .limit(12);

  res.json({ success: true, farmers: await attachConnectionStatus(farmers, req.user._id) });
});

export const sendConnectionRequest = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.userId, "user id");
  if (req.params.userId === req.user._id.toString()) throw new AppError("You cannot connect with yourself", 400);
  const receiver = await User.findById(req.params.userId);
  if (!receiver) throw new AppError("Farmer not found", 404);
  const connection = await Connection.findOneAndUpdate(
    {
      $or: [
        { senderId: req.user._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: req.user._id }
      ]
    },
    { senderId: req.user._id, receiverId: receiver._id, status: "pending" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await createNotification({
    userId: receiver._id,
    actorId: req.user._id,
    type: "connection_request",
    title: `${req.user.name} wants to connect`,
    body: "Accept to start private chat and collaborate.",
    link: "/community?tab=network"
  });
  emitToUser(receiver._id, "connection_request", connection);
  res.status(201).json({ success: true, connection });
});

export const listConnectionRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.find({ receiverId: req.user._id, status: "pending" })
    .populate("senderId", userFields)
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

export const listConnections = asyncHandler(async (req, res) => {
  const connections = await Connection.find({
    status: "accepted",
    $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
  })
    .populate("senderId receiverId", userFields)
    .sort({ updatedAt: -1 });

  const farmers = connections.map((connection) => {
    const farmer = connection.senderId._id.equals(req.user._id) ? connection.receiverId : connection.senderId;
    return {
      ...farmer.toObject(),
      socialStatus: {
        connectionId: connection._id,
        status: "accepted",
        direction: connection.senderId._id.equals(req.user._id) ? "outgoing" : "incoming"
      },
      online: isUserOnline(farmer._id)
    };
  });

  res.json({ success: true, connections: farmers });
});

export const respondConnectionRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.connectionId);
  if (!connection) throw new AppError("Connection request not found", 404);
  if (!connection.receiverId.equals(req.user._id)) throw new AppError("Only receiver can respond", 403);
  connection.status = req.body.status === "accepted" ? "accepted" : "rejected";
  await connection.save();
  let chat = null;
  if (connection.status === "accepted") {
    await User.updateOne({ _id: connection.senderId }, { $addToSet: { connections: connection.receiverId } });
    await User.updateOne({ _id: connection.receiverId }, { $addToSet: { connections: connection.senderId } });
    chat = await getOrCreateDirectChat(connection.senderId, connection.receiverId);
    await createNotification({
      userId: connection.senderId,
      actorId: req.user._id,
      type: "connection_accepted",
      title: `${req.user.name} accepted your request`,
      body: "You can now start a private chat.",
      link: "/community?tab=chat"
    });
  }
  res.json({ success: true, connection, chat });
});

export const toggleFollow = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.userId, "user id");
  const target = await User.findById(req.params.userId);
  if (!target) throw new AppError("Farmer not found", 404);
  const isFollowing = req.user.following.some((user) => user.equals(target._id));
  const update = isFollowing ? "$pull" : "$addToSet";
  await User.updateOne({ _id: req.user._id }, { [update]: { following: target._id } });
  await User.updateOne({ _id: target._id }, { [update]: { followers: req.user._id } });
  res.json({ success: true, following: !isFollowing });
});

export const blockUser = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.userId, "user id");
  await User.updateOne({ _id: req.user._id }, { $addToSet: { blockedUsers: req.params.userId }, $pull: { connections: req.params.userId, followers: req.params.userId, following: req.params.userId } });
  res.json({ success: true, message: "User blocked" });
});

export const listChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id, blockedBy: { $ne: req.user._id } })
    .populate("participants", "name profileImage profile")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });
  res.json({ success: true, chats: chats.map((chat) => ({ ...chat.toObject(), participants: chat.participants.map((user) => ({ ...user.toObject(), online: isUserOnline(user._id) })) })) });
});

export const openChat = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.userId, "user id");
  if (!(await areConnected(req.user._id, req.params.userId))) {
    throw new AppError("Private chat is available after connection is accepted", 403);
  }
  const chat = await (await getOrCreateDirectChat(req.user._id, req.params.userId)).populate("participants", "name profileImage profile");
  res.json({ success: true, chat });
});

export const listMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.chatId, participants: req.user._id });
  if (!chat) throw new AppError("Chat not found", 404);
  const messages = await Message.find({ chatId: chat._id, deletedFor: { $ne: req.user._id } })
    .populate("senderId", "name profileImage")
    .sort({ createdAt: 1 })
    .limit(100);
  await Message.updateMany({ chatId: chat._id, senderId: { $ne: req.user._id } }, { $addToSet: { readBy: req.user._id } });
  emitToChat(chat._id, "messages_read", { chatId: chat._id, readerId: req.user._id });
  res.json({ success: true, messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.chatId, participants: req.user._id, blockedBy: { $ne: req.user._id } });
  if (!chat) throw new AppError("Chat not found", 404);
  if (!req.body.message?.trim() && !req.body.attachments?.length) {
    throw new AppError("Message text or attachment is required", 400);
  }
  const message = await Message.create({
    chatId: chat._id,
    senderId: req.user._id,
    message: req.body.message,
    attachments: req.body.attachments || [],
    messageType: req.body.messageType || (req.body.attachments?.[0]?.type ?? "text"),
    readBy: [req.user._id]
  });
  chat.lastMessage = message._id;
  await chat.save();
  const populated = await message.populate("senderId", "name profileImage");
  emitToChat(chat._id, "receive_message", populated);
  for (const participant of chat.participants) {
    if (!participant.equals(req.user._id)) {
      await createNotification({
        userId: participant,
        actorId: req.user._id,
        type: "message",
        title: `New message from ${req.user.name}`,
        body: message.message?.slice(0, 120) || "Attachment shared",
        link: `/community?tab=chat&chat=${chat._id}`
      });
    }
  }
  res.status(201).json({ success: true, message: populated });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) throw new AppError("Message not found", 404);
  if (!message.senderId.equals(req.user._id)) message.deletedFor.addToSet(req.user._id);
  else message.isDeleted = true;
  await message.save();
  emitToChat(message.chatId, "message_deleted", { messageId: message._id, chatId: message.chatId });
  res.json({ success: true });
});

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .populate("actorId", "name profileImage")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, notifications });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, _id: { $in: req.body.ids || [] } }, { isRead: true });
  res.json({ success: true });
});

export const uploadAttachment = asyncHandler(async (req, res) => {
  const upload = await uploadToStorage({
    dataUri: req.body.dataUri,
    folder: req.body.folder || "krishimitra/community",
    resourceType: req.body.resourceType || "auto"
  });
  res.status(201).json({ success: true, attachment: { url: upload.url, type: upload.type === "raw" ? "file" : upload.type, name: req.body.fileName || "Attachment" } });
});
