import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, LogOut, LayoutDashboard, MessageSquare, TrendingUp, 
  ShieldCheck, Settings, ChevronLeft, Moon, Sun 
} from 'lucide-react'; // បន្ថែម Moon និង Sun

// Sub-component for individual links
const NavItem = ({ icon, label, to, expanded }) => {
  const location = useLocation();

  const active =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        active
          ? "bg-indigo-700 text-yellow-400 shadow-md"
          : "hover:bg-indigo-800 text-indigo-200"
      }`}
    >
      <span className="shrink-0">{icon}</span>

      {/* Label slides in */}
      <span
        className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
          expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
        }`}
      >
        {label}
      </span>

      {/* Tooltip when not expanded */}
      {!expanded && (
        <span className="
          absolute left-full ml-4 px-2.5 py-1.5 rounded-md text-xs font-semibold
          bg-gray-900 text-white shadow-xl whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none
          scale-95 group-hover:scale-100
          transition-all duration-150 z-200
        ">
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </span>
      )}
    </Link>
  );
};

const Sidebar = ({ onLogout, isOpen, toggleSidebar, darkMode, toggleDarkMode }) => { // បន្ថែម props
  const [expanded, setExpanded] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: '/' },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={20} />, to: '/chat' },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp size={20} />, to: '/forecast' },
    { id: 'blockchain', label: 'Blockchain', icon: <ShieldCheck size={20} />, to: '/blockchain' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, to: '/settings' },
  ];

return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <nav
        style={{ width: expanded ? '256px' : '68px' }}
        className={`
          fixed md:relative z-50 h-screen bg-indigo-900 dark:bg-indigo-950 text-white
          transition-all duration-300 ease-in-out flex flex-col justify-between
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 overflow-hidden
          shadow-2xl dark:shadow-indigo-950/50
        `}
      >
        {/* Top section */}
        <div className="p-3">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="group flex items-center gap-3 p-3 w-full rounded-lg hover:bg-indigo-800 dark:hover:bg-indigo-900 transition-all duration-200"
              onClick={() => isOpen && toggleSidebar()}
            >
              <ShieldCheck
                size={20}
                className="text-yellow-400 dark:text-yellow-300 group-hover:rotate-12 transition-transform shrink-0"
              />
              <span
                className={`text-lg font-bold text-yellow-400 dark:text-yellow-300 whitespace-nowrap transition-all duration-300 overflow-hidden ${
                  expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
                }`}
              >
                MoneyAI
              </span>
            </Link>

            {/* Mobile close */}
            <button
              onClick={toggleSidebar}
              className="md:hidden text-indigo-200 dark:text-indigo-300 hover:text-white dark:hover:text-white cursor-pointer shrink-0 p-3"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav items */}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id} className="group" onClick={() => isOpen && toggleSidebar()}>
                <NavItem {...item} expanded={expanded} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Dark Mode + Collapse + Logout */}
        <div className="p-3">
          {/* Divider */}
          <div className={`border-t border-indigo-800 dark:border-indigo-900 mb-3 transition-all duration-300 ${expanded ? "mx-0" : "mx-1"}`} />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 p-3 w-full rounded-lg cursor-pointer text-indigo-300 dark:text-indigo-400 hover:bg-indigo-800 dark:hover:bg-indigo-900 hover:text-white transition-all mb-1"
          >
            <span className="shrink-0" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {darkMode ? <Sun size={20} className="text-indigo-300 dark:text-indigo-400" /> : <Moon size={20} className="text-indigo-300 dark:text-indigo-400" />}
            </span>
            <span
              className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
              }`}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Collapse toggle button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 p-3 w-full rounded-lg cursor-pointer text-indigo-300 dark:text-indigo-400 hover:bg-indigo-800 dark:hover:bg-indigo-900 hover:text-white transition-all mb-1"
          >
            <span className="shrink-0" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft
                size={20}
                className={`transition-transform duration-300 ${expanded ? "" : "rotate-180"} text-indigo-300 dark:text-indigo-400`}
              />
            </span>
            <span
              className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
              }`}
            >
              Collapse
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg cursor-pointer text-red-400 dark:text-red-400 hover:bg-red-900/50 dark:hover:bg-red-900/70 transition-all"
          >
            <span className="shrink-0"><LogOut size={20} /></span>
            <span
              className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;