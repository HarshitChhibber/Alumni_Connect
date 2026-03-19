import { useState, useEffect, useCallback } from 'react';
import { 
  fetchWorkshops, 
  createWorkshop, 
  deleteWorkshop, 
  fetchWorkshopStats,
  // ✅ New Imports
  requestVenue,
  fetchPendingVenueRequests,
  approveVenueRequest
} from '../api/workshopService';

export const useWorkshops = (activeTab) => {
  const [workshops, setWorkshops] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // ✅ State for Admin Approvals
  const [stats, setStats] = useState({ totalRegistrations: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);

  // 1. Load Standard Workshops (Alumni: My Created / Admin: All)
  const loadWorkshops = useCallback(async () => {
    // If we are on the 'requests' tab, don't load standard workshops to save bandwidth
    if (activeTab === 'requests') return; 

    setLoading(true);
    try {
      const data = await fetchWorkshops(activeTab);
      setWorkshops(data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [activeTab]);

  // 2. Load Pending Requests (Admin Only)
  const loadPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingVenueRequests();
      setPendingRequests(data);
    } catch (err) {
      console.error("Failed to load pending requests", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Load Stats
  const loadStats = useCallback(async () => {
    try { 
      const data = await fetchWorkshopStats(); 
      setStats(data); 
    } catch (err) { 
      console.error(err); 
    }
  }, []);

  // --- EFFECTS ---

  // Auto-load based on tab
  useEffect(() => { 
    if (activeTab === 'requests') {
      loadPendingRequests();
    } else {
      loadWorkshops(); 
    }
  }, [loadWorkshops, loadPendingRequests, activeTab]);

  useEffect(() => { loadStats(); }, [loadStats]);

  // --- ACTIONS ---

  // A. Create Online Workshop (Standard)
  const addWorkshop = async (formData) => {
    try {
      await createWorkshop(formData);
      if (activeTab === 'upcoming' || activeTab === 'all') loadWorkshops(); 
      loadStats();
      return { success: true };
    } catch (err) { 
      return { success: false, message: err.response?.data?.message || "Failed" }; 
    }
  };

  // B. Submit Venue Request (Alumni - Offline) ✅ NEW
  const submitVenueRequest = async (data) => {
    try {
      await requestVenue(data);
      // We don't reload workshops immediately because it goes to 'Pending' state
      // allowing the UI to show a success message or redirect
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Request Failed" };
    }
  };

  // C. Approve Venue (Admin) ✅ NEW
  const approveVenue = async (data) => {
    try {
      await approveVenueRequest(data);
      // Remove the approved item from the local pending list immediately
      setPendingRequests(prev => prev.filter(req => req._id !== data.workshopId));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Approval Failed" };
    }
  };

  // D. Delete/Reject Workshop
  const removeWorkshop = async (id) => {
    try {
      await deleteWorkshop(id);
      setWorkshops(prev => prev.filter(w => w.id !== id));
      // Also check pending requests in case we are rejecting a request
      setPendingRequests(prev => prev.filter(req => req._id !== id));
      loadStats();
      return { success: true };
    } catch (err) { 
      return { success: false, message: err.message }; 
    }
  };

  return { 
    workshops, 
    pendingRequests, // ✅ Exposed for Admin UI
    stats, 
    loading, 
    addWorkshop, 
    submitVenueRequest, // ✅ Exposed for Alumni Form
    approveVenue,       // ✅ Exposed for Admin Modal
    removeWorkshop,
    refreshPending: loadPendingRequests // Helper to manually refresh requests
  };
};