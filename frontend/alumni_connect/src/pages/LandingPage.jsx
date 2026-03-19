import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, GraduationCap, Briefcase, Building2, Check, Compass } from 'lucide-react';
import { HeroGraph } from '../components/Illustrations';

// --- CUSTOM DROPDOWN COMPONENT ---
const RoleDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { id: 'student', label: 'Join as Student', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'alumni', label: 'Join as Alumni', icon: <Briefcase className="w-5 h-5" /> },
   
  ];

  const current = options.find(o => o.id === selected) || options[0];

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 pl-4 pr-4 bg-neutral-50 hover:bg-neutral-100 border border-transparent rounded-xl flex items-center justify-between transition-colors group"
      >
        <div className="flex items-center gap-3 text-neutral-700 group-hover:text-neutral-900 font-medium">
          <span className="text-neutral-400">{current.icon}</span>
          {current.label}
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onSelect(opt.id); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              {opt.icon}
              <span className="flex-1">{opt.label}</span>
              {selected === opt.id && <Check className="w-4 h-4 text-neutral-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN LANDING PAGE ---
const LandingPage = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState('student'); 

  return (
    <div className="max-h-screen bg-white font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'); body { font-family: 'Poppins', sans-serif; }`}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* <div className="text-2xl font-bold tracking-tighter cursor-pointer">AIN.</div> */}
          <div className=" flex items-center gap-2">
                 <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white"><Compass size={20}/></div>
                 <span className="font-bold text-slate-900 text-xl">Saarthi</span>
            </div>
          <div className="flex gap-4">
           
            <button 
              onClick={() => onNavigate(selectedRole, 'login')} 
              className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-full text-sm font-medium transition"
            >
               Login
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
           <div className="inline-block px-4 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold tracking-wide uppercase text-neutral-500">
             Institute-Powered Network
           </div>
           <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-neutral-900">
             Connect with <br/> <span className="text-neutral-500">Verified Alumni.</span>
           </h1>
           <p className="text-lg text-neutral-600 max-w-md leading-relaxed">
             The only alumni intelligence network that integrates directly with your institute's data for verified mentorship.
           </p>

           {/* Role Selector */}
           <div className="relative max-w-md p-2 bg-white border border-neutral-200 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2">
              <RoleDropdown selected={selectedRole} onSelect={setSelectedRole} />
              <button 
                onClick={() => onNavigate(selectedRole, 'register')}
                className="h-12 px-8 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-black transition-transform active:scale-95 whitespace-nowrap"
              >
                 Get Started
              </button>
           </div>
           
           <p className="text-xs text-neutral-400 pl-2">
             * Alumni require work email. Students require ID Card.
           </p>
        </div>

        <div className="relative h-[500px] hidden lg:block">
           <HeroGraph />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;