import React, { useState } from 'react';
import { 
  Calendar as CalIcon, Clock, Users, DollarSign, ExternalLink, 
  Copy, Plus, X, Trash2, Loader2, ChevronLeft, ChevronRight,
  Image as ImageIcon, Tag, MapPin, AlertCircle, CheckCircle
} from 'lucide-react';
import { useWorkshops } from '../../hooks/useWorkshops';

const WorkshopManager = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ✅ 1. Get submitVenueRequest from hook
  const { 
    workshops, stats, loading, 
    addWorkshop, removeWorkshop, submitVenueRequest 
  } = useWorkshops(activeTab);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', time: '10:00',
    mode: 'Online', price: '', capacity: 100, tags: '',
    requirements: '' // ✅ Added for Offline Requests
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- CALENDAR LOGIC (Standard) ---
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate);

  const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));
  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));

  const handleDayClick = (day) => {
    const clickedDate = new Date(viewYear, viewMonth, day);
    if (clickedDate < today) return;
    const formattedDate = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setFormData({ ...formData, date: formattedDate });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ 2. Handle Submit - Split Logic for Online vs Offline
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let result;

    if (formData.mode === 'Offline') {
      // --- A. OFFLINE: Submit Request (JSON) ---
      const requestData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        capacity: formData.capacity,
        requirements: formData.requirements // Send Requirements
      };
      result = await submitVenueRequest(requestData);
    } else {
      // --- B. ONLINE: Create Immediately (FormData for Image) ---
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('date', formData.date);
      payload.append('time', formData.time);
      payload.append('mode', 'Online');
      payload.append('price', formData.price === '' ? 0 : formData.price);
      payload.append('capacity', formData.capacity);
      payload.append('tags', formData.tags);
      if (imageFile) payload.append('image', imageFile);

      result = await addWorkshop(payload);
    }

    setSubmitting(false);
    
    if (result.success) {
        setIsModalOpen(false);
        if (formData.mode === 'Offline') {
            alert("Venue Request Sent! Waiting for Admin Approval.");
        }
        // Reset Form
        setFormData({ 
            title: '', description: '', date: '', time: '10:00', 
            mode: 'Online', price: '', capacity: 100, tags: '', requirements: '' 
        });
        setImageFile(null);
        setImagePreview('');
    } else {
        alert(result.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this workshop? This cannot be undone.')) {
      await removeWorkshop(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      {/* Header & Stats - No Changes */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Workshop Management</h1>
            <p className="text-slate-500 text-sm">Organize and manage your sessions</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setFormData({...formData, date: new Date().toISOString().split('T')[0]}) }}
          className="bg-neutral-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-neutral-900 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Workshop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <StatBox label="Total Registrations" value={stats.totalRegistrations || 0} icon={Users} color="blue" />
         <StatBox label="Revenue Earned" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Workshop Lists */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[650px]">
          <div className="flex border-b border-slate-200">
            {['upcoming', 'past', 'drafts'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition ${activeTab === tab ? 'text-neutral-800 border-b-2 border-neutral-800 bg-neutral-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
            {loading ? (
                <div className="flex justify-center items-center h-40 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading workshops...
                </div>
            ) : workshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <CalIcon className="w-12 h-12 mb-2 opacity-20"/>
                  <p>No {activeTab} workshops found.</p>
              </div>
            ) : (
              workshops.map((ws) => (
                <WorkshopCard 
                  key={ws.id} 
                  workshop={ws} 
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Calendar (No Changes needed here) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalIcon className="w-5 h-5 text-neutral-600" /> {monthLabel}
              </h3>
              <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight className="w-5 h-5" /></button>
              </div>
           </div>
           
           <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-slate-400 text-xs font-bold">{d}</div>)}
           </div>
           
           <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="h-10"></div>)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateToCheck = new Date(viewYear, viewMonth, day);
                  const isPast = dateToCheck < today;
                  const dayStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const hasEvent = workshops.some(ws => ws.date.startsWith(dayStr));
                  
                  return (
                    <button 
                      key={i}
                      disabled={isPast}
                      onClick={() => handleDayClick(day)}
                      className={`h-10 rounded-lg flex flex-col items-center justify-center relative transition border ${isPast ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-transparent' : hasEvent ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100' : 'bg-white border-transparent hover:bg-slate-100 text-slate-600'}`}
                    >
                      {day}
                      {hasEvent && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isPast ? 'bg-slate-300' : 'bg-indigo-600'}`}></span>}
                    </button>
                  )
              })}
           </div>
        </div>

      </div>

      {/* --- CREATE WORKSHOP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Schedule Workshop</h3>
                <p className="text-sm text-slate-500">Create a new session for your students.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Only show Image Upload if Online (Assuming offline requests don't need posters yet) */}
              {formData.mode === 'Online' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ImageIcon className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                            />
                        </div>
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-slate-200" />}
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Workshop Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Mastering System Design" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input required type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                  <select name="mode" value={formData.mode} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-neutral-500 outline-none">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline (Campus)</option>
                  </select>
                </div>
                
                {/* Price only for Online (Assuming offline is free for now or handled differently) */}
                {formData.mode === 'Online' && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0 for Free" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none" />
                    </div>
                )}
                
                <div className={formData.mode === 'Offline' ? "col-span-2" : ""}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none" />
                </div>
              </div>

              {/* ✅ CONDITIONAL: Show Requirements for Offline, Tags for Online */}
              {formData.mode === 'Offline' ? (
                 <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <label className="block text-sm font-bold text-amber-800 mb-1 items-center gap-2">
                        <AlertCircle className="w-4 h-4"/> Venue Requirements
                    </label>
                    <textarea required rows="2" name="requirements" value={formData.requirements} onChange={handleInputChange} placeholder="e.g. Projector, Mic, Whiteboard, 50 Chairs..." className="w-full p-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-white" />
                    <p className="text-xs text-amber-600 mt-1">This request will be sent to the Admin for approval.</p>
                 </div>
              ) : (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="React, Backend (Comma separated)" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none" />
                    </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows="3" name="description" value={formData.description} onChange={handleInputChange} placeholder="What will be covered?" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none resize-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button disabled={submitting} type="submit" className="flex-1 py-2.5 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-900 shadow-md transition flex justify-center items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                    formData.mode === 'Offline' ? 'Request Venue' : 'Publish Workshop'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Workshop Card (Updated) ---
const WorkshopCard = ({ workshop, onDelete }) => {
  const isPending = workshop.status === 'Pending';
  const isOffline = workshop.mode === 'Offline';
  
  return (
    <div className={`border rounded-xl overflow-hidden hover:shadow-lg transition bg-white group relative flex flex-col sm:flex-row h-auto sm:h-44 ${isPending ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
      
      {/* Image Side */}
      <div className="w-full sm:w-48 h-32 sm:h-full relative shrink-0">
         <img 
            src={workshop.image || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"} 
            alt={workshop.title} 
            className={`w-full h-full object-cover ${isPending && 'grayscale opacity-70'}`}
         />
         <div className="absolute top-2 left-2">
             <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide shadow-sm 
                ${isPending ? 'bg-amber-100 text-amber-700' 
                : isOffline ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-white/90 text-slate-800'}`}>
                {isPending ? 'Pending Approval' : workshop.mode}
             </span>
         </div>
      </div>

      {/* Content Side */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{workshop.title}</h4>
            <button onClick={() => onDelete(workshop.id)} className="text-slate-300 hover:text-red-500 transition">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500 mt-2 mb-3">
            <span className="flex items-center gap-1"><CalIcon className="w-3.5 h-3.5"/> {workshop.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {workshop.time}</span>
            {workshop.price > 0 && <span className="flex items-center gap-1 font-semibold text-slate-700"><DollarSign className="w-3.5 h-3.5"/> {workshop.price}</span>}
        </div>

        {/* ✅ DYNAMIC FOOTER: Meeting Code OR Venue OR Pending Status */}
        {isPending ? (
            <div className="mt-auto bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center gap-2 text-amber-700 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Venue assignment in progress by Admin.</span>
            </div>
        ) : isOffline ? (
            <div className="mt-auto bg-indigo-50 border border-indigo-100 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase block">Assigned Venue</span>
                        <span className="text-sm font-bold">{workshop.assignedVenue || "To Be Announced"}</span>
                    </div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
        ) : (
            // Standard Online Meeting Code
            workshop.meetingCode ? (
                <div className="mt-auto bg-neutral-50 border border-neutral-100 rounded-lg p-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Meeting Code</span>
                        <code className="text-sm font-mono font-bold text-neutral-800">{workshop.meetingCode}</code>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => {navigator.clipboard.writeText(workshop.meetingCode); alert('Copied!')}} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><Copy className="w-4 h-4"/></button>
                        <a href="https://callora.vercel.app/" target="_blank" rel="noreferrer" className="px-3 py-2 bg-neutral-800 text-white text-xs font-bold rounded hover:bg-neutral-900 flex items-center gap-1">
                            Launch <ExternalLink className="w-3 h-3"/>
                        </a>
                    </div>
                </div>
            ) : null
        )}
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const StatBox = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-lg ${colors[color]}`}><Icon className="w-6 h-6" /></div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
        </div>
    )
}

export default WorkshopManager;