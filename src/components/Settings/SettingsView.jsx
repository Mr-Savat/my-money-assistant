import ProfileSection from './ProfileSection';
import NotificationsSection from './NotificationsSection';
import SecuritySection from './SecuritySection';
import DangerZone from './DangerZone';

const SettingsView = () => {
  return (
  /* 1. Remove flex-col and overflow-y-auto from here */
  <div className="w-full min-h-full bg-[#F8FAFC] dark:bg-gray-900  text-[#1E293B] dark:text-gray-100">

    {/* 2. Make the header 'sticky' and 'top-0' */}
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-900 to-indigo-900 dark:from-gray-100 dark:to-indigo-400 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>
        <div className="flex items-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            Refine your experience and security
          </p>
        </div>
      </div>
    </header>

    <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 pb-20">
        <ProfileSection />
        <NotificationsSection />
        <SecuritySection />
        <DangerZone />
      </div>
    </main>
  </div>
);
};

export default SettingsView;