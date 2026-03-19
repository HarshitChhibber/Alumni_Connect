import React, { useState, useRef } from 'react';
import { 
  Save, Upload, Plus, Trash2, FileText, Code, Video, Mic, 
  Sparkles, Image as ImageIcon, Clock, CheckCircle, Layout, 
  Eye, Settings, X, ChevronRight, Calendar, MapPin, Globe
} from 'lucide-react';

const WorkshopCreator = () => {
  const [activeTab, setActiveTab] = useState('details'); // details | curriculum | settings | preview
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    description: '',
    price: '',
    seats: 50,
    mode: 'Online',
    date: '',
    time: '',
    duration: 0, // Calculated from agenda
    level: 'Beginner',
    tags: [],
    coverImage: null,
    coverImagePreview: null,
    agenda: [
      { title: 'Introduction & Welcome', type: 'Lecture', duration: 15 },
      { title: 'Core Concepts Deep Dive', type: 'Lecture', duration: 45 },
    ],
    resources: [],
    settings: {
      recordSession: true,
      issueCertificate: true,
      enableQnA: true
    }
  });

  // --- Mock AI Generation ---
  const handleAiGenerate = () => {
    if (!formData.title) return alert("Please enter a title first!");
    setIsAiLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        shortDesc: `Master ${prev.title} in this comprehensive workshop.`,
        description: `Join us for an intensive session on ${prev.title}. We will cover everything from the basics to advanced patterns. \n\nWhat you will learn:\n• Core principles\n• Industry best practices\n• Real-world applications\n\nPerfect for ${prev.level} developers looking to upskill.`,
        tags: ['Development', 'Career Growth', 'Upskilling']
      }));
      setIsAiLoading(false);
    }, 1500);
  };

  // --- Handlers ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, coverImage: file, coverImagePreview: previewUrl }));
    }
  };

  const handleAgendaChange = (index, field, value) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index][field] = value;
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const addAgendaStep = () => {
    setFormData(prev => ({
      ...prev, 
      agenda: [...prev.agenda, { title: '', type: 'Lecture', duration: 30 }]
    }));
  };

  const removeAgendaStep = (index) => {
    const newAgenda = formData.agenda.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, e.target.value] }));
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  // --- 1-Click Templates ---
  const templates = [
    { title: "Resume Mastery", level: "Beginner", tags: ["Career", "Soft Skills"], agenda: [{title: "ATS Secrets", type:"Lecture", duration: 30}, {title: "Live Reviews", type:"Hands-on", duration: 60}] },
    { title: "System Design 101", level: "Intermediate", tags: ["Architecture", "Backend"], agenda: [{title: "Scaling Basics", type:"Lecture", duration: 45}, {title: "Design Twitter", type:"Hands-on", duration: 60}] },
  ];

  const applyTemplate = (t) => {
    setFormData(prev => ({ ...prev, title: t.title, level: t.level, tags: t.tags, agenda: t.agenda }));
  };

  // --- Calculations ---
  const totalMinutes = formData.agenda.reduce((acc, item) => acc + parseInt(item.duration || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-900">
      
      {/* Header & Actions */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workshop Studio</h1>
          <p className="text-slate-500">Design immersive learning experiences.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-lg transition border border-transparent hover:border-slate-200">
            Save Draft
          </button>
          <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition transform hover:-translate-y-0.5">
            <Save className="w-4 h-4" /> Publish Live
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Navigation Sidebar (Desktop) or Topbar (Mobile) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completion</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-3/4 rounded-full"></div>
              </div>
            </div>
            <nav className="flex flex-col">
              {[
                { id: 'details', label: 'Basic Details', icon: Layout },
                { id: 'curriculum', label: 'Curriculum', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'preview', label: 'Live Preview', icon: Eye },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-4 text-sm font-medium border-l-4 transition-all ${
                    activeTab === item.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-slate-100 mt-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-500 mb-3">QUICK TEMPLATES</h4>
              <div className="space-y-2">
                {templates.map((t, i) => (
                  <button key={i} onClick={() => applyTemplate(t)} className="w-full text-left text-xs text-indigo-600 hover:underline flex items-center gap-1">
                     <Sparkles className="w-3 h-3" /> {t.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Main Content Form */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Workshop Details</h2>
                <button 
                  onClick={handleAiGenerate}
                  disabled={isAiLoading}
                  className="text-sm bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isAiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isAiLoading ? 'Generating...' : 'Auto-Fill with AI'}
                </button>
              </div>

              {/* Cover Image Upload */}
              <div 
                onClick={() => fileInputRef.current.click()}
                className="group relative w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer flex flex-col items-center justify-center overflow-hidden mb-8"
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                
                {formData.coverImagePreview ? (
                  <>
                    <img src={formData.coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <p className="text-white font-medium flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Change Cover</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-indigo-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Click to upload cover image</p>
                    <p className="text-xs text-slate-400">1200x600px recommended</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                    placeholder="e.g. Advanced System Design Patterns"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Level</label>
                    <select 
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (Press Enter)</label>
                     <div className="w-full p-2 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 bg-white flex flex-wrap gap-2 min-h-12">
                        {formData.tags.map(tag => (
                          <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            {tag} <button onClick={() => removeTag(tag)}><X className="w-3 h-3 hover:text-indigo-900"/></button>
                          </span>
                        ))}
                        <input 
                          onKeyDown={handleTagKeyDown}
                          className="flex-1 outline-none text-sm min-w-20"
                          placeholder="Add skill..."
                        />
                     </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Short Description</label>
                  <input 
                    value={formData.shortDesc} 
                    onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg outline-none text-sm" 
                    placeholder="A catchy one-liner for the card view..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Description</label>
                  <textarea 
                    rows="5"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm bg-slate-50" 
                    placeholder="Markdown supported. Describe prerequisites, goals, etc." 
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <button onClick={() => setActiveTab('curriculum')} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800">
                  Next: Curriculum <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Curriculum Builder</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" /> Total Duration: <span className="font-bold text-indigo-600">{totalHours}h {remainingMins}m</span>
                  </p>
                </div>
                <button onClick={addAgendaStep} className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Topic
                </button>
              </div>

              <div className="space-y-4">
                {formData.agenda.map((item, idx) => (
                  <div key={idx} className="group flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-200">
                    <div className="mt-3 text-slate-300 font-bold text-xl select-none">{(idx + 1).toString().padStart(2, '0')}</div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-7">
                        <label className="text-xs font-bold text-slate-500 uppercase">Topic Title</label>
                        <input 
                          value={item.title}
                          onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)}
                          className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-md text-sm font-medium outline-none focus:border-indigo-500"
                          placeholder="e.g. Introduction to Hooks"
                        />
                      </div>
                      <div className="md:col-span-3">
                         <label className="text-xs font-bold text-slate-500 uppercase">Format</label>
                         <select 
                           value={item.type}
                           onChange={(e) => handleAgendaChange(idx, 'type', e.target.value)}
                           className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-md text-sm outline-none"
                         >
                           <option>Lecture</option>
                           <option>Hands-on</option>
                           <option>Q&A</option>
                           <option>Break</option>
                         </select>
                      </div>
                      <div className="md:col-span-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Mins</label>
                         <input 
                           type="number"
                           value={item.duration}
                           onChange={(e) => handleAgendaChange(idx, 'duration', e.target.value)}
                           className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-md text-sm outline-none text-center"
                         />
                      </div>
                    </div>

                    <button onClick={() => removeAgendaStep(idx)} className="mt-3 text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                 <button onClick={() => setActiveTab('details')} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                 <button onClick={() => setActiveTab('settings')} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800">
                  Next: Settings <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & LOGISTICS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <h2 className="text-xl font-bold text-slate-800 mb-6">Logistics & Settings</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2  items-center gap-2"><Calendar className="w-4 h-4"/> Date</label>
                    <input type="date" className="w-full p-2 border border-slate-300 rounded bg-white" />
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2  items-center gap-2"><Clock className="w-4 h-4"/> Time (Start)</label>
                    <input type="time" className="w-full p-2 border border-slate-300 rounded bg-white" />
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                     <label className="block text-sm font-bold text-slate-700 mb-2  items-center gap-2"><Globe className="w-4 h-4"/> Mode</label>
                     <select className="w-full p-2 border border-slate-300 rounded bg-white">
                        <option>Online (Google Meet)</option>
                        <option>Online (Zoom)</option>
                        <option>Offline (University Hall)</option>
                     </select>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                     <label className="block text-sm font-bold text-slate-700 mb-2 items-center gap-2"><Layout className="w-4 h-4"/> Seats Limit</label>
                     <input type="number" defaultValue={50} className="w-full p-2 border border-slate-300 rounded bg-white" />
                  </div>
               </div>

               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Session Options</h3>
               <div className="space-y-3">
                 {Object.entries(formData.settings).map(([key, val]) => (
                   <div key={key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${val ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                           {key === 'recordSession' && <Video className="w-5 h-5" />}
                           {key === 'issueCertificate' && <CheckCircle className="w-5 h-5" />}
                           {key === 'enableQnA' && <Mic className="w-5 h-5" />}
                         </div>
                         <div>
                           <p className="font-bold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                           <p className="text-xs text-slate-500">Enable this feature for students</p>
                         </div>
                      </div>
                      
                      {/* Custom Toggle Switch */}
                      <button 
                        onClick={() => setFormData(prev => ({...prev, settings: {...prev.settings, [key]: !val}}))}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${val ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${val ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                 ))}
               </div>

               <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                 <button onClick={() => setActiveTab('curriculum')} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                 <button onClick={() => setActiveTab('preview')} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800">
                  Review & Publish <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-linear-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Ready to Launch?</h2>
                <p className="text-indigo-200 mb-6">Here is how your workshop will appear to students.</p>
                <button className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-full hover:scale-105 transition shadow-lg">
                  Confirm & Publish Workshop
                </button>
              </div>

              {/* The Preview Card */}
              <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform hover:-translate-y-1 transition duration-300">
                <div className="h-48 bg-slate-200 relative">
                   {formData.coverImagePreview ? (
                     <img src={formData.coverImagePreview} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200"><ImageIcon className="w-12 h-12" /></div>
                   )}
                   <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-indigo-600 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                     {formData.mode}
                   </span>
                </div>
                <div className="p-5">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{formData.level}</span>
                      {formData.settings.issueCertificate && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Cert. Included</span>}
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{formData.title || 'Untitled Workshop'}</h3>
                   <p className="text-sm text-slate-500 line-clamp-2 mb-4">{formData.shortDesc || 'No description added yet.'}</p>
                   
                   <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-b border-slate-100 py-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {totalHours}h {remainingMins}m</span>
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {formData.agenda.length} Sessions</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {formData.seats} Seats</span>
                   </div>

                   <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-900">{formData.price > 0 ? `₹${formData.price}` : 'Free'}</span>
                      <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg">Register Now</button>
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WorkshopCreator;