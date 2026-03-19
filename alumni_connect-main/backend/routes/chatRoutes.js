import express from "express";
import { getConversations, getMessages, sendMessage,clearAllChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/:conversationId", getMessages);
router.post("/send", sendMessage);
router.delete("/reset-chat-db", clearAllChats);
export default router;