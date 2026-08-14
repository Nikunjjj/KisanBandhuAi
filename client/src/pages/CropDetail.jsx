import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, MapPin, Sprout, IndianRupee, User, Calendar, Truck, Star } from "lucide-react";
import Alert from "../components/Alert";
import { marketplaceApi } from "../api/marketplace";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCrop() {
      try {
        const response = await marketplaceApi.getCropById(id);
        setCrop(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load crop details");
      } finally {
        setLoading(false);
      }
    }

    fetchCrop();
  }, [id]);

  if (loading) return <div className="p-12 text-center">Loading crop details...</div>;
  if (error) return <Alert type="error" className="m-6">{error}</Alert>;
  if (!crop) return <Alert type="error" className="m-6">Crop not found</Alert>;

  const handleWhatsApp = () => {
    if (crop.whatsapp) {
      window.open(`https://wa.me/${crop.whatsapp}`, "_blank");
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${crop.phone}`;
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await marketplaceApi.deleteCropListing(crop._id);
        navigate("/marketplace");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete listing.");
      }
    }
  };

  const totalPrice = crop.pricePerUnit * crop.quantity;
  const isOwner = user && user._id === crop.seller;

  return (
    <section className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{crop.cropName}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Sprout size={16} />
              <span className="capitalize">{crop.cropCategory}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{crop.village || crop.district}, {crop.state}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{new Date(crop.harvestDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Price and Quantity */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-xs text-amber-600 uppercase tracking-wide font-semibold mb-1">Price per {crop.quantityUnit}</p>
                <p className="text-2xl font-bold text-amber-700">₹{crop.pricePerUnit.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">Available Quantity</p>
                <p className="text-2xl font-bold text-blue-700">{crop.quantity} {crop.quantityUnit}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">Total Value</p>
                <p className="text-2xl font-bold text-green-700">₹{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Quality and Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Quality Grade</h3>
                <p className="text-slate-600 capitalize">{crop.qualityGrade}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Organic</h3>
                <p className="text-slate-600">{crop.isOrganic ? "Yes - Certified Organic" : "Conventional"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Harvest Date</h3>
                <p className="text-slate-600">{new Date(crop.harvestDate).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-1">Delivery Option</h3>
                <p className="text-slate-600 capitalize">{crop.deliveryOption.replace(/_/g, " ")}</p>
              </div>
            </div>

            {/* Description */}
            {crop.description && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{crop.description}</p>
              </div>
            )}

            {/* Location Details */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">Location Details</h2>
              <div className="space-y-2 text-slate-700">
                <p><strong>Address:</strong> {crop.pickupAddress || `${crop.village}, ${crop.district}, ${crop.state}`}</p>
                <p><strong>Village:</strong> {crop.village}</p>
                <p><strong>District:</strong> {crop.district}</p>
                <p><strong>State:</strong> {crop.state}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Information */}
          <div className="md:col-span-1">
            <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-6 shadow-md">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Seller Information</h3>

              {/* Seller Info */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="text-amber-700" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{crop.sellerName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-slate-600">{crop.sellerRating.toFixed(1)} rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 transition"
                >
                  <Phone size={18} />
                  Call: {crop.phone}
                </button>

                {crop.whatsapp && (
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white font-semibold hover:bg-green-600 transition"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                )}
              </div>

              {/* Status */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Status</p>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold capitalize bg-amber-100 text-amber-800">
                  {crop.status}
                </span>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Manage Listing</h4>
                  <div className="space-y-3">
                    <Link
                      to={`/marketplace/${crop._id}/edit`}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-100 px-4 py-3 text-amber-700 font-semibold hover:bg-amber-200 transition"
                    >
                      Edit Listing
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-red-700 font-semibold hover:bg-red-100 transition"
                    >
                      Delete Listing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
