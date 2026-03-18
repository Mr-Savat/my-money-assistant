// hooks/useCachedState.js
import { useState, useEffect } from 'react';

export const useCachedState = (key, defaultValue) => {
  // អានពី localStorage ពេលដំបូង
  const [value, setValue] = useState(() => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // រក្សាទុកក្នុង localStorage ពេល value ផ្លាស់ប្តូរ
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue];
};