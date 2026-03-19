import { useState, useEffect, useCallback } from 'react';
import { fetchStudentDashboard, trackUserActivity } from '../api/studentDashBoardService';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: { readiness: 0, mentorships: 0, xp: 0, streak: 0 },
    skillData: [],
    activityData: [],
    upcomingWorkshops: [],
    recommendedMentors: []
  });

  // 1. Function to load data
  const loadData = useCallback(async () => {
    try {
      const data = await fetchStudentDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard load failed", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Initial Fetch
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 3. Heartbeat (Activity Tracker)
  useEffect(() => {
    // Ping server every 60 seconds to log 1 minute of activity
    const intervalId = setInterval(async () => {
      try {
        await trackUserActivity();
        // Optional: silently refresh graph data after tracking?
        // loadData(); 
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return { loading, error, dashboardData, refreshDashboard: loadData };
};