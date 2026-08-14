import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  Check,
  Flag,
  Heart,
  Image,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Smile,
  Sprout,
  UserCheck,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { http } from "../api/http";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";

const starterGroups = [
  "Rice Farmers Karnataka",
  "Dairy Farmers India",
  "Irrigation Support Group",
  "Organic Farming Community",
  "Solar Pump Users Group"
];

const tabs = [
  ["groups", "Groups", Users],
  ["network", "Network", UserPlus],
  ["chat", "Chats", MessageCircle],
  ["alerts", "Alerts", Bell]
];

const emojiOptions = ["like", "helpful", "thanks", "insightful"];

function displayName(account, fallback = "Farmer") {
  if (!account) return fallback;
  return account.name || account.fullName || account.email || account.phone || fallback;
}

function initials(account) {
  return displayName(typeof account === "string" ? { name: account } : account)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ user, size = "h-10 w-10" }) {
  return user?.profileImage ? (
    <img src={user.profileImage} alt="" className={`${size} rounded-md object-cover`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-md bg-green-100 font-bold text-leaf`}>
      {initials(user)}
    </span>
  );
}

function sameId(left, right) {
  return String(left || "") === String(right || "");
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-md border border-dashed border-slate-200 bg-white p-6 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-green-50 text-leaf">
          <Icon size={24} />
        </span>
        <h3 className="mt-3 font-bold text-slate-950">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export default function Community() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState({});
  const [typing, setTyping] = useState(null);
  const [search, setSearch] = useState("");
  const [groupForm, setGroupForm] = useState({ groupName: "", description: "", privacy: "public", tags: "" });
  const [postForm, setPostForm] = useState({ content: "", mediaUrl: "", mediaType: "image" });
  const [uploadingPostMedia, setUploadingPostMedia] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageAttachment, setMessageAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const currentAccountName = displayName(user, "Your account");
  const selectedGroupMemberIds = useMemo(
    () => new Set((selectedGroup?.members || []).map((member) => (typeof member === "string" ? member : member._id))),
    [selectedGroup]
  );
  const isSelectedGroupMember = selectedGroupMemberIds.has(user?._id);

  async function loadGroups(nextSearch = search) {
    const { data } = await http.get("/social/groups", { params: { search: nextSearch } });
    setGroups(data.groups);
    if (!selectedGroup && data.groups[0]) setSelectedGroup(data.groups[0]);
  }

  async function loadGroup(groupId) {
    const { data } = await http.get(`/social/groups/${groupId}`);
    setSelectedGroup(data.group);
  }

  async function loadPosts(groupId = selectedGroup?._id) {
    if (!groupId) return;
    const { data } = await http.get(`/social/groups/${groupId}/posts`);
    setPosts(data.posts);
  }

  async function loadNetwork() {
    const [suggestions, connected, pending] = await Promise.all([
      http.get("/social/farmers/suggestions"),
      http.get("/social/connections"),
      http.get("/social/connections/requests")
    ]);
    setFarmers(suggestions.data.farmers);
    setConnections(connected.data.connections);
    setRequests(pending.data.requests);
  }

  async function loadChats(selectChatId = activeChat?._id) {
    const { data } = await http.get("/social/chats");
    setChats(data.chats);
    const selected = data.chats.find((chat) => sameId(chat._id, selectChatId));
    if (selected) setActiveChat(selected);
    else if (!selectChatId && data.chats[0]) setActiveChat(data.chats[0]);
  }

  async function loadNotifications() {
    const { data } = await http.get("/social/notifications");
    setNotifications(data.notifications);
  }

  async function bootstrap() {
    setLoading(true);
    try {
      await Promise.all([loadGroups(), loadNetwork(), loadChats(), loadNotifications()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSelectedGroup(null);
    setPosts([]);
    setComments({});
    setFarmers([]);
    setConnections([]);
    setRequests([]);
    setChats([]);
    setActiveChat(null);
    setMessages([]);
    setNotifications([]);
    setOnline({});
    setTyping(null);
    bootstrap();
  }, [user?._id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tabs.some(([id]) => id === tab)) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    if (selectedGroup?._id) loadPosts(selectedGroup._id);
  }, [selectedGroup?._id]);

  useEffect(() => {
    async function loadChatMessages() {
      if (!activeChat?._id) return;
      const socket = getSocket(token);
      socket?.emit("join_chat", activeChat._id);
      const { data } = await http.get(`/social/chats/${activeChat._id}/messages`);
      setMessages(data.messages);
    }
    loadChatMessages();
    return () => getSocket(token)?.emit("leave_chat", activeChat?._id);
  }, [activeChat?._id, token]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket(token);
    if (!socket) return undefined;

    const receiveMessage = (message) => {
      if (message.chatId === activeChat?._id) setMessages((current) => (current.some((item) => item._id === message._id) ? current : [...current, message]));
      loadChats();
    };
    const receiveNotification = (notification) => setNotifications((current) => [notification, ...current]);
    const updatePresence = ({ userId, online: isOnline }) => setOnline((current) => ({ ...current, [userId]: isOnline }));
    const userTyping = (payload) => {
      if (payload.chatId === activeChat?._id && payload.isTyping) {
        setTyping(payload.name);
        setTimeout(() => setTyping(null), 1600);
      }
    };
    const refreshNetwork = () => loadNetwork();

    socket.on("receive_message", receiveMessage);
    socket.on("new_notification", receiveNotification);
    socket.on("presence:update", updatePresence);
    socket.on("user_typing", userTyping);
    socket.on("connection_request", refreshNetwork);

    return () => {
      socket.off("receive_message", receiveMessage);
      socket.off("new_notification", receiveNotification);
      socket.off("presence:update", updatePresence);
      socket.off("user_typing", userTyping);
      socket.off("connection_request", refreshNetwork);
    };
  }, [activeChat?._id, token]);

  async function createGroup(event) {
    event.preventDefault();
    const payload = { ...groupForm, tags: groupForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    const { data } = await http.post("/social/groups", payload);
    setGroupForm({ groupName: "", description: "", privacy: "public", tags: "" });
    setGroups((current) => [data.group, ...current]);
    await loadGroup(data.group._id);
  }

  async function joinOrLeaveGroup() {
    const action = isSelectedGroupMember ? "leave" : "join";
    await http.post(`/social/groups/${selectedGroup._id}/${action}`);
    await loadGroup(selectedGroup._id);
    await loadGroups();
  }

  async function createPost(event) {
    event.preventDefault();
    const attachments = postForm.mediaUrl ? [{ url: postForm.mediaUrl, type: postForm.mediaType, name: "Shared media" }] : [];
    const { data } = await http.post(`/social/groups/${selectedGroup._id}/posts`, { content: postForm.content, attachments });
    setPosts((current) => [data.post, ...current]);
    setPostForm({ content: "", mediaUrl: "", mediaType: "image" });
  }

  async function uploadFile(file) {
    if (!file) return;
    const dataUri = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const resourceType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "raw";
    const { data } = await http.post("/social/uploads", { dataUri, fileName: file.name, resourceType });
    return data.attachment;
  }

  async function uploadPostMedia(file) {
    setUploadingPostMedia(true);
    try {
      const attachment = await uploadFile(file);
      if (!attachment) return;
      setPostForm((current) => ({
        ...current,
        mediaUrl: attachment.url,
        mediaType: attachment.type === "raw" ? "file" : attachment.type
      }));
    } finally {
      setUploadingPostMedia(false);
    }
  }

  async function reactToPost(postId, emoji = "like") {
    const { data } = await http.post(`/social/posts/${postId}/react`, { emoji });
    setPosts((current) => current.map((post) => (post._id === postId ? { ...post, reactions: data.reactions } : post)));
  }

  async function loadComments(postId) {
    const { data } = await http.get(`/social/posts/${postId}/comments`);
    setComments((current) => ({ ...current, [postId]: data.comments }));
  }

  async function addComment(event, postId) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const comment = form.get("comment");
    if (!comment.trim()) return;
    const { data } = await http.post(`/social/posts/${postId}/comments`, { comment });
    setComments((current) => ({ ...current, [postId]: [data.comment, ...(current[postId] || [])] }));
    event.currentTarget.reset();
  }

  async function addReply(event, postId, commentId) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const comment = form.get("reply");
    if (!comment.trim()) return;
    const { data } = await http.post(`/social/comments/${commentId}/replies`, { comment });
    setComments((current) => ({
      ...current,
      [postId]: (current[postId] || []).map((item) => (item._id === commentId ? data.comment : item))
    }));
    event.currentTarget.reset();
  }

  async function sendRequest(farmerId) {
    try {
      await http.post(`/social/connections/${farmerId}`);
      setNotice("Connection request sent.");
      await loadNetwork();
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to send connection request.");
    }
  }

  async function respondRequest(requestId, status) {
    try {
      const { data } = await http.patch(`/social/connections/${requestId}`, { status });
      setNotice(status === "accepted" ? "Connection accepted. You can now chat." : "Connection request rejected.");
      if (status === "accepted" && data.chat?._id) {
        setActiveChat(data.chat);
        setActiveTab("chat");
        await Promise.all([loadNetwork(), loadChats(data.chat._id)]);
      } else {
        await Promise.all([loadNetwork(), loadChats()]);
      }
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to update connection request.");
    }
  }

  async function startChat(farmerId) {
    try {
      const { data } = await http.post(`/social/chats/with/${farmerId}`);
      setActiveChat(data.chat);
      setActiveTab("chat");
      await loadChats(data.chat._id);
    } catch (error) {
      setNotice(error.response?.data?.message || "Chat opens after the connection is accepted.");
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if ((!messageText.trim() && !messageAttachment) || !activeChat?._id) return;
    const attachments = messageAttachment ? [messageAttachment] : [];
    const { data } = await http.post(`/social/chats/${activeChat._id}/messages`, {
      message: messageText,
      attachments,
      messageType: messageAttachment?.type || "text"
    });
    setMessages((current) => (current.some((item) => item._id === data.message._id) ? current : [...current, data.message]));
    setMessageText("");
    setMessageAttachment(null);
    await loadChats();
  }

  function notifyTyping() {
    if (activeChat?._id) getSocket(token)?.emit("typing", { chatId: activeChat._id, isTyping: true });
  }

  async function markAllRead() {
    const ids = notifications.filter((item) => !item.isRead).map((item) => item._id);
    if (ids.length) await http.patch("/social/notifications/read", { ids });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  const activeChatOther = activeChat?.participants?.find((participant) => !sameId(participant._id, user?._id));

  return (
    <section className="grid gap-4">
      <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Community Discussion</h1>
            <p className="text-sm text-slate-500">Join groups, solve farming problems together, and message trusted farmers.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-3 py-2">
              <Avatar user={user} size="h-8 w-8" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Signed in as</p>
                <p className="text-sm font-bold text-slate-950">{currentAccountName}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 rounded-md border border-slate-200 bg-slate-50 p-1">
              {tabs.map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`focus-ring relative inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${
                    activeTab === id ? "bg-leaf text-white shadow-sm" : "text-slate-600"
                  }`}
                  title={label}
                >
                  <Icon size={17} />
                  <span className="hidden sm:inline">{label}</span>
                  {id === "alerts" && unreadCount > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-mustard px-1.5 text-xs text-slate-950">{unreadCount}</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {notice ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="focus-ring rounded-md p-1 text-slate-500" title="Close">
            <X size={16} />
          </button>
        </div>
      ) : null}

      {activeTab === "groups" ? (
        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <aside className="grid h-fit gap-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadGroups(search);
              }}
              className="rounded-md border border-green-100 bg-white p-3 shadow-sm"
            >
              <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search groups" className="w-full bg-transparent text-sm outline-none" />
              </label>
            </form>

            <form onSubmit={createGroup} className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-slate-950">Create farming group</h2>
              <div className="mt-3 grid gap-3">
                <input required value={groupForm.groupName} onChange={(event) => setGroupForm({ ...groupForm, groupName: event.target.value })} placeholder="Group name" className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <textarea value={groupForm.description} onChange={(event) => setGroupForm({ ...groupForm, description: event.target.value })} placeholder="Description" rows={3} className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <input value={groupForm.tags} onChange={(event) => setGroupForm({ ...groupForm, tags: event.target.value })} placeholder="Tags: rice, dairy, irrigation" className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <select value={groupForm.privacy} onChange={(event) => setGroupForm({ ...groupForm, privacy: event.target.value })} className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <option value="public">Public group</option>
                  <option value="private">Private group</option>
                </select>
                <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-bold text-white">
                  <Plus size={17} /> Create group
                </button>
              </div>
            </form>

            <div className="rounded-md border border-green-100 bg-white p-3 shadow-sm">
              <h2 className="px-1 font-bold text-slate-950">Groups</h2>
              <div className="mt-2 grid gap-2">
                {(groups.length ? groups : starterGroups.map((groupName) => ({ _id: groupName, groupName, description: "Suggested group", members: [] }))).map((group) => (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() => group.createdAt && loadGroup(group._id)}
                    className={`focus-ring rounded-md border p-3 text-left ${selectedGroup?._id === group._id ? "border-leaf bg-green-50" : "border-slate-200 bg-white"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-950">{group.groupName}</span>
                      {group.privacy === "private" ? <Lock size={15} className="text-slate-400" /> : null}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">{group.members?.length || 0} members</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid gap-4">
            {selectedGroup ? (
              <>
                <div className="overflow-hidden rounded-md border border-green-100 bg-white shadow-sm">
                  <div className="h-28 bg-[linear-gradient(135deg,#2f7d32,#f6c445)]" />
                  <div className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-950">{selectedGroup.groupName}</h2>
                          {selectedGroup.privacy === "private" ? <Lock size={18} className="text-slate-500" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{selectedGroup.description || "Farmers sharing practical field advice and local updates."}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                          <span className="rounded-md bg-green-50 px-2 py-1">{selectedGroup.members?.length || 0} members</span>
                          <span className="rounded-md bg-yellow-50 px-2 py-1">{selectedGroup.admins?.length || 0} admins</span>
                          <span className="rounded-md bg-slate-100 px-2 py-1">Guidelines active</span>
                        </div>
                      </div>
                      <button onClick={joinOrLeaveGroup} className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${isSelectedGroupMember ? "border border-slate-200 text-slate-700" : "bg-leaf text-white"}`}>
                        {isSelectedGroupMember ? <X size={17} /> : <UserPlus size={17} />} {isSelectedGroupMember ? "Leave" : "Join"}
                      </button>
                    </div>
                  </div>
                </div>

                {isSelectedGroupMember ? (
                  <form onSubmit={createPost} className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-3 rounded-md bg-green-50 px-3 py-2">
                      <Avatar user={user} size="h-9 w-9" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Posting as</p>
                        <p className="font-bold text-slate-950">{currentAccountName}</p>
                      </div>
                    </div>
                    <textarea required value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} placeholder="Share a crop issue, livestock question, subsidy update, or field experience..." rows={3} className="focus-ring w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                      <input value={postForm.mediaUrl} onChange={(event) => setPostForm({ ...postForm, mediaUrl: event.target.value })} placeholder="Image/video/document URL" className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm" />
                      <select value={postForm.mediaType} onChange={(event) => setPostForm({ ...postForm, mediaType: event.target.value })} className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm">
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="file">Document</option>
                      </select>
                      <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-bold text-white">
                        <Send size={17} /> Post
                      </button>
                    </div>
                    <label className="focus-ring mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                      <Image size={17} /> {uploadingPostMedia ? "Uploading..." : "Upload media"}
                      <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={(event) => uploadPostMedia(event.target.files?.[0])} />
                    </label>
                  </form>
                ) : null}

                {posts.length ? (
                  <div className="grid gap-4">
                    {posts.map((post) => (
                      <article key={post._id} className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar user={post.userId} />
                            <div>
                              <p className="font-bold text-slate-950">{displayName(post.userId, "Unknown farmer")}</p>
                              {sameId(post.userId?._id, user?._id) ? <p className="text-xs font-semibold text-leaf">Your post</p> : null}
                              <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            {post.isPinned ? <Pin size={17} className="text-leaf" /> : null}
                            <MoreHorizontal size={18} />
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{post.content}</p>
                        {post.attachments?.length ? (
                          <div className="mt-3 grid gap-2">
                            {post.attachments.map((attachment) =>
                              attachment.type === "image" ? (
                                <img key={attachment.url} src={attachment.url} alt="" className="max-h-96 w-full rounded-md object-cover" />
                              ) : (
                                <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-leaf">
                                  <Image size={17} /> Open attachment
                                </a>
                              )
                            )}
                          </div>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.hashtags?.map((tag) => (
                            <span key={tag} className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-leaf">#{tag}</span>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          {emojiOptions.map((emoji) => (
                            <button key={emoji} onClick={() => reactToPost(post._id, emoji)} className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
                              <Heart size={15} /> {emoji}
                            </button>
                          ))}
                          <button onClick={() => loadComments(post._id)} className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
                            <MessageCircle size={15} /> {post.commentsCount || 0}
                          </button>
                          <button onClick={() => http.post(`/social/posts/${post._id}/save`)} className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
                            <Bookmark size={15} /> Save
                          </button>
                          <button onClick={() => navigator.share?.({ text: post.content })} className="focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
                            <Share2 size={15} /> Share
                          </button>
                          <button onClick={() => http.post(`/social/posts/${post._id}/report`, { reason: "Reported by user" })} className="focus-ring ml-auto inline-flex items-center gap-1 rounded-md border border-red-100 px-3 py-2 text-xs font-bold text-red-600">
                            <Flag size={15} /> Report
                          </button>
                          <span className="text-xs font-semibold text-slate-500">{post.reactions?.length || 0} reactions</span>
                        </div>
                        {comments[post._id] ? (
                          <div className="mt-4 grid gap-3 rounded-md bg-slate-50 p-3">
                            <form onSubmit={(event) => addComment(event, post._id)} className="flex gap-2">
                              <input name="comment" placeholder="Write a helpful reply" className="focus-ring min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm" />
                              <button className="focus-ring rounded-md bg-slate-900 px-3 text-white" title="Send reply"><Send size={17} /></button>
                            </form>
                            {comments[post._id].map((comment) => (
                              <div key={comment._id} className="rounded-md bg-white p-3">
                                <div className="flex items-center gap-2">
                                  <Avatar user={comment.userId} size="h-8 w-8" />
                                  <span className="text-sm font-bold text-slate-950">{displayName(comment.userId, "Unknown farmer")}</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-700">{comment.comment}</p>
                                {comment.replies?.length ? (
                                  <div className="mt-3 grid gap-2 border-l-2 border-green-100 pl-3">
                                    {comment.replies.map((reply) => (
                                      <div key={reply._id || reply.createdAt} className="text-sm">
                                        <span className="font-bold text-slate-800">{displayName(reply.userId, "Unknown farmer")}: </span>
                                        <span className="text-slate-600">{reply.comment}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                                <form onSubmit={(event) => addReply(event, post._id, comment._id)} className="mt-3 flex gap-2">
                                  <input name="reply" placeholder="Reply" className="focus-ring min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm" />
                                  <button className="focus-ring rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700">Reply</button>
                                </form>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Sprout} title="No discussions yet" text="Start the first useful discussion for this community." />
                )}
              </>
            ) : (
              <EmptyState icon={Users} title="Create or join a group" text="Groups organize public and private farmer conversations by crop, district, livestock, and farming interest." />
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "network" ? (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <aside className="grid h-fit gap-4">
            <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-slate-950">Connected people</h2>
              <p className="text-xs text-slate-500">Start a private chat with any accepted connection.</p>
              <div className="mt-3 grid gap-3">
                {connections.length ? connections.map((farmer) => (
                  <div key={farmer._id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar user={farmer} />
                        {online[farmer._id] || farmer.online ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-leaf" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-950">{displayName(farmer, "Unknown farmer")}</p>
                        <p className="truncate text-xs text-slate-500">{[farmer.profile?.district, farmer.profile?.state].filter(Boolean).join(", ") || "Location not added"}</p>
                      </div>
                    </div>
                    <button onClick={() => startChat(farmer._id)} className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-leaf px-3 py-2 text-sm font-bold text-white">
                      <MessageCircle size={16} /> Message privately
                    </button>
                  </div>
                )) : <p className="text-sm text-slate-500">Accepted connections will appear here.</p>}
              </div>
            </div>

            <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-slate-950">Connection requests</h2>
              <div className="mt-3 grid gap-3">
                {requests.length ? requests.map((request) => (
                  <div key={request._id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={request.senderId} />
                      <div>
                        <p className="font-bold text-slate-950">{displayName(request.senderId, "Unknown farmer")}</p>
                        <p className="text-xs text-slate-500">{request.senderId?.profile?.district || "District not added"}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => respondRequest(request._id, "accepted")} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-leaf px-3 py-2 text-sm font-bold text-white"><Check size={16} /> Accept</button>
                      <button onClick={() => respondRequest(request._id, "rejected")} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700"><X size={16} /> Reject</button>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No pending requests.</p>}
              </div>
            </div>
          </aside>
          <div className="grid gap-3 sm:grid-cols-2">
            {farmers.length ? farmers.map((farmer) => (
              <div key={farmer._id} className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar user={farmer} />
                    {online[farmer._id] || farmer.online ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-leaf" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-950">{displayName(farmer, "Unknown farmer")}</p>
                    <p className="text-xs text-slate-500">{[farmer.profile?.district, farmer.profile?.state].filter(Boolean).join(", ") || "Location not added"}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{farmer.bio || "Farmer interested in practical knowledge sharing and government scheme support."}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                  {(farmer.profile?.cropType || []).slice(0, 3).map((crop) => <span key={crop} className="rounded-md bg-green-50 px-2 py-1">{crop}</span>)}
                  <span className="rounded-md bg-slate-100 px-2 py-1">{farmer.connections?.length || 0} connections</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {farmer.socialStatus?.status === "accepted" ? (
                    <button disabled className="inline-flex items-center justify-center gap-1 rounded-md bg-green-50 px-2 py-2 text-xs font-bold text-leaf"><UserCheck size={15} /> Connected</button>
                  ) : farmer.socialStatus?.status === "pending" && farmer.socialStatus?.direction === "outgoing" ? (
                    <button disabled className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-100 px-2 py-2 text-xs font-bold text-slate-500"><UserPlus size={15} /> Pending</button>
                  ) : farmer.socialStatus?.status === "pending" && farmer.socialStatus?.direction === "incoming" ? (
                    <button onClick={() => respondRequest(farmer.socialStatus.connectionId, "accepted")} className="focus-ring inline-flex items-center justify-center gap-1 rounded-md bg-leaf px-2 py-2 text-xs font-bold text-white"><Check size={15} /> Accept</button>
                  ) : (
                    <button onClick={() => sendRequest(farmer._id)} className="focus-ring inline-flex items-center justify-center gap-1 rounded-md bg-leaf px-2 py-2 text-xs font-bold text-white"><UserPlus size={15} /> Connect</button>
                  )}
                  <button onClick={() => http.post(`/social/farmers/${farmer._id}/follow`)} className="focus-ring inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-2 text-xs font-bold text-slate-700"><UserCheck size={15} /> Follow</button>
                  <button
                    onClick={() => startChat(farmer._id)}
                    disabled={farmer.socialStatus?.status !== "accepted"}
                    className={`focus-ring inline-flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-bold ${
                      farmer.socialStatus?.status === "accepted" ? "border-slate-200 text-slate-700" : "border-slate-100 text-slate-400"
                    }`}
                  >
                    <MessageCircle size={15} /> Chat
                  </button>
                </div>
              </div>
            )) : <EmptyState icon={UserPlus} title="No suggestions yet" text="Complete your profile with crops, livestock, district, and groups to improve farmer suggestions." />}
          </div>
        </div>
      ) : null}

      {activeTab === "chat" ? (
        <div className="grid min-h-[620px] overflow-hidden rounded-md border border-green-100 bg-white shadow-sm lg:grid-cols-[330px_1fr]">
          <aside className="border-b border-slate-100 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-950">Private messages</h2>
              <p className="text-xs text-slate-500">Chats open after accepted connections.</p>
            </div>
            <div className="max-h-[520px] overflow-y-auto p-2">
              {chats.length ? chats.map((chat) => {
                const other = chat.participants?.find((participant) => !sameId(participant._id, user?._id));
                return (
                  <button key={chat._id} onClick={() => setActiveChat(chat)} className={`focus-ring flex w-full items-center gap-3 rounded-md p-3 text-left ${activeChat?._id === chat._id ? "bg-green-50" : "hover:bg-slate-50"}`}>
                    <Avatar user={other} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-slate-950">{displayName(other, "Unknown farmer")}</p>
                        {online[other?._id] || other?.online ? <span className="h-2 w-2 rounded-full bg-leaf" /> : null}
                      </div>
                      <p className="truncate text-xs text-slate-500">{chat.lastMessage?.message || "No messages yet"}</p>
                    </div>
                  </button>
                );
              }) : <div className="p-4 text-sm text-slate-500">Connect with farmers to begin private chats.</div>}
            </div>
          </aside>
          <div className="flex min-h-[620px] flex-col">
            {activeChat ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={activeChatOther} />
                    <div>
                      <p className="font-bold text-slate-950">{displayName(activeChatOther, "Unknown farmer")}</p>
                      <p className="text-xs text-slate-500">{online[activeChatOther?._id] || activeChatOther?.online ? "Online" : "Offline"} {typing ? `• ${typing} typing...` : ""}</p>
                    </div>
                  </div>
                  <button onClick={() => http.post(`/social/farmers/${activeChatOther?._id}/block`)} className="focus-ring rounded-md border border-red-100 p-2 text-red-600" title="Block or report"><ShieldAlert size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto bg-field p-4">
                  <div className="grid gap-3">
                    {messages.map((message) => {
                      const mine = sameId(message.senderId?._id || message.senderId, user?._id);
                      return (
                        <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[82%] rounded-md px-3 py-2 text-sm shadow-sm ${mine ? "bg-leaf text-white" : "bg-white text-slate-800"}`}>
                            <p className={`mb-1 text-[11px] font-bold ${mine ? "text-green-50" : "text-slate-500"}`}>
                              {mine ? currentAccountName : displayName(message.senderId, "Unknown farmer")}
                            </p>
                            <p>{message.isDeleted ? "Message deleted" : message.message}</p>
                            {message.attachments?.map((attachment) =>
                              attachment.type === "image" ? (
                                <img key={attachment.url} src={attachment.url} alt="" className="mt-2 max-h-52 rounded-md object-cover" />
                              ) : (
                                <a key={attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold ${mine ? "bg-white/15 text-white" : "bg-green-50 text-leaf"}`}>
                                  Open attachment
                                </a>
                              )
                            )}
                            <p className={`mt-1 text-[11px] ${mine ? "text-green-50" : "text-slate-400"}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {mine && message.readBy?.length > 1 ? "Seen" : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                </div>
                <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 p-3">
                  <button type="button" className="focus-ring rounded-md border border-slate-200 p-2 text-slate-600" title="Emoji"><Smile size={20} /></button>
                  <label className="focus-ring cursor-pointer rounded-md border border-slate-200 p-2 text-slate-600" title="Attachment">
                    <Image size={20} />
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={async (event) => {
                        const attachment = await uploadFile(event.target.files?.[0]);
                        if (attachment) setMessageAttachment(attachment);
                      }}
                    />
                  </label>
                  <input value={messageText} onChange={(event) => setMessageText(event.target.value)} onKeyDown={notifyTyping} placeholder="Type a private message" className="focus-ring min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm" />
                  <button className="focus-ring rounded-md bg-leaf p-2 text-white" title="Send"><Send size={20} /></button>
                </form>
                {messageAttachment ? <div className="border-t border-slate-100 px-3 py-2 text-xs font-bold text-slate-500">Attached: {messageAttachment.name}</div> : null}
              </>
            ) : (
              <EmptyState icon={MessageCircle} title="Select a chat" text="Accepted connections can exchange real-time private messages with read receipts and typing status." />
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "alerts" ? (
        <div className="rounded-md border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">Notifications</h2>
              <p className="text-sm text-slate-500">Messages, requests, replies, likes, mentions, and group activity.</p>
            </div>
            <button onClick={markAllRead} className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Mark read</button>
          </div>
          <div className="mt-4 grid gap-2">
            {notifications.length ? notifications.map((notification) => (
              <div key={notification._id} className={`rounded-md border p-3 ${notification.isRead ? "border-slate-100 bg-white" : "border-green-100 bg-green-50"}`}>
                <div className="flex items-start gap-3">
                  <Avatar user={notification.actorId} />
                  <div>
                    <p className="font-bold text-slate-950">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.body}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )) : <EmptyState icon={Bell} title="No notifications" text="Live alerts will appear here when farmers message, mention, react, or connect with you." />}
          </div>
        </div>
      ) : null}

      {loading ? <div className="fixed bottom-4 right-4 rounded-md bg-slate-900 px-3 py-2 text-sm font-bold text-white shadow-lg">Loading community...</div> : null}
    </section>
  );
}
