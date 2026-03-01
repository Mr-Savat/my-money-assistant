import React, { useState, useEffect } from 'react'; // ++++++++++ បន្ថែម useEffect ++++++++++
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // ++++++++++ Dark Mode State ++++++++++
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // ++++++++++ Effect សម្រាប់ Dark Mode ++++++++++
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`flex h-screen bg-gray-100 font-sans overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}           // ++++++++++ បញ្ជូន props ++++++++++
        toggleDarkMode={toggleDarkMode} // ++++++++++ បញ្ជូន props ++++++++++
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-2 bg-indigo-900 text-white shrink-0 border-b border-indigo-800">
          <h1 className="text-lg font-bold text-yellow-400">MoneyAI</h1>
          <button onClick={toggleSidebar} className="p-2 focus:outline-none cursor-pointer">
            <Menu size={28} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;