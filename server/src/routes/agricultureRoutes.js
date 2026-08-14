import express from "express";
import {
  getCropInfo,
  getCropMarketById,
  getCurrentWeather,
  getDiseaseInfo,
  getLivestockInfo,
  getMarketPrices,
  getMarketTrends,
  getNews,
  getSeasonRecommendations,
  getWeatherAlerts,
  getWeatherForecast
} from "../controllers/agricultureController.js";
import { authenticate } from "../middleware/auth.js";

export const weatherRouter = express.Router();
export const marketRouter = express.Router();
export const agricultureRouter = express.Router();

weatherRouter.use(authenticate);
weatherRouter.get("/current", getCurrentWeather);
weatherRouter.get("/forecast", getWeatherForecast);
weatherRouter.get("/alerts", getWeatherAlerts);

marketRouter.use(authenticate);
marketRouter.get("/prices", getMarketPrices);
marketRouter.get("/trends", getMarketTrends);
marketRouter.get("/crops/:id", getCropMarketById);

agricultureRouter.use(authenticate);
agricultureRouter.get("/crop/info", getCropInfo);
agricultureRouter.get("/disease/info", getDiseaseInfo);
agricultureRouter.get("/livestock/info", getLivestockInfo);
agricultureRouter.get("/season/recommendations", getSeasonRecommendations);
agricultureRouter.get("/news", getNews);
