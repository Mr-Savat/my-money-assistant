import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ onLogout }) => {
  return (
    <div className="flex bg-gray-100 font-sans">
      {/* Sidebar stays fixed on the left */}
      <Sidebar onLogout={onLogout} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* This is where your Dashboard, Chat, or Forecast will appear */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;