import {
  agricultureNews,
  cropInfo,
  diseaseInfo,
  districtWeather,
  hourlyForecast,
  livestockInfo,
  marketPrices,
  priceTrends,
  sevenDayForecast
} from "../data/agricultureKnowledge.js";
import { env } from "../config/env.js";

const weatherEntries = Object.values(districtWeather);

function normalize(value = "") {
  return value.toString().trim().toLowerCase();
}

function pickDistrict(district = "Bengaluru Rural") {
  return (
    districtWeather[district] ||
    weatherEntries.find((item) => normalize(item.district) === normalize(district)) ||
    districtWeather["Bengaluru Rural"]
  );
}

function buildWeatherAdvisories(current) {
  const alerts = [];

  if (current.rainfallProbability >= 65 || current.rainfall >= 5) {
    alerts.push({
      type: "Heavy rain",
      severity: "high",
      message: "Heavy rainfall expected. Avoid fertilizer spraying and postpone pesticide application."
    });
  }
  if (current.windSpeed >= 18) {
    alerts.push({
      type: "Strong winds",
      severity: "medium",
      message: "Strong winds predicted today. Support young plants and avoid overhead spraying."
    });
  }
  if (current.humidity >= 70) {
    alerts.push({
      type: "Disease risk",
      severity: "medium",
      message: "High humidity may increase fungal disease risk. Improve drainage and inspect leaves."
    });
  }
  if (current.temperature >= 35) {
    alerts.push({
      type: "Heat wave",
      severity: "high",
      message: "Heat stress risk is high. Irrigate early morning or late evening and protect livestock."
    });
  }
  if (current.rainfallProbability <= 15 && current.temperature >= 33) {
    alerts.push({
      type: "Drought watch",
      severity: "medium",
      message: "Dry conditions continue. Use mulching and prioritize irrigation for flowering crops."
    });
  }
  if (current.temperature >= 24 && current.temperature <= 32 && current.humidity > 65) {
    alerts.push({
      type: "Crop suitability",
      severity: "low",
      message: "Temperature and humidity are suitable for rice nursery and transplanting activities."
    });
  }
  if (current.uvIndex >= 8) {
    alerts.push({
      type: "High UV",
      severity: "medium",
      message: "Very high UV index today. Avoid outdoor fieldwork between 10 AM and 3 PM. Use protective clothing."
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "Clear conditions",
      severity: "low",
      message: "Weather conditions are favourable for routine farming activities today."
    });
  }

  return alerts;
}

/**
 * Wind degrees → compass direction string
 */
function degreesToCompass(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/**
 * Format unix epoch → "HH:MM" local Indian time string
 */
function fmtTime(iso) {
  // iso is a string like "2025-06-03T06:12" from Open-Meteo
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Reverse-geocode lat/lon → city name using BigDataCloud (free, no key)
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return "Detected Location";
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "Detected Location";
  } catch {
    return "Detected Location";
  }
}

/**
 * Fetch live weather from Open-Meteo (no API key required)
 * https://open-meteo.com/en/docs
 */
async function fetchOpenMeteo(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);

  // Current weather variables
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "surface_pressure",
      "cloud_cover",
      "uv_index"
    ].join(",")
  );

  // Hourly for next 12 hours
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "precipitation_probability", "precipitation", "relative_humidity_2m", "uv_index"].join(",")
  );

  // Daily for 7-day forecast
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
      "uv_index_max"
    ].join(",")
  );

  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Open-Meteo responded with ${res.status}`);
  return res.json();
}

/**
 * WMO weather code → human readable string
 */
function wmoDescription(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    80: "Slight showers",
    81: "Moderate showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };
  return map[code] || "Live weather";
}

/**
 * Main: fetch live Open-Meteo data + reverse-geocode, shape into the app's format
 */
async function fetchLiveWeatherByCoordinates(lat, lon) {
  if (!lat || !lon) return null;

  const [omData, cityName] = await Promise.all([fetchOpenMeteo(lat, lon), reverseGeocode(lat, lon)]);

  const cur = omData.current;
  const hourlyRaw = omData.hourly;
  const dailyRaw = omData.daily;

  // Today's values
  const today = {
    district: cityName,
    state: "",
    temperature: Math.round(cur.temperature_2m ?? 0),
    feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
    humidity: Math.round(cur.relative_humidity_2m ?? 0),
    rainfall: parseFloat((cur.rain ?? cur.precipitation ?? 0).toFixed(1)),
    rainfallProbability: Math.round((dailyRaw.precipitation_probability_max?.[0] ?? 0)),
    windSpeed: Math.round(cur.wind_speed_10m ?? 0),
    windDirection: degreesToCompass(cur.wind_direction_10m ?? 0),
    pressure: Math.round(cur.surface_pressure ?? 0),
    uvIndex: parseFloat((cur.uv_index ?? 0).toFixed(1)),
    cloudCoverage: Math.round(cur.cloud_cover ?? 0),
    sunrise: fmtTime(dailyRaw.sunrise?.[0]),
    sunset: fmtTime(dailyRaw.sunset?.[0]),
    condition: wmoDescription(cur.weather_code ?? 0)
  };

  // Hourly forecast — next 12 slots (Open-Meteo returns 168 hours)
  // Find the index of the current hour
  const nowHour = new Date().getHours();
  const hourlySlice = hourlyRaw.time
    .map((t, i) => ({
      time: t.slice(11, 16), // "HH:MM"
      temperature: Math.round(hourlyRaw.temperature_2m[i] ?? 0),
      rain: Math.round(hourlyRaw.precipitation_probability[i] ?? 0),
      humidity: Math.round(hourlyRaw.relative_humidity_2m[i] ?? 0),
      precipitation: parseFloat((hourlyRaw.precipitation[i] ?? 0).toFixed(1))
    }))
    .filter((_, i) => {
      const h = parseInt(hourlyRaw.time[i].slice(11, 13), 10);
      return h >= nowHour;
    })
    .slice(0, 12);

  const hourly = hourlySlice.length > 0 ? hourlySlice : hourlyForecast;

  // 7-day daily forecast
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daily = dailyRaw.time.map((dateStr, i) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: i === 0 ? "Today" : dayNames[d.getDay()],
      max: Math.round(dailyRaw.temperature_2m_max[i] ?? 0),
      min: Math.round(dailyRaw.temperature_2m_min[i] ?? 0),
      rainfall: parseFloat((dailyRaw.precipitation_sum[i] ?? 0).toFixed(1)),
      rainChance: Math.round(dailyRaw.precipitation_probability_max[i] ?? 0),
      uvMax: parseFloat((dailyRaw.uv_index_max[i] ?? 0).toFixed(1)),
      // Keep temperature field for backward compatibility with chart
      temperature: Math.round(dailyRaw.temperature_2m_max[i] ?? 0)
    };
  });

  return { current: today, hourly, daily };
}

export async function getWeatherIntelligence({ district, lat, lon }) {
  let liveWeather = null;

  if (lat && lon) {
    try {
      liveWeather = await fetchLiveWeatherByCoordinates(parseFloat(lat), parseFloat(lon));
    } catch (err) {
      console.error("[Weather] Live fetch failed:", err.message);
    }
  } else if (env.openWeather?.apiKey) {
    // Legacy OWM path — kept for backward compat
    try {
      liveWeather = await fetchOpenWeatherByCoordinates(lat, lon);
    } catch {
      liveWeather = null;
    }
  }

  const current = liveWeather?.current || pickDistrict(district);
  const hourly = liveWeather?.hourly || hourlyForecast;
  const daily =
    liveWeather?.daily ||
    sevenDayForecast.map((item, index) => ({
      ...item,
      temperature: index === 0 ? current.temperature : item.temperature
    }));

  return {
    current,
    hourly,
    daily,
    history: current.history || pickDistrict(district).history,
    alerts: buildWeatherAdvisories(current),
    favorites: ["Bengaluru Rural", "Nashik", "Ludhiana"],
    source: liveWeather ? "Open-Meteo (live)" : "KrishiMitra advisory dataset"
  };
}

// ─── Legacy OWM helper (only used if OPENWEATHER_API_KEY is set) ──────────────
async function fetchOpenWeatherByCoordinates(lat, lon) {
  if (!env.openWeather.apiKey || !lat || !lon) return null;
  const currentUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  currentUrl.searchParams.set("lat", lat);
  currentUrl.searchParams.set("lon", lon);
  currentUrl.searchParams.set("appid", env.openWeather.apiKey);
  currentUrl.searchParams.set("units", "metric");

  const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
  forecastUrl.searchParams.set("lat", lat);
  forecastUrl.searchParams.set("lon", lon);
  forecastUrl.searchParams.set("appid", env.openWeather.apiKey);
  forecastUrl.searchParams.set("units", "metric");

  const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
  if (!currentRes.ok || !forecastRes.ok) return null;
  const [current, forecast] = await Promise.all([currentRes.json(), forecastRes.json()]);
  return {
    current: {
      district: current.name || "Detected location",
      state: "",
      temperature: Math.round(current.main?.temp || 0),
      feelsLike: Math.round(current.main?.feels_like || current.main?.temp || 0),
      humidity: current.main?.humidity || 0,
      rainfall: current.rain?.["1h"] || 0,
      rainfallProbability: Math.round((forecast.list?.[0]?.pop || 0) * 100),
      windSpeed: Math.round((current.wind?.speed || 0) * 3.6),
      windDirection: degreesToCompass(current.wind?.deg || 0),
      pressure: current.main?.pressure || 0,
      uvIndex: 0,
      cloudCoverage: current.clouds?.all || 0,
      sunrise: current.sys?.sunrise
        ? new Date(current.sys.sunrise * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : "",
      sunset: current.sys?.sunset
        ? new Date(current.sys.sunset * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : "",
      condition: current.weather?.[0]?.description || "Live weather"
    },
    hourly: (forecast.list || []).slice(0, 12).map((item) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      temperature: Math.round(item.main.temp),
      rain: Math.round((item.pop || 0) * 100),
      humidity: item.main.humidity
    }))
  };
}

// ─── Other agriculture service functions (unchanged) ─────────────────────────


// ─── Live market price integration (data.gov.in Agmarknet) ───────────────────

const DATA_GOV_RESOURCE = "35985678-0d79-46b4-9ed6-6f13308a1d24";
const DATA_GOV_BASE = "https://api.data.gov.in/resource";

// Crops we track with their Agmarknet commodity names
const TRACKED_CROPS = [
  { id: "rice",      cropName: "Rice",      commodity: "Rice",      category: "Cereals" },
  { id: "wheat",     cropName: "Wheat",     commodity: "Wheat",     category: "Cereals" },
  { id: "tomato",    cropName: "Tomato",    commodity: "Tomato",    category: "Vegetables" },
  { id: "onion",     cropName: "Onion",     commodity: "Onion",     category: "Vegetables" },
  { id: "cotton",    cropName: "Cotton",    commodity: "Cotton",    category: "Commercial" },
  { id: "sugarcane", cropName: "Sugarcane", commodity: "Sugarcane", category: "Commercial" },
  { id: "maize",     cropName: "Maize",     commodity: "Maize",     category: "Cereals" },
  { id: "potato",    cropName: "Potato",    commodity: "Potato",    category: "Vegetables" },
  { id: "soyabean",  cropName: "Soyabean",  commodity: "Soyabean",  category: "Oilseeds" },
  { id: "mustard",   cropName: "Mustard",   commodity: "Mustard",   category: "Oilseeds" },
  { id: "groundnut", cropName: "Groundnut", commodity: "Groundnut", category: "Oilseeds" },
  { id: "cabbage",   cropName: "Cabbage",   commodity: "Cabbage",   category: "Vegetables" },
  { id: "apple",     cropName: "Apple",     commodity: "Apple",     category: "Fruits" },
  { id: "banana",    cropName: "Banana",    commodity: "Banana",    category: "Fruits" },
  { id: "garlic",    cropName: "Garlic",    commodity: "Garlic",    category: "Vegetables" }
];

function buildRecommendation(changePercent, trend, cropName) {
  if (trend === "up" && changePercent > 10)
    return `${cropName} prices surged ${changePercent.toFixed(1)}%. Excellent selling opportunity right now.`;
  if (trend === "up")
    return `${cropName} prices rising. Consider selling graded stock in the next 2-3 days.`;
  if (trend === "down" && changePercent < -10)
    return `Sharp price drop for ${cropName}. Avoid distress sale — hold if storage allows.`;
  if (trend === "down")
    return `${cropName} prices slightly lower. Compare nearby mandis before selling.`;
  return `${cropName} prices are stable and close to modal average. Plan sale based on storage and quality.`;
}

async function fetchAllStatePrices(apiKey, state = "") {
  const url = new URL(`${DATA_GOV_BASE}/${DATA_GOV_RESOURCE}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1000"); // fetch up to 1000 recent records
  if (state && state !== "All States") {
    url.searchParams.set("filters[State]", state);
  }
  url.searchParams.set("sort[Arrival_Date]", "desc");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const data = await res.json();
  return data.records || [];
}

async function fetchLiveMarketPrices(filter = {}) {
  const apiKey = env.dataGov?.apiKey;
  if (!apiKey) return null;

  try {
    // 1. Fetch all recent records for the state in ONE request to prevent API throttling/timeouts
    const records = await fetchAllStatePrices(apiKey, filter.state || "");
    if (!records || records.length === 0) return null;

    // 2. Group the records by Commodity to find the latest vs previous price easily
    const groupedByCommodity = {};
    for (const r of records) {
      if (!groupedByCommodity[r.Commodity]) {
        groupedByCommodity[r.Commodity] = [];
      }
      groupedByCommodity[r.Commodity].push(r);
    }

    const prices = [];

    // 3. Match against our TRACKED_CROPS array to populate the dashboard
    for (const crop of TRACKED_CROPS) {
      const cropRecords = groupedByCommodity[crop.commodity];
      if (!cropRecords || cropRecords.length === 0) continue;

      const latest = cropRecords[0];
      // Try to find a previous record (different date or different mandi) to calculate trend, otherwise fallback to latest
      const previous = cropRecords.length > 1 ? cropRecords[1] : cropRecords[0];

      const currentPrice = Number(latest.Modal_Price) || Number(latest.Max_Price) || 0;
      const previousPrice = Number(previous.Modal_Price) || currentPrice;
      const minPrice = Number(latest.Min_Price) || 0;
      const maxPrice = Number(latest.Max_Price) || 0;
      const avgPrice = Math.round((minPrice + maxPrice) / 2);

      const rawChange = currentPrice - previousPrice;
      const changePercent = previousPrice > 0 ? parseFloat(((rawChange / previousPrice) * 100).toFixed(1)) : 0;
      const trend = changePercent > 1 ? "up" : changePercent < -1 ? "down" : "stable";

      if (filter.crop && !normalize(crop.cropName).includes(normalize(filter.crop))) continue;

      prices.push({
        id: crop.id,
        cropName: crop.cropName,
        category: crop.category,
        district: latest.District || "",
        mandi: latest.Market || "",
        state: latest.State || "",
        variety: latest.Variety || "",
        currentPrice,
        previousPrice,
        minPrice,
        maxPrice,
        averagePrice: avgPrice,
        unit: "quintal",
        trend,
        changePercent,
        arrivalDate: latest.Arrival_Date || "",
        recommendation: buildRecommendation(changePercent, trend, crop.cropName),
        source: "data.gov.in (Agmarknet)"
      });
    }

    return prices.length > 0 ? prices : null;
  } catch (err) {
    console.error("[Market] Live fetch failed:", err.message);
    return null;
  }
}

function buildLivePriceTrends(prices) {
  const previousRow = { date: "Previous" };
  const currentRow = { date: "Current" };
  const projectionRow = { date: "Projection" };

  prices.forEach((item) => {
    const cropKey = item.cropName;
    previousRow[cropKey] = item.previousPrice || item.currentPrice;
    currentRow[cropKey] = item.currentPrice;
    projectionRow[cropKey] = Math.round(item.currentPrice * (1 + (item.changePercent || 0) / 100));
  });

  return [previousRow, currentRow, projectionRow];
}

export async function getMarketIntelligence({ crop, district, state, category }) {
  // Try live data first — pass state so Agmarknet filters at source
  const livePrices = await fetchLiveMarketPrices({ crop, district, state });

  let prices;
  let isLive = false;

  if (livePrices && livePrices.length > 0) {
    // Apply category filter on live data
    prices = category
      ? livePrices.filter((item) => normalize(item.category) === normalize(category))
      : livePrices;
    if (prices.length === 0) prices = livePrices; // ignore category filter if nothing matches
    isLive = true;
  } else {
    // Fallback to hardcoded knowledge
    const filtered = marketPrices.filter((item) => {
      const cropMatch = crop ? normalize(item.cropName).includes(normalize(crop)) : true;
      const districtMatch = district ? normalize(item.district).includes(normalize(district)) : true;
      const categoryMatch = category ? normalize(item.category) === normalize(category) : true;
      return cropMatch && districtMatch && categoryMatch;
    });
    prices = filtered.length ? filtered : marketPrices;
  }

  const insights = prices.slice(0, 4).map((item) => ({
    cropName: item.cropName,
    severity: item.trend === "up" ? "positive" : item.trend === "down" ? "warning" : "neutral",
    message: item.recommendation ||
      (item.trend === "up"
        ? `${item.cropName} prices increased by ${Math.abs(item.changePercent)}% this week.`
        : item.trend === "down"
          ? `${item.cropName} prices are down ${Math.abs(item.changePercent)}%. Compare nearby mandis before selling.`
          : `${item.cropName} prices are stable; plan sale based on storage quality.`)
  }));

  // Build weekly trend from live prices (current only) or use stored trends
  const trends = isLive ? buildLivePriceTrends(prices) : priceTrends;

  return {
    prices,
    trends,
    insights,
    categories: [...new Set(prices.map((item) => item.category))],
    crops: prices.map((item) => item.cropName),
    source: isLive ? "data.gov.in (Agmarknet) — Live" : "KrishiMitra static dataset"
  };
}


export function getCropKnowledge({ crop }) {
  const crops = crop ? cropInfo.filter((item) => normalize(item.cropName).includes(normalize(crop))) : cropInfo;
  return { crops: crops.length ? crops : cropInfo };
}

export function getDiseaseKnowledge({ type }) {
  const diseases = type ? diseaseInfo.filter((item) => normalize(item.type) === normalize(type)) : diseaseInfo;
  return {
    diseases,
    alerts: [
      "High humidity may increase fungal disease risk in tomato and paddy fields.",
      "Isolate livestock with fever, mouth lesions, or sudden milk drop and call a veterinarian."
    ]
  };
}

export function getLivestockKnowledge({ animal }) {
  const animals = animal ? livestockInfo.filter((item) => normalize(item.animal).includes(normalize(animal))) : livestockInfo;
  return { animals: animals.length ? animals : livestockInfo };
}

export function getSeasonalRecommendations({ month, region, cropType, weather }) {
  const monthIndex = month ? Number(month) - 1 : new Date().getMonth();
  const monthName = new Date(2026, monthIndex, 1).toLocaleString("en-IN", { month: "long" });
  const isMonsoon = [5, 6, 7, 8].includes(monthIndex);
  const isRabi = [9, 10, 11, 0].includes(monthIndex);
  const selectedCrop = cropType || (isMonsoon ? "Rice, maize, cotton" : isRabi ? "Wheat, mustard, vegetables" : "Vegetables, fodder, pulses");

  return {
    month: monthName,
    region: region || "Your region",
    cropType: selectedCrop,
    recommendations: [
      `Best crops to plant this month: ${selectedCrop}.`,
      isMonsoon ? "Maintain field drainage and avoid spraying before rainfall." : "Use irrigation scheduling based on soil moisture and crop stage.",
      "Apply fertilizer in split doses and avoid application before heavy rain.",
      weather === "dry" ? "Use mulching to reduce evaporation." : "Scout for fungal symptoms every 3-4 days."
    ],
    activities: [
      { title: "This week", task: isMonsoon ? "Prepare nursery and repair bunds" : "Check irrigation channels and seed availability" },
      { title: "Next 15 days", task: "Plan fertilizer purchase and pest monitoring schedule" },
      { title: "This month", task: "Track mandi arrivals before deciding harvest sale timing" }
    ]
  };
}

export function getAgricultureNews({ category }) {
  const news = category ? agricultureNews.filter((item) => normalize(item.category) === normalize(category)) : agricultureNews;
  return {
    news,
    categories: [...new Set(agricultureNews.map((item) => item.category))]
  };
}
