import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from '../hooks/useAuth';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [onlineAlumniNotifications, setOnlineAlumniNotifications] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]); // For alumni receiving requests
  const socketRef = useRef(null);

  // Fetch alumni details from API - wrapped in useCallback to avoid closure issues
  const fetchAlumniDetails = useCallback(async (alumniId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/profile/${alumniId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched alumni details:', data);
        // Profile API returns user object directly
        return data.user || data;
      } else {
        console.error('Failed to fetch alumni details, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching alumni details:', error);
    }
    return null;
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      console.log('⏭️ SocketContext: No token or user, skipping connection');
      return;
    }

    console.log('🔗 SocketContext: Connecting WebSocket for user:', user._id, 'Role:', user.role, 'University:', user.university);

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8080', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket Connected! Socket ID:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket Disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 WebSocket Connection Error:', error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Only students receive alumni online notifications
    if (user.role === 'student') {
      // Listen for alumni online notifications
      newSocket.on('alumni-online', (data) => {
        console.log('Alumni online notification:', data);
        // Fetch alumni details and add to notifications
        fetchAlumniDetails(data.alumniId).then(alumni => {
          if (alumni) {
            setOnlineAlumniNotifications(prev => {
              // Avoid duplicates
              const exists = prev.find(n => n._id === alumni._id);
              if (exists) return prev;
              return [...prev, { ...alumni, timestamp: new Date() }];
            });
          }
        });
      });

      // Listen for alumni offline notifications
      newSocket.on('alumni-offline', (data) => {
        console.log('Alumni offline notification:', data);
        // Remove from notifications if present
        setOnlineAlumniNotifications(prev => 
          prev.filter(n => n._id !== data.alumniId)
        );
      });

      // Listen for connection request acceptance
      newSocket.on('connection-accepted', (data) => {
        console.log('Connection accepted:', data);
        // Trigger navigation to chat or show success message
        window.dispatchEvent(new CustomEvent('connection-accepted', { detail: data }));
      });

      // Listen for request send confirmation
      newSocket.on('request-sent', (data) => {
        console.log('Request sent:', data);
        window.dispatchEvent(new CustomEvent('request-sent', { detail: data }));
      });

      // Listen for request errors
      newSocket.on('request-error', (data) => {
        console.error('Request error:', data);
        window.dispatchEvent(new CustomEvent('request-error', { detail: data }));
      });
    }

    // Only alumni receive student connection requests
    if (user.role === 'alumni') {
      // Listen for student connection requests
      newSocket.on('student-connection-request', (data) => {
        console.log('Student connection request:', data);
        setConnectionRequests(prev => {
          // Avoid duplicates
          const exists = prev.find(r => r.studentId === data.studentId);
          if (exists) return prev;
          return [...prev, data];
        });
        // Also trigger event for notifications
        window.dispatchEvent(new CustomEvent('student-connection-request', { detail: data }));
      });

      // Listen for acceptance confirmation
      newSocket.on('accept-success', (data) => {
        console.log('Request accepted successfully:', data);
        window.dispatchEvent(new CustomEvent('accept-success', { detail: data }));
      });

      // Listen for accept errors
      newSocket.on('accept-error', (data) => {
        console.error('Accept error:', data);
        window.dispatchEvent(new CustomEvent('accept-error', { detail: data }));
      });
    }

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Keep connection alive
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(pingInterval);
      newSocket.close();
      setSocket(null);
    };
  }, [token, user, fetchAlumniDetails]);

  // Send connection request via WebSocket
  const sendConnectionRequest = (alumniId, message) => {
    if (socket && socket.connected) {
      socket.emit('send-connection-request', { alumniId, message });
    }
  };

  // Accept connection request via WebSocket
  const acceptConnectionRequest = (studentId) => {
    if (socket && socket.connected) {
      socket.emit('accept-connection-request', { studentId });
    }
  };

  // Remove notification
  const removeNotification = (alumniId) => {
    setOnlineAlumniNotifications(prev => 
      prev.filter(n => n._id !== alumniId)
    );
  };

  // Remove connection request (for alumni)
  const removeConnectionRequest = (studentId) => {
    setConnectionRequests(prev =>
      prev.filter(r => r.studentId !== studentId)
    );
  };

  const value = {
    socket,
    onlineAlumniNotifications,
    connectionRequests,
    removeNotification,
    removeConnectionRequest,
    sendConnectionRequest,
    acceptConnectionRequest
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

