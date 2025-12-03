import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import routes from "./routes";
import { apiLimiter } from "./middleware/rateLimit";

const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/airbnb_clone";

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// ========== Middlewares ==========
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images / assets from other domains
  })
);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Rate limiting for all /api routes
app.use("/api", apiLimiter);

// ========== Routes ==========
app.use("/api", routes);

// Simple health root
app.get("/", (_req, res) => {
  res.json({ message: "Airbnb clone API running" });
});

// ========== Error handler ==========
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    if (res.headersSent) return;
    const status = err.status || 500;
    res.status(status).json({
      message: err.message || "Internal server error",
    });
  }
);

// ========== Start server ==========
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  });
