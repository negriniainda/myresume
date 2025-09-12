import { useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '@/types';

interface UseLanguageReturn {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  isLoading: boolean;
}

const useLanguage = (): UseLanguageReturn => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // First, try to get from localStorage
        const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
          setLanguageState(savedLanguage);
          setIsLoading(false);
          return;
        }

        // Fallback to browser language detection
        const browserLanguage = navigator.language.toLowerCase();
        if (browserLanguage.startsWith('pt')) {
          setLanguageState('pt');
        } else {
          setLanguageState('en');
        }
      } catch (error) {
        console.warn('Failed to initialize language preference:', error);
        setLanguageState('en'); // Safe fallback
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Save to localStorage whenever language changes
  const setLanguage = useCallback((newLanguage: SupportedLanguage) => {
    try {
      localStorage.setItem('preferred-language', newLanguage);
      setLanguageState(newLanguage);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('languageChange', { 
        detail: { language: newLanguage } 
      }));
    } catch (error) {
      console.warn('Failed to save language preference:', error);
      setLanguageState(newLanguage); // Still update state even if localStorage fails
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'en' ? 'pt' : 'en';
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  return { 
    language, 
    setLanguage, 
    toggleLanguage, 
    isLoading 
  };
};

export default useLanguage;
