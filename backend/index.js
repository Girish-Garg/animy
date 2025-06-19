import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import albumRoutes from "./routes/album.routes.js";
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from "./db/connection.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Config dotenv with explicit path to .env file
dotenv.config({ path: path.join(rootDir, '.env') });
connectDB();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", dashboardRoutes);
app.use("/api/v1/album", albumRoutes);
app.use("/api/v1/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});