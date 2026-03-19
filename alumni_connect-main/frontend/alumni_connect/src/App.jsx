import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// --- Page Imports ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
// import AlumniProfile from './pages/student/AlumniProfile'; // Commented out as per your previous logic

// Admin Pages
import UniversityAdminDashboard from './pages/admin/UniversityAdminDashboard';
import AdminDashboard from './pages/admin/DashBoard';

// Alumni Pages
import AlumniLayout from './pages/alumni/Layout';
import AlumniDashboard from './pages/alumni/AlumniDashBoard';
import WorkshopManager from './pages/alumni/WorkshopManager';
import WorkshopCreator from './pages/alumni/WorkshopCreator';
import StudentExplorer from './pages/alumni/StudentExplorer';
import StudentRequests from './pages/alumni/studentRequests';
import AlumniSettings from './pages/alumni/AlumniSettings';
import UserProfile from './pages/alumni/UserProfile';

import StudentProfile from './pages/student/StudentProfile'; 

import ChatSection from './pages/ChatSection';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// --- Notification Components ---
import OnlineAlumniNotificationPopup from './components/OnlineAlumniNotificationPopup';
import AlumniConnectionRequestsPopup from './components/AlumniConnectionRequestsPopup';


// --- 1. Landing Page Wrapper ---
const LandingWrapper = () => {
  const navigate = useNavigate();
  const handleNavigateToAuth = (role, mode) => {
    navigate('/auth', { state: { role, mode } });
  };
  return <LandingPage onNavigate={handleNavigateToAuth} />;
};

// --- 2. Login Page Wrapper ---
const LoginWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, mode } = location.state || { role: 'student', mode: 'login' };

  const handleLoginSuccess = (userRole) => {
    if (userRole === 'alumni') navigate('/alumni'); 
    else if (userRole === 'admin') navigate('/university');
    else navigate('/student-dashboard');
  };

  return (
    <LoginPage 
      initialRole={role} 
      initialMode={mode} 
      onBack={() => navigate('/')}
      onLoginSuccess={handleLoginSuccess} 
    />
  );
};

// --- Main App Component ---
export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <AuthProvider>
        <SocketProvider>
          {/* Online Alumni Notifications for Students */}
          <OnlineAlumniNotificationPopup />
          
          {/* Connection Requests for Alumni */}
          <AlumniConnectionRequestsPopup />
          
          <Routes>
          
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingWrapper />} />
          <Route path="/auth" element={<LoginWrapper />} />

          {/* --- Student Routes (Standalone) --- */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          
          {/* --- Admin Routes (Standalone) --- */}
          <Route path="/university" element={<UniversityAdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard/>} />
          
          {/* --- ALUMNI ROUTES (Protected & Nested in Sidebar) --- */}
          <Route path="/alumni" element={<AlumniLayout/>}>
            
            {/* Default: /alumni -> Dashboard */}
            <Route index element={<AlumniDashboard />} />
            
            {/* Students & Profiles */}
            <Route path="students" element={<StudentExplorer />} />
            {/* ⚠️ This route handles /alumni/student-profile/:id */}
            <Route path="student-profile/:id" element={<StudentProfile />} />
            
            {/* Requests & Workshops */}
            <Route path="requests" element={<StudentRequests />} />
            <Route path="workshops" element={<WorkshopManager />} />
            <Route path="create-workshop" element={<WorkshopCreator />} />
            
            {/* Chats & Settings */}
            <Route path="chats" element={<ChatSection/>} />
            <Route path="settings" element={<AlumniSettings />} />
            
          </Route>

          {/* --- General User Profile Route --- */}
          <Route path="/profile/:id" element={<UserProfile/>} />
          
          {/* Catch-all for 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}