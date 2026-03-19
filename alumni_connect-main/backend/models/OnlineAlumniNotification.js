import mongoose from 'mongoose';

const onlineAlumniNotificationSchema = new mongoose.Schema({
  // The student who will receive the notification
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // The alumni who came online
  alumni: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Connection request status (if student initiates connection)
  connectionRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectionRequest',
    default: null
  },
  
  // Notification status (visible only in backend/socket, not exposed via REST API)
  status: {
    type: String,
    enum: ['online', 'offline', 'connection_sent', 'connection_accepted'],
    default: 'online'
  },
  
  // When did alumni come online
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for quick lookups
onlineAlumniNotificationSchema.index({ student: 1, alumni: 1 });

export default mongoose.model('OnlineAlumniNotification', onlineAlumniNotificationSchema);
