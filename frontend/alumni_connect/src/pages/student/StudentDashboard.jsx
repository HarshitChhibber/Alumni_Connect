import React, { useState, useEffect } from 'react';
import { 
  Bell, Menu, Search, PlayCircle, MapPin, 
  Zap, ArrowRight
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid 
} from 'recharts';

// --- IMPORTS ---
import { useDashboard } from '../../hooks/useDashboard';  
import { useFetchProfile } from '../../hooks/useProfile'; 
import Sidebar from './Sidebar';
import AlumniExplorer from './alumni_explorer'; 
import StudentJourney from './StudentJourney';   
import WorkshopsModule from './Workshops';       
import ChatSection from '../ChatSection';
import StudentRequests from '../alumni/studentRequests';
import OnlineAlumniNotification from '../../components/OnlineAlumniNotification';

// --- HELPER COMPONENTS ---

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-xs">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: <span className="font-mono">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- DASHBOARD HOME COMPONENT ---
const DashboardHome = ({ setActiveTab, onViewProfile, userProfile, showNotifications, setShowNotifications }) => {
  // 1. Hook into dynamic dashboard data
  const { loading, error, dashboardData } = useDashboard();
  
  // FIX: Safe destructuring with default values to prevent crashes
  const { 
    skillData = [], 
    activityData = [], 
    upcomingWorkshops = [], 
    recommendedMentors = [] 
  } = dashboardData || {};

  // 2. Dynamic User Data Logic
  const displayName = userProfile?.name || 'Student';
  const firstName = displayName.split(' ')[0];
  const avatarUrl = userProfile?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  // 3. Loading State
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-sm font-medium animate-pulse">Syncing your progress...</p>
      </div>
    );
  }

  // 4. Error State
  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl m-4">
        <p className="font-bold">Failed to load dashboard.</p>
        <p className="text-sm">Please check your internet connection or try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-12 space-y-8 pt-6 animate-in fade-in duration-500">
      
      {/* Header & Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName}!
          </h2>
          <p className="text-slate-500 text-sm">Track your progress and upcoming events.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 relative transition-colors"
            title="Online Alumni Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div 
            className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-100 transition"
            onClick={() => setActiveTab('My Journey')} 
            title="View Profile"
          >
             <img 
               src={avatarUrl} 
               alt={displayName} 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart: Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-80">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-bold text-slate-900">Skill Analysis</h3>
                <p className="text-xs text-slate-500">Based on your tags</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="student" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                  <Radar name="Market" dataKey="industry" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.2} />
                  <RechartsTooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Area Chart: Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-80">
             <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Learning Activity</h3>
                <p className="text-xs text-slate-500">Minutes active (Last 7 Days)</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-2 py-1 outline-none">
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mins" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMins)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Upcoming Workshops */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
             <PlayCircle className="text-indigo-600 w-5 h-5" /> Your Workshops
           </h3>
           <button onClick={() => setActiveTab('Workshops')} className="text-neutral-500 text-xs font-bold hover:text-neutral-800">View All</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
           {upcomingWorkshops && upcomingWorkshops.length > 0 ? (
             upcomingWorkshops.map((item) => (
               // FIX: Using _id as key
               <div key={item._id} className="min-w-[280px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group snap-start cursor-pointer">
                  <div className="h-32 relative bg-slate-100">
                     <img 
                       src={item.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"} 
                       alt={item.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="text-white w-10 h-10" />
                     </div>
                     <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white">
                        {/* FIX: Valid Date Parsing */}
                        {new Date(item.date).toLocaleDateString()}
                     </div>
                  </div>
                  <div className="p-4">
                     <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1 mb-1">{item.title}</h4>
                     
                     {/* FIX: Using item.host (fallback to conductorName if needed) */}
                     <p className="text-xs text-slate-500 mb-3">Host: {item.host || item.conductorName || "Alumni"}</p>
                     
                     <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="min-w-[300px] p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No upcoming workshops. <span className="text-indigo-600 font-bold cursor-pointer" onClick={() => setActiveTab('Workshops')}>Browse now!</span>
             </div>
           )}
           
           <div className="min-w-[150px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition cursor-pointer snap-start" onClick={() => setActiveTab('Workshops')}>
              <Search size={24} className="mb-2 opacity-50"/>
              <span className="text-xs font-bold">Find More</span>
           </div>
        </div>
      </section>

      {/* Offline Events & Recommendations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {/* Static Offline Events */}
         <section>
           <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-rose-500 w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Offline Events Near You</h3>
           </div>
           <div className="space-y-4">
               {/* Static data preserved */}
               <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-4 hover:border-slate-300 transition group cursor-pointer">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                     <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80" alt="Event" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                  </div>
                  <div className="flex-1 py-1">
                     <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-0.5">Dec 12 • 5:00 PM</div>
                     <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1 group-hover:text-rose-600 transition-colors">Tech Meetup Bangalore</h4>
                     <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <MapPin size={12}/> Indiranagar
                     </div>
                  </div>
               </div>
               <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-4 hover:border-slate-300 transition group cursor-pointer">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                     <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" alt="Event" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                  </div>
                  <div className="flex-1 py-1">
                     <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-0.5">Dec 15 • 10:00 AM</div>
                     <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1 group-hover:text-rose-600 transition-colors">Design Sprint Workshop</h4>
                     <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <MapPin size={12}/> WeWork, Delhi
                     </div>
                  </div>
               </div>
           </div>
         </section>

         {/* Dynamic Mentor Recommendations */}
         <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotifications && setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 relative"
                  title="Online Alumni Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button
                  onClick={async () => {
                    try {
                      const sample = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/debug/get-sample-alumni`).then(r=>r.json());
                      if (!sample?.alumniId) return alert('No sample alumni found');
                      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/debug/emit-alumni-online`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ alumniId: sample.alumniId })
                      }).then(r=>r.json());
                      alert(`Debug emit result: ${JSON.stringify(resp)}`);
                    } catch (err) {
                      console.error(err);
                      alert('Debug emit failed, see console');
                    }
                  }}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100"
                  title="Emit test alumni-online event"
                >
                  Test Notify
                </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm min-h-[150px]">
               {recommendedMentors.length > 0 ? (
                 recommendedMentors.map((mentor) => (
                    <div key={mentor._id} onClick={() => onViewProfile(mentor)} className="p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0">
                       <img 
                         src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} 
                         className="w-10 h-10 rounded-full bg-slate-100 object-cover" 
                         alt="Mentor" 
                       />
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <h4 className="font-bold text-slate-900 text-sm">{mentor.name}</h4>
                             <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Skill Match</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{mentor.headline || "Alumni Mentor"}</p>
                       </div>
                       <button className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white transition">
                          <ArrowRight size={14} />
                       </button>
                    </div>
                ))
                ) : (
                 <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                    <p className="text-sm text-slate-500">No specific matches yet.</p>
                    <button onClick={() => setActiveTab('My Journey')} className="text-xs text-indigo-600 font-bold mt-1">Update your skills</button>
                 </div>
               )}
              </div>
              {/* Close the header wrapper (flex items-center justify-between) */}
              </div>
            </section>
      </div>
    </div>
  );
};

// --- MAIN SHELL COMPONENT ---
function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // 1. Fetch User Profile
  const { fetchProfile, profile } = useFetchProfile();

  useEffect(() => {
    fetchProfile('me');
  }, [fetchProfile]);

  // Helper variables for Mobile Header
  const displayName = profile?.name || 'Student';
  const avatarUrl = profile?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  const handleViewProfile = (alumni) => {
    setSelectedAlumni(alumni);
  };

  const renderContent = () => {
    if (selectedAlumni) {
      return <AlumniExplorer alumni={selectedAlumni} onBack={() => setSelectedAlumni(null)} />;
    }

    switch (activeTab) {
        case 'Explore Alumni':
            return <AlumniExplorer onViewProfile={handleViewProfile} />;
        case 'My Journey':
            return <StudentJourney />;
        case 'Workshops':
            return <WorkshopsModule />;
        case 'Messages':
            return <ChatSection />;
        case 'Requests':
            return <StudentRequests />;
        case 'Dashboard':
        default:
            return <DashboardHome 
              setActiveTab={setActiveTab} 
              onViewProfile={handleViewProfile}
              userProfile={profile}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
            />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        selectedAlumni={selectedAlumni}
        setSelectedAlumni={setSelectedAlumni}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userProfile={profile} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full transition-all duration-300">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-30 sticky top-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg active:bg-slate-100"
                >
                    <Menu size={24} />
                </button>
                <span className="font-bold text-slate-900 text-lg truncate">
                    {selectedAlumni ? 'Alumni Profile' : activeTab}
                </span>
            </div>
            
            {/* MOBILE AVATAR */}
            <div 
              className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer"
              onClick={() => setActiveTab('My Journey')}
            >
                 <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            </div>
        </div>

        {/* DYNAMIC CONTENT SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full scrollbar-hide">
            {renderContent()}
        </div>

        {/* Online Alumni Notifications */}
        <OnlineAlumniNotification 
          show={showNotifications}
          onToggle={() => setShowNotifications(!showNotifications)}
        />

      </main>
    </div>
  );
}

export default StudentDashboard;