import DashboardTransactions from './DashboardTransactions';
import DashboardChart from './DashboardChart';
import DashboardNavigation from './DashboardNavigation';
import DashboardSummaryCards from './DashboardSummaryCards';

const Dashboard = () => {
  return (
    <div className="h-screen overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-[#1E293B] font-sans">
      <div className="max-w-7xl mx-auto">
        <DashboardNavigation />
        <DashboardSummaryCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DashboardChart />
          <DashboardTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;