import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Send, Search, MoreVertical, Phone, Video, 
  MessageSquare, Loader2, ArrowLeft
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { AuthContext } from '../context/AuthContext'; 

const ChatSection = () => { 
  const { user } = useContext(AuthContext);

  const { 
    conversations, 
    currentChat, 
    selectConversation, 
    // setCurrentChat, // Note: This might need to be exposed from useChat if you want "Back" button to work manually, otherwise use selectConversation(null)
    messages, 
    loading,
    handleSendMessage 
  } = useChat(user?._id); 

  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // --- Helper to safely extract string ID ---
 // --- Helper to safely extract string ID ---
  const getSafeId = (participant) => {
    if (!participant) return null;
    
    // Handle object types (populated fields)
    if (typeof participant === 'object') {
      // Check for _id first (Mongoose default), then id (virtuals/SQL), then fall back
      return String(participant._id || participant.id || participant);
    }
    
    // Handle primitive strings
    return String(participant);
  };

  const currentUserId = getSafeId(user);

  // Scroll to bottom effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentChat]);

  // Helper to get partner details
  const getPartner = (conversation) => {
    if (!conversation || !conversation.participants) return { name: "Unknown" };
    return conversation.participants.find(p => getSafeId(p) !== currentUserId) || { name: "Unknown" };
  };

  if (!user) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
      </div>
    );
  }

  const onSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    handleSendMessage(newMessage);
    setNewMessage("");
  };

  // Manual back handler for mobile
  // const handleBack = () => {
  //   // We need a way to clear current chat. 
  //   // If your useChat doesn't export setCurrentChat, you can just reload or add it to the hook.
  //   // Assuming you modify useChat to export setCurrentChat, or simply re-select:
  //   window.location.reload(); // Temporary fix if setCurrentChat isn't exported, otherwise: setCurrentChat(null)
  // };

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 flex font-sans overflow-hidden border-t border-gray-200">
      
      {/* Sidebar */}
      <div className={`w-full md:w-1/3 min-w-[300px] bg-white border-r border-gray-200 flex flex-col ${currentChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-neutral-100 focus:border-neutral-300 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.map((conv) => {
            const partner = getPartner(conv);
            const isSelected = currentChat?._id === conv._id;

            return (
              <div 
                key={conv._id}
                onClick={() => selectConversation(conv)} 
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${isSelected ? 'bg-neutral-50/50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold overflow-hidden shrink-0">
                  {partner.avatar ? (
                    <img src={partner.avatar} alt="" className="w-full h-full object-cover"/> 
                  ) : (
                    partner.name?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-neutral-900' : 'text-slate-800'}`}>
                      {partner.name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {conv.updatedAt && new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${isSelected ? 'text-neutral-600 font-medium' : 'text-gray-500'}`}>
                    {getSafeId(conv.lastMessage?.sender) === currentUserId ? 'You: ' : ''}
                    {conv.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })}
          
          {conversations.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No conversations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!currentChat ? 'hidden md:flex' : 'flex'}`}>
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => selectConversation(null)} // Make sure selectConversation(null) handles clearing chat
                  className="md:hidden p-1 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold">
                  {getPartner(currentChat).name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">
                    {getPartner(currentChat).name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs text-slate-500">Active now</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 md:gap-4 text-gray-400">
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><Phone className="w-4 h-4 md:w-5 md:h-5" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><Video className="w-4 h-4 md:w-5 md:h-5" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><MoreVertical className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
            </div>

            {/* Messages Area - Attach ref to the container, not a div inside */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
            >
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                    No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg, index) => {
                  const msgSenderId = getSafeId(msg.sender);
                  const isMe = msgSenderId === currentUserId;
                  
                  return (
                    <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm shadow-sm relative group ${
                          isMe 
                            ? 'bg-neutral-600 text-white rounded-br-sm' 
                            : 'bg-white text-slate-700 border border-gray-100 rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                        <div className={`text-[9px] mt-1 text-right opacity-70 ${isMe ? 'text-neutral-100' : 'text-gray-400'}`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={onSend} className="p-3 md:p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-neutral-100 focus-within:border-neutral-300 transition-all">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-gray-400"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-2 bg-neutral-600 text-white rounded-xl hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <MessageSquare className="w-10 h-10 text-neutral-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Your Messages</h3>
            <p className="text-sm text-slate-500 mt-2">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;