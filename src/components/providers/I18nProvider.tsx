'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n if not already initialized
    if (!i18n.isInitialized) {
      i18n.init().then(() => {
        setIsInitialized(true);
      }).catch((error) => {
        console.error('Failed to initialize i18n:', error);
        setIsInitialized(true); // Still render to avoid blocking the app
      });
    } else {
      setIsInitialized(true);
    }
  }, []);

  // Show loading state while i18n is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </I18nextProvider>
  );
}