import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const Connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

export default Connectdb;
