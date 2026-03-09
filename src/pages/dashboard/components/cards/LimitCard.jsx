import React from 'react';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LimitCard = ({ 
  hasLimit, 
  userData, 
  stats, 
  spendingPercentage, 
  isOverLimit, 
  t,
  formatCurrency 
}) => {
  const navigate = useNavigate();

  if (!hasLimit) {
    return (
      <div className="group bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-4xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3 transition-transform duration-300 ease-out group-hover:scale-110 transform-gpu">
          <Target size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium text-center">
          {t('dashboard.no_limit_set')}
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="mt-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline cursor-pointer"
        >
          {t('dashboard.set_limit')}
        </button>
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-gray-800 p-5 md:p-6 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110">
          <Target size={24} />
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold tracking-wider">
          {t('dashboard.monthly_limit')}
        </span>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-semibold tracking-tight">
        {t('dashboard.current_vs_limit')}
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {formatCurrency(stats.expense)} <span className="text-gray-400 dark:text-gray-500 font-normal">/ {formatCurrency(userData?.spendingLimit)}</span>
          </span>
          <span className={`text-xs font-black ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}>
            {spendingPercentage}%
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700/50 transition-colors duration-300">
          <div
            className="w-full h-full transition-all duration-500 ease-out"
            style={{
              background: 'linear-gradient(to right, #6366f1, #8b5cf6, #ec4899, #f43f5e)',
              clipPath: `inset(0 ${100 - Math.min(spendingPercentage, 100)}% 0 0)`,
            }}
          />
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-1.5 animate-pulse">
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-wide">
              ⚠️ {t('dashboard.over_limit')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LimitCard;