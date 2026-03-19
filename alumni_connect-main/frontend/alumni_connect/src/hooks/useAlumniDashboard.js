import { useState, useEffect, useCallback, useMemo } from 'react';

// Import services directly to aggregate data
import { fetchWorkshops, fetchWorkshopStats } from '../api/workshopService';
import { fetchMentorshipRequests, updateRequestStatus } from '../api/requestService';
// Assuming you have this or will stub it
import { fetchRecommendedStudents } from '../api/alumniService'; 

export const useAlumniDashboard = () => {
  // --- State ---
  const [dashboardData, setDashboardData] = useState({
    workshops: [],
    workshopStats: { totalRegistrations: 0, totalRevenue: 0 },
    requests: [],
    recommendations: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Load All Data (Aggregated) ---
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all required data in parallel
      const [
        allWorkshops, 
        wStats, 
        requestsData, 
        recsData
      ] = await Promise.all([
        fetchWorkshops('all'), // Ensure your API supports 'all'
        fetchWorkshopStats(),
        fetchMentorshipRequests(),
        fetchRecommendedStudents().catch(() => []) // Fallback
      ]);

      setDashboardData({
        workshops: allWorkshops || [],
        workshopStats: wStats || { totalRegistrations: 0, totalRevenue: 0 },
        requests: requestsData || [],
        recommendations: recsData || []
      });

    } catch (err) {
      console.error("Dashboard Load Error", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // --- 2. Data Transformation (Logic Layer) ---

  // A. Calculate Top-Level Stats
  const stats = useMemo(() => {
    const { workshopStats, workshops, requests } = dashboardData;
    
    // Logic: Interactions = Total Requests (Chats) + Workshop Attendees
    const interactions = requests.length + (workshopStats.totalRegistrations || 0);
    
    // Logic: Students Helped = Workshop Attendees + Accepted Mentorships
    const acceptedRequests = requests.filter(r => r.status === 'Accepted').length;
    const studentsHelped = (workshopStats.totalRegistrations || 0) + acceptedRequests;

    return {
      totalWorkshops: workshops.length,
      totalEarnings: workshopStats.totalRevenue || 0,
      studentsHelped: studentsHelped,
      interactions: interactions,
      profileCompletion: 85 // You can fetch this from a profile API if needed
    };
  }, [dashboardData]);

  // B. Generate Performance Chart Data (Group by Month)
  const performanceData = useMemo(() => {
    const { workshops } = dashboardData;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartMap = new Map();

    // Initialize map
    months.forEach(m => chartMap.set(m, { month: m, attendees: 0, earnings: 0, sortIndex: months.indexOf(m) }));

    workshops.forEach(ws => {
      const date = new Date(ws.date);
      if (!isNaN(date)) {
        const monthKey = months[date.getMonth()];
        if (chartMap.has(monthKey)) {
            const entry = chartMap.get(monthKey);
            const count = ws.registeredCount || 0;
            const price = ws.price || 0;
            entry.attendees += count;
            entry.earnings += (count * price);
        }
      }
    });

    // Return array sorted by month index, filter empty months if desired
    return Array.from(chartMap.values())
        .filter(d => d.attendees > 0 || d.earnings > 0)
        .sort((a, b) => a.sortIndex - b.sortIndex);
  }, [dashboardData]);

  // C. Filter Upcoming Workshops
  const upcomingWorkshops = useMemo(() => {
    const now = new Date();
    return dashboardData.workshops
      .filter(ws => new Date(ws.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3) 
      .map(ws => ({
        id: ws.id,
        title: ws.title,
        date: new Date(ws.date).toLocaleDateString(),
        time: ws.time || "10:00 AM",
        registered: ws.registeredCount || 0
      }));
  }, [dashboardData.workshops]);

  // D. Format Requests for UI
  const studentRequests = useMemo(() => {
    return dashboardData.requests
      .filter(r => r.status === 'Pending')
      .map(req => ({
        id: req.id,
        name: req.studentName || "Student", 
        year: req.studentYear || "N/A",
        type: req.type || "Mentorship",
        posted: "Recently", 
        msg: req.message || "Requesting guidance..."
      }));
  }, [dashboardData.requests]);

  // --- 3. Actions ---
  const handleRequestAction = async (id, status) => {
    const prevRequests = [...dashboardData.requests];
    
    // Optimistic Update
    setDashboardData(prev => ({
      ...prev,
      requests: prev.requests.filter(r => r.id !== id)
    }));

    try {
      await updateRequestStatus(id, status);
      return { success: true };
    } catch (err) {
      console.error("Action Error", err);
      // Revert on error
      setDashboardData(prev => ({ ...prev, requests: prevRequests }));
      return { success: false, message: "Action failed" };
    }
  };

  return {
    stats,
    performanceData,
    upcomingWorkshops,
    studentRequests,
    matchingStudents: dashboardData.recommendations,
    loading,
    error,
    handleRequestAction,
    refresh: loadDashboard
  };
};