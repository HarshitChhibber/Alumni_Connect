import mongoose from "mongoose";

const workshopSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    
    // Date & Time
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: String }, 

    mode: { 
      type: String, 
      enum: ["Online", "Offline"], 
      default: "Online" 
    },
    
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 100 },
    registeredUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    // Visuals
    image: { 
      type: String, 
      default: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" 
    },
    tags: [{ type: String }],

    meetingCode: { type: String },
    
    // --- ⬇️ NEW FIELDS (SAFE ADDITIONS) ⬇️ ---

    // For Alumni to describe what they need (Projector, Mic, etc.)
    venueRequest: {
        requirements: { type: String }, 
        reason: { type: String }
    },

    // For Admin to assign the actual room
    assignedVenue: { type: String }, // e.g., "Auditorium B"

    // For Admin to talk back (e.g., "Approved, keys at reception")
    adminNote: { type: String },

    status: {
      type: String,
      // Added 'Pending' and 'Rejected' to the Enum. 
      // 'Published' remains default so old code still works automatically.
      enum: ["Published", "Draft", "Cancelled", "Pending", "Rejected"],
      default: "Published"
    }
  },
  { timestamps: true }
);

const Workshop = mongoose.model("Workshop", workshopSchema);
export default Workshop;