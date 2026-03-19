import express from "express";
import { 
    getProfile, 
    updateProfile,      // 1. This is the name you imported
    getExploreProfiles, 
    getMyProfile 
} from "../controllers/Profile.js";
import { protect } from "../middleware/authMiddleware.js"; // 2. This is the name you imported
import { upload } from "../utils/Cloudinary.js"; 

const router = express.Router();

// --- 1. Specific Routes FIRST ---

// GET /api/profile/explore
router.get("/explore", protect, getExploreProfiles);

// GET /api/profile/me 
router.get("/me", protect, getMyProfile); 

// PUT /api/profile/update 
// Fixed: changed 'auth' to 'protect'
// Fixed: changed 'updateProfileController' to 'updateProfile' (to match import)
// Key: 'avatar' matches your Frontend formData.append('avatar', file)
router.put('/update', protect, upload.single('avatar'), updateProfile);

// --- 2. Dynamic/Wildcard Routes LAST ---

// GET /api/profile/:id 
router.get("/:id", protect, getProfile);

export default router;