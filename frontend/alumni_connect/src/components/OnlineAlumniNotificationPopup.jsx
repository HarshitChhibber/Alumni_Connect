import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuthContext } from '../hooks/useAuth';
import './OnlineAlumniNotificationPopup.css';

const OnlineAlumniNotificationPopup = () => {
  const { onlineAlumniNotifications, removeNotification, sendConnectionRequest } = useSocket();
  const { token, user } = useAuthContext();
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationList, setShowNotificationList] = useState(false);

  useEffect(() => {
    console.log('Notifications updated:', onlineAlumniNotifications);
    setNotifications(onlineAlumniNotifications);
  }, [onlineAlumniNotifications]);

  useEffect(() => {
    console.log('User role:', user?.role);
    console.log('Socket notifications:', onlineAlumniNotifications);
  }, [user, onlineAlumniNotifications]);

  useEffect(() => {
    // Listen for connection events
    const handleRequestSent = (event) => {
      const { detail } = event;
      if (detail.success) {
        setMessage('');
        setSelectedAlumni(null);
        // Optionally remove notification
        removeNotification(selectedAlumni._id);
      }
    };

    const handleRequestError = (event) => {
      const { detail } = event;
      alert(`Error: ${detail.error}`);
    };

    window.addEventListener('request-sent', handleRequestSent);
    window.addEventListener('request-error', handleRequestError);

    return () => {
      window.removeEventListener('request-sent', handleRequestSent);
      window.removeEventListener('request-error', handleRequestError);
    };
  }, [selectedAlumni, removeNotification]);

  const handleConnectClick = async (alumni) => {
    setSelectedAlumni(alumni);
    setMessage('');
    setShowNotificationList(false);
  };

  const handleSendRequest = async () => {
    if (!selectedAlumni) return;

    setLoading(true);
    try {
      // Use WebSocket if available, otherwise fall back to REST API
      if (sendConnectionRequest) {
        sendConnectionRequest(selectedAlumni._id, message || `Hi! I'd like to connect with you`);
      } else {
        // Fallback to REST API
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/send-connection-request`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              alumniId: selectedAlumni._id,
              message: message || `Hi! I'd like to connect with you`
            })
          }
        );

        if (response.ok) {
          alert('Connection request sent successfully!');
          setMessage('');
          setSelectedAlumni(null);
          removeNotification(selectedAlumni._id);
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (alumni) => {
    removeNotification(alumni._id);
  };

  // Only show for students
  if (user?.role !== 'student' || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {/* Notification Bell Icon */}
      <div className="notification-bell-wrapper">
        <button 
          className="notification-bell"
          onClick={() => setShowNotificationList(!showNotificationList)}
          title="Online Alumni Notifications"
        >
          🔔
          {notifications.length > 0 && (
            <span className="notification-badge-count">{notifications.length}</span>
          )}
        </button>
      </div>

      {/* Notification List Dropdown */}
      {showNotificationList && (
        <div className="notification-list-dropdown">
          <div className="notification-list-header">
            <h3>Online Alumni ({notifications.length})</h3>
            <button 
              className="close-dropdown"
              onClick={() => setShowNotificationList(false)}
            >
              ✕
            </button>
          </div>

          <div className="notification-list">
            {notifications.map((alumni) => (
              <div 
                key={alumni._id} 
                className="notification-item"
                onClick={() => handleConnectClick(alumni)}
              >
                <div className="item-content">
                  <img 
                    src={alumni.profilePicture || '/default-avatar.png'} 
                    alt={alumni.name}
                    className="item-avatar"
                  />
                  <div className="item-info">
                    <h4>{alumni.name}</h4>
                    <p>{alumni.currentCompany || 'Alumni'}</p>
                  </div>
                  <div className="online-dot"></div>
                </div>
                <button 
                  className="item-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(alumni);
                  }}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alumni Profile Card (Modern Design) */}
      {selectedAlumni && (
        <div className="profile-card-overlay" onClick={() => setSelectedAlumni(null)}>
          <div className="profile-card" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              className="card-close-btn"
              onClick={() => setSelectedAlumni(null)}
            >
              ✕
            </button>

            {/* Online Status Indicator */}
            <div className="online-indicator"></div>

            {/* Profile Picture */}
            <div className="card-avatar-section">
              <img 
                src={selectedAlumni.profilePicture || '/default-avatar.png'} 
                alt={selectedAlumni.name}
                className="card-avatar"
              />
            </div>

            {/* Alumni Info */}
            <div className="card-info">
              <h2 className="alumni-name">{selectedAlumni.name}</h2>
              <p className="alumni-role">
                <span className="badge-alumni">alumni</span>
              </p>
              
              {selectedAlumni.currentCompany && (
                <div className="info-item">
                  <span className="info-icon">🏢</span>
                  <span className="info-text">{selectedAlumni.currentCompany}</span>
                </div>
              )}

              {selectedAlumni.location && (
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span className="info-text">{selectedAlumni.location}</span>
                </div>
              )}

              {selectedAlumni.batch && (
                <div className="info-item">
                  <span className="info-icon">📚</span>
                  <span className="info-text">{selectedAlumni.batch}</span>
                </div>
              )}

              {/* Skills */}
              {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                <div className="skills-section">
                  <div className="skills-tags">
                    {selectedAlumni.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="skill-badge">{skill}</span>
                    ))}
                    {selectedAlumni.skills.length > 4 && (
                      <span className="skill-badge more">+{selectedAlumni.skills.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="card-actions">
              <button 
                className="btn-view-profile"
                onClick={() => {
                  // Navigate to alumni profile
                  window.location.href = `/profile/${selectedAlumni._id}`;
                }}
              >
                View Profile
              </button>
              
              <button 
                className="btn-connect-primary"
                onClick={handleSendRequest}
                disabled={loading}
              >
                {loading ? '...' : '✈️ Connect'}
              </button>
            </div>

            {/* Optional Message Input */}
            {selectedAlumni && (
              <div className="message-input-wrapper">
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message (optional)..."
                  className="card-message-input"
                  maxLength="200"
                />
                <div className="message-char-count">{message.length}/200</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineAlumniNotificationPopup;
