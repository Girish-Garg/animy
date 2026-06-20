import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import albumRoutes from "./routes/album.routes.js";
import { handleValidationErrors } from "./middleware/validation.middleware.js";
import connectDB from "./db/connection.js";
import { clerkMiddleware } from "@clerk/express";
import * as Sentry from "@sentry/node";
import { validateEnv } from "./config/env.js";
import logger from "./utils/logger.js";

app.set('trust proxy', 1);
// Fail fast with a readable message if the environment is misconfigured.
try {
  validateEnv(process.env);
} catch (err) {
  console.error(`\n${err.message}\n`);
  process.exit(1);
}

// Sentry is optional and configured via env (DSN is no longer hardcoded;
// sendDefaultPii removed so user data isn't shipped to Sentry by default).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
  });
}

connectDB();
const app = express();

// CORS: allow the configured frontend origin plus the local dev origin.
// Undefined entries are filtered so an unset FRONTEND_URL doesn't break it.
// Extra dev origins can be supplied via CORS_EXTRA_ORIGINS (comma-separated).
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  ...(process.env.CORS_EXTRA_ORIGINS ? process.env.CORS_EXTRA_ORIGINS.split(",") : []),
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(clerkMiddleware());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Basic rate limiting for the API surface.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1", dashboardRoutes);
app.use("/api/v1/album", albumRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use(handleValidationErrors);

// Report unhandled errors to Sentry (when configured) before our handler.
if (process.env.SENTRY_DSN && typeof Sentry.setupExpressErrorHandler === "function") {
  Sentry.setupExpressErrorHandler(app);
}

// Global error handler
app.use((error, req, res, next) => {
  logger.error({ err: error }, "Global error handler");
  res.status(500).json({
    type: "error",
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
