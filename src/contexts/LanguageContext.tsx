'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  let i18n;
  try {
    const translation = useTranslation();
    i18n = translation.i18n;
  } catch (error) {
    console.error('Error accessing i18n:', error);
    i18n = null;
  }
  
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Add safety check for i18n
  if (!i18n) {
    console.error('i18n not available in LanguageProvider');
    // Return a fallback provider with default values
    const fallbackValue: LanguageContextType = {
      language: 'en',
      setLanguage: () => {},
      isLoading: false,
    };
    return (
      <LanguageContext.Provider value={fallbackValue}>
        {children}
      </LanguageContext.Provider>
    );
  }

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('i18nextLng') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
          setLanguageState(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        } else {
          // Fallback to browser language detection
          const browserLang = navigator.language.toLowerCase();
          const detectedLang: Language = browserLang.startsWith('pt') ? 'pt' : 'en';
          setLanguageState(detectedLang);
          i18n.changeLanguage(detectedLang);
        }
      } catch (error) {
        console.warn('Error initializing language:', error);
        // Fallback to English
        setLanguageState('en');
        i18n.changeLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    try {
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values instead of throwing error to prevent crashes
    console.warn('useLanguage called outside of LanguageProvider, using defaults');
    return {
      language: 'en',
      setLanguage: () => {},
      isLoading: false,
    };
  }
  return context;
}