import React from 'react';

const BaseCard = ({ 
  icon, 
  iconBg, 
  iconColor,
  badge, 
  badgeColor,
  label, 
  value,
  valueColor = 'text-gray-900 dark:text-white',
  children 
}) => {
  return (
    <div className="group bg-white dark:bg-gray-800 p-5 md:p-6 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        {badge && (
          <span className={`flex items-center px-2 py-1 ${badgeColor} text-[10px] font-bold rounded-lg tracking-wider`}>
            {badge}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-semibold tracking-tight">
          {label}
        </p>
        <h2 className={`text-2xl md:text-3xl font-black mt-1 tracking-tight ${valueColor}`}>
          {value}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default BaseCard;