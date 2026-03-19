import User from "../models/User.js";

// ==============================
// 🟢 GET: My Profile (Logged in user)
// ==============================
export const getMyProfile = async (req, res) => {
  try {
    // req.user is populated by your auth middleware (verifyToken)
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Not authorized" });
    }
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json(user);
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==============================
// 🔵 GET: Specific User Profile (by ID)
// ==============================
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Safety check for "me" route collision
    if (id === "me") {
        return res.status(400).json({ message: "Invalid ID parameter" });
    }

    // Exclude sensitive verification docs when viewing others
    const user = await User.findById(id).select("-password -studentIdCardUrl -idCardUrl -degreeUrl");
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid Profile ID" });
    }
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 🟡 PUT: Update Profile
// ==============================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; 
    let updates = { ...req.body };

    // Security cleanup: Prevent updating restricted fields
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates._id;
    delete updates.isVerified; // Prevent self-verification

    // Parse stringified JSON fields (necessary when using FormData for file uploads)
    const complexFields = ['milestones', 'skills', 'skillStats', 'socials'];
    complexFields.forEach(field => {
        if (updates[field] && typeof updates[field] === 'string') {
            try {
                updates[field] = JSON.parse(updates[field]);
            } catch (e) {
                delete updates[field]; // discard invalid JSON
            }
        }
    });

    // Handle File Upload (Cloudinary URL provided by middleware)
    if (req.file) {
      updates.profilePicture = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==============================
// 🟣 GET: Explore Profiles (Strict University Scoping)
// ==============================
export const getExploreProfiles = async (req, res) => {
  try {
    const { search, role } = req.query; // Removed 'university' from query extraction
    
    // 1. STRICT SCOPING: Get University from Logged-in User
    // (This assumes you have added university to the JWT payload in auth.js)
    const myUniversity = req.user.university; 

    // 2. Build the Base Query
    let query = { 
        university: myUniversity, // <--- THE KEY CHANGE: FORCE FILTER
        
        // ⚠️ DEV NOTE: Uncomment these for production behavior
        // isVerified: true, 
        // _id: { $ne: req.user._id } 
    }; 

    // 3. Role Logic
    if (role) {
        // If frontend specifically asks for 'student' or 'alumni', obey it.
        query.role = role;
    } else {
        // Default behavior: Show the OPPOSITE role
        const currentUserRole = req.user.role;
        if (currentUserRole === 'student') {
            query.role = 'alumni';
        } else if (currentUserRole === 'alumni') {
            query.role = 'student';
        }
    }

    // 4. Search Logic
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
        { currentCompany: { $regex: search, $options: "i" } } // Also search company
      ];
    }

    console.log(`🔍 Explore: User(${req.user._id}) from ${myUniversity} searching for ${query.role}`); 

    const profiles = await User.find(query)
      .select("name role university bio skills profilePicture goal status currentCompany year batch location socials resumeLink")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(profiles);
  } catch (error) {
    console.error("EXPLORE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};