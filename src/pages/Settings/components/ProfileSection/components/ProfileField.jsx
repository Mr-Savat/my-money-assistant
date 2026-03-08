import React from 'react';
import { useProfile } from '../hooks/useProfile';

const ProfileField = ({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  type = 'text', 
  options = null,
  prefix = null 
}) => {
  const {t} = useProfile();
  return (
    <div className="p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        {label}
      </span>
      
      {isEditing ? (
        options ? (
          <select
            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 mt-1 font-bold text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={value}
            onChange={onChange}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            {prefix && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {prefix}
              </span>
            )}
            <input
              type={type}
              className={`w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg ${prefix ? 'pl-6' : 'px-2'} py-1 mt-1 font-bold text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none`}
              value={value}
              onChange={onChange}
              placeholder={`Enter ${label.toLowerCase()}`}
              step={type === 'number' ? '0.01' : undefined}
              min={type === 'number' ? '0' : undefined}
            />
          </div>
        )
      ) : (
        <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mt-1">
          {value || (t('profile.na'))}
        </p>
      )}
    </div>
  );
};

export default ProfileField;