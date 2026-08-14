import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAgricultureNews,
  getCropKnowledge,
  getDiseaseKnowledge,
  getLivestockKnowledge,
  getMarketIntelligence,
  getSeasonalRecommendations,
  getWeatherIntelligence
} from "../services/agricultureService.js";

export const getCurrentWeather = asyncHandler(async (req, res) => {
  const data = await getWeatherIntelligence(req.query);
  res.json({ success: true, weather: data.current, source: data.source });
});

export const getWeatherForecast = asyncHandler(async (req, res) => {
  const data = await getWeatherIntelligence(req.query);
  res.json({
    success: true,
    current: data.current,
    hourly: data.hourly,
    daily: data.daily,
    history: data.history,
    favorites: data.favorites,
    source: data.source
  });
});

export const getWeatherAlerts = asyncHandler(async (req, res) => {
  const data = await getWeatherIntelligence(req.query);
  res.json({ success: true, alerts: data.alerts });
});

export const getMarketPrices = asyncHandler(async (req, res) => {
  const market = await getMarketIntelligence(req.query);
  res.json({ success: true, ...market });
});

export const getMarketTrends = asyncHandler(async (req, res) => {
  const market = await getMarketIntelligence(req.query);
  res.json({ success: true, trends: market.trends, insights: market.insights });
});

export const getCropMarketById = asyncHandler(async (req, res) => {
  const market = await getMarketIntelligence({ crop: req.params.id });
  res.json({ success: true, crop: market.prices[0] || null, trends: market.trends });
});

export const getCropInfo = asyncHandler(async (req, res) => {
  res.json({ success: true, ...getCropKnowledge(req.query) });
});

export const getDiseaseInfo = asyncHandler(async (req, res) => {
  res.json({ success: true, ...getDiseaseKnowledge(req.query) });
});

export const getLivestockInfo = asyncHandler(async (req, res) => {
  res.json({ success: true, ...getLivestockKnowledge(req.query) });
});

export const getSeasonRecommendations = asyncHandler(async (req, res) => {
  res.json({ success: true, seasonal: getSeasonalRecommendations(req.query) });
});

export const getNews = asyncHandler(async (req, res) => {
  res.json({ success: true, ...getAgricultureNews(req.query) });
});
