import React, { useEffect, useState } from "react";
import { Search, Store, MapPin, IndianRupee, Trash2, Package } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export default function AdminMarketplace() {
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState("");

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCrops();
      setCrops(res.data);
    } catch (err) {
      console.error("Failed to fetch crops", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this marketplace listing? This action cannot be undone.")) return;
    try {
      await adminApi.deleteCrop(id);
      setCrops(crops.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete crop listing");
    }
  };

  const filteredCrops = crops.filter(crop => 
    crop.cropName.toLowerCase().includes(search.toLowerCase()) || 
    crop.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
    crop.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace Moderation</h1>
          <p className="text-slate-500">Review and moderate agricultural products listed for sale.</p>
        </div>
      </div>

      <div className="flex rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by crop name, farmer, or district..." 
          className="w-full ml-2 bg-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-12 text-center text-slate-500">Loading listings...</p>
        ) : filteredCrops.length === 0 ? (
          <p className="col-span-full py-12 text-center text-slate-500">No listings found.</p>
        ) : (
          filteredCrops.map(crop => (
            <div key={crop._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  Grade {crop.qualityGrade}
                </span>
                <span className="text-xs text-slate-400">{new Date(crop.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{crop.cropName}</h3>
              <p className="mb-4 text-sm text-slate-600 line-clamp-2">{crop.description || "No description provided."}</p>
              
              <div className="space-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{crop.village || crop.district || "Location unknown"}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <IndianRupee size={16} className="text-slate-400" />
                  <span>₹{crop.price} / {crop.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-slate-400" />
                  <span>Available: {crop.quantityAvailable} {crop.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-slate-400" />
                  <span>Seller: {crop.farmerName || "Unknown"}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDelete(crop._id)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Delete Listing
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
