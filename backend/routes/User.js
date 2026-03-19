import express from "express";
import { register, login } from "../controllers/User.js";
import { upload } from "../utils/Cloudinary.js";

const router = express.Router();

// Handle multiple file fields
// 1. studentIdCardImage -> Student (verify Name, Roll No, Uni)
// 2. idCardImage -> Alumni (verify Company Name)
// 3. degreeImage -> Alumni (verify Uni Name)

const uploadFields = upload.fields([
  { name: "studentIdCardImage", maxCount: 1 },
  { name: "idCardImage", maxCount: 1 },
  { name: "degreeImage", maxCount: 1 }, 
]);

router.post("/register", uploadFields, register);
router.post("/login", login);

export default router;