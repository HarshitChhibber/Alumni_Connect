import express from 'express';
import { 
  getOnlineAlumni, 
  getNotificationHistory, 
  clearNotification,
  sendConnectionRequestViaRest,
  acceptConnectionRequestViaRest 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Get online alumni
router.get('/online-alumni', getOnlineAlumni);

// Get notification history
router.get('/history', getNotificationHistory);

// Clear a specific notification
router.post('/clear', clearNotification);

// Send connection request via REST (backup for WebSocket)
router.post('/send-connection-request', sendConnectionRequestViaRest);

// Accept connection request via REST
router.post('/accept-connection-request', acceptConnectionRequestViaRest);

export default router;
