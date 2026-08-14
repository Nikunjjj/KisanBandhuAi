export const districtWeather = {
  "Bengaluru Rural": {
    district: "Bengaluru Rural",
    state: "Karnataka",
    temperature: 27,
    feelsLike: 29,
    humidity: 74,
    rainfall: 5.4,
    rainfallProbability: 68,
    windSpeed: 14,
    windDirection: "SW",
    pressure: 1008,
    uvIndex: 7,
    cloudCoverage: 72,
    sunrise: "05:56",
    sunset: "18:39",
    condition: "Humid with scattered rain",
    history: [
      { day: "Mon", temperature: 29, rainfall: 2 },
      { day: "Tue", temperature: 28, rainfall: 6 },
      { day: "Wed", temperature: 27, rainfall: 5 },
      { day: "Thu", temperature: 27, rainfall: 8 },
      { day: "Fri", temperature: 26, rainfall: 11 }
    ]
  },
  Nashik: {
    district: "Nashik",
    state: "Maharashtra",
    temperature: 31,
    feelsLike: 32,
    humidity: 49,
    rainfall: 0.8,
    rainfallProbability: 24,
    windSpeed: 18,
    windDirection: "W",
    pressure: 1005,
    uvIndex: 9,
    cloudCoverage: 38,
    sunrise: "05:59",
    sunset: "19:02",
    condition: "Warm and breezy",
    history: [
      { day: "Mon", temperature: 34, rainfall: 0 },
      { day: "Tue", temperature: 33, rainfall: 0 },
      { day: "Wed", temperature: 32, rainfall: 1 },
      { day: "Thu", temperature: 31, rainfall: 0 },
      { day: "Fri", temperature: 31, rainfall: 2 }
    ]
  },
  Ludhiana: {
    district: "Ludhiana",
    state: "Punjab",
    temperature: 36,
    feelsLike: 39,
    humidity: 41,
    rainfall: 0,
    rainfallProbability: 12,
    windSpeed: 12,
    windDirection: "NW",
    pressure: 1002,
    uvIndex: 10,
    cloudCoverage: 18,
    sunrise: "05:33",
    sunset: "19:16",
    condition: "Hot and dry",
    history: [
      { day: "Mon", temperature: 35, rainfall: 0 },
      { day: "Tue", temperature: 36, rainfall: 0 },
      { day: "Wed", temperature: 37, rainfall: 0 },
      { day: "Thu", temperature: 36, rainfall: 0 },
      { day: "Fri", temperature: 36, rainfall: 0 }
    ]
  }
};

export const hourlyForecast = [
  { time: "06:00", temperature: 24, rain: 22, humidity: 81 },
  { time: "09:00", temperature: 27, rain: 34, humidity: 76 },
  { time: "12:00", temperature: 31, rain: 42, humidity: 66 },
  { time: "15:00", temperature: 30, rain: 68, humidity: 72 },
  { time: "18:00", temperature: 27, rain: 74, humidity: 84 },
  { time: "21:00", temperature: 25, rain: 58, humidity: 88 }
];

export const sevenDayForecast = [
  { day: "Today", temperature: 27, min: 23, max: 31, rain: 68, rainfall: 5.4 },
  { day: "Fri", temperature: 26, min: 22, max: 30, rain: 82, rainfall: 12 },
  { day: "Sat", temperature: 28, min: 23, max: 32, rain: 45, rainfall: 3 },
  { day: "Sun", temperature: 29, min: 24, max: 33, rain: 18, rainfall: 0.4 },
  { day: "Mon", temperature: 30, min: 24, max: 34, rain: 12, rainfall: 0 },
  { day: "Tue", temperature: 31, min: 25, max: 35, rain: 24, rainfall: 1.2 },
  { day: "Wed", temperature: 29, min: 24, max: 32, rain: 55, rainfall: 6.1 }
];

export const marketPrices = [
  { id: "rice", cropName: "Rice", category: "Cereal", district: "Bengaluru Rural", mandi: "Yelahanka APMC", currentPrice: 2380, previousPrice: 2290, minPrice: 2140, maxPrice: 2520, averagePrice: 2340, unit: "quintal", trend: "up", changePercent: 3.9, recommendation: "Hold quality stock for 3-5 days if storage is dry." },
  { id: "wheat", cropName: "Wheat", category: "Cereal", district: "Ludhiana", mandi: "Khanna Mandi", currentPrice: 2315, previousPrice: 2320, minPrice: 2240, maxPrice: 2380, averagePrice: 2305, unit: "quintal", trend: "stable", changePercent: -0.2, recommendation: "Sell in graded lots; prices are close to MSP levels." },
  { id: "tomato", cropName: "Tomato", category: "Vegetable", district: "Nashik", mandi: "Pimpalgaon", currentPrice: 1850, previousPrice: 1580, minPrice: 1320, maxPrice: 2100, averagePrice: 1710, unit: "quintal", trend: "up", changePercent: 17.1, recommendation: "Good selling window for ripe produce this week." },
  { id: "onion", cropName: "Onion", category: "Vegetable", district: "Nashik", mandi: "Lasalgaon", currentPrice: 1420, previousPrice: 1510, minPrice: 1180, maxPrice: 1650, averagePrice: 1395, unit: "quintal", trend: "down", changePercent: -6, recommendation: "Avoid distress sale; check storage ventilation." },
  { id: "cotton", cropName: "Cotton", category: "Fiber", district: "Amravati", mandi: "Amravati APMC", currentPrice: 6840, previousPrice: 6620, minPrice: 6410, maxPrice: 7100, averagePrice: 6750, unit: "quintal", trend: "up", changePercent: 3.3, recommendation: "Best selling period is approaching for clean, low-moisture kapas." },
  { id: "sugarcane", cropName: "Sugarcane", category: "Commercial", district: "Kolhapur", mandi: "Kolhapur", currentPrice: 340, previousPrice: 340, minPrice: 325, maxPrice: 355, averagePrice: 338, unit: "quintal", trend: "stable", changePercent: 0, recommendation: "Coordinate harvest timing with nearby mills." },
  { id: "maize", cropName: "Maize", category: "Cereal", district: "Davanagere", mandi: "Davanagere APMC", currentPrice: 2190, previousPrice: 2110, minPrice: 2040, maxPrice: 2260, averagePrice: 2160, unit: "quintal", trend: "up", changePercent: 3.8, recommendation: "Dry grain below safe moisture before bulk sale." }
];

export const priceTrends = [
  { date: "Week 1", Rice: 2240, Wheat: 2280, Tomato: 1220, Onion: 1580, Cotton: 6420, Maize: 2040 },
  { date: "Week 2", Rice: 2290, Wheat: 2310, Tomato: 1360, Onion: 1540, Cotton: 6530, Maize: 2080 },
  { date: "Week 3", Rice: 2325, Wheat: 2320, Tomato: 1580, Onion: 1510, Cotton: 6620, Maize: 2110 },
  { date: "Week 4", Rice: 2380, Wheat: 2315, Tomato: 1850, Onion: 1420, Cotton: 6840, Maize: 2190 }
];

export const cropInfo = [
  {
    id: "rice",
    cropName: "Rice",
    scientificName: "Oryza sativa",
    season: "Kharif",
    overview: "A staple cereal suited to warm, humid regions with reliable irrigation or monsoon rainfall.",
    soil: "Clay loam or silty clay with good water retention",
    water: "High; maintain shallow standing water during vegetative growth",
    idealTemperature: "24-32 C",
    fertilizers: ["Farmyard manure before puddling", "Split nitrogen application", "Zinc sulphate where deficiency appears"],
    guidance: {
      landPreparation: "Level the field, puddle thoroughly, and strengthen bunds before transplanting.",
      seedSelection: "Use certified, region-suitable varieties with salt-water seed cleaning where practiced.",
      irrigation: "Keep 2-5 cm water after establishment; drain before harvest.",
      harvest: "Harvest when 80-85% grains are mature and dry promptly."
    },
    timeline: ["Seed preparation", "Nursery and transplanting", "Tillering growth", "Panicle flowering", "Harvest and drying"]
  },
  {
    id: "wheat",
    cropName: "Wheat",
    scientificName: "Triticum aestivum",
    season: "Rabi",
    overview: "A cool-season cereal grown after monsoon crops in well-drained fields.",
    soil: "Loam to clay loam with neutral pH",
    water: "Moderate; critical irrigation at crown root initiation, flowering, and grain filling",
    idealTemperature: "15-25 C",
    fertilizers: ["Balanced NPK basal dose", "Top-dress nitrogen at first irrigation", "Sulphur in deficient soils"],
    guidance: {
      landPreparation: "Prepare a firm, fine seedbed after pre-sowing irrigation.",
      seedSelection: "Choose rust-resistant varieties and treat seed before sowing.",
      irrigation: "Avoid water stress during crown root initiation and flowering.",
      harvest: "Harvest when straw turns golden and grain is hard."
    },
    timeline: ["Seed treatment", "Line sowing", "Tillering", "Flowering", "Harvest"]
  },
  {
    id: "cotton",
    cropName: "Cotton",
    scientificName: "Gossypium hirsutum",
    season: "Kharif",
    overview: "A fiber crop that needs warm weather, drainage, and close pest monitoring.",
    soil: "Deep black cotton soil or well-drained loam",
    water: "Moderate; avoid waterlogging",
    idealTemperature: "21-35 C",
    fertilizers: ["Organic manure", "Split nitrogen and potassium", "Micronutrient spray if leaves show deficiency"],
    guidance: {
      landPreparation: "Make broad beds or ridges for drainage in heavy soil.",
      seedSelection: "Use approved hybrids and maintain refuge where required.",
      irrigation: "Irrigate at square formation and boll development.",
      harvest: "Pick fully opened bolls in dry weather."
    },
    timeline: ["Seed treatment", "Sowing", "Vegetative growth", "Flowering and boll formation", "Picking"]
  },
  {
    id: "tomato",
    cropName: "Tomato",
    scientificName: "Solanum lycopersicum",
    season: "Rabi/Summer",
    overview: "A high-value vegetable crop requiring nursery care, staking, and disease vigilance.",
    soil: "Well-drained sandy loam rich in organic matter",
    water: "Regular light irrigation; avoid wet leaves",
    idealTemperature: "18-30 C",
    fertilizers: ["Compost before transplanting", "NPK through split doses", "Calcium for fruit quality"],
    guidance: {
      landPreparation: "Prepare raised beds with drip lines and mulch where available.",
      seedSelection: "Use disease-tolerant hybrids from reliable sources.",
      irrigation: "Prefer drip irrigation and keep moisture uniform.",
      harvest: "Pick at breaker to red stage depending on market distance."
    },
    timeline: ["Nursery", "Transplanting", "Vegetative growth", "Flowering and fruiting", "Harvest rounds"]
  },
  {
    id: "sugarcane",
    cropName: "Sugarcane",
    scientificName: "Saccharum officinarum",
    season: "Annual",
    overview: "A long-duration commercial crop needing fertile soil, irrigation, and ratoon management.",
    soil: "Deep loam with good drainage",
    water: "High; critical during germination and grand growth",
    idealTemperature: "20-35 C",
    fertilizers: ["Press mud or compost", "Nitrogen in splits", "Potash for cane quality"],
    guidance: {
      landPreparation: "Open furrows with proper spacing and drainage channels.",
      seedSelection: "Use healthy, disease-free setts treated before planting.",
      irrigation: "Irrigate lightly and frequently during establishment.",
      harvest: "Harvest mature cane at peak sugar recovery."
    },
    timeline: ["Sett treatment", "Planting", "Tillering", "Grand growth", "Harvest"]
  }
];

export const diseaseInfo = [
  { id: "leaf-blight", name: "Leaf blight", type: "Plant", symptoms: ["Brown lesions on leaves", "Drying from leaf tips", "Reduced grain filling"], causes: ["Fungal infection", "High humidity", "Poor air flow"], prevention: ["Use resistant varieties", "Avoid excess nitrogen", "Maintain field sanitation"], treatment: "Remove infected residue and use recommended fungicide with local agriculture officer guidance.", recommendedPesticides: ["Mancozeb", "Copper oxychloride"] },
  { id: "root-rot", name: "Root rot", type: "Plant", symptoms: ["Wilting plants", "Dark soft roots", "Stunted growth"], causes: ["Waterlogging", "Soil-borne fungi"], prevention: ["Improve drainage", "Treat seed", "Rotate crops"], treatment: "Drain excess water and apply soil fungicide where advised.", recommendedPesticides: ["Trichoderma", "Carbendazim"] },
  { id: "powdery-mildew", name: "Powdery mildew", type: "Plant", symptoms: ["White powdery patches", "Leaf curling", "Premature leaf fall"], causes: ["Humid nights", "Dense canopy"], prevention: ["Space plants well", "Avoid overhead irrigation"], treatment: "Use sulphur-based spray early and repeat only as advised.", recommendedPesticides: ["Wettable sulphur"] },
  { id: "fmd", name: "Foot-and-mouth disease", type: "Livestock", symptoms: ["Fever", "Mouth blisters", "Lameness", "Low milk yield"], causes: ["Highly contagious viral infection"], prevention: ["Regular vaccination", "Isolate sick animals", "Disinfect sheds"], treatment: "Call a veterinarian, isolate the animal, and provide soft feed and wound care.", vaccination: "Vaccinate cattle, buffalo, sheep, and goats as per state veterinary schedule." },
  { id: "mastitis", name: "Mastitis", type: "Livestock", symptoms: ["Swollen udder", "Clots in milk", "Pain during milking"], causes: ["Bacterial infection", "Poor milking hygiene"], prevention: ["Clean udder before milking", "Dry bedding", "Post-milking teat dip"], treatment: "Consult a veterinarian quickly; early antibiotic care prevents loss.", vaccination: "Follow veterinary advice for herd-specific prevention." },
  { id: "bird-flu", name: "Bird flu", type: "Livestock", symptoms: ["Sudden poultry death", "Respiratory distress", "Drop in egg production"], causes: ["Avian influenza virus"], prevention: ["Restrict outside birds", "Disinfect equipment", "Report unusual deaths"], treatment: "Report immediately to veterinary authorities; do not move birds from the farm.", vaccination: "Follow government advisory during outbreaks." }
];

export const livestockInfo = [
  { animal: "Cow", feeding: ["Green fodder twice daily", "Mineral mixture with concentrate", "Clean water at all times"], vaccination: ["FMD every 6 months", "HS annually before monsoon", "Brucellosis for female calves"], hygiene: ["Dry bedding", "Daily shed cleaning", "Udder wash before milking"], breeding: "Observe heat signs and use timely artificial insemination.", prevention: "Deworm as advised and isolate new animals for observation.", emergency: "Call a veterinarian for fever, bloat, difficult calving, or sudden milk drop." },
  { animal: "Buffalo", feeding: ["High-fiber fodder", "Oil cake/concentrate for milk animals", "Salt lick and minerals"], vaccination: ["FMD every 6 months", "BQ/HS annually where advised"], hygiene: ["Provide wallowing or cooling", "Clean water troughs", "Fly control"], breeding: "Watch silent heat signs, especially in summer.", prevention: "Prevent heat stress and keep hooves clean.", emergency: "Seek urgent help for anorexia, high fever, or retained placenta." },
  { animal: "Goat", feeding: ["Tree leaves and grasses", "Small grain supplement for pregnant does", "Fresh water"], vaccination: ["PPR annually", "ET before monsoon", "FMD as advised"], hygiene: ["Raised dry floor", "Regular hoof trimming", "Avoid overcrowding"], breeding: "Breed healthy does at proper body weight.", prevention: "Deworm based on fecal load and rotate grazing.", emergency: "Isolate coughing, diarrheic, or weak animals." },
  { animal: "Poultry", feeding: ["Starter/grower/layer feed by age", "Clean water with sanitization", "Calcium for layers"], vaccination: ["Marek's at hatchery", "Ranikhet schedule", "Gumboro as advised"], hygiene: ["Dry litter", "Ventilation", "Footbath at entry"], breeding: "Maintain correct male-female ratio for breeder flocks.", prevention: "Biosecurity is the first defense; restrict visitors.", emergency: "Report sudden mortality or respiratory signs quickly." },
  { animal: "Sheep", feeding: ["Grazing plus dry fodder", "Mineral mixture", "Extra feed in late pregnancy"], vaccination: ["PPR annually", "Enterotoxemia before monsoon", "Sheep pox where advised"], hygiene: ["Dry shelter", "Shearing hygiene", "Foot bath in wet season"], breeding: "Select healthy rams and avoid inbreeding.", prevention: "Control internal parasites and ticks.", emergency: "Treat bloat, maggot wounds, or lambing difficulty urgently." }
];

export const agricultureNews = [
  { id: "scheme-update", title: "State agriculture departments expand digital crop advisory services", category: "Government updates", date: "2026-05-12", summary: "Farmers can expect more localized alerts for weather, pests, and market movement through district-level digital services." },
  { id: "market-watch", title: "Vegetable markets see stronger arrival-linked price movement", category: "Market news", date: "2026-05-11", summary: "Tomato and onion prices remain sensitive to rainfall and transport conditions in major producing belts." },
  { id: "weather-watch", title: "Pre-monsoon rainfall may increase disease risk in humid pockets", category: "Weather news", date: "2026-05-10", summary: "Farmers are advised to improve drainage and avoid spraying fertilizer before heavy showers." },
  { id: "tech-update", title: "Low-cost soil moisture sensors gain adoption in irrigated farms", category: "Farming technology", date: "2026-05-08", summary: "Sensor-based irrigation scheduling can reduce water use and improve fertilizer efficiency." }
];
