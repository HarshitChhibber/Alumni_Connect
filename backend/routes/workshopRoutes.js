import express from "express";
import { 
  createWorkshop, 
  requestVenue,           // ✅ NEW: Import this
  getMyWorkshops, 
  deleteWorkshop, 
  getWorkshopStats,
  getAllWorkshops, 
  registerForWorkshop, 
  getStudentWorkshops,
  createWorkshopOrder,
  verifyWorkshopPayment,
  getPendingVenueRequests, // ✅ NEW: Import this
  approveVenue             // ✅ NEW: Import this
} from "../controllers/workshopController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { upload } from "../utils/Cloudinary.js";

const router = express.Router();

// All routes below this require authentication
router.use(protect);

// ==========================================
// 1. ALUMNI ROUTES
// ==========================================

// Create Standard Online Workshop (Published Immediately)
router.post(
  "/", 
  restrictTo("alumni"), 
  upload.single("image"), 
  createWorkshop
);

// Create Offline Workshop Request (Pending Approval)
router.post(
  "/request-venue",
  restrictTo("alumni"),
  // Note: Add upload.single("image") here if you want images for offline requests too
  requestVenue
);

// Get My Workshops (Alumni) OR All University Workshops (Admin)
router.get("/my-created", restrictTo("alumni", "admin"), getMyWorkshops);

// Delete/Cancel Workshop
router.delete("/:id", restrictTo("alumni", "admin"), deleteWorkshop);

// Get Stats
router.get("/stats", restrictTo("alumni", "admin"), getWorkshopStats);


// ==========================================
// 2. ADMIN ROUTES
// ==========================================

// Get all Pending Offline Requests for this University
router.get(
  "/admin/pending-venues", 
  restrictTo("admin"), 
  getPendingVenueRequests
);

// Approve a Venue Request and Publish the Workshop
router.post(
  "/admin/approve-venue", 
  restrictTo("admin"), 
  approveVenue
);


// ==========================================
// 3. STUDENT ROUTES
// ==========================================

router.get("/explore", getAllWorkshops); 
router.get("/my-learning", getStudentWorkshops);

// Registration & Payment Flow
router.post("/:id/register", registerForWorkshop); // For Free events
router.post("/:id/payment-order", createWorkshopOrder); // Step 1: Paid events
router.post("/verify-payment", verifyWorkshopPayment);  // Step 2: Paid events

export default router;