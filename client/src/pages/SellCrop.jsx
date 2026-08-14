import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IndianRupee, MapPin, Phone, Scale } from "lucide-react";
import Alert from "../components/Alert";
import { marketplaceApi } from "../api/marketplace";
import { useAuth } from "../context/AuthContext";

export default function SellCrop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    cropName: "",
    cropCategory: "cereal",
    quantity: "",
    quantityUnit: "quintal",
    pricePerUnit: "",
    qualityGrade: "B",
    harvestDate: "",
    description: "",
    village: "",
    district: "",
    phone: "",
    pickupAvailable: true,
    deliveryAvailable: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  useEffect(() => {
    if (id) {
      async function fetchCrop() {
        try {
          const res = await marketplaceApi.getCropById(id);
          const crop = res.data;
          // Ensure harvest date is formatted as YYYY-MM-DD for the date input
          const harvestDateStr = crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : "";
          
          setFormData({
            cropName: crop.cropName || "",
            cropCategory: crop.cropCategory || "cereal",
            quantity: crop.quantity || "",
            quantityUnit: crop.quantityUnit || "quintal",
            pricePerUnit: crop.pricePerUnit || "",
            qualityGrade: crop.qualityGrade || "B",
            harvestDate: harvestDateStr,
            description: crop.description || "",
            village: crop.village || "",
            district: crop.district || "",
            phone: crop.phone || "",
            pickupAvailable: crop.deliveryOption === 'pickup' || crop.deliveryOption === 'both',
            deliveryAvailable: crop.deliveryOption === 'delivery' || crop.deliveryOption === 'both'
          });
        } catch (err) {
          setError("Failed to load crop details for editing.");
        } finally {
          setInitialLoading(false);
        }
      }
      fetchCrop();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Determine delivery option based on checkboxes
      let deliveryOption = "pickup";
      if (formData.pickupAvailable && formData.deliveryAvailable) {
        deliveryOption = "both";
      } else if (formData.deliveryAvailable) {
        deliveryOption = "delivery";
      }

      const payload = {
        cropName: formData.cropName,
        cropCategory: formData.cropCategory,
        quantity: Number(formData.quantity),
        quantityUnit: formData.quantityUnit,
        pricePerUnit: Number(formData.pricePerUnit),
        qualityGrade: formData.qualityGrade,
        harvestDate: formData.harvestDate,
        description: formData.description,
        village: formData.village,
        district: formData.district,
        phone: formData.phone,
        deliveryOption: deliveryOption,
        seller: user._id,
        sellerName: user.name || "Farmer",
        location: {
          type: "Point",
          coordinates: [77.1025, 28.7041] // Mock coordinates - should use actual GPS
        }
      };

      if (id) {
        await marketplaceApi.updateCropListing(id, payload);
      } else {
        await marketplaceApi.createCropListing(payload);
      }
      
      navigate(id ? `/marketplace/${id}` : "/marketplace");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save crop listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-12 text-center text-slate-600">Loading crop details...</div>;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{id ? "Edit Your Harvest" : "Sell Your Harvest"}</h1>
        <p className="mt-2 text-slate-600">{id ? "Update the details of your marketplace listing." : "List your crops directly to buyers on the Agri Marketplace."}</p>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Crop Name *</label>
              <input
                required
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder="e.g. Wheat, Basmati Rice"
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Category *</label>
              <select
                required
                name="cropCategory"
                value={formData.cropCategory}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              >
                <option value="cereal">Cereal</option>
                <option value="pulse">Pulse/Lentil</option>
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="spice">Spice</option>
                <option value="commercial">Commercial Crop</option>
                <option value="fodder">Fodder</option>
                <option value="organic">Organic</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Total Quantity *</label>
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  className="w-32 rounded-md border border-slate-300 bg-slate-50 py-2.5 px-2 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                >
                  <option value="kg">KG</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="crate">Crate</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Price (per {formData.quantityUnit}) *</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  required
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Quality Grade *</label>
              <select
                required
                name="qualityGrade"
                value={formData.qualityGrade}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              >
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Processing)</option>
                <option value="mixed">Mixed Grade</option>
                <option value="not_graded">Not Graded</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Harvest Date *</label>
              <input
                required
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe variety, moisture content, or any other details..."
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              ></textarea>
            </div>

            <div className="col-span-2 mt-4 border-t border-slate-100 pt-4">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Location & Contact</h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Village/City *</label>
              <input
                required
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">District *</label>
              <input
                required
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 py-2.5 px-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Phone Number *</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your contact number"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-3">
               <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="pickupAvailable"
                  checked={formData.pickupAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                />
                Pickup from Farm available
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="deliveryAvailable"
                  checked={formData.deliveryAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                />
                I can arrange transportation
              </label>
            </div>

          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 rounded-b-md bg-slate-50 p-6">
          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className="rounded-md px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-amber-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-70"
          >
            {loading ? "Saving..." : (id ? "Save Changes" : "List Crop for Sale")}
          </button>
        </div>
      </form>
    </section>
  );
}
