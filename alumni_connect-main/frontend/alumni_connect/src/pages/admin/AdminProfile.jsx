import React, { useState } from 'react';
import { 
  User, Mail, Phone, Camera, Building2, 
  CheckCircle, Settings, Save 
} from 'lucide-react';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Siddharth Rao",
    role: "Chief Administrator",
    email: "admin@institute.edu",
    phone: "+91 98765 43210",
    department: "Administrative Block A",
    bio: "Ensuring smooth operations for the Alumni-Student nexus. Passionate about education technology and community building.",
  });

  return (
    <div className="animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 mb-16">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-900 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Avatar Overlap */}
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
               <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80" alt="Admin" className="w-full h-full object-cover"/>
            </div>
            <button className="absolute bottom-2 right-2 p-1.5 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition shadow-md">
               <Camera size={14} />
            </button>
          </div>
          <div className="mb-14 text-white">
            <h2 className="text-3xl font-bold">{profileData.name}</h2>
            <p className="text-indigo-200 font-medium">{profileData.role}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-4 right-6">
           <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-slate-900 hover:bg-slate-50'}`}
           >
              {isEditing ? <><Save size={16}/> Save Changes</> : <><Settings size={16}/> Edit Profile</>}
           </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Col: Info */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <User size={20} className="text-indigo-600"/> Personal Information
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                     <input 
                       type="text" 
                       disabled={!isEditing}
                       value={profileData.name}
                       onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                       className={`w-full p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${isEditing ? 'bg-white border-slate-300' : 'bg-slate-50 border-transparent text-slate-600'}`}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Designation</label>
                     <input 
                       type="text" 
                       disabled={!isEditing}
                       value={profileData.role}
                       onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                       className={`w-full p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${isEditing ? 'bg-white border-slate-300' : 'bg-slate-50 border-transparent text-slate-600'}`}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                     <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                        <input 
                          type="email" 
                          disabled={true} // Email usually disabled
                          value={profileData.email}
                          className="w-full pl-10 p-3 rounded-xl border border-transparent bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                     <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                        <input 
                          type="text" 
                          disabled={!isEditing}
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className={`w-full pl-10 p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${isEditing ? 'bg-white border-slate-300' : 'bg-slate-50 border-transparent text-slate-600'}`}
                        />
                     </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Department / Block</label>
                     <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                        <input 
                          type="text" 
                          disabled={!isEditing}
                          value={profileData.department}
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                          className={`w-full pl-10 p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${isEditing ? 'bg-white border-slate-300' : 'bg-slate-50 border-transparent text-slate-600'}`}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Col: Stats */}
         <div className="space-y-6">
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
               <h3 className="font-bold text-lg mb-1">System Status</h3>
               <p className="text-indigo-100 text-xs mb-6">Operational • v2.4.0</p>
               <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl mb-2">
                  <span className="text-sm font-medium">Last Login</span>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Today, 10:30 AM</span>
               </div>
               <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                   <span className="text-sm font-medium">Security Check</span>
                   <span className="text-xs font-bold text-emerald-300 flex items-center gap-1"><CheckCircle size={12}/> Passed</span>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h3 className="font-bold text-slate-900 mb-4">Activity Overview</h3>
               <ul className="space-y-4">
                  <li className="flex justify-between text-sm">
                     <span className="text-slate-600">Workshops Approved</span>
                     <span className="font-bold text-slate-900">124</span>
                  </li>
                  <li className="flex justify-between text-sm">
                     <span className="text-slate-600">Users Verified</span>
                     <span className="font-bold text-slate-900">850+</span>
                  </li>
                  <li className="flex justify-between text-sm">
                     <span className="text-slate-600">Reports Generated</span>
                     <span className="font-bold text-slate-900">45</span>
                  </li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminProfile;