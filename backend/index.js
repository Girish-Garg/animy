import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import albumRoutes from "./routes/album.routes.js";
import { handleValidationErrors } from "./middleware/validation.middleware.js";
import connectDB from "./db/connection.js";
import { clerkMiddleware } from "@clerk/express";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://267546bd766c252e5cd811bdbd52bec9@o4509724094431232.ingest.us.sentry.io/4509724393865216",
  sendDefaultPii: true,
  tracesSampleRate: 0.2,
});

dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL , "http://localhost:5173"],
  credentials: true
}));
app.use(clerkMiddleware());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", dashboardRoutes);
app.use("/api/v1/album", albumRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use(handleValidationErrors);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    type: 'error',
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});