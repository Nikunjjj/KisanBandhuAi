import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Plus, Phone, MessageSquare, IndianRupee, Sprout, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { marketplaceApi } from "../api/marketplace";

const defaultFilters = {
  search: "",
  cropType: "",
  maxPrice: "",
  location: ""
};

export default function Marketplace() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.cropType) params.cropType = filters.cropType;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.location) params.location = filters.location;
    return params;
  }, [filters]);

  async function loadCrops() {
    setLoading(true);
    setError("");
    try {
      const response = await marketplaceApi.getCropListings(queryParams);
      setCrops(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load crops.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCrops();
  }, [queryParams]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-md bg-amber-600 px-5 py-6 text-white shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-amber-100">Agricultural Marketplace</p>
          <h1 className="mt-2 text-3xl font-bold">Buy & Sell Crops Directly</h1>
          <p className="mt-3 max-w-3xl text-amber-50">
            Connect directly with farmers to buy fresh produce, or list your harvest for sale without middlemen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <Link to="/marketplace/new" className="focus-ring inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 font-bold text-amber-700">
              <Plus size={18} /> Sell Crop
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-amber-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Crop Name</span>
            <div className="flex rounded-md border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-600 focus-within:ring-offset-2">
              <span className="grid w-10 place-items-center text-slate-500">
                <Search size={18} />
              </span>
              <input
                className="w-full rounded-md py-2.5 pr-3 outline-none"
                value={filters.cropType}
                onChange={(event) => updateFilter("cropType", event.target.value)}
                placeholder="e.g. Wheat, Tomato..."
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Location</span>
            <div className="flex rounded-md border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-600 focus-within:ring-offset-2">
              <span className="grid w-10 place-items-center text-slate-500">
                <MapPin size={18} />
              </span>
              <input
                className="w-full rounded-md py-2.5 pr-3 outline-none"
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                placeholder="Village, District..."
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Max Price (₹)</span>
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 shadow-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              value={filters.maxPrice}
              onChange={(event) => updateFilter("maxPrice", event.target.value)}
              placeholder="e.g. 2500"
            />
          </label>

          <div className="flex items-end">
             <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className="w-full rounded-md border border-slate-300 bg-slate-50 py-2.5 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <p className="text-slate-500">Loading listings...</p>
        ) : crops.length > 0 ? (
          crops.map(crop => (
            <div key={crop._id} className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer group">
              <Link to={`/marketplace/${crop._id}`} className="block">
                {crop.images && crop.images.length > 0 ? (
                  <img src={crop.images[0]} alt={crop.cropName} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-slate-400">
                    <Sprout size={48} />
                  </div>
                )}
              </Link>
              
              <div className="flex-1 p-4">
                <Link to={`/marketplace/${crop._id}`} className="block">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700">{crop.cropName}</h3>
                    <span className="whitespace-nowrap rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                      {crop.qualityGrade}
                    </span>
                  </div>
                  
                  <p className="mb-3 text-sm text-slate-600 line-clamp-2">{crop.description}</p>
                  
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Tag size={16} className="text-slate-400" />
                      <span className="text-lg text-amber-700">₹{crop.pricePerUnit}</span> 
                      <span className="text-slate-500">/ {crop.quantityUnit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sprout size={16} className="text-slate-400" />
                      <span>Available: <span className="font-semibold">{crop.quantity} {crop.quantityUnit}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{crop.village || crop.district ? `${crop.village}, ${crop.district}` : "Location not specified"}</span>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="flex border-t border-slate-100 bg-slate-50 p-3 gap-2">
                <Link 
                  to={`/marketplace/${crop._id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            No crops found matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
}
