import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  ChevronDown, 
  MessageCircle, 
  User,
  GraduationCap,
  Building2,
  X,
  Loader2,
  Users,
  Send // Added Send icon
} from 'lucide-react';

import { useExplore } from '../../hooks/useProfile';

// ✅ IMPORT: API Service for sending requests
import { sendConnectionRequest } from '../../api/connectionService';

// --- Static Filter Options ---
const FILTERS = [
  {
    id: 'domain',
    label: 'Domain',
    options: ['Engineering', 'Product', 'Data Science', 'Design', 'Finance']
  },
  {
    id: 'batch',
    label: 'Class Batch',
    options: ['2024', '2023', '2022', '2021', '2020', 'Older']
  },
  {
    id: 'location',
    label: 'Location',
    options: ['Bangalore', 'Mumbai', 'Delhi NCR', 'USA', 'Remote']
  }
];

const FilterSection = ({ title, options, selected, onChange, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-slate-100 py-5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-bold text-slate-800 hover:text-neutral-600 transition-colors group"
      >
        {title}
        <span className={`p-1 rounded-full group-hover:bg-neutral-50 transition-all ${isOpen ? 'rotate-180' : ''}`}>
           <ChevronDown size={14} />
        </span>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-2.5">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={selected?.includes(option)}
                  onChange={() => onChange(option)}
                  className="peer appearance-none h-4 w-4 border border-slate-300 rounded bg-white checked:bg-neutral-600 checked:border-neutral-600 focus:ring-2 focus:ring-neutral-100 transition-all"
                />
                <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Updated AlumniCard to accept onConnect prop
// New AlumniCard Component
const AlumniCard = ({ data, onClick, onConnect }) => {
  // Helper to get initials
  const initials = data.name 
    ? data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AL';

  return (
    <div 
      onClick={() => onClick(data._id || data.id)}
      className="group relative bg-white rounded-3xl border border-slate-200 p-6 flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-indigo-100 cursor-pointer h-full overflow-hidden"
    >
      
      {/* Top Decorative Gradient (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-slate-200 to-transparent opacity-50 group-hover:via-neutral-500 group-hover:opacity-100 transition-all duration-500"></div>

      {/* Featured Badge */}
      {data.isFeatured && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-100 shadow-sm">
           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Top Mentor
        </div>
      )}

      {/* --- HEADER: Identity --- */}
      <div className="flex items-start gap-4 mb-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 font-bold text-xl overflow-hidden group-hover:ring-4 group-hover:ring-slate-50 transition-all">
             {data.profilePicture ? (
               <img src={data.profilePicture} alt={data.name} className="w-full h-full object-cover" />
             ) : (
               initials
             )}
          </div>
          {/* Online/Verified Dot (Optional decoration) */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
             <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Name & Role */}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {data.name}
          </h3>
          <p className="text-sm font-medium text-slate-500 truncate">
            {data.role || 'Alumni Member'}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-400">
            <Building2 size={12} />
            <span className="truncate max-w-[150px]">{data.currentCompany || 'Unknown Company'}</span>
          </div>
        </div>
      </div>

      {/* --- BODY: Attributes --- */}
      <div className="flex items-center gap-2 mb-5">
         {data.batch && (
           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 text-xs font-semibold">
              <GraduationCap size={12} className="text-slate-400" /> '{String(data.batch).slice(-2)}
           </span>
         )}
         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 text-xs font-semibold">
            <MapPin size={12} className="text-slate-400" /> {data.location || 'Remote'}
         </span>
         {data.experience && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 text-xs font-semibold">
              <Briefcase size={12} className="text-slate-400" /> {data.experience}
           </span>
         )}
      </div>

      {/* --- BODY: Skills --- */}
      <div className="flex-1 mb-6">
         <div className="flex flex-wrap gap-2">
            {data.skills && data.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500 shadow-sm">
                  {skill}
                </span>
            ))}
            {data.skills && data.skills.length > 3 && (
                <span className="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 rounded-lg">
                   +{data.skills.length - 3}
                </span>
            )}
         </div>
      </div>

      {/* --- FOOTER: Actions --- */}
      <div className="grid grid-cols-2 gap-3 mt-auto pt-5 border-t border-slate-50">
         <button 
           onClick={(e) => { e.stopPropagation(); onClick(data._id || data.id); }} 
           className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
         >
           View Profile
         </button>
         <button 
           onClick={(e) => { 
               e.stopPropagation(); 
               onConnect(); 
           }}
           className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 shadow-sm hover:shadow-indigo-200 transition-all group/btn"
         >
           <Send size={12} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" /> Connect
         </button>
      </div>

    </div>
  );
};
// --- MAIN PAGE COMPONENT ---

export default function AlumniExplorer() {
  const navigate = useNavigate();
  const { fetchExplore, profiles, loading } = useExplore();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedFilters, setSelectedFilters] = useState({
      domain: [],
      batch: [],
      location: []
  });

  // --- Modal State ---
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // --- Data Safety Layer ---
  const alumniList = useMemo(() => {
    if (Array.isArray(profiles)) return profiles;
    if (profiles && Array.isArray(profiles.data)) return profiles.data;
    if (profiles && Array.isArray(profiles.users)) return profiles.users;
    return [];
  }, [profiles]);

  // --- Fetch Data Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const apiFilters = {
        role: 'alumni',
        search: searchTerm,
      };
      
      console.log("Fetching Alumni with filters:", apiFilters);
      fetchExplore(apiFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchExplore]); 

  // --- Filter Handlers ---
  const toggleFilter = (category, value) => {
      setSelectedFilters(prev => {
          const current = prev[category];
          const updated = current.includes(value) 
              ? current.filter(item => item !== value)
              : [...current, value];
          return { ...prev, [category]: updated };
      });
  };

  const handleViewProfile = (id) => {
      navigate(`/profile/${id}`);
  };

  // --- Connection Handlers ---
  const openConnectModal = (alumni) => {
    setSelectedAlumni(alumni);
    const firstName = alumni.name ? alumni.name.split(' ')[0] : 'there';
    const company = alumni.currentCompany || 'your company';
    setMessageText(`Hi ${firstName}, \n\nI am a student interested in your work at ${company}. I would love to connect and learn from your experience.`);
  };

  const handleConnect = async () => {
    if (!messageText.trim()) return;
    
    setSending(true);
    try {
      const targetId = selectedAlumni._id || selectedAlumni.id;
      // ✅ Call Real API
      await sendConnectionRequest(targetId, messageText);
      
      alert(`Request sent to ${selectedAlumni.name}!`);
      
      // Cleanup
      setSelectedAlumni(null);
      setMessageText("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send request.";
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-neutral-50/50 to-transparent pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                    Alumni <span className="text-neutral-600">Network</span>
                </h1>
                <p className="text-slate-500 mt-3 text-lg leading-relaxed">
                    Connect with <span className="font-semibold text-slate-900">{alumniList.length}+ alumni</span> working at top companies. Find a mentor who has walked your path.
                </p>
            </div>
            
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50"
            >
                <Filter size={16} /> Filter Results
            </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-2 max-w-4xl mb-10 mx-auto transform -translate-y-2 sticky top-4 z-20">
            <div className="pl-4 text-slate-400">
                <Search size={20} />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, company, role, or skills..."
                className="flex-1 py-3 px-2 bg-transparent outline-none text-slate-700 placeholder-slate-400 font-medium"
            />
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-neutral-600 transition-colors shadow-md">
                Search
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sidebar Filters */}
            <aside className="hidden lg:block col-span-1 sticky top-28">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                            <Filter size={20} className="text-neutral-600" />
                            <span>Filters</span>
                        </div>
                        <button 
                            onClick={() => setSelectedFilters({ domain: [], batch: [], location: [] })}
                            className="text-xs font-bold text-slate-400 hover:text-neutral-600 uppercase tracking-wide transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                    
                    {FILTERS.map((filter) => (
                        <FilterSection 
                            key={filter.id} 
                            title={filter.label} 
                            options={filter.options}
                            selected={selectedFilters[filter.id]}
                            onChange={(val) => toggleFilter(filter.id, val)}
                            isOpenDefault={['domain', 'batch'].includes(filter.id)} 
                        />
                    ))}
                </div>
            </aside>

            {/* Main Grid */}
            <section className="col-span-1 lg:col-span-3">
                <div className="flex items-center justify-between mb-6 px-1">
                    <p className="text-sm font-medium text-slate-500">
                        Showing <span className="font-bold text-slate-900">{alumniList.length}</span> alumni
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                    </div>
                ) : alumniList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Users className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No alumni found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {alumniList.map((alumni) => (
                            <AlumniCard 
                                key={alumni._id || alumni.id} 
                                data={alumni} 
                                onClick={handleViewProfile} 
                                onConnect={() => openConnectModal(alumni)} // ✅ Trigger Connect Modal
                            />
                        ))}
                    </div>
                )}

                {/* Load More (Placeholder) */}
                {alumniList.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <button className="px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                            Load More Alumni
                        </button>
                    </div>
                )}
            </section>

        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 lg:hidden flex justify-end">
            <div className="w-80 bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>
                {FILTERS.map((filter) => (
                    <FilterSection 
                        key={filter.id} 
                        title={filter.label} 
                        options={filter.options}
                        selected={selectedFilters[filter.id]}
                        onChange={(val) => toggleFilter(filter.id, val)}
                        isOpenDefault={true} 
                    />
                ))}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-neutral-200"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ✅ Connect Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-bold text-neutral-900">Connect with {selectedAlumni.name}</h3>
                 <button onClick={() => setSelectedAlumni(null)} className="text-neutral-400 hover:text-neutral-800 transition"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex items-center gap-3 mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                 <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {selectedAlumni.profilePicture ? (
                        <img src={selectedAlumni.profilePicture} alt="Avatar" className="w-full h-full object-cover"/>
                    ) : (
                        (selectedAlumni.name?.charAt(0) || 'A')
                    )}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-neutral-900">{selectedAlumni.name}</p>
                    <p className="text-xs text-neutral-500">{selectedAlumni.currentCompany || 'Alumni'}</p>
                 </div>
              </div>
              
              <textarea 
                className="w-full h-32 p-3 border border-neutral-300 rounded-xl text-sm outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 resize-none mb-4 bg-white placeholder-neutral-400"
                placeholder="Write your connection request..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              ></textarea>
              
              <button 
                onClick={handleConnect} 
                disabled={sending}
                className="w-full py-3 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-900 transition flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
              >
                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
              </button>
           </div>
        </div>
      )}

    </div>
  );
}