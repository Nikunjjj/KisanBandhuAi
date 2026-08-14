import { AgriLocation } from "../models/AgriLocation.js";
import { EquipmentRental } from "../models/EquipmentRental.js";
import { MarketplaceListing } from "../models/MarketplaceListing.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

const categoryAliases = {
  fertilizer: ["fertilizer", "urea", "dap", "npk", "manure"],
  seed: ["seed", "seeds", "nursery"],
  pesticide: ["pesticide", "insecticide", "fungicide"],
  organic: ["organic", "bio"],
  irrigation: ["irrigation", "drip", "sprinkler", "pump"],
  machinery_dealer: ["machinery", "tractor dealer", "harvester"],
  equipment_rental: ["rental", "rent", "tractor rental", "equipment"],
  veterinary: ["veterinary", "vet", "animal hospital"],
  livestock_market: ["livestock", "cattle", "goat", "sheep"],
  dairy: ["dairy", "milk collection"],
  warehouse: ["warehouse", "storage"],
  cold_storage: ["cold storage"],
  bank: ["bank", "loan", "credit"],
  cooperative: ["cooperative", "society", "fpo"],
  government_office: ["government", "agriculture office"],
  kvk: ["kvk", "krishi vigyan"],
  soil_lab: ["soil", "soil testing"],
  seed_center: ["seed distribution"],
  procurement_center: ["procurement", "msp", "sell crop"],
  service_center: ["service center", "farmer center"],
  farmer: ["nearby farmer", "community"]
};

const sampleLocations = [
  {
    _id: "sample-resource-1",
    name: "GreenGrow Fertilizer Depot",
    category: "fertilizer",
    address: "APMC Road, Yelahanka",
    district: "Bengaluru Urban",
    pincode: "560064",
    phone: "+91 98765 12001",
    workingHours: "8:00 AM - 8:00 PM",
    services: ["Bulk fertilizer", "Soil nutrient guidance", "Doorstep delivery"],
    products: ["Urea", "DAP", "NPK 19:19:19", "Zinc sulphate"],
    priceHighlights: ["Urea from ₹280/bag", "DAP from ₹1,350/bag"],
    rating: 4.6,
    reviewCount: 128,
    verified: true,
    liveInventory: [
      { item: "Urea 45kg", quantity: "210 bags", price: 280 },
      { item: "DAP 50kg", quantity: "86 bags", price: 1350 }
    ],
    location: { type: "Point", coordinates: [77.585, 13.101] }
  },
  {
    _id: "sample-resource-2",
    name: "Raitha Seed & Organic Center",
    category: "seed",
    address: "Market Yard, Nelamangala",
    district: "Bengaluru Rural",
    pincode: "562123",
    phone: "+91 98765 12002",
    workingHours: "7:30 AM - 7:00 PM",
    services: ["Certified seeds", "Organic inputs", "Crop package advice"],
    products: ["Ragi seed", "Tomato hybrid", "Paddy BPT-5204", "Bio-fertilizer"],
    priceHighlights: ["Tomato hybrid ₹780/10g", "Ragi seed ₹62/kg"],
    rating: 4.4,
    reviewCount: 92,
    verified: true,
    location: { type: "Point", coordinates: [77.393, 13.102] }
  },
  {
    _id: "sample-resource-3",
    name: "District Soil Testing Laboratory",
    category: "soil_lab",
    address: "Agriculture Complex, Hebbal",
    district: "Bengaluru Urban",
    pincode: "560024",
    phone: "+91 80235 60011",
    workingHours: "10:00 AM - 5:30 PM",
    services: ["Soil health card", "Water quality testing", "Fertilizer recommendation"],
    products: [],
    priceHighlights: ["Soil test from ₹100/sample"],
    rating: 4.5,
    reviewCount: 51,
    verified: true,
    location: { type: "Point", coordinates: [77.589, 13.046] }
  },
  {
    _id: "sample-resource-4",
    name: "Krishi Vigyan Kendra Bengaluru Rural",
    category: "kvk",
    address: "Hadonahalli Farm Campus",
    district: "Bengaluru Rural",
    pincode: "561205",
    phone: "+91 80276 20045",
    workingHours: "9:30 AM - 5:30 PM",
    services: ["Crop training", "Disease advisory", "Demonstration plots", "Farmer field school"],
    products: ["Training calendar", "Advisory leaflets"],
    rating: 4.8,
    reviewCount: 214,
    verified: true,
    governmentMeta: { department: "ICAR KVK", update: "Millet and tomato IPM training this week" },
    location: { type: "Point", coordinates: [77.515, 13.285] }
  },
  {
    _id: "sample-resource-5",
    name: "Nandi Cold Chain & Warehouse",
    category: "cold_storage",
    address: "Doddaballapur Industrial Area",
    district: "Bengaluru Rural",
    pincode: "561203",
    phone: "+91 98765 12005",
    workingHours: "24 hours",
    services: ["Cold storage", "Ripening chamber", "Warehouse receipts", "Transport tie-up"],
    products: ["Tomato crates", "Onion storage", "Dairy cold room"],
    priceHighlights: ["Cold room from ₹1.8/kg/month"],
    rating: 4.3,
    reviewCount: 77,
    verified: true,
    location: { type: "Point", coordinates: [77.545, 13.292] }
  },
  {
    _id: "sample-resource-6",
    name: "Taluk Veterinary Hospital",
    category: "veterinary",
    address: "Old Bus Stand Road",
    district: "Bengaluru Rural",
    pincode: "562110",
    phone: "+91 80234 11120",
    workingHours: "8:00 AM - 6:00 PM; emergency on call",
    services: ["Cattle treatment", "Vaccination", "Artificial insemination", "Livestock insurance certificate"],
    products: ["Deworming schedule", "FMD vaccine updates"],
    rating: 4.2,
    reviewCount: 63,
    verified: true,
    location: { type: "Point", coordinates: [77.704, 13.198] }
  },
  {
    _id: "sample-resource-7",
    name: "Primary Agricultural Cooperative Society",
    category: "cooperative",
    address: "Village Panchayat Road, Devanahalli",
    district: "Bengaluru Rural",
    pincode: "562110",
    phone: "+91 98765 12007",
    workingHours: "9:30 AM - 4:30 PM",
    services: ["Crop loan", "Bulk seed purchase", "Fertilizer distribution", "Transport sharing"],
    products: ["KCC assistance", "PACS credit"],
    rating: 4.1,
    reviewCount: 84,
    verified: true,
    location: { type: "Point", coordinates: [77.713, 13.247] }
  },
  {
    _id: "sample-resource-8",
    name: "Government Procurement Center - Tomato & Ragi",
    category: "procurement_center",
    address: "APMC Yard, Doddaballapur",
    district: "Bengaluru Rural",
    pincode: "561203",
    phone: "+91 80276 52210",
    workingHours: "8:00 AM - 5:00 PM",
    services: ["MSP procurement", "Quality grading", "Auction support", "Farmer registration"],
    products: ["Ragi MSP desk", "Tomato market arrivals"],
    priceHighlights: ["Ragi MSP updates available", "Daily auction from 10 AM"],
    rating: 4.5,
    reviewCount: 109,
    verified: true,
    governmentMeta: { department: "Agricultural Marketing Department", mspCrops: ["Ragi", "Paddy"], update: "Bring Aadhaar, FRUITS ID, bank passbook" },
    location: { type: "Point", coordinates: [77.539, 13.294] }
  }
];

const sampleListings = [
  {
    _id: "sample-listing-1",
    title: "Tomato buyers needed for Grade A harvest",
    listingType: "sell",
    category: "vegetable",
    description: "Fresh tomato harvest available for pickup tomorrow morning. Sorting and crates available.",
    quantity: "4 tonnes",
    price: 18,
    priceUnit: "kg",
    ownerName: "Lakshmi FPO",
    phone: "+91 99880 10001",
    rating: 4.7,
    verified: true,
    auctionEnabled: true,
    currentBid: 19,
    pickupAddress: "Hoskote farm gate",
    district: "Bengaluru Rural",
    location: { type: "Point", coordinates: [77.798, 13.07] }
  },
  {
    _id: "sample-listing-2",
    title: "Rice mill buying paddy",
    listingType: "buy",
    category: "grain",
    description: "Looking for FAQ paddy lots. Immediate digital payment after weighbridge.",
    quantity: "25 tonnes",
    price: 2260,
    priceUnit: "quintal",
    ownerName: "Cauvery Agro Foods",
    phone: "+91 99880 10002",
    rating: 4.5,
    verified: true,
    pickupAddress: "Buyer yard, Mandya Road",
    district: "Mandya",
    location: { type: "Point", coordinates: [77.389, 12.522] }
  },
  {
    _id: "sample-listing-3",
    title: "Certified maize seed packs",
    listingType: "sell",
    category: "seed",
    description: "Verified seed dealer with live inventory and farmer bulk discount.",
    quantity: "340 packs",
    price: 1250,
    priceUnit: "pack",
    ownerName: "AgroServe Inputs",
    phone: "+91 99880 10003",
    rating: 4.6,
    verified: true,
    pickupAddress: "Tumakuru bypass",
    district: "Tumakuru",
    location: { type: "Point", coordinates: [77.102, 13.34] }
  }
];

const sampleRentals = [
  {
    _id: "sample-rental-1",
    name: "Mahindra 575 DI Tractor with driver",
    equipmentType: "tractor",
    description: "Available for ploughing, haulage, and rotavator work. Diesel included for local bookings.",
    ownerName: "Ramesh Equipment Sharing Group",
    phone: "+91 99000 20001",
    hourlyRate: 850,
    dailyRate: 5200,
    deposit: 1000,
    bookingMode: "instant",
    rating: 4.8,
    verified: true,
    address: "Devanahalli",
    district: "Bengaluru Rural",
    location: { type: "Point", coordinates: [77.704, 13.238] }
  },
  {
    _id: "sample-rental-2",
    name: "Drone spraying service",
    equipmentType: "drone",
    description: "10L agri drone for pesticide and micronutrient spraying with certified pilot.",
    ownerName: "SkyKisan Drone Services",
    phone: "+91 99000 20002",
    hourlyRate: 1400,
    dailyRate: 9600,
    deposit: 0,
    bookingMode: "request",
    rating: 4.7,
    verified: true,
    address: "Yelahanka",
    district: "Bengaluru Urban",
    location: { type: "Point", coordinates: [77.605, 13.106] }
  },
  {
    _id: "sample-rental-3",
    name: "Rotavator and seed drill combo",
    equipmentType: "rotavator",
    description: "Best for ragi and maize land preparation. Operator available.",
    ownerName: "Village Custom Hiring Center",
    phone: "+91 99000 20003",
    hourlyRate: 650,
    dailyRate: 4300,
    deposit: 750,
    bookingMode: "request",
    rating: 4.4,
    verified: true,
    address: "Doddaballapur",
    district: "Bengaluru Rural",
    location: { type: "Point", coordinates: [77.539, 13.293] }
  }
];

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCoordinates(query) {
  return {
    lat: toNumber(query.lat, DEFAULT_CENTER.lat),
    lng: toNumber(query.lng, DEFAULT_CENTER.lng)
  };
}

function distanceKm(a, b) {
  const earthRadius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const hav = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

function withDistance(items, origin) {
  return items
    .map((item) => {
      const coordinates = item.location?.coordinates || [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];
      const distance = distanceKm(origin, { lng: coordinates[0], lat: coordinates[1] });
      return {
        ...item,
        distanceKm: Number(distance.toFixed(1)),
        travelTimeMinutes: Math.max(4, Math.round((distance / 28) * 60))
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function inferCategory(search = "") {
  const normalized = search.toLowerCase();
  return Object.entries(categoryAliases).find(([, terms]) => terms.some((term) => normalized.includes(term)))?.[0];
}

function filterSample(items, query, typeKey = "category") {
  const search = (query.search || query.q || "").toLowerCase();
  const category = query.category || inferCategory(search);
  return items.filter((item) => {
    const categoryMatch = !category || item[typeKey] === category || item.category === category;
    const text = JSON.stringify(item).toLowerCase();
    const searchMatch = !search || text.includes(search) || (inferCategory(search) && categoryMatch);
    return categoryMatch && searchMatch;
  });
}

async function geoFind(Model, query, origin, radiusKm, extra = {}) {
  const criteria = {
    ...extra,
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [origin.lng, origin.lat] },
        $maxDistance: radiusKm * 1000
      }
    }
  };

  const search = query.search || query.q;
  if (search) criteria.$text = { $search: search };
  if (query.category) criteria.category = query.category;
  if (query.type) criteria.listingType = query.type;
  if (query.equipmentType) criteria.equipmentType = query.equipmentType;

  return Model.find(criteria).limit(toNumber(query.limit, 50)).lean();
}

export const getNearbyResources = asyncHandler(async (req, res) => {
  const origin = getCoordinates(req.query);
  const radiusKm = toNumber(req.query.radiusKm, 25);
  let resources = await geoFind(AgriLocation, req.query, origin, radiusKm);

  if (!resources.length) {
    resources = filterSample(sampleLocations, req.query);
  }

  res.json({ success: true, origin, resources: withDistance(resources, origin).slice(0, toNumber(req.query.limit, 50)) });
});

export const getMarketplaceListings = asyncHandler(async (req, res) => {
  const origin = getCoordinates(req.query);
  const radiusKm = toNumber(req.query.radiusKm, 50);
  let listings = await geoFind(MarketplaceListing, req.query, origin, radiusKm, { status: "active" });

  if (!listings.length) {
    listings = filterSample(sampleListings, req.query);
  }

  res.json({ success: true, origin, listings: withDistance(listings, origin).slice(0, toNumber(req.query.limit, 50)) });
});

export const createMarketplaceListing = asyncHandler(async (req, res) => {
  const { lat, lng, ...payload } = req.body;
  if (!payload.title || !payload.listingType || !payload.category) {
    throw new AppError("Title, listing type, and category are required.", 400);
  }

  const listing = await MarketplaceListing.create({
    ...payload,
    owner: req.user._id,
    ownerName: payload.ownerName || req.user.name,
    phone: payload.phone || req.user.phone,
    whatsapp: payload.whatsapp || req.user.whatsapp || "",
    location: { type: "Point", coordinates: [toNumber(lng, DEFAULT_CENTER.lng), toNumber(lat, DEFAULT_CENTER.lat)] }
  });

  res.status(201).json({ success: true, listing });
});

export const getEquipmentRentals = asyncHandler(async (req, res) => {
  const origin = getCoordinates(req.query);
  const radiusKm = toNumber(req.query.radiusKm, 50);
  let rentals = await geoFind(EquipmentRental, req.query, origin, radiusKm, { status: "active" });

  if (!rentals.length) {
    rentals = filterSample(sampleRentals, req.query, "equipmentType");
  }

  res.json({ success: true, origin, rentals: withDistance(rentals, origin).slice(0, toNumber(req.query.limit, 50)) });
});

export const createEquipmentRental = asyncHandler(async (req, res) => {
  const { lat, lng, ...payload } = req.body;
  if (!payload.name || !payload.equipmentType) {
    throw new AppError("Equipment name and type are required.", 400);
  }

  const rental = await EquipmentRental.create({
    ...payload,
    owner: req.user._id,
    ownerName: payload.ownerName || req.user.name,
    phone: payload.phone || req.user.phone,
    location: { type: "Point", coordinates: [toNumber(lng, DEFAULT_CENTER.lng), toNumber(lat, DEFAULT_CENTER.lat)] }
  });

  res.status(201).json({ success: true, rental });
});

export const getBuyerSellerDiscovery = asyncHandler(async (req, res) => {
  const origin = getCoordinates(req.query);
  const buyers = withDistance(filterSample(sampleListings, { ...req.query, type: "buy" }).filter((item) => item.listingType === "buy"), origin);
  const sellers = withDistance(filterSample(sampleListings, { ...req.query, type: "sell" }).filter((item) => item.listingType === "sell"), origin);
  res.json({ success: true, origin, buyers, sellers });
});

export const getGovernmentServices = asyncHandler(async (req, res) => {
  const governmentCategories = ["government_office", "kvk", "soil_lab", "seed_center", "procurement_center", "service_center"];
  const origin = getCoordinates(req.query);
  let resources = await AgriLocation.find({
    category: { $in: governmentCategories },
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [origin.lng, origin.lat] },
        $maxDistance: toNumber(req.query.radiusKm, 50) * 1000
      }
    }
  }).lean();

  if (!resources.length) resources = sampleLocations.filter((item) => governmentCategories.includes(item.category));

  res.json({ success: true, origin, services: withDistance(resources, origin) });
});

export const getLocationRecommendations = asyncHandler(async (req, res) => {
  const origin = getCoordinates(req.query);
  const crops = req.user.profile?.cropType?.length ? req.user.profile.cropType : ["Tomato", "Ragi"];
  const cropText = crops.join(", ");
  const resources = withDistance(sampleLocations, origin);
  const listings = withDistance(sampleListings, origin);
  const rentals = withDistance(sampleRentals, origin);

  res.json({
    success: true,
    recommendations: [
      {
        title: `Priority buyer matches for ${cropText}`,
        reason: "Nearby buyers and procurement centers are ranked by crop fit, distance, verified status, and price signal.",
        items: [...listings.filter((item) => item.listingType === "buy"), resources.find((item) => item.category === "procurement_center")].filter(Boolean).slice(0, 3)
      },
      {
        title: "Input and soil-health actions",
        reason: "Seasonal crop planning suggests checking soil nutrients before bulk fertilizer purchase.",
        items: resources.filter((item) => ["fertilizer", "seed", "soil_lab", "kvk"].includes(item.category)).slice(0, 4)
      },
      {
        title: "Equipment sharing opportunities",
        reason: "Custom hiring options reduce fixed machinery cost and are close enough for same-day booking.",
        items: rentals.slice(0, 3)
      }
    ]
  });
});

export const updateMarketplaceListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const listing = await MarketplaceListing.findById(id);

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }
  
  if (listing.owner?.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to update this listing", 403);
  }

  const { lat, lng, ...payload } = req.body;
  if (lat && lng) {
    payload.location = { type: "Point", coordinates: [toNumber(lng, DEFAULT_CENTER.lng), toNumber(lat, DEFAULT_CENTER.lat)] };
  }

  Object.assign(listing, payload);
  await listing.save();

  res.json({ success: true, listing });
});

export const deleteMarketplaceListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const listing = await MarketplaceListing.findById(id);

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (listing.owner?.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to delete this listing", 403);
  }

  await listing.deleteOne();
  res.json({ success: true, message: "Listing deleted successfully" });
});
