import { io } from "socket.io-client";

let socket;
let socketToken;

export function getSocket(token) {
  if (!token) return null;
  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const serverUrl = apiUrl.replace(/\/api\/?$/, "");
    socketToken = token;
    socket = io(serverUrl, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket", "polling"]
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
}
