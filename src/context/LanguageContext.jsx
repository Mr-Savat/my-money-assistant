import React, { createContext, useState, useEffect } from 'react';
import en from '../translations/en';
import km from '../translations/km';

const translations = { en, km };

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || key;
    
    // Replace parameters like {name}
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  const switchLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'km' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};