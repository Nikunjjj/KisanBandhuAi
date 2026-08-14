import express from "express";
import { getCachedNews } from "../services/newsService.js";

export const newsRouter = express.Router();

newsRouter.get("/", (_req, res) => {
  const { news, categories } = getCachedNews();
  res.json({ news, categories });
});

export default newsRouter;
