import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { verifyDocumentOCR } from "../utils/ocrService.js"; 

// ✅ UPDATE: Add university to the token payload
const generateToken = (user) => {
  return jwt.sign({ 
    id: user._id, 
    role: user.role,
    university: user.university // <--- CRITICAL: Scoping relies on this
  }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==============================
// 🚀 REGISTER CONTROLLER
// ==============================
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "student",
      rollNumber,
      graduationYear,
      currentCompany, // Alumni company
      university,     // Required for both
      workEmail,
    } = req.body;

    // Handle File Uploads
    const studentIdCardFile = req.files?.["studentIdCardImage"]?.[0];
    const alumniIdCardFile = req.files?.["idCardImage"]?.[0]; // Company ID
    const alumniDegreeFile = req.files?.["degreeImage"]?.[0]; // DMC/Degree

    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: "Name, email, password, and university are required." });
    }

    const cleanedEmail = email.trim().toLowerCase();
    
    // Check existing user
    const exists = await User.findOne({ email: cleanedEmail });
    if (exists) return res.status(400).json({ message: "Email already registered." });

    let isVerified = false;
    let studentIdCardUrl = "";
    let idCardUrl = "";
    let degreeUrl = "";

    // ==========================================
    // 🎓 STUDENT VERIFICATION LOGIC
    // Checks: Name, Roll Number, University
    // ==========================================
    if (role === "student") {
      if (!rollNumber) return res.status(400).json({ message: "Roll number is required." });
      if (!studentIdCardFile) return res.status(400).json({ message: "Student ID Card is required." });

      studentIdCardUrl = studentIdCardFile.path;

      console.log("🔍 Verifying Student ID...");
      // Check Name, Roll No, AND University Name
      const ocrResult = await verifyDocumentOCR(studentIdCardUrl, [name, rollNumber, university]);

      if (ocrResult.success) {
        isVerified = true;
        console.log("✅ Student Verified (Name, Roll, Uni match).");
      } else {
        console.log("⚠️ Student Verification Failed. Pending Manual Review.");
      }
    }

    // ==========================================
    // 💼 ALUMNI VERIFICATION LOGIC
    // Checks: Company Name (ID Card) + Uni Name (DMC)
    // ==========================================
    if (role === "alumni") {
      if (!graduationYear) return res.status(400).json({ message: "Graduation year is required." });
      if (!currentCompany) return res.status(400).json({ message: "Current company is required." });
      
      // 1. Handle Company ID (Optional if work email provided, but mandatory for instant verification)
      if (alumniIdCardFile) {
        idCardUrl = alumniIdCardFile.path;
      }
      
      // 2. Handle Degree/DMC (Mandatory for Uni verification)
      if (alumniDegreeFile) {
        degreeUrl = alumniDegreeFile.path;
      } else {
        return res.status(400).json({ message: "Degree/DMC image is required for university verification." });
      }

      // --- CHECK 1: UNIVERSITY (via DMC) ---
      console.log("🔍 Verifying Alumni Degree...");
      const degreeOcr = await verifyDocumentOCR(degreeUrl, [university]);
      const isUniVerified = degreeOcr.success;

      // --- CHECK 2: COMPANY (via ID Card or Email) ---
      let isCompanyVerified = false;

      // Method A: Work Email Check
      const corporateDomains = [".com", ".co", ".ai", ".org", ".net"];
      const genericDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
      if (workEmail) {
        const emailDomain = workEmail.split("@")[1];
        if (!genericDomains.includes(emailDomain)) {
          isCompanyVerified = true;
        }
      }

      // Method B: Company ID OCR (Override if email fails or isn't provided)
      if (!isCompanyVerified && idCardUrl) {
        console.log("🔍 Verifying Alumni Company ID...");
        const companyOcr = await verifyDocumentOCR(idCardUrl, [currentCompany]);
        isCompanyVerified = companyOcr.success;
      }

      // --- FINAL ALUMNI VERDICT ---
      if (isUniVerified && isCompanyVerified) {
        isVerified = true;
        console.log("✅ Alumni Fully Verified (Uni & Company).");
      } else {
        console.log(`⚠️ Alumni Verification Failed. Uni: ${isUniVerified}, Company: ${isCompanyVerified}`);
      }
    }

    // Create User
    const user = await User.create({
      name,
      email: cleanedEmail,
      password,
      role,
      university, // Save Uni
      rollNumber,
      graduationYear,
      currentCompany,
      workEmail,
      studentIdCardUrl,
      idCardUrl,
      degreeUrl, // Save DMC URL
      isVerified,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: isVerified ? "Registered & Verified!" : "Registered. Verification pending.",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        university: user.university, // Added to response
        isVerified: user.isVerified,
      },
      token,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error. Try again." });
  }
};

// ==============================
// 🔐 LOGIN CONTROLLER
// ==============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    // Generates token WITH university inside
    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university, // Added to response
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error." });
  }
};