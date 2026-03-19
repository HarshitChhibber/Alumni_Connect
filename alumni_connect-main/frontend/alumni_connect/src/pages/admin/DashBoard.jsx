import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, CheckCircle, XCircle, 
  Search, Bell, FileText, Compass, MoreVertical, Loader2, 
  GraduationCap, Briefcase, AlertCircle, LogOut, CheckSquare, 
  Download, MapPin
} from 'lucide-react';

// --- CUSTOM HOOKS ---
import { useExplore } from '../../hooks/useProfile';
import { useWorkshops } from '../../hooks/useWorkshops';
import UniversityAdminDashboard from './UniversityAdminDashboard';
import AdminSettings from './AdminSettings';

// --- SIDEBAR ---
// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: Icon, label, active, expanded, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center transition-all duration-200 group rounded-xl relative
      ${expanded ? "gap-3 px-4 py-3 w-full justify-start" : "justify-center p-3 w-12 h-12 mx-auto"}
      ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}
    `}
    title={!expanded ? label : ""}
  >
    <Icon size={20} className="shrink-0" />
    <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 hidden'}`}>
      {label}
    </span>
    {!expanded && active && (
      <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-white"></div>
    )}
  </button>
);

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shrink-0 relative z-30 h-screen top-0 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
      <div className="h-24 flex items-center justify-center border-b border-slate-50 relative px-4">
        <div className={`flex items-center gap-3 transition-all duration-300 ${!isSidebarOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 flex items-center justify-center cursor-pointer transition" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
             <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center shadow-md text-white shrink-0">
                 <Compass size={20} />
             </div>
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">Saarthi</h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 w-full p-4 mt-4">
        <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} expanded={isSidebarOpen} onClick={() => setActiveTab('overview')} />
        <SidebarItem icon={Users} label="User Directory" active={activeTab === 'users'} expanded={isSidebarOpen} onClick={() => setActiveTab('users')} />
        <SidebarItem icon={CheckSquare} label="Approvals" active={activeTab === 'requests'} expanded={isSidebarOpen} onClick={() => setActiveTab('requests')} />
        <div className={`my-4 border-t border-slate-100 ${!isSidebarOpen ? 'mx-2' : 'mx-4'}`}></div>
        <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} expanded={isSidebarOpen} onClick={() => setActiveTab('reports')} />
          
      </nav>

      <div className={`p-4 border-t border-slate-100 ${!isSidebarOpen && 'flex justify-center'}`}>
        <button className={`flex items-center transition-colors group rounded-xl ${isSidebarOpen ? "gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50" : "justify-center p-3 w-12 h-12 text-slate-400 hover:text-red-600 hover:bg-red-50"}`} title="Logout">
          <LogOut size={20} />
          <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Verified: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Active: "bg-blue-100 text-blue-700 border-blue-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Rejected: "bg-red-100 text-red-700 border-red-200"
  };
  const safeStatus = status || 'Pending';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[safeStatus] || styles.Pending}`}>
      {safeStatus}
    </span>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- 1. DATA FETCHING ---
  const { profiles, loading: usersLoading, fetchExplore } = useExplore();
  
  // ✅ Pass activeTab to useWorkshops to trigger correct data fetching
  const { 
    workshops, 
    pendingRequests, // ✅ Use dedicated pending requests for the approval tab
    loading: workshopLoading, 
    removeWorkshop,
    approveVenue     // ✅ Import approve function
  } = useWorkshops(activeTab);


  // --- 2. LOCAL STATE ---
  const [userFilter, setUserFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Approval Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [venueInput, setVenueInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  // --- 3. INITIAL LOAD ---
  useEffect(() => {
    fetchExplore({}); 
  }, [fetchExplore]);

  // --- 4. ROBUST FILTERING LOGIC ---

  const getCountByRole = (roleStr) => {
    if (!profiles || !Array.isArray(profiles)) return 0;
    return profiles.filter(p => p.role && p.role.toLowerCase() === roleStr.toLowerCase()).length;
  };

  const filteredUsers = useMemo(() => {
    let data = profiles || [];
    
    // Filter by Role
    if (userFilter !== 'All') {
      data = data.filter(u => u.role && u.role.toLowerCase() === userFilter.toLowerCase().slice(0, -1)); 
    }

    // Filter by Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter(u => 
        (u.name && u.name.toLowerCase().includes(lowerSearch)) || 
        (u.email && u.email.toLowerCase().includes(lowerSearch))
      );
    }
    return data;
  }, [profiles, userFilter, searchTerm]);

  // Stats Logic: Count pending items for the overview cards
  const pendingCount = useMemo(() => {
     // If we are on overview, 'workshops' contains all data (including pending)
     // If we are on requests, 'pendingRequests' contains the data
     if (activeTab === 'requests') return pendingRequests.length;
     return workshops ? workshops.filter(w => w.status === 'Pending').length : 0;
  }, [workshops, pendingRequests, activeTab]);

  // --- 5. STATS CALCULATION ---
  const statsData = [
    { 
      label: "Total Alumni", 
      value: usersLoading ? "..." : getCountByRole('Alumni'), 
      change: "Verified", 
      icon: Briefcase, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50" 
    },
    { 
      label: "Active Students", 
      value: usersLoading ? "..." : getCountByRole('Student'), 
      change: "On Campus", 
      icon: GraduationCap, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "Pending Approvals", 
      value: workshopLoading ? "..." : pendingCount, 
      change: "Urgent", 
      icon: AlertCircle, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      label: "Total Workshops", 
      value: workshopLoading ? "..." : (workshops ? workshops.length : 0), 
      change: "Scheduled", 
      icon: Calendar, 
      color: "text-pink-600", 
      bg: "bg-pink-50" 
    },
  ];

  // ✅ APPROVE WORKSHOP LOGIC
  const handleApproveWorkshop = async () => {
    if (!venueInput) return alert("Please assign a venue.");
    
    const result = await approveVenue({
        workshopId: selectedRequest._id,
        assignedVenue: venueInput,
        adminNote: noteInput || "Approved."
    });

    if (result.success) {
        alert("Workshop Approved & Venue Assigned!");
        setSelectedRequest(null);
        setVenueInput('');
        setNoteInput('');
    } else {
        alert(result.message || "Failed to approve.");
    }
  };

  const handleNavigateProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* SIDEBAR */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
             {activeTab === 'overview' ? 'Dashboard Overview' : 
              activeTab === 'users' ? 'User Directory' : 
              activeTab === 'requests' ? 'Venue Approvals' : 
              activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm" 
                />
             </div>
             <div className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 relative shadow-sm cursor-pointer">
                <Bell size={20} />
             </div>
          </div>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {/* Show spinner if loading is explicitly true, or fallback to value */}
                    {stat.value === "..." ? <Loader2 className="animate-spin" /> : stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Recent Registrations</h3>
                <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
              </div>
              {usersLoading ? (
                 <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
              ) : profiles.length === 0 ? (
                 <div className="p-10 text-center text-slate-400">No users found in database.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Batch/Dept</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profiles.slice(0, 5).map(user => (
                      <tr key={user._id || user.id} onClick={() => handleNavigateProfile(user._id || user.id)} className="hover:bg-slate-50 transition cursor-pointer">
                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                          <img 
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}`} 
                            className="w-8 h-8 rounded-full object-cover" 
                            alt=""
                          />
                          {user.name}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'Alumni' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{user.batch || user.department || 'N/A'}</td>
                        <td className="px-6 py-4"><StatusBadge status={user.status || 'Active'}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* --- USER DIRECTORY TAB --- */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                 {['All', 'Alumni', 'Student'].map(role => (
                    <button 
                        key={role}
                        onClick={() => setUserFilter(role === 'All' ? 'All' : role + 's')} // Simple toggle logic
                        className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition ${
                            (userFilter === 'All' && role === 'All') || userFilter.includes(role)
                            ? "bg-slate-900 text-white" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {role === 'All' ? 'All Users' : role + 's'}
                    </button>
                 ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">
                 <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Profile</th>
                    <th className="px-6 py-4">Batch/Dept</th>
                    <th className="px-6 py-4">Designation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading ? (
                      <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user._id || user.id} onClick={() => handleNavigateProfile(user._id || user.id)} className="hover:bg-slate-50 transition group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                            alt=""
                          />
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{user.batch || user.year || user.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500">{user.designation || user.company || 'Student'}</td>
                      <td className="px-6 py-4"><StatusBadge status={user.verified ? 'Verified' : 'Active'}/></td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- OTHER TABS --- */}
        {activeTab === 'reports' && <UniversityAdminDashboard/>}
        {activeTab === 'settings' && <AdminSettings/>}

        {/* --- REQUESTS TAB --- */}
        {activeTab === 'requests' && (
          <div className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-6">
                {workshopLoading && <div className="text-center p-10"><Loader2 className="animate-spin inline"/> Checking for requests...</div>}
                
                {!workshopLoading && pendingRequests.length === 0 && (
                      <div className="text-center py-20 text-slate-400">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                          <p>All caught up! No pending approvals.</p>
                      </div>
                )}

                {/* ✅ Use pendingRequests from hook */}
                {pendingRequests.map((req) => (
                   <div key={req.id || req._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row gap-6 shadow-sm hover:border-indigo-200 transition">
                      <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                                 {req.mode || 'Venue'} Request
                               </span>
                               <h3 className="text-xl font-bold text-slate-900">{req.title}</h3>
                               <p className="text-sm text-slate-500 mt-1">
                                 Organizer: <span className="font-medium text-slate-900">{req.organizer?.name}</span>
                               </p>
                            </div>
                            <div className="text-right">
                               <div className="text-2xl font-bold text-slate-900">{req.date ? new Date(req.date).getDate() : 'TBD'}</div>
                               <div className="text-xs font-bold text-slate-500 uppercase">{req.date ? new Date(req.date).toLocaleString('default', { month: 'short' }) : ''}</div>
                            </div>
                          </div>
                          
                          {/* Requirements Section */}
                          {req.venueRequest && (
                              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm mb-4">
                                  <span className="block font-bold text-amber-800 text-xs uppercase mb-1 items-center gap-1">
                                      <MapPin size={12}/> Venue Requirements
                                  </span>
                                  <p className="text-amber-900">{req.venueRequest.requirements}</p>
                              </div>
                          )}

                          <div className="flex gap-2 mt-4">
                             <button onClick={() => setSelectedRequest(req)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition">Approve & Assign</button>
                             <button onClick={() => removeWorkshop(req._id)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">Reject</button>
                          </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* --- APPROVE MODAL --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Approve Workshop</h3>
                  <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={20}/></button>
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Venue</label>
                  <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Auditorium B, Room 301"
                      value={venueInput}
                      onChange={(e) => setVenueInput(e.target.value)}
                  />
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Note</label>
                  <textarea 
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Instructions for Alumni (e.g. Keys at reception)"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                  />
              </div>

              <div className="pt-2">
                  <button onClick={handleApproveWorkshop} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-200">
                      Confirm Approval
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;