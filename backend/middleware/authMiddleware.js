import jwt from "jsonwebtoken";
import User from "../models/User.js";

// PROTECT ROUTE
export const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    // Extract Bearer token
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Authentication failed." });
  }
};

// ROLE BASED ACCESS
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. Access denied." });
    }

    next();
  };
};
