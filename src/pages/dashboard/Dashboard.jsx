import React from 'react';
import DashboardNavigation from './components/DashboardNavigation';
import DashboardSummaryCards from './components/DashboardSummaryCards';
import DashboardChart from './components/DashboardChart';
import DashboardTransactions from './components/DashboardTransactions';

function Dashboard() {
  return (
    <div className="overflow-y-auto bg-[#F8FAFC] dark:bg-gray-900 p-4 md:p-8 text-[#1E293B] dark:text-gray-100 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        <DashboardNavigation />

        <div className="mb-6 lg:mb-8">
          <DashboardSummaryCards />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          <div className="xl:col-span-2 h-full">
            <DashboardChart />
          </div>

          <div className="xl:col-span-1 h-full">
            <DashboardTransactions />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;