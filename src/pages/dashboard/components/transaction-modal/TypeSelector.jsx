import React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';

const TypeSelector = ({ type, setType }) => {
  const { t } = useTranslation();

  return (
    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
      {['expense', 'income'].map((typeOption) => (
        <button
          key={typeOption}
          type="button"
          onClick={() => setType(typeOption)}
          className={`flex-1 py-2 sm:py-3 cursor-pointer rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            type === typeOption
              ? (typeOption === 'expense' 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-emerald-500 text-white shadow-md')
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {t(`dashboard.${typeOption}`)}
        </button>
      ))}
    </div>
  );
};

export default TypeSelector;