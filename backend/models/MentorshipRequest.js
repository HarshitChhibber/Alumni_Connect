import mongoose from "mongoose";

const mentorshipRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    
    // New Fields for detailed card
    type: { 
      type: String, 
      enum: ['Referral', 'Mentorship', 'Doubt Solving', 'Portfolio Review'],
      required: true 
    },
    goal: { type: String, required: true }, // e.g. "SDE @ Google"
    
    // We store skills as a simple array of objects
    skillsData: [{
      subject: String,
      A: Number, // The score (0-100)
      fullMark: { type: Number, default: 100 }
    }],

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"], // Changed 'Ignored' to 'Rejected' to match UI
      default: "Pending",
    },
  },
  { timestamps: true }
);

const MentorshipRequest = mongoose.model("MentorshipRequest", mentorshipRequestSchema);
export default MentorshipRequest;