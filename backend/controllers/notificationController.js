import User from '../models/User.js';
import OnlineAlumniNotification from '../models/OnlineAlumniNotification.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Get online alumni for notifications (students only)
export const getOnlineAlumni = async (req, res) => {
  try {
    const userId = req.user._id;
    const userUniversity = req.user.university;

    // Only students can see online alumni
    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.role !== 'student') {
      return res.status(403).json({ 
        message: "Only students can view online alumni notifications." 
      });
    }

    // Get online alumni from the same university
    const onlineAlumni = await User.find({
      role: 'alumni',
      isOnline: true,
      university: userUniversity
    })
    .select('name profilePicture currentCompany location batch skills graduationYear')
    .limit(10)
    .sort({ lastSeen: -1 });

    res.status(200).json({ onlineAlumni });
  } catch (err) {
    console.error("Error fetching online alumni:", err);
    res.status(500).json({ error: "Failed to fetch online alumni" });
  }
};

// Get notification history for a student (backend internal use only)
export const getNotificationHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    const currentUser = await User.findById(studentId);
    
    if (!currentUser || currentUser.role !== 'student') {
      return res.status(403).json({ 
        message: "Only students can view notifications." 
      });
    }

    // Get recent notifications (last 30 days)
    const notifications = await OnlineAlumniNotification.find({
      student: studentId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    .populate('alumni', 'name profilePicture currentCompany batch')
    .sort({ createdAt: -1 })
    .limit(20);

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Clear a notification (when offline or dismissed)
export const clearNotification = async (req, res) => {
  try {
    const { alumniId } = req.body;
    const studentId = req.user._id;

    // Delete notification record
    await OnlineAlumniNotification.deleteOne({
      student: studentId,
      alumni: alumniId
    });

    res.status(200).json({ message: "Notification cleared" });
  } catch (err) {
    console.error("Error clearing notification:", err);
    res.status(500).json({ error: "Failed to clear notification" });
  }
};

// Send connection request (REST endpoint for reliability)
export const sendConnectionRequestViaRest = async (req, res) => {
  try {
    const { alumniId, message } = req.body;
    const studentId = req.user._id;

    // Verify the student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ error: 'Only students can send connection requests' });
    }

    // Verify the alumni
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ error: 'Invalid alumni' });
    }

    // Verify university match
    if (student.university !== alumni.university) {
      return res.status(403).json({ error: 'You can only connect with alumni from your university' });
    }

    // Check for existing request
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: studentId, receiver: alumniId },
        { sender: alumniId, receiver: studentId }
      ],
      status: { $ne: 'rejected' }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Connection request already exists' });
    }

    // Create connection request
    const connectionRequest = new ConnectionRequest({
      sender: studentId,
      receiver: alumniId,
      message: message || `Hi, I'd like to connect with you!`
    });

    await connectionRequest.save();

    // Update notification status
    await OnlineAlumniNotification.findOneAndUpdate(
      { student: studentId, alumni: alumniId },
      { status: 'connection_sent', connectionRequest: connectionRequest._id },
      { upsert: true }
    );

    res.status(201).json({ 
      message: "Connection request sent successfully.",
      requestId: connectionRequest._id 
    });

  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).json({ error: "Failed to send connection request" });
  }
};

// Accept connection request and start messaging (REST endpoint)
export const acceptConnectionRequestViaRest = async (req, res) => {
  try {
    const { studentId } = req.body;
    const alumniId = req.user._id;

    // Verify the alumni
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can accept requests' });
    }

    // Find the connection request
    const connectionRequest = await ConnectionRequest.findOne({
      sender: studentId,
      receiver: alumniId,
      status: 'pending'
    });

    if (!connectionRequest) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Update request status
    connectionRequest.status = 'accepted';
    await connectionRequest.save();

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [studentId, alumniId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [studentId, alumniId],
        lastMessage: {
          text: "Connection accepted",
          sender: alumniId,
          createdAt: new Date()
        }
      });

      // Create first message if there was a message in the request
      if (connectionRequest.message) {
        const firstMsg = await Message.create({
          conversationId: conversation._id,
          sender: studentId,
          text: connectionRequest.message
        });

        conversation.lastMessage = {
          text: connectionRequest.message,
          sender: studentId,
          createdAt: firstMsg.createdAt
        };
        await conversation.save();
      }
    }

    // Update notification status
    await OnlineAlumniNotification.findOneAndUpdate(
      { student: studentId, alumni: alumniId },
      { status: 'connection_accepted' },
      { upsert: true }
    );

    res.status(200).json({ 
      message: "Connection request accepted. Chat enabled.",
      conversationId: conversation._id,
      conversationParticipants: [studentId, alumniId]
    });

  } catch (err) {
    console.error("Error accepting connection request:", err);
    res.status(500).json({ error: "Failed to accept connection request" });
  }
};