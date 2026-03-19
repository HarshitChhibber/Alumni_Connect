import React, { useState } from 'react';
import { 
  Globe, 
  Sun, 
  Moon, 
  BellRing, 
  ToggleLeft, 
  ToggleRight, 
  Lock, 
  User, 
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle2,
  Activity
} from 'lucide-react';

// --- Utility Components ---

const ToggleSwitch = ({ active, onClick }) => (
   <button onClick={onClick} className={`transition-colors duration-200 ${active ? 'text-indigo-600' : 'text-slate-300'}`}>
      {active ? <ToggleRight size={40} fill="currentColor" /> : <ToggleLeft size={40} />}
   </button>
);

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button 
    onClick={() => setActiveTab(id)}
    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 
      ${activeTab === id 
        ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 ring-1 ring-indigo-50' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// --- Main Component ---

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // Default to profile
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true });

  // Mock User Data
  const adminUser = {
    name: "Sarah Jenkins",
    role: "Super Administrator",
    email: "sarah.jenkins@platform.com",
    phone: "+1 (555) 012-3456",
    location: "San Francisco, CA",
    joined: "March 2021",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"
  };

  return (
     <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
             <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
             <p className="text-sm text-slate-500 mt-1">Manage your personal profile and system configurations.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
             
             {/* Sidebar Navigation */}
             <div className="w-full lg:w-64 shrink-0 space-y-2">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Account</div>
                <SidebarItem id="profile" label="My Profile" icon={User} activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <div className="px-4 py-2 mt-6 text-xs font-bold text-slate-400 uppercase tracking-wider">System</div>
                <SidebarItem id="general" label="General" icon={Globe} activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem id="notifications" label="Notifications" icon={BellRing} activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem id="security" label="Security" icon={Lock} activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem id="billing" label="Billing" icon={CreditCard} activeTab={activeTab} setActiveTab={setActiveTab} />
             </div>

             {/* Content Area */}
             <div className="flex-1 min-h-[500px]">
                
                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="h-32 bg-linear-to-r from-indigo-600 to-purple-600 relative">
                         <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold rounded-lg transition">Edit Cover</button>
                         </div>
                      </div>
                      <div className="px-6 pb-6 relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-4 gap-4">
                          <img 
                            src={adminUser.avatarUrl} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white"
                          />
                          <div className="flex-1 pt-2 sm:pt-0">
                            <h3 className="text-xl font-bold text-slate-900">{adminUser.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Shield size={14} className="text-indigo-600" />
                              {adminUser.role}
                            </div>
                          </div>
                          <button className="mt-4 sm:mt-0 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-indigo-200">
                            Edit Profile
                          </button>
                        </div>

                        {/* Profile Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <Mail size={16} className="text-slate-400" />
                              {adminUser.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <Phone size={16} className="text-slate-400" />
                              {adminUser.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <MapPin size={16} className="text-slate-400" />
                              {adminUser.location}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                  <div className="text-2xl font-bold text-slate-900">24</div>
                                  <div className="text-xs text-slate-500 font-medium">Projects Managed</div>
                               </div>
                               <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                  <div className="text-2xl font-bold text-slate-900">1.2k</div>
                                  <div className="text-xs text-slate-500 font-medium">Audit Logs</div>
                               </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                              <Calendar size={16} />
                              Joined {adminUser.joined}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Activity Widget */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                       <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Activity size={18} className="text-indigo-600"/> Recent Activity
                       </h4>
                       <div className="space-y-4">
                          {[
                            { action: "Updated system security policies", time: "2 hours ago", icon: Lock },
                            { action: "Invited new team member: Jason D.", time: "Yesterday", icon: User },
                            { action: "Exported monthly billing report", time: "3 days ago", icon: CreditCard },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                               <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                  <item.icon size={16} />
                               </div>
                               <div className="flex-1">
                                  <div className="text-sm font-medium text-slate-900">{item.action}</div>
                                  <div className="text-xs text-slate-400">{item.time}</div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {/* --- GENERAL SETTINGS TAB --- */}
                {activeTab === 'general' && (
                   <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                         <Globe size={20} className="text-indigo-600"/> General Preferences
                      </h3>
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div>
                               <div className="font-bold text-slate-900 text-sm">Dark Mode</div>
                               <div className="text-xs text-slate-500">Switch between light and dark themes.</div>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                               <button className="p-2 bg-white rounded-md shadow-sm text-amber-500"><Sun size={16}/></button>
                               <button className="p-2 text-slate-400 hover:text-slate-600"><Moon size={16}/></button>
                            </div>
                         </div>
                         <hr className="border-slate-50"/>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Language</label>
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition">
                               <option>English (United States)</option>
                               <option>Hindi</option>
                               <option>Spanish</option>
                               <option>French</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timezone</label>
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition">
                               <option>Pacific Standard Time (PST)</option>
                               <option>Eastern Standard Time (EST)</option>
                               <option>Greenwich Mean Time (GMT)</option>
                            </select>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- NOTIFICATIONS TAB --- */}
                {activeTab === 'notifications' && (
                   <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                         <BellRing size={20} className="text-indigo-600"/> Notification Preferences
                      </h3>
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div>
                               <div className="font-bold text-slate-900 text-sm">Email Alerts</div>
                               <div className="text-xs text-slate-500">Receive emails about new workshop requests.</div>
                            </div>
                            <ToggleSwitch active={notifications.email} onClick={() => setNotifications({...notifications, email: !notifications.email})}/>
                         </div>
                         <div className="flex items-center justify-between">
                            <div>
                               <div className="font-bold text-slate-900 text-sm">Push Notifications</div>
                               <div className="text-xs text-slate-500">Receive real-time alerts on your dashboard.</div>
                            </div>
                            <ToggleSwitch active={notifications.push} onClick={() => setNotifications({...notifications, push: !notifications.push})}/>
                         </div>
                         <div className="flex items-center justify-between">
                            <div>
                               <div className="font-bold text-slate-900 text-sm">Weekly Digest</div>
                               <div className="text-xs text-slate-500">Summary of alumni activities sent every Monday.</div>
                            </div>
                            <ToggleSwitch active={notifications.weekly} onClick={() => setNotifications({...notifications, weekly: !notifications.weekly})}/>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                   <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                         <Lock size={20} className="text-indigo-600"/> Security & Login
                      </h3>
                      <div className="space-y-4 max-w-md">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label>
                            <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                            <input type="password" placeholder="Enter new password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition" />
                         </div>
                         <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-200">
                            Update Password
                         </button>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-900 text-sm mb-2">Two-Factor Authentication</h4>
                          <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full text-indigo-600">
                                   <Shield size={16} />
                                </div>
                                <div>
                                   <div className="text-sm text-indigo-900 font-bold">2FA is disabled</div>
                                   <div className="text-xs text-indigo-700">Add an extra layer of security to your account.</div>
                                </div>
                             </div>
                             <button className="text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-600 hover:text-white transition">Enable</button>
                          </div>
                      </div>
                   </div>
                )}
                
                {/* --- BILLING TAB --- */}
                {activeTab === 'billing' && (
                   <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                         <CreditCard size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Plan</h3>
                      <p className="text-slate-400 text-sm mb-6">Billing information is managed by your organization administrator.</p>
                      <button className="px-6 py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition">
                         Contact Support
                      </button>
                   </div>
                )}

             </div>
          </div>
        </div>
     </div>
  );
};

export default AdminSettings;