import { Bell } from 'lucide-react';
import { NotificationsSection } from '../../Settings/components';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';

function DashboardNavigation() {
  const { userName, userImage, showNotifications, setShowNotifications, t, isAnyNotificationOn } = useDashboardNavigation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          {t('welcome', { name: userName })}
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium">
          {t('welcome.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-gray-800 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full sm:w-auto">
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 border-r border-gray-100 dark:border-gray-700 flex-1 sm:flex-initial">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base sm:text-lg lg:text-lg font-black">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="block">
            {/* Increased max-width here so the name is visible */}
            <p className="text-xs sm:text-sm font-bold leading-none truncate max-w-25 sm:max-w-37.5 lg:max-w-50 text-gray-900 dark:text-white">
              {userName}
            </p>
          </div>
        </div>

        {/* Bell Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-1.5 sm:p-2 transition-colors relative rounded-lg sm:rounded-xl ${isAnyNotificationOn()
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Bell size={16} className="sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 cursor-pointer" />
          </button>

          {/* Notifications Panel - Responsive */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-72 sm:w-80 lg:w-96 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
                  <h3 className="text-sm sm:text-base lg:text-lg font-black text-gray-900 dark:text-white">
                    {t('settings.notifications')}
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">✕</span>
                  </button>
                </div>
                <div className="p-1 sm:p-2">
                  <NotificationsSection />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardNavigation;