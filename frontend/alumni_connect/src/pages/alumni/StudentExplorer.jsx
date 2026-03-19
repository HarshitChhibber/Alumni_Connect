import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Github, FileText, Send, 
  User, Briefcase, X, Loader2, Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useExplore } from '../../hooks/useProfile';

// ✅ IMPORT: API Service for sending requests
import { sendConnectionRequest } from '../../api/connectionService';

const StudentExplorer = () => {
  const { fetchExplore, profiles, loading, error } = useExplore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: 'All',
    branch: 'All Branches'
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // --- Data Safety Layer ---
  const studentList = useMemo(() => {
    if (Array.isArray(profiles)) return profiles;
    if (profiles && Array.isArray(profiles.data)) return profiles.data;
    if (profiles && Array.isArray(profiles.users)) return profiles.users;
    return [];
  }, [profiles]);

  // --- FETCH DATA EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const apiFilters = {
        search: searchTerm,
        role: 'student', 
        year: filters.year !== 'All' ? filters.year : undefined,
        branch: filters.branch !== 'All Branches' ? filters.branch : undefined,
      };
      fetchExplore(apiFilters);
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchTerm, filters, fetchExplore]);

  // --- HANDLERS ---

  const handleNavigateToProfile = (studentId) => {
    navigate(`/alumni/student-profile/${studentId}`);
  };

  const openConnectModal = (student) => {
    setSelectedStudent(student);
    const firstName = student.name ? student.name.split(' ')[0] : 'there';
    const skill = (student.skills && student.skills.length > 0) ? student.skills[0] : 'your field';
    setMessageText(`Hi ${firstName}, \n\nI saw your profile and skills in ${skill}. I have an opportunity that might fit you.`);
  };

  // ✅ UPDATED: Real API Implementation
  const handleConnect = async () => {
    if (!messageText.trim()) return;
    
    setSending(true);
    try {
      const targetId = selectedStudent._id || selectedStudent.id;
      
      // 1. Call the API
      await sendConnectionRequest(targetId, messageText);
      
      // 2. Success Feedback
      alert(`Request sent to ${selectedStudent.name}! You can chat once they accept.`);
      
      // 3. Reset State
      setSelectedStudent(null);
      setMessageText("");

    } catch (err) {
      console.error("Connection Request Failed:", err);
      // Handle specific error messages from backend
      const errorMsg = err.response?.data?.message || "Failed to send request. You might already be connected.";
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const clearFilters = () => {
    setFilters({ year: 'All', branch: 'All Branches' });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                Student Directory 
                <span className="bg-neutral-200 text-neutral-800 text-xs px-2 py-1 rounded-full font-medium border border-neutral-300">
                  {studentList.length} Found
                </span>
              </h1>
              <p className="text-neutral-500 text-sm">Discover and mentor the next generation of talent.</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative group w-full md:w-72">
                <Search className="absolute left-3 top-2.5 text-neutral-400 w-4 h-4 group-focus-within:text-neutral-800 transition" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, skill, or role..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-500 focus:border-transparent outline-none transition placeholder-neutral-400" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 mb-8">
          <StatCard label="Total Candidates Registered" value={studentList.length} icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FILTERS SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <button onClick={clearFilters} className="text-xs text-neutral-600 font-bold hover:text-neutral-900 underline decoration-dotted">
                  Reset
                </button>
              </div>
              
              {/* Year Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Academic Year</h4>
                <div className="space-y-2">
                  {['All', '1st', '2nd', '3rd', '4th'].map(y => (
                    <label key={y} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition group">
                      <input 
                        type="radio" 
                        name="year" 
                        checked={filters.year === y} 
                        onChange={() => setFilters({...filters, year: y})}
                        className="w-4 h-4 text-neutral-800 border-neutral-300 focus:ring-neutral-500 accent-neutral-800" 
                      />
                      <span className={`text-sm font-medium group-hover:text-neutral-900 ${filters.year === y ? 'text-neutral-900' : 'text-neutral-500'}`}>
                        {y === 'All' ? 'All Years' : `${y} Year`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Branch Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Department</h4>
                <select 
                  value={filters.branch}
                  onChange={(e) => setFilters({...filters, branch: e.target.value})}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <option>All Branches</option>
                  <option>Computer Science (CSE)</option>
                  <option>Electronics (ECE)</option>
                  <option>Mechanical</option>
                  <option>Civil</option>
                </select>
              </div>
            </div>
          </div>

          {/* STUDENTS GRID */}
          <div className="lg:col-span-3">
            {error && (
                <div className="p-4 mb-4 bg-red-50 text-red-500 rounded-xl border border-red-100 text-sm text-center">
                    Error loading profiles: {error}
                </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
              </div>
            ) : studentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                   <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No students found</h3>
                <p className="text-neutral-500 text-sm">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="mt-4 text-neutral-800 font-bold text-sm hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentList.map((student) => (
                  <StudentCard 
                    key={student._id || student.id } 
                    student={student} 
                    onConnect={() => openConnectModal(student)}
                    onClick={() => handleNavigateToProfile(student._id || student.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* CONNECT MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-neutral-200">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-bold text-neutral-900">Reach out to {selectedStudent.name?.split(' ')[0]}</h3>
                 <button onClick={() => setSelectedStudent(null)} className="text-neutral-400 hover:text-neutral-800 transition"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex items-center gap-3 mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                 <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {selectedStudent.profilePicture ? (
                        <img src={selectedStudent.profilePicture} alt="Avatar" className="w-full h-full object-cover"/>
                    ) : (
                        (selectedStudent.name?.charAt(0) || 'U')
                    )}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-neutral-900">{selectedStudent.name}</p>
                    <p className="text-xs text-neutral-500">{selectedStudent.goal || 'Student'}</p>
                 </div>
              </div>
              
              <textarea 
                className="w-full h-32 p-3 border border-neutral-300 rounded-xl text-sm outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 resize-none mb-4 bg-white placeholder-neutral-400"
                placeholder="Write your message here..."
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
};

// --- Helper Components ---

const StudentCard = ({ student, onConnect, onClick }) => {
  const socials = student.socials || {};
  const skills = student.skills || [];

  return (
    <div 
        onClick={onClick} 
        className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group cursor-pointer"
    >
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 font-bold text-lg group-hover:bg-neutral-800 group-hover:text-white transition-colors duration-300 overflow-hidden">
            {student.profilePicture ? (
                <img src={student.profilePicture} alt={student.name} className="w-full h-full object-cover" />
            ) : (
                (student.name?.charAt(0) || 'U')
            )}
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 group-hover:text-neutral-600 transition">{student.name || 'Anonymous'}</h3>
            <p className="text-xs text-neutral-500 font-medium">
                {student.branch || 'General'} 
                {student.year && ` • ${student.year} Year`}
            </p>
          </div>
        </div>
        
        {socials.github && (
          <a 
            href={socials.github} 
            onClick={(e) => e.stopPropagation()} 
            target="_blank" 
            rel="noreferrer" 
            className="text-neutral-400 hover:text-neutral-900 transition bg-neutral-50 p-2 rounded-lg"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Goal & Skills */}
      <div className="flex-1 mb-6">
         <div className="flex items-center gap-2 mb-4 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
           <Briefcase className="w-4 h-4 text-neutral-400" />
           <p className="text-sm font-medium text-neutral-700 truncate">{student.goal || 'Exploring Opportunities'}</p>
         </div>
         
         <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Top Skills</p>
            <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
                skills.slice(0, 5).map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 bg-white text-neutral-600 text-xs font-semibold rounded-lg border border-neutral-200">
                    {skill}
                    </span>
                ))
            ) : (
                <span className="text-xs text-neutral-400 italic">No skills listed</span>
            )}
            {skills.length > 5 && <span className="text-xs text-neutral-400 px-1 pt-1">+{skills.length - 5} more</span>}
            </div>
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 mt-auto">
         <button 
           onClick={(e) => {
             e.stopPropagation(); 
             onConnect();
           }}
           className="flex-1 bg-neutral-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-900 transition flex items-center justify-center gap-2 shadow-sm"
         >
           <Send className="w-3.5 h-3.5" /> Reach Out
         </button>
         
         {student.resumeLink && (
             <a 
               href={student.resumeLink}
               onClick={(e) => e.stopPropagation()}
               target="_blank"
               rel="noreferrer"
               className="p-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition bg-white" 
               title="View Resume"
             >
                <FileText className="w-4 h-4" />
             </a>
         )}
      </div>
    </div>
  );
};

// Stat Card Helper
// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon }) => {
   return (
     <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
       <div className="p-3 rounded-xl bg-neutral-100 text-neutral-700">
         <Icon className="w-6 h-6" />
       </div>
       <div>
         <p className="text-2xl font-bold text-neutral-900">{value}</p>
         <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">{label}</p>
       </div>
     </div>
   );
};

export default StudentExplorer;