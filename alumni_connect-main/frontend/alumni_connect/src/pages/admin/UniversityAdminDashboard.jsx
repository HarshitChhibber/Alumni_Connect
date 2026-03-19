import React, { useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Users, BookOpen, Award, TrendingUp, GraduationCap, 
  LayoutDashboard, Loader2 
} from 'lucide-react';

// Hooks
import { useStudentExplorer } from '../../hooks/useStudentExplorer';
import { useWorkshops } from '../../hooks/useWorkshops';
import { useExplore } from '../../hooks/useProfile';

const COLORS = ['#1e293b', '#64748b', '#94a3b8', '#cbd5e1'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

 function UniversityAdminDashboard() {
  // 1. Fetch Data
  const { students, stats: studentStats, loading: load1, refresh: refreshStudents } = useStudentExplorer();
  const { workshops, stats: workshopStats, loading: load2 } = useWorkshops('all');
  const { profiles, loading: load3, fetchExplore } = useExplore();

  // Trigger fetches on mount
  useEffect(() => {
    refreshStudents();
    fetchExplore();
    // workshops fetched automatically in its hook
  }, [refreshStudents, fetchExplore]);

  // 2. Data Processing (Memoized)

  // A. Ecosystem Composition (Alumni vs Students)
  const ecosystemData = useMemo(() => {
    if (!profiles || !profiles.length) return [];
    
    const alumniCount = profiles.filter(p => p.role?.toLowerCase() === 'alumni').length;
    const studentCount = profiles.filter(p => p.role?.toLowerCase() === 'student').length;
    
    return [
      { name: 'Students', value: studentCount },
      { name: 'Alumni', value: alumniCount },
    ];
  }, [profiles]);

  // B. Workshop Engagement (Attendees per Workshop)
  const workshopEngagementData = useMemo(() => {
    if (!workshops || !workshops.length) return [];
    
    // Take top 5 workshops by attendance for clean graph
    return workshops
      .map(w => ({
        name: w.title.length > 15 ? w.title.substring(0, 15) + '...' : w.title,
        attendees: w.attendees ? w.attendees.length : 0,
        fullTitle: w.title
      }))
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 7); 
  }, [workshops]);

  // C. Student Readiness by Year/Batch
  const readinessByYear = useMemo(() => {
    if (!students || !students.length) return [];

    const yearMap = {};
    
    students.forEach(std => {
      const year = std.year || 'Unknown';
      if (!yearMap[year]) yearMap[year] = { year, totalScore: 0, count: 0 };
      
      // Use actual readiness or default to 0 to avoid NaN
      const score = std.readiness || 0; 
      yearMap[year].totalScore += score;
      yearMap[year].count += 1;
    });

    return Object.values(yearMap)
      .map(item => ({
        year: item.year,
        avgReadiness: Math.round(item.totalScore / item.count),
        count: item.count
      }))
      .sort((a, b) => a.year.localeCompare(b.year)); // Sort by year
  }, [students]);

  const loading = load1 || load2 || load3;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-900" />
        <p>Gathering ecosystem data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 font-sans">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="text-slate-500" /> Dashboard Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time metrics on students, alumni, and workshop participation.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Students" 
          value={studentStats.total || students.length || 0} 
          icon={GraduationCap} 
          subtext={`${studentStats.topTalent || 0} identified as Top Talent`}
        />
        <StatCard 
          label="Total Alumni" 
          value={ecosystemData.find(d => d.name === 'Alumni')?.value || 0} 
          icon={Award} 
          subtext="Registered profiles"
        />
        <StatCard 
          label="Workshop Registrations" 
          value={workshopStats.totalRegistrations || 0} 
          icon={BookOpen} 
          subtext="Across all active events"
        />
        <StatCard 
          label="Avg Readiness" 
          value={`${studentStats.avgReadiness || 0}%`} 
          icon={TrendingUp} 
          subtext="Platform-wide average"
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* LEFT: Workshop Popularity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Workshop Participation</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workshopEngagementData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="attendees" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={24} name="Attendees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Ecosystem Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Community Split</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ecosystemData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ecosystemData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Count */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-900">
                  {(ecosystemData[0]?.value || 0) + (ecosystemData[1]?.value || 0)}
                </span>
                <span className="block text-xs text-slate-500 uppercase tracking-wide">Total Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Student Readiness Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Avg. Readiness by Batch</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readinessByYear}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="avgReadiness" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReadiness)" name="Avg Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Students List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Award className="text-amber-500" size={20} /> Top Talent
             </h3>
             <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                Highest Readiness
             </span>
          </div>
          <div className="overflow-y-auto max-h-[250px] p-2">
             {students
               .sort((a, b) => (b.readiness || 0) - (a.readiness || 0)) // Sort by readiness desc
               .slice(0, 5)
               .map((student, i) => (
                 <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {student.name ? student.name.charAt(0) : 'S'}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.branch} • {student.year}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="block text-sm font-bold text-emerald-600">
                         {student.readiness || 0}%
                       </span>
                    </div>
                 </div>
             ))}
             {students.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">No student data found.</p>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple Stat Component
// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, subtext }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl text-slate-900">
        <Icon size={20} />
      </div>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-3">{subtext}</p>}
  </div>
);


export default  UniversityAdminDashboard;