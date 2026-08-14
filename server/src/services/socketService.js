import { Server } from "socket.io";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { verifyToken } from "../utils/token.js";

let io;
const onlineUsers = new Map();

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub).select("_id name profileImage");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit("presence:update", { userId, online: true });

    socket.on("join_chat", (chatId) => socket.join(`chat:${chatId}`));
    socket.on("leave_chat", (chatId) => socket.leave(`chat:${chatId}`));
    socket.on("typing", ({ chatId, isTyping = true }) => {
      socket.to(`chat:${chatId}`).emit("user_typing", {
        chatId,
        userId,
        name: socket.user.name,
        isTyping
      });
    });

    socket.on("send_message", (payload) => {
      socket.to(`chat:${payload.chatId}`).emit("receive_message", payload);
    });

    socket.on("connection_request", (payload) => {
      emitToUser(payload.receiverId, "connection_request", payload);
    });

    socket.on("disconnect", () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        io.emit("presence:update", { userId, online: false });
      }
    });
  });

  return io;
}

export function emitToUser(userId, event, payload) {
  if (io && userId) io.to(userId.toString()).emit(event, payload);
}

export function emitToChat(chatId, event, payload) {
  if (io && chatId) io.to(`chat:${chatId}`).emit(event, payload);
}

export function emitAll(event, payload) {
  if (io) io.emit(event, payload);
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId?.toString());
}
