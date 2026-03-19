import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// 1. Get All Conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name email avatar")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// 2. Get Messages
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId || conversationId === 'undefined' || conversationId === 'null') {
        return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// 3. Send Message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    // A. Check if conversation exists (Robust Check)
    // We check if a conversation exists containing EXACTLY these two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    // If no conversation, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        lastMessage: {
            text: text,
            sender: senderId,
            seen: false
        }
      });
    }

    // B. Create Message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text,
    });

    // C. Update Conversation (last message)
    // Use findByIdAndUpdate to ensure atomic update
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: {
        text,
        sender: senderId,
        seen: false,
      },
    }, { new: true });

    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};


export const clearAllChats = async (req, res) => {
  try {
    // Delete all messages
    await Message.deleteMany({});
    
    // Delete all conversations
    await Conversation.deleteMany({});

    console.log("Database chat history cleared.");
    res.status(200).json({ message: "All chats and conversations have been deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear chats" });
  }
};