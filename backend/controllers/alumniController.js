import User from "../models/User.js";
import Workshop from "../models/Workshops.js";
import MentorshipRequest from "../models/MentorshipRequest.js";

// --- GET /api/alumni/dashboard ---
export const getAlumniDashboard = async (req, res) => {
  try {
    const alumniId = req.user._id;

    // 1. Fetch Key Data
    // We fetch all workshops to calculate lifetime stats and chart data
    const workshops = await Workshop.find({ 
      organizer: alumniId, 
      status: { $ne: 'Cancelled' } 
    });

    // We fetch requests to count interactions
    const totalRequestsCount = await MentorshipRequest.countDocuments({ alumni: alumniId });

    // 2. Calculate Lifetime Stats
    let totalEarnings = 0;
    let studentsHelpedSet = new Set(); // Use Set to count unique student IDs

    workshops.forEach(ws => {
      // Calculate Revenue based on price * registrants
      const attendeeCount = ws.registeredUsers ? ws.registeredUsers.length : 0;
      totalEarnings += (ws.price || 0) * attendeeCount;

      // Track unique students
      if (ws.registeredUsers) {
        ws.registeredUsers.forEach(id => studentsHelpedSet.add(id.toString()));
      }
    });

    const totalWorkshops = workshops.length;
    const studentsHelped = studentsHelpedSet.size;
    
    // "Interactions" = Total Requests + Total Workshop Attendees
    // (You can adjust this logic based on what you define as an interaction)
    let totalInteractions = totalRequestsCount;
    workshops.forEach(ws => totalInteractions += (ws.registeredUsers ? ws.registeredUsers.length : 0));

    // 3. Prepare Performance Chart Data (Last 6 Months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth(); 
    const performanceData = [];

    // Loop back 6 months
    for (let i = 5; i >= 0; i--) {
      // Logic to handle wrapping around year (e.g., Jan -> Dec of prev year)
      let d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthName = months[monthIdx];

      // Filter workshops occurring in this specific Month & Year
      const monthlyWorkshops = workshops.filter(ws => {
        const wsDate = new Date(ws.date);
        return wsDate.getMonth() === monthIdx && wsDate.getFullYear() === year;
      });

      let monthlyAttendees = 0;
      let monthlyEarnings = 0;

      monthlyWorkshops.forEach(ws => {
        const count = ws.registeredUsers ? ws.registeredUsers.length : 0;
        monthlyAttendees += count;
        monthlyEarnings += count * (ws.price || 0);
      });

      performanceData.push({
        month: monthName,
        attendees: monthlyAttendees,
        earnings: monthlyEarnings
      });
    }

    // 4. Get Upcoming Workshops (Next 2)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcomingWorkshopsRaw = await Workshop.find({
      organizer: alumniId,
      date: { $gte: today }, // Future or Today
      status: 'Published'
    })
    .sort({ date: 1 }) // Soonest first
    .limit(2);

    const upcomingWorkshops = upcomingWorkshopsRaw.map(ws => ({
      id: ws._id,
      title: ws.title,
      // Format date: "24 Nov, 2025"
      date: new Date(ws.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: ws.time,
      registered: ws.registeredUsers ? ws.registeredUsers.length : 0
    }));

    // 5. Calculate Profile Completion Score
    const user = await User.findById(alumniId);
    let score = 40; // Base score
    if (user.currentCompany) score += 15;
    if (user.idCardUrl) score += 15; // Assuming verification docs
    if (user.about) score += 10;
    if (totalWorkshops > 0) score += 20;

    // --- RESPONSE ---
    res.json({
      stats: {
        totalWorkshops,
        totalEarnings,
        studentsHelped,
        interactions: totalInteractions,
        profileCompletion: Math.min(score, 100)
      },
      performanceData,
      upcomingWorkshops
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- GET /api/alumni/requests ---
export const getMentorshipRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ 
      alumni: req.user._id, 
      status: 'Pending' 
    })
    .populate("student", "name graduationYear") // Fetch student details
    .sort({ createdAt: -1 }); // Newest first

    // Map to Frontend UI structure
    const formattedRequests = requests.map(req => ({
      id: req._id,
      name: req.student?.name || "Unknown Student",
      year: req.student?.graduationYear 
        ? `${new Date().getFullYear() - req.student.graduationYear + 4}th Year` // Approx calculation
        : "Student", 
      msg: req.message,
      type: req.type,
      posted: timeSince(req.createdAt), // "2h ago"
      avatar: req.student?.name ? req.student.name.charAt(0) : "?"
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error("Requests Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- GET /api/alumni/recommendations ---
export const getRecommendedStudents = async (req, res) => {
  try {
    // ✅ SCOPING UPDATE: Restrict to My University
    const myUniversity = req.user.university;

    // MVP Logic: Return 3 random students FROM MY UNI only
    const students = await User.find({ 
        role: 'student',
        university: myUniversity // <--- Added Filter
    })
    .limit(3)
    .select('name interests university');
    
    const formatted = students.map((s, index) => ({
      id: s._id,
      name: s.name,
      // Create fake match % for demo or use real logic if tags exist
      match: (85 + Math.floor(Math.random() * 14)) + "%", 
      interest: s.interests && s.interests.length > 0 ? s.interests[0] : "Software Development",
      skills: ["React", "Node"] // Placeholder if skills aren't in User model yet
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Helper Functions ---

// Put request to Accept/Reject
export const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'
    await MentorshipRequest.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Time Formatter
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
}