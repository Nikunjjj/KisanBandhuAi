import React, { useEffect, useState } from "react";
import { Search, MapPinned, Trash2, Building, Navigation } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export default function AdminMap() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLocations();
      setLocations(res.data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this map location? This will remove the marker from the AgriMap.")) return;
    try {
      await adminApi.deleteLocation(id);
      setLocations(locations.filter(loc => loc._id !== id));
    } catch (err) {
      alert("Failed to delete location");
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.name?.toLowerCase().includes(search.toLowerCase()) || 
    loc.type?.toLowerCase().includes(search.toLowerCase()) ||
    loc.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Map Directory Moderation</h1>
          <p className="text-slate-500">Manage businesses, cold storages, and service centers shown on the Smart Agri Map.</p>
        </div>
      </div>

      <div className="flex rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name, type, or district..." 
          className="w-full ml-2 bg-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-12 text-center text-slate-500">Loading map locations...</p>
        ) : filteredLocations.length === 0 ? (
          <p className="col-span-full py-12 text-center text-slate-500">No locations found.</p>
        ) : (
          filteredLocations.map(loc => (
            <div key={loc._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {loc.type || "Service"}
                </span>
                <span className="text-xs text-slate-400">{new Date(loc.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{loc.name}</h3>
              <p className="mb-4 text-sm text-slate-600 line-clamp-2">{loc.description || "No description provided."}</p>
              
              <div className="space-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <MapPinned size={16} className="text-slate-400" />
                  <span>{loc.address || loc.district || "Address unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-slate-400" />
                  <span>Lat: {loc.coordinates?.[1]}, Lng: {loc.coordinates?.[0]}</span>
                </div>
                {loc.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-slate-400" />
                    <span>Contact: {loc.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDelete(loc._id)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Remove Marker
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
