import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import multerStorageCloudinary from "multer-storage-cloudinary";

// 🔧 Handle both CommonJS export styles:
// - module.exports = { CloudinaryStorage }
// - module.exports = CloudinaryStorage
const CloudinaryStorage =
  multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define storage for profile images
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "alumni_connect/profile_pics",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `${Date.now()}-${file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\.[^/.]+$/, "")}`,
  }),
});

export const upload = multer({ storage });
