import React from 'react';
import { Save, X, ChevronRight } from 'lucide-react';

const ProfileActions = ({ isEditing, onEdit, onSave, onCancel, t }) => {
  if (!isEditing) {
    return (
      <button
        onClick={onEdit}
        className="flex items-center cursor-pointer gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm hover:underline p-2 group w-full sm:w-auto justify-center sm:justify-start"
      >
        {t('profile.edit')}
        <ChevronRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2">
      <button
        onClick={onSave}
        className="flex items-center justify-center cursor-pointer gap-1 sm:gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 active:scale-95 w-full sm:w-auto"
      >
        <Save size={14} className="sm:w-4 sm:h-4" /> {t('profile.save')}
      </button>
      <button
        onClick={onCancel}
        className="flex items-center justify-center cursor-pointer gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 w-full sm:w-auto"
      >
        <X size={14} className="sm:w-4 sm:h-4" /> {t('profile.cancel')}
      </button>
    </div>
  );
};

export default ProfileActions;