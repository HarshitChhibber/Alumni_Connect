import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  MapPin, Linkedin, Github, Plus, Briefcase, TrendingUp, 
  Code, X, Camera, Edit3, Globe, Save, Trash2, Loader2, Pencil 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { toast } from 'react-hot-toast';

import JourneyGraphModule from '../../components/JourneyGraphModule'; 
import { useFetchProfile, useUpdateProfile } from '../../hooks/useProfile';

const AlumniSettings = () => {
  // --- HOOKS ---
  const { fetchProfile, profile, loading, error } = useFetchProfile();
  const { performUpdate, loading: updateLoading } = useUpdateProfile();
  
  const fileInputRef = useRef(null);

  // --- UI STATES ---
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSkillInputOpen, setIsSkillInputOpen] = useState(false);
  
  const [newSkillText, setNewSkillText] = useState('');

  // --- FORM STATES ---
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null);

  const [milestoneFormData, setMilestoneFormData] = useState({
    year: '', milestone: '', description: '', skillsGained: '', type: 'Job' 
  });

  const [editFormData, setEditFormData] = useState({});
  const [statsFormData, setStatsFormData] = useState([]); 

  // --- INITIAL FETCH ---
  useEffect(() => {
    fetchProfile("me");
  }, [fetchProfile]);

  // --- DATA PREP ---
  const sortedMilestones = useMemo(() => {
    const rawMilestones = profile?.milestones || [];
    return [...rawMilestones].sort((a, b) => parseInt(b.year) - parseInt(a.year)); 
  }, [profile?.milestones]); 

  const skills = profile?.skills || [];
  const skillStats = profile?.skillStats || [];
  const socials = profile?.socials || {};

  // --- HANDLERS ---

  // 1. Prepare Edit Form
  const handleOpenEditModal = () => {
    if (profile) {
      setEditFormData({
        name: profile.name || '',
        role: profile.role || '',
        company: profile.currentCompany || profile.company || '',
        location: profile.location || '',
        bio: profile.bio || '',
        linkedin: profile.socials?.linkedin || '',
        github: profile.socials?.github || '',
        website: profile.socials?.website || '',
      });
      setIsEditProfileOpen(true);
    }
  };

  // 2. Prepare Stats Form
  const handleOpenStatsModal = () => {
    if (profile?.skillStats && profile.skillStats.length > 0) {
        const cleanCopy = profile.skillStats.map(s => ({...s}));
        setStatsFormData(cleanCopy);
    } else {
        setStatsFormData([
            { subject: 'Coding', A: 80, fullMark: 150 },
            { subject: 'Communication', A: 100, fullMark: 150 },
            { subject: 'Leadership', A: 90, fullMark: 150 },
            { subject: 'Problem Solving', A: 110, fullMark: 150 },
            { subject: 'System Design', A: 70, fullMark: 150 },
        ]);
    }
    setIsStatsModalOpen(true);
  };

  // 3. Image Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max file size 5MB");
      const result = await performUpdate({}, file);
      if (result.success) fetchProfile("me");
    }
  };

  // 4. Submit General Profile
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name: editFormData.name,
        role: editFormData.role,
        company: editFormData.company,
        currentCompany: editFormData.company, 
        location: editFormData.location,
        bio: editFormData.bio,
        socials: {
            linkedin: editFormData.linkedin,
            github: editFormData.github,
            website: editFormData.website
        }
    };
    
    const result = await performUpdate(payload);
    if (result.success) {
      setIsEditProfileOpen(false);
      fetchProfile("me");
    }
  };

  // 5. Submit Stats
  const handleStatsSubmit = async (e) => {
      e.preventDefault();
      const result = await performUpdate({ skillStats: statsFormData });
      if (result.success) {
          setIsStatsModalOpen(false);
          fetchProfile("me");
      }
  };

  // --- MILESTONE LOGIC (Add/Edit/Delete/Import) ---

  const openAddMilestoneModal = () => {
      setMilestoneFormData({ year: '', milestone: '', description: '', skillsGained: '', type: 'Job' });
      setEditingMilestoneIndex(null);
      setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (index) => {
      const milestoneToEdit = profile.milestones[index];
      setMilestoneFormData(milestoneToEdit);
      setEditingMilestoneIndex(index);
      setIsMilestoneModalOpen(true);
  };

  const handleDeleteMilestone = async (index) => {
      if(!window.confirm("Are you sure you want to delete this experience?")) return;
      const currentMilestones = [...(profile?.milestones || [])];
      currentMilestones.splice(index, 1);

      const result = await performUpdate({ milestones: currentMilestones });
      if(result.success) fetchProfile("me");
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneFormData.year || !milestoneFormData.milestone) return;
    
    const currentMilestones = [...(profile?.milestones || [])];

    if (editingMilestoneIndex !== null) {
        currentMilestones[editingMilestoneIndex] = milestoneFormData;
    } else {
        currentMilestones.push(milestoneFormData);
    }

    const result = await performUpdate({ milestones: currentMilestones });
    if (result.success) {
      setIsMilestoneModalOpen(false);
      setMilestoneFormData({ year: '', milestone: '', description: '', skillsGained: '', type: 'Job' });
      setEditingMilestoneIndex(null);
      fetchProfile("me");
    }
  };

  // ✅ NEW: Handle Import from LinkedIn PDF
  const handleImportMilestones = async (newMilestones) => {
      const currentMilestones = profile?.milestones || [];
      const updatedMilestones = [...currentMilestones, ...newMilestones];
      
      const result = await performUpdate({ milestones: updatedMilestones });
      if(result.success) {
          toast.success(`Imported ${newMilestones.length} milestones!`);
          fetchProfile("me");
      } else {
          toast.error("Failed to import milestones.");
      }
  };

  // --- SKILLS ---

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (newSkillText.trim()) {
      const currentSkills = profile?.skills || [];
      if (currentSkills.includes(newSkillText.trim())) {
        setNewSkillText(''); setIsSkillInputOpen(false); return;
      }
      const updatedSkills = [...currentSkills, newSkillText.trim()];
      const result = await performUpdate({ skills: updatedSkills });
      if (result.success) {
        setNewSkillText(''); setIsSkillInputOpen(false); fetchProfile("me");
      }
    }
  };

  // ✅ NEW: Remove Skill Handler
  const handleRemoveSkill = async (skillToRemove) => {
    const currentSkills = profile?.skills || [];
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);
    const result = await performUpdate({ skills: updatedSkills });
    if(result.success) fetchProfile("me");
  };

  const handleStatChange = (index, field, value) => {
      setStatsFormData(prevStats => {
          const newStats = [...prevStats];
          newStats[index] = { ...newStats[index], [field]: value };
          return newStats;
      });
  };

  const handleRemoveStat = (index) => {
      const newStats = statsFormData.filter((_, i) => i !== index);
      setStatsFormData(newStats);
  };

  const handleAddStat = () => {
      setStatsFormData([...statsFormData, { subject: 'New Skill', A: 50, fullMark: 150 }]);
  };

  // --- RENDER ---
  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-400">
            <Loader2 className="w-10 h-10 animate-spin mb-2 text-neutral-900" />
            <p>Loading Profile...</p>
        </div>
    );
  }

  if (error || !profile) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-white">
              <div className="text-center">
                  <p className="text-neutral-500 mb-4">{error || "Profile not found"}</p>
                  <button onClick={() => fetchProfile("me")} className="px-4 py-2 bg-neutral-900 text-white rounded-lg">Retry</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-24">
      
      {/* HEADER SECTION */}
      <div className="border-b border-neutral-200 bg-white pt-12 pb-10 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(#B8B7B7FF_1px,transparent_1px)] bg-size-[16px_16px] opacity-40 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               
               {/* Avatar */}
               <div className="shrink-0 relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50 relative">
                    <img 
                      src={profile.profilePicture || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white w-6 h-6 mb-1" />
                        <span className="text-white text-xs font-bold">Change</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
               </div>

               {/* Info */}
               <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">{profile.name}</h1>
                        <p className="text-lg text-neutral-800 font-semibold mt-1 flex items-center gap-2">
                            <Briefcase size={18} className="text-neutral-400" />
                            {profile.currentCompany || profile.company || 'Company not set'}
                        </p>
                      </div>
                      
                      <button 
                          onClick={handleOpenEditModal}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition shadow-sm"
                      >
                          <Edit3 size={16} /> Edit Profile
                      </button>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
                      <span className="flex items-center gap-2">
                         <MapPin size={16} className="text-neutral-400" /> {profile.location || "Location not set"}
                      </span>
                  </div>

                  <p className="text-neutral-600 leading-relaxed max-w-3xl">
                      {profile.bio || "No bio added yet. Click 'Edit Profile' to add your professional summary."}
                  </p>

                  <div className="flex gap-4 pt-1">
                      {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-[#0077b5] transition"><Linkedin size={20} /></a>}
                      {socials.github && <a href={socials.github} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-black transition"><Github size={20} /></a>}
                      {socials.website && <a href={socials.website} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-emerald-600 transition"><Globe size={20} /></a>}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Row 1: Skills & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Stats Radar */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-lg">
                      <TrendingUp className="text-neutral-500 w-5 h-5" /> Professional Competency
                  </h3>
                  <button 
                      onClick={handleOpenStatsModal}
                      className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full hover:bg-neutral-900 hover:text-white transition"
                   >
                      Update Stats
                   </button>
               </div>
               <div className="h-[280px] w-full flex items-center justify-center">
                 {skillStats.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillStats}>
                       <PolarGrid stroke="#e5e5e5" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 11, fontWeight: 600 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                       <Radar name="Proficiency" dataKey="A" stroke="#171717" strokeWidth={2} fill="#171717" fillOpacity={0.1} />
                       <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                     </RadarChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="text-center text-neutral-400 text-sm">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>No stats available</p>
                        <button onClick={handleOpenStatsModal} className="text-neutral-900 font-bold mt-2 hover:underline">Add Stats</button>
                   </div>
                 )}
               </div>
            </div>

            {/* Skills Tags */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-8 shadow-sm flex flex-col">
               <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2 text-lg">
                  <Code className="text-neutral-500 w-5 h-5"/> Expertise & Tech
               </h3>
               <div className="flex-1 content-start flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                      <span key={i} className="group relative px-3 py-1.5 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-md text-sm font-medium hover:border-neutral-400 transition cursor-default flex items-center gap-1">
                          {skill}
                          <button onClick={() => handleRemoveSkill(skill)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition ml-1">
                             <X size={12} />
                          </button>
                      </span>
                  ))}
                  
                  {isSkillInputOpen ? (
                      <form onSubmit={handleAddSkillSubmit} className="inline-flex">
                          <input autoFocus type="text" value={newSkillText} onChange={(e) => setNewSkillText(e.target.value)} onBlur={() => !newSkillText && setIsSkillInputOpen(false)} className="px-3 py-1.5 text-sm border border-neutral-900 rounded-md outline-none w-32" placeholder="Type..." />
                      </form>
                  ) : (
                      <button onClick={() => setIsSkillInputOpen(true)} className="px-3 py-1.5 border border-dashed border-neutral-300 text-neutral-400 rounded-md text-sm font-medium hover:text-neutral-900 hover:border-neutral-900 transition flex items-center gap-2">
                          <Plus size={14} /> Add
                      </button>
                  )}
               </div>
            </div>
        </div>

        {/* Row 2: Journey Graph */}
        <div className="w-full">
           <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mb-8">
              <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                      <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                         <Briefcase className="text-neutral-500 w-5 h-5"/> Career Journey
                      </h2>
                  </div>
                  <button onClick={openAddMilestoneModal} className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                      <Plus size={16}/> Add Experience
                  </button>
              </div>
              
              <div className="p-8 w-full bg-neutral-50">
                 {/* ✅ INTEGRATED: Pass handleImportMilestones here */}
                 <JourneyGraphModule 
                   milestones={sortedMilestones} 
                   onAddClick={openAddMilestoneModal} 
                   onImport={handleImportMilestones}
                 />
              </div>
           </div>

           {/* Manage Experiences List */}
           {profile?.milestones && profile.milestones.length > 0 && (
             <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                    <h3 className="font-bold text-neutral-800 text-sm">Manage Experiences</h3>
                </div>
                <div className="divide-y divide-neutral-100">
                    {profile.milestones.map((milestone, index) => (
                        <div key={index} className="p-5 flex items-center justify-between group hover:bg-neutral-50 transition">
                            <div>
                                <h4 className="font-bold text-neutral-900 text-sm">{milestone.milestone}</h4>
                                <p className="text-xs text-neutral-500 mt-0.5">{milestone.year} • {milestone.type}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button 
                                    onClick={() => handleEditMilestone(index)}
                                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-white border border-transparent hover:border-neutral-200 rounded-lg transition" 
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteMilestone(index)}
                                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-neutral-200 rounded-lg transition" 
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

        {/* 1. Edit Profile Modal */}
        {isEditProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsEditProfileOpen(false)}></div>
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-neutral-900">Edit Profile</h3>
                        <button onClick={() => setIsEditProfileOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition"><X size={20} className="text-neutral-500"/></button>
                    </div>
                    <div className="overflow-y-auto p-8 custom-scrollbar">
                        <form id="edit-profile-form" onSubmit={handleEditProfileSubmit} className="space-y-6">
                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Full Name</label>
                                    <input type="text" className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                                </div>
                                {/* Alumni Specific: Role & Company */}
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Current Role</label>
                                    <input type="text" className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" value={editFormData.role} onChange={(e) => setEditFormData({...editFormData, role: e.target.value})} placeholder="e.g. Senior SDE" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Company</label>
                                    <input type="text" className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" value={editFormData.company} onChange={(e) => setEditFormData({...editFormData, company: e.target.value})} placeholder="e.g. Google" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Location</label>
                                <input type="text" className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" value={editFormData.location} onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Bio</label>
                                <textarea className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition resize-none h-32" value={editFormData.bio} onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})} placeholder="Tell us about your professional journey..."></textarea>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-neutral-100">
                                <h4 className="text-sm font-bold text-neutral-900">Social Links</h4>
                                <div className="flex items-center gap-3">
                                    <Linkedin className="text-neutral-400 w-5 h-5" />
                                    <input type="text" className="flex-1 p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" placeholder="LinkedIn URL" value={editFormData.linkedin} onChange={(e) => setEditFormData({...editFormData, linkedin: e.target.value})} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Github className="text-neutral-400 w-5 h-5" />
                                    <input type="text" className="flex-1 p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" placeholder="GitHub URL" value={editFormData.github} onChange={(e) => setEditFormData({...editFormData, github: e.target.value})} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="text-neutral-400 w-5 h-5" />
                                    <input type="text" className="flex-1 p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none transition" placeholder="Portfolio/Website URL" value={editFormData.website} onChange={(e) => setEditFormData({...editFormData, website: e.target.value})} />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                        <button form="edit-profile-form" type="submit" disabled={updateLoading} className="w-full py-3 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
                            {updateLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 2. Stats Modal */}
        {isStatsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsStatsModalOpen(false)}></div>
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-neutral-900">Update Competency Stats</h3>
                        <button onClick={() => setIsStatsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition"><X size={20} className="text-neutral-500"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar space-y-4">
                        {statsFormData.map((stat, index) => (
                            <div key={index} className="flex items-center gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                <div className="flex-1">
                                    <input type="text" value={stat.subject} onChange={(e) => handleStatChange(index, 'subject', e.target.value)} className="w-full bg-transparent text-sm font-bold text-neutral-900 outline-none mb-1" placeholder="Skill Name"/>
                                    <div className="flex items-center gap-2">
                                        <input type="range" min="0" max="150" step="1" value={stat.A || 0} onChange={(e) => handleStatChange(index, 'A', Number(e.target.value))} className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900" />
                                        <span className="text-xs font-mono font-medium text-neutral-500 w-8">{stat.A}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveStat(index)} className="text-neutral-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        <button onClick={handleAddStat} className="w-full py-2 border border-dashed border-neutral-300 text-neutral-500 rounded-xl text-sm font-bold hover:border-neutral-900 hover:text-neutral-900 transition flex items-center justify-center gap-2"><Plus size={16} /> Add New Metric</button>
                    </div>
                    <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                        <button onClick={handleStatsSubmit} disabled={updateLoading} className="w-full py-3 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800 transition">
                            {updateLoading ? <Loader2 className="animate-spin mx-auto" size={18}/> : 'Save Stats'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 3. Milestone Modal */}
        {isMilestoneModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm" onClick={() => setIsMilestoneModalOpen(false)}></div>
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden relative z-10">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-white">
                        <h3 className="text-sm font-bold text-neutral-900">
                            {editingMilestoneIndex !== null ? 'Edit Experience' : 'Add Experience'}
                        </h3>
                        <button onClick={() => setIsMilestoneModalOpen(false)}><X size={18} className="text-neutral-500 hover:text-neutral-700"/></button>
                    </div>
                    <form onSubmit={handleSaveMilestone} className="p-6 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Year</label>
                                <input type="number" className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none" value={milestoneFormData.year} onChange={(e) => setMilestoneFormData({...milestoneFormData, year: e.target.value})} required />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Type</label>
                                <select className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none" value={milestoneFormData.type} onChange={(e) => setMilestoneFormData({...milestoneFormData, type: e.target.value})}>
                                    <option>Job</option><option>Promotion</option><option>Education</option><option>Achievement</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Title</label>
                            <input type="text" className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none" value={milestoneFormData.milestone} onChange={(e) => setMilestoneFormData({...milestoneFormData, milestone: e.target.value})} required placeholder="e.g. Senior Software Engineer"/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Description</label>
                            <textarea className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 outline-none resize-none" rows="3" value={milestoneFormData.description} onChange={(e) => setMilestoneFormData({...milestoneFormData, description: e.target.value})} placeholder="Key achievements and responsibilities..."></textarea>
                        </div>
                        <button type="submit" disabled={updateLoading} className="w-full py-3 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800 transition">
                            {updateLoading ? <Loader2 className="animate-spin mx-auto" size={18}/> : (editingMilestoneIndex !== null ? 'Update Experience' : 'Save Experience')}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default AlumniSettings;