// components/DynamicAuth.jsx
import React, { useState, useEffect } from 'react';
import { 
  Loader2, AlertCircle, ArrowRight, 
  Mail, Lock, Briefcase, GraduationCap, 
  Building2, KeyRound, IdCard, Info 
} from 'lucide-react';
import { api } from '../pages/services/MockApi';

export const DynamicAuth = ({ role = 'student', initialMode = 'login', onSuccess }) => {
  // View state: 'check' (verify ID/Email) | 'password' (login)
  const [view, setView] = useState(initialMode === 'login' ? 'password' : 'check');
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);
  const [error, setError] = useState(null);
  
  // Form Fields
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');         
  const [studentId, setStudentId] = useState(''); 
  const [instituteId, setInstituteId] = useState(''); 
  const [accessKey, setAccessKey] = useState('');     

  useEffect(() => {
    setView(initialMode === 'login' ? 'password' : 'check');
    setError(null);
    setInfoMsg(null);
  }, [role, initialMode]);

  // --- HANDLER: Check Identity (Signup Flow) ---
  const handleIdentityCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMsg(null);

    // 1. Get the identifier based on role
    let identifier = '';
    if (role === 'student') identifier = studentId;
    else if (role === 'alumni') identifier = email;
    else if (role === 'institute') identifier = instituteId;

    try {
      // 2. Check if user already exists
      const exists = await api.checkUserExists(identifier);
      
      if (exists) {
        // CASE: User exists -> Switch to Login Mode
        setInfoMsg("Account found! Please enter your password to login.");
        setView('password');
      } else {
        // CASE: New User -> Verify eligibility then proceed to Onboarding
        if (role === 'alumni') await api.verifyDomain(email);
        if (role === 'student') await api.verifyStudentId(studentId);
        if (role === 'institute') await api.verifyInstituteCredentials({ instituteId, accessKey });
        
        // If successful verification and not existing -> Go to Onboarding
        onSuccess({ isNewUser: true }); 
      }
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Final Login (Password) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        // If we are in login mode directly, we might need to validate ID first if not done
        if (initialMode === 'login' && view === 'password') {
             if (role === 'institute') await api.verifyInstituteCredentials({ instituteId, accessKey });
        }

        await api.login();
        // Login Success -> Go to Dashboard (isNewUser: false)
        onSuccess({ isNewUser: false });
    } catch (err) {
        setError("Invalid credentials.",err);
    } finally {
        setLoading(false);
    }
  };

  // UI Helpers
  const getRoleConfig = () => {
    switch(role) {
        case 'alumni': return { icon: <Briefcase className="w-3 h-3"/>, label: "Alumni", color: "bg-purple-50 text-purple-700", placeholder: "name@company.com" };
        case 'institute': return { icon: <Building2 className="w-3 h-3"/>, label: "Institute", color: "bg-neutral-900 text-white", placeholder: "NITD-001" };
        default: return { icon: <GraduationCap className="w-3 h-3"/>, label: "Student", color: "bg-blue-50 text-blue-700", placeholder: "Student ID" };
    }
  };
  const config = getRoleConfig();
  const inputClass = "w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none transition-all";

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${config.color}`}>
           {config.icon} {config.label} Portal
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">
          {view === 'password' ? 'Enter Password' : 'Get Started'}
        </h2>
      </div>

      {/* Alerts */}
      {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {infoMsg && <div className="mb-6 p-3 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center gap-2"><Info className="w-4 h-4" /> {infoMsg}</div>}

      <form onSubmit={view === 'check' ? handleIdentityCheck : handleLogin} className="space-y-4">
        
        {/* --- IDENTITY INPUTS (Always visible or Disabled if verified) --- */}
        <div className="space-y-4">
            {role === 'student' && (
                <div className="relative">
                    <IdCard className="absolute top-3.5 left-4 w-5 h-5 text-neutral-400" />
                    <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Roll Number" className={inputClass} required disabled={view === 'password' && initialMode === 'signup'} />
                </div>
            )}
            {role === 'alumni' && (
                <div className="relative">
                    <Mail className="absolute top-3.5 left-4 w-5 h-5 text-neutral-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work Email" className={inputClass} required disabled={view === 'password' && initialMode === 'signup'} />
                </div>
            )}
            {role === 'institute' && (
                <div className="space-y-3">
                     <input type="text" value={instituteId} onChange={(e) => setInstituteId(e.target.value.toUpperCase())} placeholder="Institute ID" className={`${inputClass} uppercase font-mono`} required disabled={view === 'password' && initialMode === 'signup'} />
                     <input type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Master Key" className={`${inputClass} font-mono`} required disabled={view === 'password' && initialMode === 'signup'} />
                </div>
            )}
        </div>

        {/* --- PASSWORD INPUT (Only in Password View) --- */}
        {view === 'password' && (
            <div className="relative animate-in slide-in-from-bottom-2">
                <Lock className="absolute top-3.5 left-4 w-5 h-5 text-neutral-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`${inputClass} pl-12`} required autoFocus />
            </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-neutral-900/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {view === 'check' ? 'Continue' : 'Login'} 
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};