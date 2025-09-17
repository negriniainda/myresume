'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('resume-language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
          setLanguageState(savedLanguage);
        } else {
          // Fallback to browser language detection
          const browserLang = navigator.language.toLowerCase();
          const detectedLang: Language = browserLang.startsWith('pt') ? 'pt' : 'en';
          setLanguageState(detectedLang);
        }
      } catch (error) {
        console.warn('Error initializing language:', error);
        // Fallback to English
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    try {
      setLanguageState(lang);
      localStorage.setItem('resume-language', lang);
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