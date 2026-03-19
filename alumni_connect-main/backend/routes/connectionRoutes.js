import express from 'express';
import { sendRequest, acceptRequest , getPendingRequests } from '../controllers/connectionController.js'; // ✅ CORRECT IMPORT
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
// ✅ Ensure these point to connectionController functions
router.post('/send', sendRequest);
router.post('/accept', acceptRequest);
router.get('/pending',  getPendingRequests);
export default router;