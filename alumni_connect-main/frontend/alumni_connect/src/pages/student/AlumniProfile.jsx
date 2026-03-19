import React, { useState } from 'react';
import { 
  MapPin, Briefcase, GraduationCap, CheckCircle, Star, MessageCircle, Bell, 
  Calendar, Clock, Zap, TrendingUp, Award, BookOpen, ChevronRight, 
  User, ArrowLeft, X, Send, Loader2
} from 'lucide-react';
import JourneyGraphModule from './JourneyGraphModule'; // Check path

// --- HELPER: DYNAMIC DATA GENERATOR ---
// This now creates a unique journey based on the props passed
const getExtendedProfile = (basicInfo) => {
  const startYear = parseInt(basicInfo.batch) || 2020;
  
  return {
    ...basicInfo,
    verified: true,
    coverImage: basicInfo.coverImage || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
    about: basicInfo.about || `Experienced ${basicInfo.role} with a demonstrated history of working in the ${basicInfo.company} ecosystem. Skilled in full-stack development, leadership, and community mentoring.`,
    skills: {
      primary: basicInfo.skills || ["Communication", "Leadership", "React", "Node.js"],
      aiSuggested: ["System Design", "Cloud Architecture", "Team Management"] 
    },
    availability: {
      slots: ["Sat, 10:00 AM", "Sun, 2:00 PM"],
      guidanceAreas: ["Resume Review", "Mock Interview", "Career Pivots"]
    },
    projects: [
      { title: "System Migration at " + basicInfo.company, desc: `Led key initiatives to improve performance by 40%.` },
      { title: "Open Source Tooling", desc: "Developed automation scripts used by 500+ developers." }
    ],
    workshops: [
      { title: `Breaking into ${basicInfo.role}`, attendees: 120, date: "Oct 2025" }
    ],
    testimonials: [
      { text: "The guidance I received was crucial for my internship!", student: "Rahul, Batch '24" }
    ],
    // DYNAMIC JOURNEY GENERATION
    journey: [
      { year: startYear, milestone: 'Graduated B.Tech', description: 'Computer Science Major', type: 'Education' },
      { year: startYear + 1, milestone: 'First Internship', description: 'Backend Developer Intern', type: 'Internship' },
      { year: startYear + 2, milestone: `Joined ${basicInfo.company}`, description: 'Junior Developer', type: 'Job' },
      { year: startYear + 4, milestone: 'Promoted to Senior', description: basicInfo.role, type: 'Achievement' },
    ]
  };
};

// eslint-disable-next-line no-unused-vars
const SectionTitle = ({ icon: Icon, title }) => (
  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
    <Icon className="w-5 h-5 text-neutral-500" /> {title}
  </h3>
);

export default function AlumniProfile({ alumni, onBack }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!alumni) return null;

  const fullProfile = getExtendedProfile(alumni);

  const handleSendRequest = () => {
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
        setIsSending(false);
        setSentSuccess(true);
        setTimeout(() => {
            setShowMentorshipModal(false);
            setSentSuccess(false);
        }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10 relative">
      
      {/* --- 1. HEADER SECTION --- */}
      <div className="bg-white border-b border-slate-200">
        {/* Cover Image - Fixed gradient syntax */}
        <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 w-full relative overflow-hidden">
             {fullProfile.coverImage && (
                <img src={fullProfile.coverImage} alt="Cover" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
             )}
            <button onClick={onBack} className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition flex items-center gap-2 z-10">
                <ArrowLeft size={16} /> Back
            </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img 
                src={fullProfile.image || `https://api.dicebear.com/7.x/initials/svg?seed=${fullProfile.name}`}
                alt={fullProfile.name} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
              {fullProfile.verified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified Alumni">
                  <CheckCircle size={16} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 mt-2 md:mt-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {fullProfile.name}
                  </h1>
                  <p className="text-lg font-medium text-slate-700">{fullProfile.role} at {fullProfile.company}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><GraduationCap size={14} /> Batch of '{fullProfile.batch ? fullProfile.batch.toString().slice(-2) : 'XX'}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {fullProfile.location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowMentorshipModal(true)}
                    className="px-5 py-2.5 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-black flex items-center gap-2 shadow-lg shadow-neutral-200 transition-all active:scale-95"
                  >
                    <Star size={16} className="fill-yellow-400 text-yellow-400" /> Request Mentorship
                  </button>
                  <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                    <MessageCircle size={20} />
                  </button>
                  <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`p-2.5 border rounded-xl transition-colors ${isFollowing ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                  >
                    <Bell size={20} className={isFollowing ? "fill-blue-600" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN GRID --- */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <SectionTitle icon={User} title="About" />
            <p className="text-slate-600 leading-relaxed">
              {fullProfile.about}
            </p>
          </section>

          {/* ROADMAP / JOURNEY GRAPH */}
          <section>
            <div className="flex items-center justify-between mb-4">
               <SectionTitle icon={TrendingUp} title="Career Roadmap" />
               <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Live Graph</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               {/* Pass fullProfile.journey to your graph module */}
               <JourneyGraphModule milestones={fullProfile.journey} setView={() => {}} />
            </div>
          </section>

          {/* Projects & Workshops */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <SectionTitle icon={Briefcase} title="Notable Projects" />
              <div className="space-y-4">
                {fullProfile.projects.map((p, i) => (
                  <div key={i} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <h4 className="font-bold text-slate-800 text-sm">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <SectionTitle icon={BookOpen} title="Workshops" />
              {fullProfile.workshops.map((w, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">{w.title}</h4>
                        <span className="text-xs text-slate-500">{w.date}</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-slate-900">{w.attendees}</span>
                        <span className="text-[10px] uppercase text-slate-400">Attendees</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <SectionTitle icon={Award} title="Student Testimonials" />
             <div className="grid gap-4">
                {fullProfile.testimonials.map((t, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="text-4xl text-slate-200 font-serif">“</div>
                        <div>
                            <p className="text-slate-600 italic text-sm">{t.text}</p>
                            <p className="text-xs font-bold text-slate-900 mt-2">— {t.student}</p>
                        </div>
                    </div>
                ))}
             </div>
          </section>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="space-y-6">

          {/* Availability Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-blue-50/50 sticky top-24">
             <SectionTitle icon={Calendar} title="Availability" />
             <div className="space-y-3 mb-6">
                {fullProfile.availability.slots.map((slot, i) => (
                    <button key={i} onClick={() => setShowMentorshipModal(true)} className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition text-left">
                        <div className="flex items-center gap-2">
                            <Clock size={16} /> {slot}
                        </div>
                        <ChevronRight size={16} />
                    </button>
                ))}
             </div>
             
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Can guide you on</h4>
             <div className="flex flex-wrap gap-2">
                {fullProfile.availability.guidanceAreas.map((area) => (
                    <span key={area} className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-md">
                        {area}
                    </span>
                ))}
             </div>
          </div>

          {/* Skill Set (Smart) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                 <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                 <h3 className="text-lg font-bold text-slate-900">Skill Set</h3>
             </div>

             <div className="mb-6">
                 <p className="text-xs font-semibold text-slate-400 mb-2">PRIMARY SKILLS</p>
                 <div className="flex flex-wrap gap-2">
                    {fullProfile.skills.primary.map(s => (
                        <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                            {s}
                        </span>
                    ))}
                 </div>
             </div>

             <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1">
                        <Zap size={12} className="fill-blue-700" /> AI INSIGHT
                    </p>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded text-blue-400 border border-blue-100">Gap Analysis</span>
                 </div>
                 <p className="text-xs text-blue-800 mb-3">To follow a similar path, consider learning:</p>
                 <div className="flex flex-wrap gap-2">
                    {fullProfile.skills.aiSuggested.map(s => (
                        <span key={s} className="px-2 py-1 bg-white text-blue-600 text-xs rounded border border-blue-200 shadow-sm flex items-center gap-1">
                           + {s}
                        </span>
                    ))}
                 </div>
             </div>
          </div>

        </div>
      </div>

      {/* --- 3. MENTORSHIP MODAL --- */}
      {showMentorshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMentorshipModal(false)}></div>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-in fade-in zoom-in-95">
                {sentSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Request Sent!</h3>
                        <p className="text-slate-500 mt-2">{fullProfile.name} will be notified.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Request Mentorship</h3>
                            <button onClick={() => setShowMentorshipModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Topic</label>
                                <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50">
                                    <option>Career Guidance</option>
                                    <option>Resume Review</option>
                                    <option>Mock Interview</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                                <textarea 
                                    className="w-full mt-1 p-3 border border-slate-200 rounded-lg text-sm h-32 resize-none"
                                    placeholder={`Hi ${fullProfile.name.split(' ')[0]}, I'd love to connect...`}
                                ></textarea>
                            </div>
                            <button 
                                onClick={handleSendRequest}
                                disabled={isSending}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black flex items-center justify-center gap-2"
                            >
                                {isSending ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Send Request</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
}