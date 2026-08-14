import React, { useEffect, useState } from "react";
import { Search, Award, Trash2, Link as LinkIcon, Building2 } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export default function AdminSchemes() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState("");

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSchemes();
      setSchemes(res.data);
    } catch (err) {
      console.error("Failed to fetch schemes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this scheme? This will remove it from the platform permanently.")) return;
    try {
      await adminApi.deleteScheme(id);
      setSchemes(schemes.filter(s => s._id !== id));
    } catch (err) {
      alert("Failed to delete scheme");
    }
  };

  const filteredSchemes = schemes.filter(s => 
    s.title?.toLowerCase().includes(search.toLowerCase()) || 
    s.provider?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
          <p className="text-slate-500">Manage and moderate agricultural schemes, subsidies, and grants.</p>
        </div>
      </div>

      <div className="flex rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by title, provider, or category..." 
          className="w-full ml-2 bg-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-12 text-center text-slate-500">Loading schemes...</p>
        ) : filteredSchemes.length === 0 ? (
          <p className="col-span-full py-12 text-center text-slate-500">No schemes found.</p>
        ) : (
          filteredSchemes.map(scheme => (
            <div key={scheme._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  {scheme.category || "General"}
                </span>
                <span className="text-xs text-slate-400">{new Date(scheme.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{scheme.title}</h3>
              <p className="mb-4 text-sm text-slate-600 line-clamp-2">{scheme.description || "No description provided."}</p>
              
              <div className="space-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" />
                  <span>{scheme.provider || "Government"}</span>
                </div>
                {scheme.link && (
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-slate-400" />
                    <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      Official Link
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDelete(scheme._id)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Delete Scheme
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
