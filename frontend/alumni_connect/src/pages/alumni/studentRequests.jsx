import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, MessageSquare, Clock, RefreshCw, 
  Briefcase, GraduationCap, Building2, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ IMPORT API: Use real service instead of mock hooks
import { fetchPendingRequests, acceptConnectionRequest } from '../../api/connectionService';

const StudentRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Logic ---
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingRequests();
      setRequests(data); 
      setError(null);
    } catch (err) {
      console.error("Failed to load requests", err);
      setError("Could not load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // --- Action Handlers ---
  const handleAccept = async (requestId) => {
    try {
      const result = await acceptConnectionRequest(requestId);
      alert("Request Accepted! You can now chat.");
      
      // ✅ Navigate directly to the new conversation
      if(result.conversationId) {
          navigate(`/alumni/chats`);
      }
      
      // Update UI
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleDecline = (requestId) => {
    if(window.confirm("Are you sure you want to decline this request?")) {
        // Implement API call for decline if needed
        setRequests(prev => prev.filter(r => r._id !== requestId));
    }
  };

  // --- Render Helper: Determine Sender Role ---
  const renderSenderDetails = (sender) => {
    // Safety check if sender is null (deleted user)
    if (!sender) return <span className="text-sm text-red-400">Unknown User</span>;

    const isAlumni = sender.role === 'alumni';

    return (
      <div className="text-sm text-slate-500 mt-1 space-y-1">
        {isAlumni ? (
          <>
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
               <Briefcase size={14} className="text-indigo-600" />
               {sender.role || 'Alumni'}
            </div>
            <div className="flex items-center gap-1.5">
               <Building2 size={14} />
               {sender.currentCompany || 'Unknown Company'}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
               <GraduationCap size={14} className="text-green-600" />
               Student {sender.year ? `• ${sender.year} Year` : ''}
            </div>
            <div className="flex items-center gap-1.5">
               <User size={14} />
               {sender.branch || 'General'}
            </div>
          </>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <p className="mb-4">{error}</p>
        <button onClick={loadRequests} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incoming Requests</h1>
          <p className="text-slate-500">Manage your connection invitations.</p>
        </div>
        <button onClick={loadRequests} className="p-2 bg-white border rounded-full hover:bg-slate-100 shadow-sm text-slate-600">
            <RefreshCw size={18} />
        </button>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto space-y-4">
        
        {loading ? (
          // Loading Skeleton
          [1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-32 animate-pulse"></div>
          ))
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">No pending requests found.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row gap-6 hover:shadow-md transition">
              
              {/* Left: Avatar & Basic Info */}
              <div className="flex gap-4 md:w-1/3 border-r border-slate-100 pr-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                   {req.sender?.profilePicture ? (
                     <img 
                      src={req.sender.profilePicture} 
                      alt={req.sender.name} 
                      className="w-full h-full object-cover"
                     />
                   ) : (
                     <span className="text-xl font-bold text-slate-400">
                        {req.sender?.name?.charAt(0) || '?'}
                     </span>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                      {req.sender?.name || 'Unknown User'}
                  </h3>
                  {renderSenderDetails(req.sender)}
                </div>
              </div>

              {/* Middle: Message */}
              <div className="flex-1">
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 h-full relative">
                    <MessageSquare className="absolute top-4 left-3 w-4 h-4 text-slate-300" />
                    <p className="text-sm text-slate-600 italic pl-6">
                        "{req.message || 'I would like to connect with you.'}"
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-2 pl-6">
                       <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                 </div>
              </div>

              {/* Right: Actions */}
              <div className="flex md:flex-col gap-2 justify-center min-w-[140px]">
                <button 
                  onClick={() => handleAccept(req._id)}
                  className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-sm text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </button>
                <button 
                  onClick={() => handleDecline(req._id)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex justify-center items-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentRequests;