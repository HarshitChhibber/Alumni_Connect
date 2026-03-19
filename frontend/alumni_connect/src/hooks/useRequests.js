import { useState, useEffect, useCallback } from 'react';
import { 
  fetchMentorshipRequests, 
  updateRequestStatus 
} from '../api/requestService';

export const useRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load Requests
  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMentorshipRequests();
      setRequests(data);
    } catch (err) {
      console.error("Load Requests Error", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // 2. Handle Action (Accept/Reject)
  const handleRequestAction = async (id, action) => {
    // Optimistic Update: Remove from UI immediately for better UX
    const previousRequests = [...requests];
    setRequests(prev => prev.filter(r => r.id !== id));

    try {
      // action should be 'Accepted' or 'Rejected' matches backend enum
      await updateRequestStatus(id, action);
      return { success: true };
    } catch (err) {
      console.error("Action Error", err);
      // Revert if API fails
      setRequests(previousRequests);
      return { success: false, message: "Failed to update status" };
    }
  };

  return { 
    requests, 
    loading, 
    error, 
    handleRequestAction, 
    refresh: loadRequests 
  };
};