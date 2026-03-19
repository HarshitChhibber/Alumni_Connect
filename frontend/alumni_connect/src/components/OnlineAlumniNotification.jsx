import React, { useState } from 'react';
import { Bell, X, User, Building2, MapPin, GraduationCap, Send, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { sendConnectionRequest } from '../api/connectionService';

const AlumniDetailsModal = ({ alumni, onClose, onConnect }) => {
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const handleConnect = async () => {
    if (!messageText.trim()) {
      alert("Please write a connection message");
      return;
    }
    
    setSending(true);
    try {
      const targetId = alumni.alumniId || alumni._id;
      await sendConnectionRequest(targetId, messageText);
      alert(`Connection request sent to ${alumni.name}!`);
      onConnect();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send request.";
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const initials = alumni.name 
    ? alumni.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AL';

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-neutral-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-neutral-900">Connect with {alumni.name}</h3>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Alumni Info Card */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
              {alumni.profilePicture ? (
                <img src={alumni.profilePicture} alt="Avatar" className="w-full h-full object-cover"/>
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-neutral-900 text-lg mb-1">{alumni.name}</h4>
              {alumni.currentCompany && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-1">
                  <Building2 size={14} />
                  <span>{alumni.currentCompany}</span>
                </div>
              )}
              {alumni.location && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-1">
                  <MapPin size={14} />
                  <span>{alumni.location}</span>
                </div>
              )}
              {alumni.batch && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <GraduationCap size={14} />
                  <span>Class of {alumni.batch}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Skills */}
          {alumni.skills && alumni.skills.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <div className="flex flex-wrap gap-2">
                {alumni.skills.slice(0, 5).map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Connection Message */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Connection Message
          </label>
          <textarea 
            className="w-full h-32 p-3 border border-neutral-300 rounded-xl text-sm outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 resize-none bg-white placeholder-neutral-400"
            placeholder={`Hi ${alumni.name?.split(' ')[0] || 'there'}, I'd love to connect and learn from your experience...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-neutral-300 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleConnect} 
            disabled={sending}
            className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-900 transition flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const OnlineAlumniNotification = ({ show, onToggle }) => {
  const { onlineAlumniNotifications, removeNotification } = useSocket();
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use external control if provided, otherwise use internal state
  const displayExpanded = show !== undefined ? show : isExpanded;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Log for debugging
  React.useEffect(() => {
    console.log('🔔 OnlineAlumniNotification component - notifications:', onlineAlumniNotifications);
  }, [onlineAlumniNotifications]);

  // Always show the bell button, even if no notifications (for UI consistency)
  // Only show the dropdown and badge if there are notifications
  return (
    <>
      {/* Notification Bell */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleToggle}
          className="relative bg-white rounded-full p-4 shadow-lg border border-neutral-200 hover:shadow-xl transition-all group"
          title={onlineAlumniNotifications.length > 0 ? `${onlineAlumniNotifications.length} online alumni` : 'No online alumni'}
        >
          <Bell className="w-6 h-6 text-neutral-700 group-hover:text-neutral-900" />
          {onlineAlumniNotifications.length > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {onlineAlumniNotifications.length}
            </span>
          )}
        </button>

        {/* Notification Dropdown - Only show if there are notifications and expanded */}
        {displayExpanded && onlineAlumniNotifications.length > 0 && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">Online Alumni</h3>
                <button
                  onClick={handleToggle}
                  className="text-neutral-400 hover:text-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {onlineAlumniNotifications.length} alumni online
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {onlineAlumniNotifications.map((notification, idx) => (
                <div
                  key={notification.alumniId || idx}
                  className="p-4 border-b border-neutral-100 hover:bg-neutral-50 transition cursor-pointer group"
                  onClick={() => {
                    setSelectedAlumni(notification);
                    handleToggle();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-sm overflow-hidden shrink-0 relative">
                      {notification.profilePicture ? (
                        <img 
                          src={notification.profilePicture} 
                          alt={notification.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        notification.name?.charAt(0) || 'A'
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-900 text-sm mb-1 group-hover:text-neutral-600">
                        {notification.name}
                      </h4>
                      {notification.currentCompany && (
                        <p className="text-xs text-neutral-500 truncate">
                          {notification.currentCompany}
                        </p>
                      )}
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        Online now
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.alumniId);
                      }}
                      className="text-neutral-400 hover:text-neutral-800 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Show when dropdown is open but no notifications */}
        {displayExpanded && onlineAlumniNotifications.length === 0 && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden p-8">
            <div className="text-center">
              <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-900 mb-1">No Online Alumni</h3>
              <p className="text-xs text-neutral-500">Alumni from your university will appear here when they come online.</p>
            </div>
          </div>
        )}
      </div>

      {/* Alumni Details Modal */}
      {selectedAlumni && (
        <AlumniDetailsModal
          alumni={selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
          onConnect={() => removeNotification(selectedAlumni.alumniId)}
        />
      )}
    </>
  );
};

export default OnlineAlumniNotification;

