import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Sub-schema for Milestones (Timeline)
const milestoneSchema = new mongoose.Schema({
  year: { type: String, required: true },
  milestone: { type: String, required: true }, // Title
  description: { type: String },
  skillsGained: { type: String },
  type: { 
    type: String, 
    enum: ['Education', 'Job', 'Internship', 'Project', 'Achievement', 'Location', 'Promotion'],
    default: 'Project' 
  }
}, { _id: false });

// Sub-schema for Radar Chart Data
const skillStatSchema = new mongoose.Schema({
  subject: { type: String },
  A: { type: Number, default: 0 }, // Score
  fullMark: { type: Number, default: 150 }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    // --- Auth Basics ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
    
    // --- Profile Details (Shared) ---
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    profilePicture: { type: String, default: "" }, 
    
    // Links
    socials: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" }
    },
    resumeLink: { type: String, default: "" },

    // Skills & Stats
    skills: [{ type: String }], 
    skillStats: [skillStatSchema], 

    // The Journey Timeline
    milestones: [milestoneSchema],

    // --- Student Specific ---
    rollNumber: { type: String },
    branch: { type: String },
    year: { type: String }, // e.g. "3rd Year"
    goal: { type: String }, // e.g. "SDE Internship"

    // --- Alumni Specific ---
    graduationYear: { type: Number },
    currentCompany: { type: String },
    batch: { type: String }, // e.g. "Class of 2023"
    status: { type: String }, // e.g. "Open to Mentorship"
    workEmail: { type: String },

    // --- Verification Docs ---
    university: { type: String },
    studentIdCardUrl: { type: String },
    idCardUrl: { type: String },
    degreeUrl: { type: String },
    isVerified: { type: Boolean, default: false },

    // --- Online Status (Backend only, not exposed to frontend) ---
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;