import express from "express";
import { 
  getAlumniDashboard, 
  getMentorshipRequests, 
  respondToRequest,
  getRecommendedStudents
} from "../controllers/alumniController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require login + 'alumni' role
router.use(protect);
router.use(restrictTo("alumni"));

// Dashboard Aggregation
router.get("/dashboard", getAlumniDashboard);

// Requests Widget
router.get("/requests", getMentorshipRequests);
router.put("/requests/:id", respondToRequest);

// Recommendations Widget
router.get("/recommendations", getRecommendedStudents);

export default router;