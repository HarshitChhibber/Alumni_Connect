import express from "express";
import User from "../models/User.js";
import { protect,restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here require admin
router.use(protect, restrictTo("admin"));

// GET /api/admin/users  -> list all users (with pagination optional)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE /api/admin/users/:id  -> delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /api/admin/verify/:id  -> approve an alumni/student (set isVerified true)
router.post("/verify/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isVerified = true;
    await user.save();

    res.json({ message: "User verified.", user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("VERIFY USER ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
