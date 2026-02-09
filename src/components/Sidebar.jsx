import { LayoutDashboard, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react';

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-700 text-yellow-400' : 'hover:bg-indigo-800 text-indigo-200'
      }`}
  >
    {icon} <span>{label}</span>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare /> },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp /> },
    { id: 'blockchain', label: 'Blockchain', icon: <ShieldCheck /> },
  ];

  return (
    <nav className="w-64 bg-indigo-900 text-white p-6 hidden md:block">
      <h1 className="text-xl font-bold mb-10 flex items-center gap-2 text-yellow-400">
        <ShieldCheck /> MoneyAI
      </h1>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;

// import { Link, useLocation } from 'react-router-dom';
// import { LayoutDashboard, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react';

// const NavItem = ({ icon, label, to, active }) => (
//   <Link to={to}>
//     <div
//       className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
//         active ? 'bg-indigo-700 text-yellow-400' : 'hover:bg-indigo-800 text-indigo-200'
//       }`}
//     >
//       {icon} <span>{label}</span>
//     </div>
//   </Link>
// );

// const Sidebar = () => {
//   const location = useLocation(); // get current path

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard />, path: '/dashboard' },
//     { id: 'chat', label: 'AI Chat', icon: <MessageSquare />, path: '/dashboard/chat' },
//     { id: 'forecast', label: 'Forecast', icon: <TrendingUp />, path: '/dashboard/forecast' },
//     { id: 'blockchain', label: 'Blockchain', icon: <ShieldCheck />, path: '/dashboard/blockchain' },
//   ];

//   return (
//     <nav className="w-64 bg-indigo-900 text-white p-6 hidden md:block">
//       <h1 className="text-xl font-bold mb-10 flex items-center gap-2 text-yellow-400">
//         <ShieldCheck /> MoneyAI
//       </h1>
//       <div className="space-y-4">
//         {menuItems.map((item) => (
//           <NavItem
//             key={item.id}
//             icon={item.icon}
//             label={item.label}
//             to={item.path}
//             active={location.pathname === item.path}
//           />
//         ))}
//       </div>
//     </nav>
//   );
// };

// export default Sidebar;
