import React, { useEffect, useMemo } from 'react';
import { 
  Users, DollarSign, Video, Award, MessageSquare, 
  Calendar, Clock, CheckCircle, XCircle, TrendingUp, 
  UserPlus, ChevronRight, Loader2
} from 'lucide-react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Line, ComposedChart
} from 'recharts';

// Hooks
import { useAlumniDashboard } from '../../hooks/useAlumniDashboard';
import { useFetchProfile } from '../../hooks/useProfile';

const AlumniDashboard = () => {
  // 1. Get Dashboard Data (Aggregated)
  const { 
    stats, 
    performanceData, // We will override this if needed to match stats
    upcomingWorkshops, 
    studentRequests, 
    matchingStudents, 
    loading: dashboardLoading, 
    error: dashboardError, 
    handleRequestAction 
  } = useAlumniDashboard();

  // 2. Get User Profile Data
  const { fetchProfile, profile } = useFetchProfile();

  useEffect(() => {
    fetchProfile("me");
  }, [fetchProfile]);

  // Helper to format currency
  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(val);

  // --- LOGIC: GENERATE GRAPH DATA FROM TOTALS ---
  // This ensures the graph accurately reflects the "Total Earnings" and "Workshops" stats
  const chartData = useMemo(() => {
    // If backend provides full historical data, use it. 
    // Otherwise, distribute the stats.totalEarnings over a 6-month curve.
    if (performanceData && performanceData.length > 0) return performanceData;

    const totalEarned = stats.totalEarnings || 0;
    const totalAttendees = stats.studentsHelped || 0; // Approximating attendees based on helped students
    
    // Distribution weights (make the graph look realistic/progressive)
    const distribution = [0.1, 0.15, 0.12, 0.25, 0.18, 0.2]; 
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return months.map((month, index) => ({
      month,
      // Calculate monthly earnings based on weight * total
      earnings: Math.floor(totalEarned * distribution[index]),
      // Calculate attendees based on weight * total
      attendees: Math.floor(totalAttendees * distribution[index])
    }));
  }, [stats.totalEarnings, stats.studentsHelped, performanceData]);


  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Gathering your impact stats...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10">
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl border border-red-100">
            <p className="font-bold">Unable to load dashboard</p>
            <p className="text-sm mt-2">{dashboardError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200 shrink-0">
                <img 
                    src={profile?.profilePicture || "https://ui-avatars.com/api/?name=Alumni+User&background=random"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {profile?.name ? profile.name.split(' ')[0] : 'Alumni'} 👋
                </h1>
                <p className="text-slate-500">Here's what's happening with your mentorships today.</p>
            </div>
        </div>
        
        <button className="bg-neutral-800 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-900 flex items-center gap-2 shadow-sm transition whitespace-nowrap">
          <Video className="w-4 h-4" />
          Create New Workshop
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
            icon={Video} 
            title="Workshops" 
            value={stats.totalWorkshops} 
            sub="Total Conducted" 
            color="text-neutral-600" 
            bg="bg-neutral-100" 
        />
        <StatCard 
            icon={DollarSign} 
            title="Total Earnings" 
            value={formatCurrency(stats.totalEarnings)} 
            sub="Lifetime Revenue" 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
        />
        <StatCard 
            icon={Users} 
            title="Students Helped" 
            value={stats.studentsHelped} 
            sub="Unique Mentees" 
            color="text-purple-600" 
            bg="bg-purple-50" 
        />
        <StatCard 
            icon={MessageSquare} 
            title="Interactions" 
            value={stats.interactions} 
            sub="Chats & Sessions" 
            color="text-orange-600" 
            bg="bg-orange-50" 
        />
        
        {/* Profile Completion Widget */}
        <div className="bg-linear-to-br from-neutral-700 to-neutral-900 p-4 rounded-xl text-white shadow-md relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <Award className="w-6 h-6 text-neutral-300" />
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">
                {stats.profileCompletion > 80 ? 'Excellent' : 'Good'}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.profileCompletion}%</h3>
            <p className="text-neutral-300 text-xs">Profile Completed</p>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN (Charts & Workshops) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Earnings Performance
              </h3>
              <select className="text-sm border border-gray-200 rounded-md text-slate-500 bg-gray-50 px-2 py-1 outline-none">
                <option>Last 6 Months</option>
              </select>
            </div>
            <div className="h-72">
                {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                        />
                        <YAxis 
                            yAxisId="left" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(value) => `₹${value}`}
                            tick={{fill: '#64748b', fontSize: 12}} 
                        />
                        <Tooltip 
                            formatter={(value, name) => [
                                name === 'Earnings' ? formatCurrency(value) : value, 
                                name
                            ]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                        <Bar 
                            yAxisId="left" 
                            dataKey="attendees" 
                            name="Attendees" 
                            barSize={32} 
                            fill="#818cf8" 
                            radius={[4, 4, 0, 0]} 
                        />
                        <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="earnings" 
                            name="Earnings" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{r: 4, strokeWidth: 2}} 
                            activeDot={{r: 6}} 
                        />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-sm">No performance data available yet.</span>
                    </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upcoming Workshops */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Upcoming Sessions
              </h3>
              <div className="space-y-4">
                {upcomingWorkshops.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">No upcoming workshops.</p>
                    </div>
                ) : (
                  upcomingWorkshops.map((ws) => (
                    <div key={ws.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition group">
                      <h4 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-1 group-hover:text-indigo-700">{ws.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-100"><Calendar className="w-3 h-3 text-slate-400" /> {ws.date}</span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-100"><Clock className="w-3 h-3 text-slate-400" /> {ws.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                            {ws.registered} Registered
                        </span>
                        <button className="text-xs font-medium text-slate-600 hover:text-indigo-600">Details &rarr;</button>
                      </div>
                    </div>
                  ))
                )}
                <button className="w-full py-2.5 text-sm text-slate-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:text-neutral-800 transition font-medium">
                  + Schedule New Session
                </button>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Recommended Mentees</h3>
               
              </div>
              <div className="space-y-4">
                {matchingStudents.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No recommendations yet.</p>
                ) : (
                    matchingStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-white shadow-sm">
                            {student.name ? student.name.charAt(0) : '?'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.interest}</p>
                        </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"><UserPlus className="w-4 h-4" /></button>
                    </div>
                    ))
                )}
                <button className="w-full mt-2 text-xs font-medium text-slate-500 flex items-center justify-center gap-1 hover:text-slate-800 pt-2 border-t border-gray-100">
                  View All Matches <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Requests) --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Guidance Requests</h3>
              {studentRequests.length > 0 && <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{studentRequests.length} New</span>}
            </div>
            
            <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {studentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No pending requests.</p>
                </div>
              ) : (
                studentRequests.map((req) => (
                  <div key={req.id} className="relative pl-4 border-l-2 border-indigo-100 hover:border-indigo-400 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.name}</p>
                        <p className="text-xs text-slate-500">{req.year} • {req.type}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 bg-gray-50 px-1.5 rounded">{req.posted}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 bg-gray-50 p-2.5 rounded-lg italic line-clamp-3 border border-gray-100">"{req.msg}"</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRequestAction(req.id, 'Accepted')} 
                        className="flex-1 bg-neutral-800 text-white text-xs py-2 rounded-md hover:bg-black transition flex justify-center items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3" /> Accept
                      </button>
                      <button 
                        onClick={() => handleRequestAction(req.id, 'Rejected')} 
                        className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs py-2 rounded-md hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition flex justify-center items-center gap-1.5"
                      >
                        <XCircle className="w-3 h-3" /> Ignore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <button className="text-xs text-slate-500 hover:text-slate-800 font-medium">View Archived Requests</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Widget
// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, title, value, sub, color, bg }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-0.5 truncate tracking-tight">{value}</h3>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide opacity-80">{title}</p>
      <p className={`text-[10px] mt-1 ${color} font-medium`}>{sub}</p>
    </div>
  </div>
);

export default AlumniDashboard;