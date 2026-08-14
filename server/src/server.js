import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";
import http from "http";
import { initSocket } from "./services/socketService.js";

async function bootstrap() {
  validateEnv();
  
  // Start HTTP server immediately
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  
  httpServer.listen(env.port, () => {
    console.log(`KisanBandhu API running on port ${env.port}`);
  });
  
  // Connect to database in the background
  connectDb()
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error.message));
  
  // start news poller (if configured)
  try {
    const { startNewsService } = await import("./services/newsService.js");
    startNewsService();
  } catch (e) {
    console.warn("News service failed to start:", e.message || e);
  }
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
