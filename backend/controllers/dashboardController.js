import User from '../models/User.js';
import Workshop from '../models/Workshops.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import UserActivity from '../models/UserActivity.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentUniversity = req.user.university; // ✅ Get University from Token
    const student = await User.findById(studentId);

    // --- 1. REAL STATS ---
    const mentorshipsCount = await ConnectionRequest.countDocuments({
      participants: studentId,
      status: 'accepted'
    });

    const workshops = await Workshop.find({ registeredStudents: studentId })
      .sort({ date: 1 });
    
    const upcomingWorkshops = workshops
      .filter(w => new Date(w.date) > new Date())
      .slice(0, 5);

    // Logic: 50 XP per skill + 100 per mentorship + 200 per workshop
    const xp = (student.skills.length * 50) + (mentorshipsCount * 100) + (workshops.length * 200);

    // Calculate Readiness
    let readiness = 0;
    if (student.profilePicture) readiness += 10;
    if (student.headline) readiness += 10;
    if (student.about) readiness += 10;
    if (student.education?.length > 0) readiness += 20;
    if (student.skills?.length > 0) readiness += 20;
    if (student.experience?.length > 0) readiness += 15;
    if (mentorshipsCount > 0) readiness += 15;

    // --- 2. DYNAMIC SKILL RADAR CHART ---
    const skillMap = {
      'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'frontend', 'ui', 'ux'],
      'Backend': ['node', 'express', 'mongo', 'sql', 'python', 'java', 'backend', 'api'],
      'DSA': ['algorithm', 'structure', 'leetcode', 'dsa', 'competitive', 'c++'],
      'System Design': ['system', 'architecture', 'scalability', 'cloud', 'aws', 'docker'],
      'Soft Skills': ['leadership', 'communication', 'management', 'agile', 'scrum']
    };

    const studentSkills = student.skills.map(s => s.toLowerCase());

    const getScore = (categoryKeywords) => {
      let score = 0;
      categoryKeywords.forEach(keyword => {
        if (studentSkills.some(s => s.includes(keyword))) score += 25; 
      });
      return Math.min(score + 20, 110); 
    };

    const skillData = [
      { subject: 'Frontend', student: getScore(skillMap['Frontend']), industry: 120, fullMark: 150 },
      { subject: 'Backend', student: getScore(skillMap['Backend']), industry: 120, fullMark: 150 },
      { subject: 'DSA', student: getScore(skillMap['DSA']), industry: 130, fullMark: 150 },
      { subject: 'Sys Design', student: getScore(skillMap['System Design']), industry: 110, fullMark: 150 },
      { subject: 'Soft Skills', student: getScore(skillMap['Soft Skills']), industry: 100, fullMark: 150 },
    ];

    // --- 3. DYNAMIC ACTIVITY GRAPH (Last 7 Days) ---
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]); 
    }

    const activityRecords = await UserActivity.find({
      user: studentId,
      date: { $in: last7Days }
    });

    const activityData = last7Days.map(date => {
      const record = activityRecords.find(r => r.date === date);
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        mins: record ? record.minutesActive : 0
      };
    });

    // --- 4. RECOMMENDATIONS ---
    const recommendedMentors = await User.find({
      role: 'alumni',
      university: studentUniversity, // ✅ SCOPING: Only show mentors from MY university
      _id: { $ne: studentId },
      skills: { $in: student.skills } 
    })
    .select('name headline avatar skills university')
    .limit(3);

    res.json({
      stats: {
        readiness,
        mentorships: mentorshipsCount,
        xp,
        streak: 5 
      },
      skillData,
      activityData,
      upcomingWorkshops,
      recommendedMentors
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const trackActivity = async (req, res) => {
  try {
    const studentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    await UserActivity.findOneAndUpdate(
      { user: studentId, date: today },
      { $inc: { minutesActive: 1 }, lastActive: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).send('Activity logged');
  } catch (error) {
    console.error("Activity Log Error:", error);
    res.status(500).send('Error logging activity');
  }
};