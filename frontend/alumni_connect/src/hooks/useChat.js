import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchConversations, fetchMessages, sendMessage } from '../api/chatService';

export const useChat = (currentUserId) => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
   
  // Ref to track current chat ID for polling
  const currentChatRef = useRef(null);

  // Sync Ref with State
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // Helper to safely compare IDs (Handles MongoID Objects vs Strings)
  const getStringId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? id.toString() : id;
  };

  const safeCurrentUserId = getStringId(currentUserId);

  // 1. Helper: Fetch Messages
  const loadMessagesSafe = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      const data = await fetchMessages(chatId);
      // Only update if the user is still looking at this chat
      if (currentChatRef.current?._id === chatId) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }, []);

  // 2. Load Sidebar (Conversations)
  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, []);

  // 3. Select Chat
  const selectConversation = useCallback(async (conversation) => {
    if (currentChat?._id === conversation._id) return;

    setCurrentChat(conversation);
    setMessages([]); // Clear previous messages immediately
    setLoading(true);

    try {
      const data = await fetchMessages(conversation._id);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load chat", err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // 4. Polling Effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh conversation list (for last message updates)
      loadConversations();
      
      // Refresh current chat messages if open
      if (currentChatRef.current) {
        loadMessagesSafe(currentChatRef.current._id); 
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loadMessagesSafe, loadConversations]);

  // 5. Initial Load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 6. Send Message Handler
  const handleSendMessage = async (text) => {
    if (!text.trim() || !currentChat) return;

    // CRITICAL FIX: Ensure we compare IDs as strings to find the correct partner
    const partner = currentChat.participants.find(
      p => getStringId(p._id) !== safeCurrentUserId
    );

    if (!partner) {
      console.error("Could not find partner in conversation");
      return;
    }

    try {
      // Optimistic Update
      const tempMsg = {
        _id: Date.now().toString(), // Temp ID
        conversationId: currentChat._id,
        sender: safeCurrentUserId, // Ensure this matches logic in UI
        text: text,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMsg]);

      // API Call
      await sendMessage(partner._id, text);
      
      // Refresh Data to get real ID and server timestamp
      await loadMessagesSafe(currentChat._id);
      loadConversations(); 
    } catch (err) {
      console.error("Failed to send", err);
      // Optional: Remove optimistic message on failure
    }
  };

  return {
    conversations,
    currentChat,
    selectConversation,
    messages,
    loading,
    handleSendMessage
  };
};