import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/authRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { chatbotRouter } from "./routes/chatbotRoutes.js";
import { profileRouter } from "./routes/profileRoutes.js";
import { recommendationRouter } from "./routes/recommendationRoutes.js";
import { schemeRouter } from "./routes/schemeRoutes.js";
import { socialRouter } from "./routes/socialRoutes.js";
import { agricultureRouter, marketRouter, weatherRouter } from "./routes/agricultureRoutes.js";
import { documentRouter } from "./routes/documentRoutes.js";
import { dbtRouter } from "./routes/dbtRoutes.js";
import plantDoctorRouter from "./routes/plantDoctorRoutes.js";
import livestockRouter from "./routes/livestockRoutes.js";
import { newsRouter } from "./routes/newsRoutes.js";
import { agriMapRouter } from "./routes/agriMapRoutes.js";
import { jobRouter } from "./routes/jobRoutes.js";
import { marketplaceRouter } from "./routes/marketplaceRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";

export const app = express();

app.set("etag", false);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === env.clientUrl || /^http:\/\/localhost:517\d$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "KisanBandhu API", status: "healthy" });
});

app.use("/api/news", newsRouter);

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/profile", profileRouter);
app.use("/api/schemes", schemeRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/social", socialRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/market", marketRouter);
app.use("/api", agricultureRouter);
app.use("/api/documents", documentRouter);
app.use("/api/dbt", dbtRouter);
app.use("/api/plant-doctor", plantDoctorRouter);
app.use("/api/livestock", livestockRouter);
app.use("/api/agri-map", agriMapRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/marketplace", marketplaceRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);
