import mongoose from "mongoose";
import dns from "dns";
import logger from "../utils/logger.js";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      logger.error("MONGO_URI is not defined in environment variables");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

export default connectDB;