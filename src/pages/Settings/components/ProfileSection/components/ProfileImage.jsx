import React from 'react';
import { Camera } from 'lucide-react';

const ProfileImage = ({ imagePreview, name, isEditing, onImageChange, t }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      <div className="relative mx-auto sm:mx-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
          {imagePreview ? (
            <img src={imagePreview} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl sm:text-4xl font-black">
              {name?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>

        {isEditing && (
          <label className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Camera size={14} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
            <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
          </label>
        )}
      </div>

      {isEditing && (
        <div className="text-center sm:text-left text-xs text-gray-400 dark:text-gray-500">
          <p>{t('profile.camera_hint')}</p>
          <p className="mt-1">{t('profile.camera_support')}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;