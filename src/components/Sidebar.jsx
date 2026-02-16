import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, MessageSquare, TrendingUp, ShieldCheck, Settings } from 'lucide-react';

const NavItem = ({ icon, label, to }) => {
  const location = useLocation();
  // Check if current URL matches the "to" path
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-700 text-yellow-400' : 'hover:bg-indigo-800 text-indigo-200'
        }`}
    >
      {icon} <span>{label}</span>
    </Link>
  );
};

const Sidebar = ({ onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard />, to: '/' },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare />, to: '/chat' },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp />, to: '/forecast' },
    { id: 'blockchain', label: 'Blockchain', icon: <ShieldCheck />, to: '/blockchain' },
    { id: 'settings', label: 'Settings', icon: <Settings />, to: '/settings' },
  ];

  return (
    <nav className="w-64 bg-indigo-900 text-white p-6 hidden md:flex flex-col justify-between">
      <div>
        <Link to="/" className="inline-block mb-10 group">
          <h1 className="text-xl font-bold flex items-center gap-2 text-yellow-400 group-hover:text-yellow-300 transition-colors">
            <ShieldCheck className="group-hover:rotate-12 transition-transform" />
            MoneyAI
          </h1>
        </Link>
        <div className="space-y-4">
          {menuItems.map((item) => (
            <NavItem key={item.id} {...item} />
          ))}
        </div>
      </div>

      <div
        onClick={onLogout}
        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-400 hover:bg-red-900 transition-all mt-auto"
      >
        <LogOut size={20} /> <span>Logout</span>
      </div>
    </nav>
  );
};

export default Sidebar;