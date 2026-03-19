import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Storing as "YYYY-MM-DD"
    required: true
  },
  minutesActive: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique record per user per day
userActivitySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('UserActivity', userActivitySchema);