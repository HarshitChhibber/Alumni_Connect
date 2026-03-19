import express from 'express';
import { protect} from '../middleware/authMiddleware.js';   
import { getStudentDashboard, trackActivity } from '../controllers/dashboardController.js';

const router = express.Router();

// Get all dashboard data
router.get('/dashboard', protect, getStudentDashboard);

// "Heartbeat" to track usage time
router.post('/activity/heartbeat', protect, trackActivity);

export default router;