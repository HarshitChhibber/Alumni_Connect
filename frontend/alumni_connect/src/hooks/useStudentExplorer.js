import { useState, useEffect, useCallback } from 'react';
import { fetchStudents, sendMessageToStudent } from '../api/studentService';


export const useStudentExplorer = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, topTalent: 0, avgReadiness: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: 'All',
    branch: 'All Branches',
    minReadiness: 0
  });

  // 1. Fetch Logic
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudents({ ...filters, search: searchTerm });
      setStudents(data.students);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  // 2. Effect to trigger fetch
  // Debounce search if typing rapidly (optional implementation detail)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents();
    }, 300); // 300ms delay for search debounce
    return () => clearTimeout(timeoutId);
  }, [loadStudents]);

  // 3. Connect/Message Action
  const handleConnect = async (studentId, message) => {
    try {
      await sendMessageToStudent(studentId, message);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Failed to send message",err };
    }
  };

  return {
    students,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    handleConnect,
    refresh: loadStudents
  };
};