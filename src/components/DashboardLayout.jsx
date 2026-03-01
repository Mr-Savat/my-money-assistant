import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content Area - This handles all scrolling */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header - Fixed at top */}
        <header className="md:hidden flex items-center justify-between p-4 bg-indigo-900 text-white shrink-0">
          <h1 className="text-lg font-bold text-yellow-400">MoneyAI</h1>
          <button onClick={toggleSidebar} className="p-2 focus:outline-none cursor-pointer">
            <Menu size={28} />
          </button>
        </header>

        {/* Scrollable Content Area - Only ONE scrollbar here */}
        <main className="flex-1 h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;