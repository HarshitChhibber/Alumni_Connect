import ConnectionRequest from '../models/ConnectionRequest.js';
import Conversation from '../models/Conversation.js'; 
import Message from '../models/Message.js'; 
import User from '../models/User.js'; // ✅ Added to verify University

// --- 1. Send a Request ---
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id; 
    const senderUniversity = req.user.university; // From verified Token

    // --- 🔒 SCOPING CHECK: Verify University Match ---
    const receiver = await User.findById(receiverId).select('university');
    
    if (!receiver) {
        return res.status(404).json({ message: "User not found" });
    }

    if (receiver.university !== senderUniversity) {
        return res.status(403).json({ 
            message: "Restricted: You can only connect with people from your own university." 
        });
    }
    // --------------------------------------------------

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: { $ne: 'rejected' }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: "Connection request already exists or you are already connected." 
      });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      receiver: receiverId,
      message
    });

    await newRequest.save();
    res.status(201).json({ message: "Connection request sent successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error processing request." });
  }
};

// --- 2. Accept Request ---
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.id;

    const request = await ConnectionRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    request.status = 'accepted';
    await request.save();

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [request.sender, request.receiver] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [request.sender, request.receiver],
        lastMessage: {
            text: "Connection accepted",
            sender: userId,
            createdAt: new Date()
        }
      });
      
      if(request.message) {
          const firstMsg = await Message.create({
              conversationId: conversation._id,
              sender: request.sender,
              text: request.message
          });
          
          conversation.lastMessage = {
              text: request.message,
              sender: request.sender,
              createdAt: firstMsg.createdAt
          };
          await conversation.save();
      }
    }

    res.status(200).json({ 
      message: "Request accepted. Chat enabled.", 
      conversationId: conversation._id 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error accepting request." });
  }
};

// --- 3. Get Pending Requests ---
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find requests where "I" am the receiver AND status is pending
    const requests = await ConnectionRequest.find({
      receiver: userId,
      status: 'pending'
    })
    .populate('sender', 'name profilePicture role year branch currentCompany') // Get sender details
    .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching pending requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};