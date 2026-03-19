import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, UploadCloud, Github, Linkedin, Globe, 
  Plus, X, MapPin, Calendar, User, Award, Briefcase, GraduationCap, Lock
} from 'lucide-react';

// --- REUSABLE COMPONENTS ---

// 1. Custom Toggle Switch
const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm text-neutral-600 font-medium">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-neutral-900' : 'bg-neutral-200'}`}
    >
      <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

// 2. Expandable Panel Wrapper
const Panel = ({ title, isActive, onToggle, isCompleted, children }) => (
  <div className={`border border-neutral-200 rounded-xl bg-white overflow-hidden transition-all duration-300 mb-4 ${isActive ? 'shadow-lg ring-1 ring-neutral-900/5' : 'shadow-sm'}`}>
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-neutral-900 text-white' : (isCompleted ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500')}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h3 className={`font-semibold ${isActive ? 'text-neutral-900' : 'text-neutral-600'}`}>{title}</h3>
          {isCompleted && !isActive && <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Completed</span>}
        </div>
      </div>
      {isActive ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
    </button>
    
    {/* Smooth Collapse Animation */}
    <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="p-6 pt-0 border-t border-neutral-100">
        {children}
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const QuickProfileBuilder = ({ onComplete }) => {
  const [activePanel, setActivePanel] = useState(0); // Index of open panel
  const [progress] = useState(20); // Mock progress %
  
  // Mock Form State (Simplified for UI demo)
  const [tags, setTags] = useState(['React', 'Design']);
  const [currTag, setCurrTag] = useState('');
  const [privacy, setPrivacy] = useState({ resume: true, messages: true, salary: false });

  // Helper to handle tag addition
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currTag) {
      e.preventDefault();
      setTags([...tags, currTag]);
      setCurrTag('');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 outline-none transition-all text-sm";
  const labelClass = "block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-20">
       {/* Poppins Font */}
       <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'); body { font-family: 'Poppins', sans-serif; }`}</style>

       {/* --- 1. PROGRESS HEADER --- */}
       <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-100 pt-6 pb-4 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-end mb-2">
                <h1 className="text-xl font-bold tracking-tight">Build Your Profile</h1>
                <span className="text-sm font-medium text-blue-600">{progress}% Complete</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                <span className="text-neutral-900">Basic</span>
                <span>Skills</span>
                <span>Projects</span>
                <span>Finish</span>
            </div>
          </div>
       </div>

       {/* --- 2. MAIN CONTENT --- */}
       <div className="max-w-2xl mx-auto px-6 py-8">
          
          {/* PANEL 1: BASIC INFO */}
          <Panel 
            title="Basic Information" 
            icon={User} 
            isActive={activePanel === 0} 
            onToggle={() => setActivePanel(0)}
            isCompleted={true} // Mock status
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="col-span-2">
                    <label className={labelClass}>Headline / Tagline</label>
                    <input type="text" placeholder="Ex: CS Student @ NIT Delhi | Frontend Enthusiast" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Branch / Department</label>
                    <input type="text" placeholder="Computer Science" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Graduation Year</label>
                    <input type="text" placeholder="2025" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Current Location</label>
                    <div className="relative">
                        <MapPin className="absolute top-3 left-3 w-4 h-4 text-neutral-400" />
                        <input type="text" placeholder="New Delhi, India" className={`${inputClass} pl-10`} />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Gender (Optional)</label>
                    <select className={inputClass}>
                        <option>Prefer not to say</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <button onClick={() => setActivePanel(1)} className="mt-6 px-6 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-black transition">Next Step</button>
          </Panel>

          {/* PANEL 2: CONTACT & PRIVACY */}
          <Panel 
            title="Contact & Privacy" 
            icon={Lock} 
            isActive={activePanel === 1} 
            onToggle={() => setActivePanel(1)}
          >
             <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Linkedin className="absolute top-3 left-3 w-4 h-4 text-neutral-400" />
                        <input type="text" placeholder="LinkedIn URL" className={`${inputClass} pl-10`} />
                    </div>
                    <div className="relative">
                        <Github className="absolute top-3 left-3 w-4 h-4 text-neutral-400" />
                        <input type="text" placeholder="GitHub URL" className={`${inputClass} pl-10`} />
                    </div>
                    <div className="relative">
                        <Globe className="absolute top-3 left-3 w-4 h-4 text-neutral-400" />
                        <input type="text" placeholder="Portfolio Website" className={`${inputClass} pl-10`} />
                    </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 mt-4">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase mb-2">Privacy Settings</h4>
                    <Toggle 
                        label="Show Resume to Verified Students" 
                        checked={privacy.resume} 
                        onChange={(v) => setPrivacy({...privacy, resume: v})} 
                    />
                    <Toggle 
                        label="Allow Direct Messages" 
                        checked={privacy.messages} 
                        onChange={(v) => setPrivacy({...privacy, messages: v})} 
                    />
                    <Toggle 
                        label="Hide Salary Data (Anonymous only)" 
                        checked={privacy.salary} 
                        onChange={(v) => setPrivacy({...privacy, salary: v})} 
                    />
                </div>
             </div>
          </Panel>

          {/* PANEL 3: SKILLS */}
          <Panel 
            title="Skills & Expertise" 
            icon={Award} 
            isActive={activePanel === 2} 
            onToggle={() => setActivePanel(2)}
          >
             <div className="mt-4">
                <label className={labelClass}>Add Skills (Press Enter)</label>
                <div className="flex flex-wrap gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus-within:border-neutral-800 transition-colors">
                    {tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded bg-white border border-neutral-200 text-sm text-neutral-700 shadow-sm">
                            {tag}
                            <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <input 
                        type="text" 
                        value={currTag}
                        onChange={(e) => setCurrTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Type skill..." 
                        className="bg-transparent outline-none text-sm flex-1 min-w-[100px] h-8"
                    />
                </div>
                <div className="mt-3 flex gap-2">
                    <span className="text-xs text-neutral-400">Suggestions:</span>
                    {['Python', 'Machine Learning', 'AWS', 'Figma'].map(s => (
                        <button key={s} onClick={() => setTags([...tags, s])} className="text-xs font-medium text-blue-600 hover:underline decoration-blue-200 underline-offset-2">
                            + {s}
                        </button>
                    ))}
                </div>
             </div>
          </Panel>

          {/* PANEL 4: PROJECTS */}
          <Panel 
            title="Projects & Experience" 
            icon={Briefcase} 
            isActive={activePanel === 3} 
            onToggle={() => setActivePanel(3)}
          >
            <div className="space-y-4 mt-4">
                {/* Empty State / Add Button */}
                <button className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-xl flex items-center justify-center gap-2 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-all group">
                    <div className="p-2 bg-neutral-50 rounded-full group-hover:bg-neutral-100 transition">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Add Project or Internship</span>
                </button>
            </div>
          </Panel>

          {/* PANEL 5: RESUME */}
          <Panel 
            title="Resume Upload" 
            icon={UploadCloud} 
            isActive={activePanel === 4} 
            onToggle={() => setActivePanel(4)}
          >
             <div className="mt-4">
                <div className="relative w-full h-48 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">Click to upload or drag & drop</p>
                    <p className="text-xs text-neutral-500 mt-1">PDF only (Max 5MB)</p>
                </div>
                <div className="mt-4">
                     <Toggle label="Autofill profile details from Resume" checked={true} onChange={() => {}} />
                </div>
             </div>
          </Panel>

          {/* PANEL 6: JOURNEY */}
          <Panel 
            title="Add First Milestone" 
            icon={Calendar} 
            isActive={activePanel === 5} 
            onToggle={() => setActivePanel(5)}
          >
             <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                    <label className={labelClass}>Milestone Type</label>
                    <select className={inputClass}>
                        <option>Project Started</option>
                        <option>Internship</option>
                        <option>Hackathon Win</option>
                        <option>Course Completed</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows="3" placeholder="Briefly describe this achievement..." className={inputClass}></textarea>
                </div>
             </div>
          </Panel>

       </div>

       {/* --- 3. FOOTER ACTIONS --- */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <button 
                onClick={onComplete} 
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
              >
                Skip for now
              </button>
              <button 
                onClick={onComplete} 
                className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold shadow-lg hover:bg-black hover:shadow-xl transition-all active:scale-95"
              >
                Save & Continue
              </button>
          </div>
       </div>
    </div>
  );
};