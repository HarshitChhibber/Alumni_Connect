import express from "express";
import { exploreStudents, contactStudent } from "../controllers/studentController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("alumni")); // Only alumni see this page

router.get("/explore", exploreStudents);
router.post("/contact", contactStudent);

export default router;