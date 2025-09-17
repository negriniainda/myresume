'use client';

import { useMemo } from 'react';
// import { useLanguage } from '@/contexts/LanguageContext';
import { useDataManager } from '@/hooks/useDataManager';
import type { ResumeData, Project } from '@/types';

/**
 * Custom hook for managing bilingual content access
 * Provides seamless switching between English and Portuguese content
 */
export function useContent() {
  const language = 'en'; // Temporary fallback
  // Temporary fallback - disable data manager
  const resumeData = null;
  const projectsData = null;
  const isLoading = false;
  const error = null;

  /**
   * Get resume data for current language
   */
  const currentResumeData = useMemo((): ResumeData | null => {
    if (!resumeData) return null;
    
    // Return data based on current language
    return resumeData[language] || resumeData.en || null;
  }, [resumeData, language]);

  /**
   * Get projects data for current language
   */
  const currentProjectsData = useMemo((): Project[] => {
    if (!projectsData) return [];
    
    // Return projects based on current language
    return projectsData[language] || projectsData.en || [];
  }, [projectsData, language]);

  /**
   * Get content with fallback mechanism
   */
  const getContentWithFallback = <T>(
    content: Record<string, T> | undefined,
    fallbackLanguage: 'en' | 'pt' = 'en'
  ): T | null => {
    if (!content) return null;
    
    // Try current language first
    if (content[language]) {
      return content[language];
    }
    
    // Fallback to specified language
    if (content[fallbackLanguage]) {
      return content[fallbackLanguage];
    }
    
    // Last resort: return any available content
    const availableKeys = Object.keys(content);
    if (availableKeys.length > 0) {
      return content[availableKeys[0]];
    }
    
    return null;
  };

  /**
   * Check if content is available in current language
   */
  const hasContentInCurrentLanguage = (content: Record<string, any> | undefined): boolean => {
    return !!(content && content[language]);
  };

  /**
   * Get available languages for content
   */
  const getAvailableLanguages = (content: Record<string, any> | undefined): string[] => {
    if (!content) return [];
    return Object.keys(content);
  };

  /**
   * Get localized text with fallback
   */
  const getLocalizedText = (
    text: string | Record<string, string> | undefined,
    fallback?: string
  ): string => {
    if (!text) return fallback || '';
    
    if (typeof text === 'string') {
      return text;
    }
    
    // Handle object with language keys
    if (typeof text === 'object') {
      return text[language] || text.en || text.pt || fallback || '';
    }
    
    return fallback || '';
  };

  /**
   * Format content for display (handles arrays, objects, etc.)
   */
  const formatContent = (content: any): string => {
    if (!content) return '';
    
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      return content.join(', ');
    }
    
    if (typeof content === 'object') {
      return getLocalizedText(content);
    }
    
    return String(content);
  };

  /**
   * Get content statistics
   */
  const getContentStats = () => {
    return {
      hasResumeData: !!currentResumeData,
      hasProjectsData: currentProjectsData.length > 0,
      resumeLanguages: resumeData ? Object.keys(resumeData) : [],
      projectsLanguages: projectsData ? Object.keys(projectsData) : [],
      currentLanguage: language,
      isContentComplete: !!currentResumeData && currentProjectsData.length > 0,
    };
  };

  return {
    // Current language content
    resumeData: currentResumeData,
    projectsData: currentProjectsData,
    
    // Loading and error states
    isLoading,
    error,
    
    // Utility functions
    getContentWithFallback,
    hasContentInCurrentLanguage,
    getAvailableLanguages,
    getLocalizedText,
    formatContent,
    getContentStats,
    
    // Current language
    language,
  };
}