import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuthContext } from '../hooks/useAuth';
import { acceptConnectionRequestViaNotification } from '../api/connectionService';
import './AlumniConnectionRequestsPopup.css';

const AlumniConnectionRequestsPopup = () => {
  const { connectionRequests, removeConnectionRequest } = useSocket();
  const { token } = useAuthContext();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(connectionRequests);
  }, [connectionRequests]);

  useEffect(() => {
    // Listen for accept success
    const handleAcceptSuccess = (event) => {
      const { detail } = event;
      if (detail.success) {
        alert('Connection accepted! You can now chat with this student.');
        setSelectedRequest(null);
        if (selectedRequest) {
          removeConnectionRequest(selectedRequest.studentId);
        }
      }
    };

    const handleAcceptError = (event) => {
      const { detail } = event;
      alert(`Error: ${detail.error}`);
    };

    window.addEventListener('accept-success', handleAcceptSuccess);
    window.addEventListener('accept-error', handleAcceptError);

    return () => {
      window.removeEventListener('accept-success', handleAcceptSuccess);
      window.removeEventListener('accept-error', handleAcceptError);
    };
  }, [selectedRequest, removeConnectionRequest]);

  const handleAccept = async (request) => {
    setSelectedRequest(request);
    setLoading(true);

    try {
      // Try WebSocket first, fallback to REST API
      const { acceptConnectionRequest } = await import('../context/SocketContext');
      
      // Try REST API directly
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/accept-connection-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ studentId: request.studentId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Connected! You can now chat with ${request.studentName}`);
        removeConnectionRequest(request.studentId);
        setSelectedRequest(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (studentId) => {
    removeConnectionRequest(studentId);
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="alumni-requests-container">
      {/* Request Notifications */}
      <div className="requests-list">
        {requests.map((request) => (
          <div key={request.studentId} className="request-item">
            <div className="request-content">
              <img 
                src={request.studentProfilePicture || '/default-avatar.png'} 
                alt={request.studentName}
                className="request-avatar"
              />
              <div className="request-info">
                <h4>{request.studentName}</h4>
                <p className="request-message">{request.message}</p>
              </div>
              <button 
                className="btn-accept"
                onClick={() => handleAccept(request)}
                disabled={loading}
              >
                {loading ? 'Accepting...' : 'Accept'}
              </button>
              <button 
                className="btn-dismiss"
                onClick={() => handleDismiss(request.studentId)}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniConnectionRequestsPopup;
