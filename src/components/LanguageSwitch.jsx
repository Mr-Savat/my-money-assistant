import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSwitch = ({ expanded }) => {
  const { language, switchLanguage } = useTranslation();

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-3 p-3 w-full rounded-lg cursor-pointer text-indigo-300 dark:text-indigo-400 hover:bg-indigo-800 dark:hover:bg-indigo-900 hover:text-white transition-all mb-1"
    >
 <span className="shrink-0 text-sm font-medium">
  {language === "en" ? "KH" : "EN"}
</span>
      <span
        className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
          expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
        }`}
      >
        {language === 'en' ? 'ភាសាខ្មែរ' : 'English'}
      </span>
    </button>
  );
};

export default LanguageSwitch;