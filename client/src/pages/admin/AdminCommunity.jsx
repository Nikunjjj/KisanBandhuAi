import React, { useEffect, useState } from "react";
import { Search, MessageSquare, Trash2, User } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export default function AdminCommunity() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPosts();
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this community post? This action cannot be undone.")) return;
    try {
      await adminApi.deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(search.toLowerCase()) || 
    post.content?.toLowerCase().includes(search.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Moderation</h1>
          <p className="text-slate-500">Review and moderate all community discussions and posts.</p>
        </div>
      </div>

      <div className="flex rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by keyword, content, or author..." 
          className="w-full ml-2 bg-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="py-12 text-center text-slate-500">Loading posts...</p>
        ) : filteredPosts.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No posts found.</p>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <User size={16} />
                    {post.author?.name || "Anonymous User"}
                  </div>
                  <span className="text-xs text-slate-400">• {new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {post.category || "General"}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                
                {post.image && (
                  <div className="mt-4 max-w-sm rounded-lg border border-slate-200 overflow-hidden">
                    <img src={post.image} alt="Post attachment" className="w-full h-auto object-cover max-h-48" />
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                <button 
                  onClick={() => handleDelete(post._id)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Delete Post
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
