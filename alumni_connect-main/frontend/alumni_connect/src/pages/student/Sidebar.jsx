import React from 'react';
import { 
  Layout, 
  Search, 
  Calendar, 
  MessageSquare, 
  Map, 
  LogOut, 
  Compass,
  X 
} from 'lucide-react';

// Helper Component: SidebarItem
const SidebarItem = ({ icon: Icon, label, active, onClick, expanded }) => (
  <button
    onClick={onClick}
    title={!expanded ? label : ""}
    className={`flex items-center cursor-pointer transition-all duration-200 group rounded-xl my-1
      ${expanded ? 'w-full gap-3 px-4 py-3' : 'w-full justify-center py-3'}
      ${
        active
          ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200"
          : "text-slate-500 hover:bg-neutral-50 hover:text-neutral-900"
      }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
    <span
      className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
        expanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
      }`}
    >
      {label}
    </span>
    {active && expanded && (
      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shrink-0" />
    )}
  </button>
);

const handleLogout = () => {
  // Clear user session
  localStorage.clear();
  sessionStorage.clear();

  // Redirect to login page
  window.location.href = "/login";
};

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  selectedAlumni, 
  setSelectedAlumni,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
    setSelectedAlumni(null); // Reset profile view when changing tabs
    setIsMobileMenuOpen(false); // Close mobile menu
  };

  return (
    <>
      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out shrink-0 
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'} 
        ${isSidebarOpen ? 'w-72' : 'w-20'} 
        flex flex-col h-full`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between md:justify-center border-b border-slate-50 relative px-6 md:px-4">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              !isSidebarOpen ? 'md:justify-center w-full' : ''
            }`}
          >
            {/* Toggle Button (Desktop) */}
            <div 
              className="w-8 h-8 bg-neutral-900 rounded-lg hidden md:flex items-center justify-center shadow-md text-white shrink-0 cursor-pointer hover:bg-neutral-800 transition-colors" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Compass size={20} />
            </div>
            
            {/* Mobile Logo (Visible only on mobile sidebar) */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white">
                <Compass size={20} />
              </div>
              <span className="font-bold text-slate-900 text-xl">Saarthi</span>
            </div>

            {/* Desktop Logo Text */}
            <h1
              className={`font-bold text-slate-900 text-2xl tracking-tight whitespace-nowrap overflow-hidden hidden md:block transition-all duration-300 ${
                isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'
              }`}
            >
              Saarthi
            </h1>
          </div>

          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 w-full p-4 mt-4 overflow-y-auto scrollbar-hide">
          <SidebarItem 
            icon={Layout} 
            label="Dashboard" 
            active={activeTab === 'Dashboard' && !selectedAlumni} 
            expanded={isSidebarOpen}
            onClick={() => handleNavigation('Dashboard')}
          />
          <SidebarItem 
            icon={Search} 
            label="Explore Alumni" 
            active={activeTab === 'Explore Alumni' && !selectedAlumni} 
            expanded={isSidebarOpen}
            onClick={() => handleNavigation('Explore Alumni')}
          />
          <SidebarItem 
            icon={Calendar} 
            label="Workshops" 
            active={activeTab === 'Workshops'} 
            expanded={isSidebarOpen}
            onClick={() => handleNavigation('Workshops')}
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="Messages" 
            active={activeTab === 'Messages'} 
            expanded={isSidebarOpen}
            onClick={() => handleNavigation('Messages')}
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="Requests" 
            active={activeTab === 'Requests'} 
            expanded={isSidebarOpen}
            onClick={() => handleNavigation('Requests')}
          />
          <SidebarItem 
            icon={Map} 
            label="My Journey" 
            active={activeTab === 'My Journey'} 
            expanded={isSidebarOpen}
            onClick={() => handleNavigation('My Journey')}
          />
        </nav>

        {/* Logout Section */}
        <div
          className={`p-4 border-t border-slate-100 ${
            !isSidebarOpen ? 'md:flex md:justify-center' : ''
          }`}
        >
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center cursor-pointer transition-colors group rounded-xl w-full
              ${
                isSidebarOpen
                  ? "gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                  : "justify-center p-3 text-slate-400 hover:text-red-600 hover:bg-red-50"
              }`}
            title="Logout"
          >
            <LogOut size={20} />
            <span
              className={`transition-all duration-300 ${
                isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
