'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'pt' as const, name: 'Português', flag: '🇧🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode: 'en' | 'pt') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLanguage.name}. Click to change language`}
      >
        <span className="text-base" role="img" aria-label={`${currentLanguage.name} flag`}>
          {currentLanguage.flag}
        </span>
        <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50"
              role="listbox"
              aria-label="Language options"
            >
              <div className="py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                      language === lang.code
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    role="option"
                    aria-selected={language === lang.code}
                  >
                    <span className="text-base" role="img" aria-label={`${lang.name} flag`}>
                      {lang.flag}
                    </span>
                    <span>{lang.name}</span>
                    {language === lang.code && (
                      <svg
                        className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;