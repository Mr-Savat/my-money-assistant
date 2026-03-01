import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, LayoutDashboard, MessageSquare, TrendingUp, ShieldCheck, Settings } from 'lucide-react';

// Sub-component for individual links
const NavItem = ({ icon, label, to }) => {
  const location = useLocation();

  // Check if current path matches the link "to" prop
  const active =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        active
          ? "bg-indigo-700 text-yellow-400 shadow-md"
          : "hover:bg-indigo-800 text-indigo-200"
      }`}
    >
      {/* Ensure the icon inherits the color by just passing it through */}
      {icon} 
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Sidebar = ({ onLogout, isOpen, toggleSidebar }) => {
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

      <nav className={`
        fixed md:relative z-50 h-screen w-64 bg-indigo-900 text-white p-6 
        transition-transform duration-300 ease-in-out flex flex-col justify-between
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        <div>
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="group" onClick={() => isOpen && toggleSidebar()}>
              <h1 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
                <ShieldCheck className="group-hover:rotate-12 transition-transform" /> 
                MoneyAI
              </h1>
            </Link>
            
            {/* Close button for mobile */}
            <button onClick={toggleSidebar} className="md:hidden text-indigo-200 hover:text-white cursor-pointer">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id} onClick={() => isOpen && toggleSidebar()}>
                <NavItem {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-400 hover:bg-red-900/50 transition-all mt-auto"
        >
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;