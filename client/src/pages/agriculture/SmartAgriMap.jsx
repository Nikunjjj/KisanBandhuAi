import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  BadgeCheck,
  Banknote,
  BellRing,
  Bookmark,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Filter,
  IndianRupee,
  Landmark,
  Loader2,
  LocateFixed,
  MapPin,
  MessageCircle,
  Mic,
  Navigation,
  Phone,
  Plus,
  Route,
  Search,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  Sprout,
  Tractor,
  Users,
  Warehouse,
  X
} from "lucide-react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Alert from "../../components/Alert";
import { http } from "../../api/http";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

const resourceCategories = [
  { value: "", label: "All resources", icon: MapPin },
  { value: "fertilizer", label: "Fertilizers", icon: Sprout },
  { value: "seed", label: "Seeds", icon: Sprout },
  { value: "pesticide", label: "Pesticides", icon: BellRing },
  { value: "organic", label: "Organic centers", icon: Sprout },
  { value: "irrigation", label: "Irrigation", icon: Boxes },
  { value: "machinery_dealer", label: "Machinery dealers", icon: Tractor },
  { value: "equipment_rental", label: "Equipment rentals", icon: Tractor },
  { value: "veterinary", label: "Veterinary", icon: Building2 },
  { value: "livestock_market", label: "Livestock markets", icon: Users },
  { value: "dairy", label: "Dairy centers", icon: Boxes },
  { value: "warehouse", label: "Warehouses", icon: Warehouse },
  { value: "cold_storage", label: "Cold storage", icon: Warehouse },
  { value: "bank", label: "Banks", icon: Landmark },
  { value: "cooperative", label: "Cooperatives", icon: Users },
  { value: "government_office", label: "Govt offices", icon: Building2 },
  { value: "kvk", label: "KVKs", icon: Sprout },
  { value: "soil_lab", label: "Soil labs", icon: BellRing },
  { value: "procurement_center", label: "Procurement", icon: IndianRupee },
  { value: "farmer", label: "Nearby farmers", icon: Users }
];

const marketplaceCategories = ["crop", "vegetable", "fruit", "grain", "dairy", "livestock", "fertilizer", "seed", "tool", "irrigation", "machinery", "feed", "used_equipment"];
const quickQueries = ["Find fertilizer shops near me", "Show nearby rice buyers", "Locate tractor rentals within 10 km", "Where can I sell tomatoes?", "Nearest veterinary hospital"];

const pinColors = {
  resource: "#2f7d32",
  buy: "#2563eb",
  sell: "#d97706",
  equipment: "#9333ea",
  government: "#0f766e"
};

const queryCategoryHints = [
  ["fertilizer", "fertilizer"],
  ["seed", "seed"],
  ["pesticide", "pesticide"],
  ["tractor", "equipment"],
  ["rental", "equipment"],
  ["rent", "equipment"],
  ["buyer", "buyers"],
  ["buy", "buyers"],
  ["sell", "sellers"],
  ["veterinary", "veterinary"],
  ["hospital", "veterinary"],
  ["warehouse", "warehouse"],
  ["cold storage", "cold_storage"],
  ["soil", "soil_lab"],
  ["kvk", "kvk"],
  ["procurement", "procurement_center"],
  ["msp", "procurement_center"],
  ["bank", "bank"]
];

function createMarkerIcon(type) {
  const color = pinColors[type] || pinColors.resource;
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:${color};color:white;border:3px solid white;box-shadow:0 8px 20px rgba(15,23,42,.25);font-size:14px;font-weight:800;">${type === "equipment" ? "T" : type === "buy" ? "B" : type === "sell" ? "S" : "K"}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom() || 11, { animate: true });
  }, [center, map]);
  return null;
}

function coordsOf(item) {
  const [lng, lat] = item.location?.coordinates || [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];
  return { lat, lng };
}

function normalizeMapItems(resources, listings, rentals) {
  const resourceItems = resources.map((item) => ({ ...item, mapType: item.category?.includes("government") || ["kvk", "soil_lab", "procurement_center"].includes(item.category) ? "government" : "resource" }));
  const listingItems = listings.map((item) => ({ ...item, name: item.title, mapType: item.listingType === "buy" ? "buy" : "sell" }));
  const rentalItems = rentals.map((item) => ({ ...item, mapType: "equipment" }));
  return [...resourceItems, ...listingItems, ...rentalItems];
}

function getDirectionsUrl(item) {
  const { lat, lng } = coordsOf(item);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function inferSearchTarget(value) {
  const normalized = value.toLowerCase();
  return queryCategoryHints.find(([hint]) => normalized.includes(hint))?.[1] || "";
}

async function geocodePlace(value) {
  const query = value.trim();
  if (!query) return null;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`
  );
  if (!response.ok) return null;

  const [place] = await response.json();
  if (!place?.lat || !place?.lon) return null;

  return {
    lat: Number(place.lat),
    lng: Number(place.lon),
    label: place.display_name
  };
}

function StatTile({ icon: Icon, label, value, tone = "leaf" }) {
  const tones = {
    leaf: "bg-leaf-50 text-leaf-700 dark:bg-leaf-950/30 dark:text-leaf-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"
  };
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-premium dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-extrabold text-slate-950 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function ResultCard({ item, onSelect, onSave }) {
  const isListing = Boolean(item.listingType);
  const isRental = Boolean(item.equipmentType);
  const price = isListing
    ? `₹${item.price}/${item.priceUnit || "unit"}`
    : isRental
      ? `₹${item.hourlyRate}/hr`
      : item.priceHighlights?.[0];

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-premium transition hover:-translate-y-0.5 hover:shadow-premium-hover dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-extrabold text-slate-950 dark:text-white">{item.name || item.title}</h3>
            {item.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                <BadgeCheck size={12} /> Verified
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-xs font-medium text-slate-500 dark:text-slate-400">{item.address || item.pickupAddress || item.description}</p>
        </div>
        <button type="button" onClick={() => onSave(item)} className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" title="Save">
          <Bookmark size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-bold">
        <span className="rounded-xl bg-slate-50 px-2 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.distanceKm ?? "--"} km</span>
        <span className="rounded-xl bg-slate-50 px-2 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.travelTimeMinutes ?? "--"} min</span>
        <span className="rounded-xl bg-slate-50 px-2 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">★ {item.rating || "4.2"}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {price && <span className="rounded-full bg-mustard-light px-3 py-1 text-xs font-extrabold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">{price}</span>}
        {(item.quantity || item.workingHours) && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.quantity || item.workingHours}</span>}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onSelect(item)} className="focus-ring rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
          Details
        </button>
        <a href={getDirectionsUrl(item)} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
          <Navigation size={13} /> Go
        </a>
        <a href={item.phone ? `tel:${item.phone}` : "#"} className="focus-ring inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
          <Phone size={13} /> Call
        </a>
      </div>
    </article>
  );
}

function DetailPanel({ item, onClose, currentUser, onEdit, onDelete }) {
  if (!item) return null;
  const chips = [...(item.services || []), ...(item.products || [])].slice(0, 8);
  const sellerName = item.sellerName || item.farmerName || item.ownerName || item.name || "Seller";
  const sellerRating = item.sellerRating || item.rating || 4.2;
  const isOwner = currentUser?._id && item.owner === currentUser._id;
  
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-premium dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-leaf-600 dark:text-leaf-300">{item.category || item.equipmentType || item.listingType}</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">{item.name || item.title}</h2>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{item.description || item.address || item.pickupAddress}</p>
        </div>
        <button type="button" onClick={onClose} className="focus-ring rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-[11px] font-bold text-slate-500">Distance</p>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{item.distanceKm} km, {item.travelTimeMinutes} min</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-[11px] font-bold text-slate-500">Rating</p>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">★ {sellerRating}</p>
        </div>
      </div>

      {/* Contact Information Section */}
      {(sellerName || item.phone) && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <h3 className="mb-3 text-sm font-extrabold text-amber-900 dark:text-amber-200">📞 Contact Information</h3>
          
          {sellerName && (
            <div className="mb-3 pb-3 border-b border-amber-200 dark:border-amber-900">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">SELLER NAME</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{sellerName}</p>
            </div>
          )}
          
          {item.phone && (
            <div className="mb-3">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">PHONE NUMBER</p>
              <a 
                href={`tel:${item.phone}`}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-extrabold text-white hover:bg-green-700 transition mt-2"
              >
                <Phone size={14} /> {item.phone}
              </a>
            </div>
          )}
          
          {item.whatsapp && (
            <div className="pt-3 border-t border-amber-200 dark:border-amber-900">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">WHATSAPP</p>
              <a 
                href={`https://wa.me/${item.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-extrabold text-white hover:bg-green-600 transition mt-2"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-700 dark:bg-leaf-950/30 dark:text-leaf-300">{chip}</span>
          ))}
        </div>
      )}

      {item.liveInventory?.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-extrabold text-slate-950 dark:text-white">Live inventory</h3>
          <div className="grid gap-2">
            {item.liveInventory.map((stock) => (
              <div key={stock.item} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-800">
                <span>{stock.item}</span>
                <span>{stock.quantity} · ₹{stock.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.governmentMeta?.update && (
        <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
          {item.governmentMeta.update}
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <a href={getDirectionsUrl(item)} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-4 py-3 text-xs font-extrabold text-white">
          <Route size={15} /> Navigate
        </a>
        {item.phone && (
          <a href={`tel:${item.phone}`} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
            <Phone size={15} /> Call
          </a>
        )}
        <a href="/community" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
          <MessageCircle size={15} /> Message
        </a>
      </div>

      {isOwner && (
        <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={() => onEdit(item)} className="focus-ring inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-xs font-extrabold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
            Edit listing
          </button>
          <button type="button" onClick={() => { if(window.confirm('Are you sure you want to delete this listing?')) onDelete(item); }} className="focus-ring inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-3 text-xs font-extrabold text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50">
            Delete listing
          </button>
        </div>
      )}
    </aside>
  );
}

function CreateListingPanel({ center, onCreated, initialData, onUpdated, onCancel }) {
  const [mode, setMode] = useState(initialData?.listingType || "sell");
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "vegetable");
  const [price, setPrice] = useState(initialData?.price || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || "");
  const [pickupAddress, setPickupAddress] = useState(initialData?.pickupAddress || "");
  const [district, setDistrict] = useState(initialData?.district || "");
  const [pincode, setPincode] = useState(initialData?.pincode || "");
  const [lat, setLat] = useState(initialData ? String(initialData.location?.coordinates[1] || center.lat.toFixed(6)) : String(center.lat.toFixed(6)));
  const [lng, setLng] = useState(initialData ? String(initialData.location?.coordinates[0] || center.lng.toFixed(6)) : String(center.lng.toFixed(6)));
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sync initialData changes
  useEffect(() => {
    if (initialData) {
      setMode(initialData.listingType || "sell");
      setTitle(initialData.title || "");
      setCategory(initialData.category || "vegetable");
      setPrice(initialData.price || "");
      setQuantity(initialData.quantity || "");
      setPickupAddress(initialData.pickupAddress || "");
      setDistrict(initialData.district || "");
      setPincode(initialData.pincode || "");
      setPhone(initialData.phone || "");
      setWhatsapp(initialData.whatsapp || "");
      setLat(String(initialData.location?.coordinates[1] || center.lat.toFixed(6)));
      setLng(String(initialData.location?.coordinates[0] || center.lng.toFixed(6)));
    } else {
      setLat(String(center.lat.toFixed(6)));
      setLng(String(center.lng.toFixed(6)));
    }
  }, [center.lat, center.lng, initialData]);

  const useGpsForListing = () => {
    if (!navigator.geolocation) {
      setError("GPS is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(String(position.coords.latitude.toFixed(6)));
        setLng(String(position.coords.longitude.toFixed(6)));
        setError("");
      },
      () => setError("Location permission was denied. You can enter latitude and longitude manually.")
    );
  };

  const geocodePickupAddress = async () => {
    setError("");
    try {
      const place = await geocodePlace([pickupAddress, district, pincode].filter(Boolean).join(", "));
      if (!place) {
        setError("Could not find that pickup location. Try adding village, district, state, or PIN code.");
        return;
      }
      setLat(String(place.lat.toFixed(6)));
      setLng(String(place.lng.toFixed(6)));
      if (!pickupAddress) setPickupAddress(place.label);
    } catch {
      setError("Could not search that pickup location right now.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      setError("Please add a valid latitude and longitude for the pickup location.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        title,
        listingType: mode,
        category,
        price: Number(price || 0),
        priceUnit: category === "grain" ? "quintal" : "kg",
        quantity,
        description: `${mode === "sell" ? "Available for sale" : "Looking to buy"} through KrishiMitra marketplace.`,
        pickupAddress: pickupAddress || "Seller pickup location",
        district,
        pincode,
        phone,
        whatsapp,
        lat: parsedLat,
        lng: parsedLng,
        verified: true
      };

      if (initialData) {
        const res = await http.put(`/agri-map/marketplace/${initialData._id}`, payload);
        onUpdated(res.data.listing);
      } else {
        const res = await http.post("/agri-map/marketplace", payload);
        setTitle("");
        setPrice("");
        setQuantity("");
        setPickupAddress("");
        setPhone("");
        setWhatsapp("");
        setDistrict("");
        setPincode("");
        onCreated(res.data.listing);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${initialData ? 'update' : 'publish'} listing.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-premium dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{initialData ? "Edit marketplace listing" : "Create marketplace listing"}</h3>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold dark:bg-slate-800">
          {["sell", "buy"].map((item) => (
            <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-lg px-3 py-1.5 capitalize ${mode === item ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="Crop, product, livestock, or equipment" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800">
          {marketplaceCategories.map((item) => <option key={item} value={item} className="dark:bg-slate-900">{item.replace("_", " ")}</option>)}
        </select>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="Quantity, e.g. 2 tonnes" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="Price" />
        <input required value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800 sm:col-span-2" placeholder="Pickup location or farm address" />
        <input value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="District / city" />
        <input value={pincode} onChange={(e) => setPincode(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="PIN code" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="Your phone number" />
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="WhatsApp number (optional)" />
        <input required value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="Latitude" />
        <input required value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-leaf dark:border-slate-800" placeholder="Longitude" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => { setLat(String(center.lat.toFixed(6))); setLng(String(center.lng.toFixed(6))); }} className="focus-ring rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
          Use map center
        </button>
        <button type="button" onClick={useGpsForListing} className="focus-ring rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
          Use my GPS
        </button>
        <button type="button" onClick={geocodePickupAddress} className="focus-ring col-span-2 rounded-xl border border-leaf-200 bg-leaf-50 px-3 py-2 text-xs font-extrabold text-leaf-700 hover:bg-leaf-100 dark:border-leaf-900 dark:bg-leaf-950/30 dark:text-leaf-300">
          Find coordinates from address
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        {initialData && (
          <button type="button" onClick={onCancel} disabled={saving} className="focus-ring flex-1 rounded-xl bg-slate-100 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
        )}
        <button disabled={saving} className="focus-ring inline-flex flex-[2] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} {initialData ? "Save changes" : "Publish on map"}
        </button>
      </div>
    </form>
  );
}

export default function SmartAgriMap() {
  const { user } = useAuth();
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [radiusKm, setRadiusKm] = useState(25);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingListing, setEditingListing] = useState(null);
  const [resources, setResources] = useState([]);
  const [listings, setListings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [government, setGovernment] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("krishi_saved_locations") || "[]"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapItems = useMemo(() => normalizeMapItems(resources, listings, rentals), [resources, listings, rentals]);
  const buyers = listings.filter((item) => item.listingType === "buy");
  const sellers = listings.filter((item) => item.listingType === "sell");

  const fetchData = async (overrides = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        lat: overrides.center?.lat ?? center.lat,
        lng: overrides.center?.lng ?? center.lng,
        radiusKm: overrides.radiusKm ?? radiusKm,
        search: overrides.search ?? search,
        category: overrides.category ?? category
      };
      const [resourceRes, listingRes, rentalRes, governmentRes, recRes] = await Promise.all([
        http.get("/agri-map/resources", { params }),
        http.get("/agri-map/marketplace", { params: { ...params, category: "" } }),
        http.get("/agri-map/equipment", { params: { lat: params.lat, lng: params.lng, radiusKm: params.radiusKm, search: params.search } }),
        http.get("/agri-map/government", { params: { lat: params.lat, lng: params.lng, radiusKm: params.radiusKm, search: params.search } }),
        http.get("/agri-map/recommendations", { params: { lat: params.lat, lng: params.lng } })
      ]);
      setResources(resourceRes.data.resources || []);
      setListings(listingRes.data.listings || []);
      setRentals(rentalRes.data.rentals || []);
      setGovernment(governmentRes.data.services || []);
      setRecommendations(recRes.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load nearby agri-map intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [center.lat, center.lng, radiusKm, category]);

  const detectLocation = () => {
    if (!navigator.geolocation) return setError("GPS is not available in this browser.");
    navigator.geolocation.getCurrentPosition(
      (position) => setCenter({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setError("Location permission was denied. You can search manually by village, city, district, or PIN code.")
    );
  };

  const manualSearch = async (event) => {
    event.preventDefault();
    const target = inferSearchTarget(search);
    if (target === "equipment") {
      setActiveTab("equipment");
    } else if (target === "buyers") {
      setActiveTab("buyers");
    } else if (target === "sellers") {
      setActiveTab("sellers");
    } else if (target) {
      setCategory(target);
      setActiveTab("dashboard");
    }

    const nextCategory = ["equipment", "buyers", "sellers"].includes(target) ? category : target || category;
    const place = await geocodePlace(search).catch(() => null);
    if (place) {
      const nextCenter = { lat: place.lat, lng: place.lng };
      setCenter(nextCenter);
      fetchData({ center: nextCenter, search, category: nextCategory });
      return;
    }

    fetchData({ search, category: nextCategory });
  };

  const voiceSearch = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return setError("Voice search is not supported in this browser.");
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      const target = inferSearchTarget(transcript);
      if (target === "equipment") setActiveTab("equipment");
      if (target === "buyers") setActiveTab("buyers");
      if (target === "sellers") setActiveTab("sellers");
      fetchData({ search: transcript, category: ["equipment", "buyers", "sellers"].includes(target) ? category : target || category });
    };
    recognition.start();
  };

  const saveItem = (item) => {
    const next = [{ id: item._id, name: item.name || item.title, savedAt: new Date().toISOString(), distanceKm: item.distanceKm }, ...saved.filter((entry) => entry.id !== item._id)].slice(0, 12);
    setSaved(next);
    localStorage.setItem("krishi_saved_locations", JSON.stringify(next));
  };

  const handleListingCreated = (listing) => {
    const point = listing ? coordsOf(listing) : center;
    setCenter(point);
    setActiveTab(listing?.listingType === "buy" ? "buyers" : "sellers");
    setSelected(listing || null);
    fetchData({ center: point, search: "", category: "" });
  };

  const handleListingUpdated = (listing) => {
    const point = coordsOf(listing);
    setCenter(point);
    setActiveTab(listing?.listingType === "buy" ? "buyers" : "sellers");
    setSelected(listing);
    setEditingListing(null);
    fetchData({ center: point, search: "", category: "" });
  };

  const handleDeleteListing = async (listing) => {
    try {
      await http.delete(`/agri-map/marketplace/${listing._id}`);
      setListings((prev) => prev.filter((l) => l._id !== listing._id));
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing.");
    }
  };

  const runQuickQuery = async (query) => {
    setSearch(query);
    const target = inferSearchTarget(query);
    if (target === "equipment") setActiveTab("equipment");
    if (target === "buyers") setActiveTab("buyers");
    if (target === "sellers") setActiveTab("sellers");
    if (target && !["equipment", "buyers", "sellers"].includes(target)) {
      setCategory(target);
      setActiveTab("dashboard");
    }
    fetchData({ search: query, category: ["equipment", "buyers", "sellers"].includes(target) ? category : target || category });
  };

  const filteredPrimary = useMemo(() => {
    if (activeTab === "marketplace") return listings;
    if (activeTab === "buyers") return buyers;
    if (activeTab === "sellers") return sellers;
    if (activeTab === "equipment") return rentals;
    if (activeTab === "government") return government;
    return resources;
  }, [activeTab, resources, listings, rentals, government, buyers, sellers]);

  return (
    <section className="grid gap-6 animate-fadeIn">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-leaf-600 dark:text-leaf-300">KrishiMitra location intelligence</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Smart Agri Map & Digital Marketplace</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600 dark:text-slate-400">
            GPS resources, verified buyers and sellers, rentals, government services, procurement, storage, and route-ready farm commerce in one workspace.
          </p>
        </div>
        <button onClick={detectLocation} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-5 py-3 text-sm font-extrabold text-white shadow-glow-green">
          <LocateFixed size={17} /> Detect GPS location
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={MapPin} label="Nearby resources" value={resources.length} />
        <StatTile icon={ShoppingBag} label="Marketplace listings" value={listings.length} tone="blue" />
        <StatTile icon={Tractor} label="Equipment rentals" value={rentals.length} tone="violet" />
        <StatTile icon={Building2} label="Government services" value={government.length} tone="amber" />
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-premium dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={manualSearch} className="grid gap-3 lg:grid-cols-[1.4fr_1fr_auto_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-transparent py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-leaf dark:border-slate-800" placeholder="Search village, city, PIN, or ask: Find fertilizer shops near me" />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm font-bold outline-none focus:border-leaf dark:border-slate-800">
            {resourceCategories.map((item) => <option key={item.value || "all"} value={item.value} className="dark:bg-slate-900">{item.label}</option>)}
          </select>
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold dark:border-slate-800">
            <SlidersHorizontal size={16} />
            <input type="range" min="5" max="100" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
            <span className="w-12">{radiusKm}km</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="submit" className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white dark:bg-white dark:text-slate-950">
              <Filter size={16} /> Search
            </button>
            <button type="button" onClick={voiceSearch} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 dark:border-slate-800 dark:text-slate-300">
              <Mic size={16} /> Voice
            </button>
          </div>
        </form>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {quickQueries.map((query) => (
            <button key={query} type="button" onClick={() => runQuickQuery(query)} className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              {query}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="self-start overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-premium dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">Interactive agri map</h2>
              <p className="text-xs font-semibold text-slate-500">Tap pins for details, navigation, calling, messaging, pricing, inventory, and reviews.</p>
            </div>
            {loading && <Loader2 className="animate-spin text-leaf-600" size={18} />}
          </div>
          <div className="h-[520px]">
            <MapContainer center={[center.lat, center.lng]} zoom={10} className="h-full w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap center={center} />
              <Circle center={[center.lat, center.lng]} radius={radiusKm * 1000} pathOptions={{ color: "#2f7d32", fillColor: "#2f7d32", fillOpacity: 0.06 }} />
              <Marker position={[center.lat, center.lng]} icon={createMarkerIcon("resource")}>
                <Popup>Your selected farm location</Popup>
              </Marker>
              {mapItems.map((item) => {
                const point = coordsOf(item);
                return (
                  <Marker key={`${item.mapType}-${item._id}`} position={[point.lat, point.lng]} icon={createMarkerIcon(item.mapType)} eventHandlers={{ click: () => setSelected(item) }}>
                    <Popup>
                      <div style={{ fontSize: "12px", minWidth: "220px" }}>
                        <strong style={{ fontSize: "14px" }}>{item.name || item.title}</strong>
                        <br />
                        {item.distanceKm && `${item.distanceKm} km`} {item.travelTimeMinutes && `· ${item.travelTimeMinutes} min`}
                        <br />
                        {(item.sellerName || item.farmerName || item.ownerName) && (
                          <>
                            <br />
                            <strong>Seller:</strong> {item.sellerName || item.farmerName || item.ownerName}
                          </>
                        )}
                        {item.phone && (
                          <>
                            <br />
                            <strong>Phone:</strong> <a href={`tel:${item.phone}`} style={{ color: "#2563eb" }}>{item.phone}</a>
                          </>
                        )}
                        {item.price && (
                          <>
                            <br />
                            <strong>Price:</strong> ₹{item.price}{item.priceUnit ? `/${item.priceUnit}` : ""}
                          </>
                        )}
                        <br />
                        <button 
                          onClick={() => setSelected(item)}
                          style={{ marginTop: "8px", padding: "4px 8px", background: "#2f7d32", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
                        >
                          View Full Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="grid gap-4">
          <DetailPanel item={selected || filteredPrimary[0]} onClose={() => setSelected(null)} currentUser={user} onEdit={setEditingListing} onDelete={handleDeleteListing} />
          <CreateListingPanel center={center} onCreated={handleListingCreated} initialData={editingListing} onUpdated={handleListingUpdated} onCancel={() => setEditingListing(null)} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ["dashboard", "Nearby Resources", MapPin],
          ["marketplace", "Marketplace", ShoppingBag],
          ["buyers", "Buyers Near Me", CircleDollarSign],
          ["sellers", "Sellers Near Me", ShoppingBag],
          ["equipment", "Equipment Rental", Tractor],
          ["government", "Government Services", Landmark],
          ["saved", "Saved Locations", Bookmark]
        ].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold ${activeTab === key ? "bg-leaf-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === "saved" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {saved.length ? saved.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-premium dark:border-slate-800 dark:bg-slate-900">
              <p className="font-extrabold text-slate-950 dark:text-white">{item.name}</p>
              <p className="text-xs font-semibold text-slate-500">Saved · {item.distanceKm ?? "--"} km away</p>
            </div>
          )) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm font-bold text-slate-500 dark:border-slate-700">No saved locations yet.</p>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrimary.map((item) => <ResultCard key={item._id} item={item} onSelect={setSelected} onSave={saveItem} />)}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-premium dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-leaf-600" size={18} />
            <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">AI personalized recommendations</h2>
          </div>
          <div className="grid gap-4">
            {recommendations.map((group) => (
              <div key={group.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{group.title}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{group.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items?.map((item) => <button key={item._id} onClick={() => setSelected(item)} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">{item.name || item.title}</button>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-premium dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Send className="text-blue-600" size={18} />
            <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">Cooperative commerce tools</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Auction crop selling", "Run bids with nearby buyers and publish current bid on the map.", IndianRupee],
              ["Bulk purchasing", "Pool seeds, fertilizers, and tools with nearby farmers.", ShoppingBag],
              ["Transport sharing", "Match trips to APMC, warehouse, cold storage, or procurement centers.", Route],
              ["MSP updates", "Track procurement center requirements and crop-specific price notices.", Banknote],
              ["Route optimizer", "Plan multi-stop visits for shops, labs, banks, and warehouses.", Navigation],
              ["Offline readiness", "Cache recent map results and saved places for low-connectivity use.", CalendarClock]
            ].map(([title, text, Icon]) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <Icon className="mb-3 text-slate-700 dark:text-slate-300" size={18} />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
