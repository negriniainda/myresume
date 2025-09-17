import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  // Add error boundary and default values
  const languageContext = useLanguage();
  const { language = 'en', setLanguage = () => {}, isLoading = false } = languageContext || {};
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  // Safety check - if context is not available, render a simple fallback
  if (!languageContext) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        EN
      </div>
    );
  }

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language || isLoading) return;
    
    setIsAnimating(true);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setLanguage(newLanguage);
      setIsAnimating(false);
    }, 150);
  };

  const languages = [
    {
      code: 'en' as const,
      label: t('language.english'),
      flag: '🇺🇸',
      shortLabel: 'EN'
    },
    {
      code: 'pt' as const,
      label: t('language.portuguese'),
      flag: '🇧🇷',
      shortLabel: 'PT'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Switch Design */}
      <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 transition-all duration-300">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              relative flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
              transition-all duration-300 ease-in-out transform
              ${language === lang.code
                ? 'bg-white text-blue-600 shadow-md scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }
              ${isAnimating ? 'animate-pulse' : ''}
            `}
            aria-label={t('language.switchTo', { language: lang.label })}
            title={t('language.switchTo', { language: lang.label })}
          >
            {/* Flag */}
            <span 
              className={`text-lg transition-transform duration-300 ${
                language === lang.code ? 'scale-110' : 'scale-100'
              }`}
              role="img"
              aria-label={`${lang.label} flag`}
            >
              {lang.flag}
            </span>
            
            {/* Language Code */}
            <span className="font-semibold tracking-wide">
              {lang.shortLabel}
            </span>

            {/* Active Indicator */}
            {language === lang.code && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Transition Animation Overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse pointer-events-none" />
      )}

      {/* Screen Reader Text */}
      <span className="sr-only">
        Current language: {languages.find(lang => lang.code === language)?.label}
      </span>
    </div>
  );
};

export default LanguageSelector;
