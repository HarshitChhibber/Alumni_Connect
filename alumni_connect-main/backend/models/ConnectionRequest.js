import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  message: { 
    type: String 
  }, 
}, { timestamps: true });

// Prevent duplicate pending requests
connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model('ConnectionRequest', connectionRequestSchema);