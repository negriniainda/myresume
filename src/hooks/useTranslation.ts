'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Custom hook that extends react-i18next's useTranslation with additional functionality
 * for our bilingual resume application
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const { language, setLanguage, isLoading } = useLanguage();

  /**
   * Get translation with fallback support
   */
  const translate = (key: string, options?: any) => {
    try {
      return t(key, options);
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  };

  /**
   * Get translation with HTML support (for rich text content)
   */
  const translateHTML = (key: string, options?: any) => {
    try {
      return t(key, { ...options, interpolation: { escapeValue: false } });
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  };

  /**
   * Check if a translation key exists
   */
  const hasTranslation = (key: string): boolean => {
    return i18n.exists(key);
  };

  /**
   * Get current language direction (for future RTL support if needed)
   */
  const getLanguageDirection = (): 'ltr' | 'rtl' => {
    // Both Portuguese and English are LTR languages
    return 'ltr';
  };

  /**
   * Format date according to current language
   */
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
  };

  /**
   * Format number according to current language
   */
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    return number.toLocaleString(locale, options);
  };

  /**
   * Get language-specific content key
   */
  const getContentKey = (baseKey: string): string => {
    return `${baseKey}.${language}`;
  };

  return {
    t: translate,
    tHTML: translateHTML,
    language,
    setLanguage,
    isLoading,
    hasTranslation,
    getLanguageDirection,
    formatDate,
    formatNumber,
    getContentKey,
    i18n,
  };
}