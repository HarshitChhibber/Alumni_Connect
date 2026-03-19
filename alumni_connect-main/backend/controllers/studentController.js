import User from "../models/User.js";
import MentorshipRequest from "../models/MentorshipRequest.js";

// GET /api/students/explore
export const exploreStudents = async (req, res) => {
  try {
    const { search, year, branch } = req.query;
    const myUniversity = req.user.university; // ✅ Get University from Token

    // 1. Build the Query Object
    const query = { 
        role: 'student',
        university: myUniversity // ✅ RESTRICT TO MY UNIVERSITY
    };

    // Filter by Year
    if (year && year !== 'All') {
      query.year = year; 
    }

    // Filter by Branch
    if (branch && branch !== 'All Branches') {
      if (branch.includes('CSE')) query.branch = 'CSE';
      else if (branch.includes('ECE')) query.branch = 'ECE';
      else if (branch.includes('Mechanical')) query.branch = 'Mech';
      else if (branch.includes('Civil')) query.branch = 'Civil';
    }

    // Search (Name, Skills, or Goal)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { skills: { $in: [searchRegex] } },
        { goal: searchRegex }
      ];
    }

    // 2. Fetch Students
    const students = await User.find(query).select('-password');

    // 3. Simple Stats (Scoped to University)
    const totalCandidates = await User.countDocuments({ 
        role: 'student',
        university: myUniversity 
    });
    
    res.json({
      students,
      stats: {
        total: totalCandidates
      }
    });

  } catch (error) {
    console.error("Explore Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/students/contact
export const contactStudent = async (req, res) => {
  try {
    const { studentId, message } = req.body;
    const alumniId = req.user._id;
    const alumniUniversity = req.user.university; // From Token

    // --- 🔒 SCOPING CHECK: Verify Student University ---
    const student = await User.findById(studentId).select('university');
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    if (student.university !== alumniUniversity) {
        return res.status(403).json({ 
            message: "Restricted: You can only contact students from your own university." 
        });
    }
    // ----------------------------------------------------

    const newInteraction = await MentorshipRequest.create({
      student: studentId,
      alumni: alumniId,
      message: message,
      type: 'Mentorship', 
      goal: 'Alumni Outreach',
      status: 'Accepted' 
    });

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Student Error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};