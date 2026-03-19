import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Users, Star, Clock, 
  CheckCircle, Video, MessageSquare, FileText, 
  ChevronRight, PlayCircle, Search, Loader2,
  Copy
} from 'lucide-react';
import { 
  fetchAllWorkshops, 
  fetchStudentWorkshops 
} from '../../api/workshopService'; // Removed registerWorkshop as it's handled by the hook now

// Import your payment hook (Ensure the path is correct based on your folder structure)
import { useWorkshopPayment } from '../../hooks/useWorkshopPayment'; 

// --- SUB-COMPONENTS ---

// 1. Workshop Listing Card
// Updated: Added 'processing' prop to disable button during payment
const WorkshopCard = ({ workshop, onViewDetails, onRegister, processing }) => (
  <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-neutral-200 transition-all duration-300 flex flex-col h-full">
    {/* Image Header */}
    <div className="h-32 overflow-hidden relative shrink-0">
      <img 
        src={workshop.image || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"} 
        alt={workshop.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div className="absolute top-2 right-2 flex gap-2">
        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" /> 4.9
        </span>
      </div>
      <div className="absolute bottom-2 left-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${workshop.price === 0 ? 'bg-emerald-500 text-white' : 'bg-neutral-600 text-white'}`}>
          {workshop.price === 0 ? 'Free' : `₹${workshop.price}`}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col flex-1">
      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-neutral-600 transition-colors line-clamp-1">
        {workshop.title}
      </h3>
      
      <div className="flex items-center gap-2 mb-3">
        <img src={workshop.hostImg || "https://ui-avatars.com/api/?name=" + workshop.host} alt={workshop.host} className="w-6 h-6 rounded-full" />
        <p className="text-xs text-slate-500 truncate">By <span className="font-medium text-slate-700">{workshop.host}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 mt-auto">
        <div className="flex items-center gap-1.5"><Calendar size={14}/> {workshop.date}</div>
        <div className="flex items-center gap-1.5"><Users size={14}/> {Math.max(0, workshop.seats - workshop.seatsFilled)} seats left</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        {workshop.isRegistered ? (
          <button disabled className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-default">
            <CheckCircle size={14} /> Registered
          </button>
        ) : (
          <button 
            disabled={processing}
            onClick={(e) => { e.stopPropagation(); onRegister(workshop); }}
            className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-neutral-600 transition flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-wait"
          >
            {processing ? <Loader2 className="animate-spin w-3 h-3"/> : 'Register'}
          </button>
        )}
        <button onClick={onViewDetails} className="p-2 text-slate-500 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg transition border border-slate-200">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </div>
);

// 2. Workshop Details View
// Updated: Added 'processing' prop to disable button during payment
const WorkshopDetails = ({ workshop, onBack, onRegister, loading, processing }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
    <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-neutral-600 mb-4 flex items-center gap-1">
      <ChevronRight size={14} className="rotate-180" /> Back to Workshops
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative h-64 rounded-2xl overflow-hidden group">
          <img 
            src={workshop.image || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"} 
            className="w-full h-full object-cover" 
            alt="Cover" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex gap-2 mb-2">
               {workshop.tags && workshop.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider">{tag}</span>)}
            </div>
            <h1 className="text-3xl font-bold mb-2">{workshop.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-200">
              <span className="flex items-center gap-1.5"><Calendar size={16}/> {workshop.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={16}/> {workshop.time}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-neutral-600"/> Agenda & Syllabus
          </h3>
          <div className="space-y-4">
            {['Introduction & Key Concepts', 'Deep Dive into Architecture', 'Hands-on Coding Session', 'Live Q&A'].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-neutral-50 text-neutral-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</div>
                <p className="text-sm text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-slate-900">{workshop.price === 0 ? 'Free' : `₹${workshop.price}`}</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">Open</span>
          </div>
          
          {workshop.isRegistered ? (
             <button disabled className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold cursor-default mb-3 flex items-center justify-center gap-2">
               <CheckCircle size={16} /> Seat Secured
             </button>
          ) : (
            <button 
              onClick={() => onRegister(workshop)}
              disabled={loading || processing}
              className="w-full bg-neutral-600 text-white py-3 rounded-xl font-bold hover:bg-neutral-700 transition shadow-neutral-200 shadow-lg mb-3 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {(loading || processing) ? <Loader2 className="animate-spin w-4 h-4" /> : 'Secure Your Seat'}
            </button>
          )}
          <p className="text-xs text-center text-slate-500">Limited seats available</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <img src={workshop.hostImg || "https://ui-avatars.com/api/?name=" + workshop.host} className="w-12 h-12 rounded-full object-cover" alt="Host"/>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{workshop.host}</h4>
              <p className="text-xs text-slate-500">{workshop.hostRole}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 3. My Workshops (Dashboard) - Unchanged
const MyWorkshops = ({ registered, completed, loading }) => {
  const [activeTab, setActiveTab] = useState('registered');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {['registered', 'completed'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-neutral-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-600 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'registered' ? (
           registered.length === 0 ? (
             <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">You haven't registered for any workshops yet.</div>
           ) : (
             registered.map(ws => (
              <div key={ws.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                <div className="w-full sm:w-48 h-28 shrink-0 rounded-lg overflow-hidden relative">
                  <img src={ws.image} className="w-full h-full object-cover" alt="Workshop"/>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayCircle size={32} className="text-white/80" /></div>
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="font-bold text-slate-900 mb-1">{ws.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">Host: {ws.host} • {ws.date} at {ws.time}</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {ws.meetingCode ? (
                          <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs w-full justify-between sm:justify-start">
                                <span className="font-bold">Code:</span> 
                                <code className="font-mono text-sm">{ws.meetingCode}</code>
                                <button onClick={() => {navigator.clipboard.writeText(ws.meetingCode); alert("Code copied!")}} className="hover:text-emerald-900"><Copy size={14}/></button>
                            </div>
                            <a 
                                href="https://callora.vercel.app/" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-black transition flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                                <Video size={14} /> Join Now
                            </a>
                        </div>
                      ) : (
                         <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-bold cursor-not-allowed flex items-center gap-2">
                            <Clock size={14} /> Link available 5 mins before start
                         </button>
                      )}
                  </div>

                </div>
              </div>
             ))
           )
        ) : (
           completed.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">No completed workshops.</div>
           ) : (
             completed.map(ws => (
              <div key={ws.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-5 shadow-sm opacity-90">
                <div className="w-full sm:w-48 h-28 shrink-0 rounded-lg overflow-hidden grayscale">
                   <img src={ws.image} className="w-full h-full object-cover" alt="Workshop"/>
                </div>
                <div className="flex-1 w-full">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <h3 className="font-bold text-slate-900">{ws.title}</h3>
                       <p className="text-xs text-slate-500">Completed on {ws.date}</p>
                     </div>
                     <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full"><CheckCircle size={16}/></div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      <button className="py-2 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-500 hover:border-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-2 transition">
                         <MessageSquare size={14}/> Feedback
                      </button>
                   </div>
                </div>
              </div>
             ))
           )
        )}
      </div>
    </div>
  );
};


// --- MAIN LAYOUT COMPONENT ---
const WorkshopsModule = () => {
  const [view, setView] = useState('list');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  
  // Data States
  const [allWorkshops, setAllWorkshops] = useState([]);
  const [myWorkshops, setMyWorkshops] = useState({ registered: [], completed: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // --- INTEGRATING PAYMENT HOOK ---
  const { handleRegister: initiatePayment, processing: paymentProcessing } = useWorkshopPayment();

  // Retrieve user data for Razorpay Prefill (Optional but recommended)
  // Assuming you store user in localStorage or have a Context. 
  // If not, you can pass null, but Razorpay will ask user to type email manually.
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student', email: '', phone: '' };

  // 1. Fetch Data Logic
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (view === 'list' || view === 'details') {
        const data = await fetchAllWorkshops({ search, filter: activeFilter });
        setAllWorkshops(data);
      } else if (view === 'my-workshops') {
        const data = await fetchStudentWorkshops();
        setMyWorkshops(data);
      }
    } catch (error) {
      console.error("Failed to load workshops", error);
    } finally {
      setLoading(false);
    }
  }, [view, search, activeFilter]);

  // Trigger Fetch on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  // 2. Handle Registration (UPDATED FOR PAYMENT)
  const handleRegister = async (workshop) => {
    // If passed only ID (legacy support), find the workshop
    const targetWorkshop = typeof workshop === 'string' 
        ? allWorkshops.find(w => w.id === workshop) 
        : workshop;

    if(!targetWorkshop) return;

    // Use the Hook's logic
    await initiatePayment(targetWorkshop, user, () => {
        // --- ON SUCCESS CALLBACK ---
        // Only update UI here after successful payment/registration
        setAllWorkshops(prev => prev.map(ws => 
            ws.id === targetWorkshop.id 
            ? { ...ws, isRegistered: true, seatsFilled: ws.seatsFilled + 1 } 
            : ws
        ));

        // Also update selected view if open
        if(selectedWorkshop && selectedWorkshop.id === targetWorkshop.id) {
            setSelectedWorkshop(prev => ({...prev, isRegistered: true}));
        }
    });
  };

  const handleViewDetails = (workshop) => {
    setSelectedWorkshop(workshop);
    setView('details');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 sm:p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Workshops</h1>
           <p className="text-xs text-slate-500">Learn from the best alumni in the industry</p>
         </div>
         
         <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setView('list')} 
             className={`px-4 py-2 rounded-lg text-xs font-bold transition ${view === 'list' || view === 'details' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             Explore
           </button>
           <button 
             onClick={() => setView('my-workshops')} 
             className={`px-4 py-2 rounded-lg text-xs font-bold transition ${view === 'my-workshops' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             My Learning
           </button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* 6️⃣ WORKSHOPS LIST */}
        {view === 'list' && (
          <div className="animate-in fade-in duration-500">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
               <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                  {['All', 'Upcoming', 'Popular', 'Free', 'Paid'].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition ${activeFilter === filter ? 'bg-neutral-600 border-neutral-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {filter}
                    </button>
                  ))}
               </div>
               <div className="relative w-full sm:w-64">
                 <Search size={14} className="absolute left-3 top-3 text-slate-400"/>
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search topics..." 
                   className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-500 transition" 
                 />
               </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400 w-8 h-8"/></div>
            ) : allWorkshops.length === 0 ? (
               <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-xl">
                 <p className="text-slate-500 font-medium">No workshops found matching your criteria.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allWorkshops.map(workshop => (
                  <WorkshopCard 
                    key={workshop.id} 
                    workshop={workshop} 
                    onViewDetails={() => handleViewDetails(workshop)} 
                    onRegister={handleRegister}
                    processing={paymentProcessing} // Pass processing state to disable button
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7️⃣ WORKSHOP DETAILS */}
        {view === 'details' && selectedWorkshop && (
          <WorkshopDetails 
            workshop={selectedWorkshop} 
            onBack={() => setView('list')} 
            onRegister={handleRegister}
            loading={loading}
            processing={paymentProcessing} // Pass processing state
          />
        )}

        {/* 8️⃣ MY WORKSHOPS */}
        {view === 'my-workshops' && (
          <div className="animate-in fade-in duration-500">
             <MyWorkshops 
               registered={myWorkshops.registered} 
               completed={myWorkshops.completed} 
               loading={loading}
             />
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkshopsModule;