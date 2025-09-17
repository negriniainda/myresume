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
  // Temporary static data for testing
  const resumeData = {
    personalInfo: {
      name: "Marcelo Negrini",
      title: "AI & Technology Leadership Expert",
      location: "Brazil",
      email: "marcelo@example.com",
      linkedin: "https://linkedin.com/in/marcelonegrini",
      github: "https://github.com/marcelonegrini"
    },
    summary: {
      title: "Professional Summary",
      items: [
        "20+ years of experience in technology leadership and AI implementation",
        "Expert in digital transformation and team management",
        "Proven track record in building scalable solutions"
      ]
    },
    experience: [
      {
        id: "1",
        position: "Technology Director",
        company: "Tech Company",
        location: "Brazil",
        period: { start: "2020", end: "Present" },
        description: "Leading technology initiatives and AI implementation",
        achievements: [
          { metric: "35%", description: "Cost reduction through automation", impact: "High" }
        ],
        technologies: ["Python", "AI/ML", "Cloud Computing"],
        responsibilities: ["Team leadership", "Strategic planning"]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Computer Science",
        institution: "University",
        location: "Brazil",
        period: { start: "1998", end: "2002" },
        description: "Bachelor's degree in Computer Science"
      }
    ],
    skills: [
      {
        name: "Programming Languages",
        skills: [
          { name: "Python", level: "Expert", yearsOfExperience: 10 },
          { name: "JavaScript", level: "Advanced", yearsOfExperience: 8 }
        ]
      }
    ],
    languages: [
      { name: "Portuguese", proficiency: "Native" },
      { name: "English", proficiency: "Fluent" }
    ],
    activities: ["Technology consulting", "Team mentoring"]
  };
  
  const projectsData = [
    {
      id: "1",
      title: "AI Implementation Project",
      duration: "6 months",
      location: "Brazil",
      clientType: "Enterprise",
      projectType: "AI/ML",
      industry: "Technology",
      businessUnit: "Innovation",
      problem: "Need for automated processes",
      action: "Implemented AI-driven automation",
      result: "35% efficiency improvement",
      technologies: ["Python", "TensorFlow", "AWS"]
    }
  ];
  
  const isLoading = false;
  const error = null;

  /**
   * Get resume data for current language
   */
  const currentResumeData = useMemo((): ResumeData | null => {
    if (!resumeData) return null;
    
    // Return static data directly (not language-keyed for now)
    return resumeData;
  }, [resumeData, language]);

  /**
   * Get projects data for current language
   */
  const currentProjectsData = useMemo((): Project[] => {
    if (!projectsData) return [];
    
    // Return static data directly (not language-keyed for now)
    return projectsData;
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