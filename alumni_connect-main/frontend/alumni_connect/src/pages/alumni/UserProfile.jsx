



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, MapPin, Linkedin, Github, 
  Briefcase, TrendingUp, Code, 
  X, Loader2, MessageCircle, Send, Globe, CheckCircle, ArrowLeft, Building2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

import { useFetchProfile } from '../../hooks/useProfile';
import JourneyGraphModule from '../../components/JourneyGraphModule';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { fetchProfile, profile, loading, error } = useFetchProfile();
  
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    if (id) {
        fetchProfile(id);
    }
  }, [id, fetchProfile]);

  // 2. 🛡️ LOADING GUARD
  if (loading || (id && !profile && !error)) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-2 text-slate-900" />
            <p>Loading profile...</p>
        </div>
    );
  }

  // 3. 🛡️ ERROR / NOT FOUND GUARD
  if (error || !profile) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
                  <div className="text-red-500 font-bold text-lg mb-2">Profile Not Found</div>
                  <p className="text-slate-500 mb-4">
                      {error ? error : "User data could not be retrieved."}
                  </p>
                  <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Go Back</button>
              </div>
          </div>
      );
  }

  // --- Safe Data Prep ---
  // Note: JourneyGraphModule handles its own sorting (Oldest -> Newest)
  const milestones = profile.milestones || [];
    
  const skills = profile.skills || [];
  const skillStats = profile.skillStats || [];
  const socials = profile.socials || {};
  
  const firstName = profile.name ? profile.name.split(' ')[0] : 'User';
  const displayName = profile.name || "Anonymous User";
  const avatarUrl = profile.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}`;

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setSending(false);
    setSentSuccess(true);
    setTimeout(() => {
        setSentSuccess(false);
        setIsConnectOpen(false);
        setMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ✅ CUSTOM SCROLLBAR STYLES */}
      <style>{`
        /* Webkit (Chrome, Edge, Safari) */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* slate-300 */
          border-radius: 99px;
          border: 2px solid #f8fafc; /* slate-50 padding */
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; /* slate-400 */
        }
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>

      {/* HEADER */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm relative">
        <div className="absolute inset-0 bg-[radial-gradient(#E5E2E2FF_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          
          <button onClick={() => navigate(-1)} className="absolute top-4 left-6 p-2 text-slate-400 hover:text-slate-900 transition flex items-center gap-1 text-sm font-bold">
            <ArrowLeft size={16} /> Back
          </button>

          <button onClick={() => setIsConnectOpen(true)} className="absolute top-6 right-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-200">
            <MessageCircle size={18} /> Connect
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start mt-4 md:mt-0">
            {/* Avatar */}
            <div className="shrink-0">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-slate-100">
                 <img 
                   src={avatarUrl} 
                   alt={displayName} 
                   className="w-full h-full object-cover"
                 />
               </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
               <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    {displayName}
                  </h1>
                  
                  <p className="text-lg text-slate-800 font-semibold mt-1 flex items-center gap-2">
                    <Briefcase size={18} className="text-slate-400" />
                    {profile.role || 'Member'} <span className="text-slate-400 font-normal">at</span> {profile.currentCompany || profile.company || 'Unknown Company'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                         <GraduationCap size={16} className="text-slate-400" /> {profile.batch || profile.year || 'Batch N/A'}
                      </span>
                      <span className="flex items-center gap-1.5">
                         <MapPin size={16} className="text-slate-400" /> {profile.location || 'Remote'}
                      </span>
                  </div>
               </div>

               <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                  {profile.bio || "No bio available."}
               </p>

               <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex gap-2">
                      {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 rounded-lg text-slate-600 hover:text-[#0077b5] hover:bg-white hover:shadow-md transition"><Linkedin size={20} /></a>}
                      {socials.github && <a href={socials.github} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 rounded-lg text-slate-600 hover:text-black hover:bg-white hover:shadow-md transition"><Github size={20} /></a>}
                      {socials.website && <a href={socials.website} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-md transition"><Globe size={20} /></a>}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MIDDLE GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Radar Chart  */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <div className="mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp size={20} className="text-slate-900" /> Professional Competency
                  </h3>
               </div>
               
               <div className="h-[300px] w-full flex items-center justify-center bg-slate-50/50 rounded-xl">
                 {skillStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillStats}>
                        <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Proficiency" dataKey="A" stroke="#1e293b" strokeWidth={3} fill="#94a3b8" fillOpacity={0.4} />
                        <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="text-center">
                        <TrendingUp className="w-8 h-8 mx-auto text-slate-300 mb-2"/>
                        <p className="text-slate-400 text-sm">No competency stats shared.</p>
                    </div>
                 )}
               </div>
            </div>

            {/* 2. Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
               <div className="mb-4">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Code size={20} className="text-slate-900" /> Expertise
                   </h3>
               </div>
               <div className="flex-1 content-start flex flex-wrap gap-2.5">
                  {skills.length > 0 ? skills.map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:border-slate-400 transition cursor-default">{skill}</span>
                  )) : <p className="text-slate-400 text-sm italic">No skills listed.</p>}
               </div>
            </div>
        </div>
      </div>

      {/* --- JOURNEY GRAPH --- */}
      <div className="w-full mt-4">
         <div className="max-w-[95%] mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Building2 size={20} className="text-slate-900"/> Career Journey
                  </h2>
               </div>
            </div>
            
            {/* The wrapper handles the scroll, the Module handles the graph */}
            <div className="w-full bg-neutral-50/50">
                {/* We pass ONLY 'milestones'. 
                   Because 'onImport' and 'onAddClick' are undefined, 
                   the module will hide the "Import PDF" and "Add Milestone" buttons automatically.
                */}
                <JourneyGraphModule milestones={milestones} />
            </div>
         </div>
      </div>

      {/* CONNECT MODAL */}
      {isConnectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConnectOpen(false)}></div>
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
              {sentSuccess ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><CheckCircle size={32} /></div>
                      <h3 className="text-xl font-bold text-slate-900">Request Sent!</h3>
                      <p className="text-slate-500 mt-2 text-sm">You have requested to connect with {firstName}.</p>
                  </div>
              ) : (
                  <>
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><MessageCircle size={16}/> Connect with {firstName}</h3>
                        <button onClick={() => setIsConnectOpen(false)}><X size={18} className="text-slate-400 hover:text-slate-600"/></button>
                    </div>
                    <form onSubmit={handleConnectSubmit} className="p-5 space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Message Note</label>
                            <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none transition" rows="4" placeholder={`Hi ${firstName}, I would like to connect regarding...`} value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                        </div>
                        <button type="submit" disabled={sending} className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition flex justify-center items-center gap-2 disabled:opacity-70">
                            {sending ? <Loader2 className="animate-spin" size={18}/> : <><Send size={16} /> Send Request</>}
                        </button>
                    </form>
                  </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;