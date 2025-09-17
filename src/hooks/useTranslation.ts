'use client';

import { useLanguage } from '@/contexts/LanguageContext';

// Simple translation dictionary
const translations = {
  en: {
    // Navigation
    'navigation.home': 'Home',
    'navigation.summary': 'Summary',
    'navigation.experience': 'Experience',
    'navigation.skills': 'Skills',
    'navigation.education': 'Education',
    'navigation.projects': 'Projects',
    
    // Summary section
    'summary.title': 'Professional Summary',
    'summary.noData': 'No summary information available',
    'summary.objective': 'Objective',
    'summary.keyQualifications': 'Key Qualifications',
    'summary.highlights': 'Career Highlights',
    'summary.yearsExperience': 'Years Experience',
    'summary.projectsCompleted': 'Projects Completed',
    'summary.technologiesMastered': 'Technologies Mastered',
    'summary.industriesServed': 'Industries Served',
    
    // Experience section
    'experience.title': 'Professional Experience',
    'experience.noData': 'No experience information available',
    'experience.subtitle': 'Explore my professional journey and key achievements across different roles and industries',
    'experience.achievements': 'Key Achievements',
    'experience.responsibilities': 'Key Responsibilities',
    'experience.technologies': 'Technologies Used',
    'experience.year': 'year',
    'experience.years': 'years',
    
    // Skills section
    'skills.title': 'Technical Skills',
    'skills.noData': 'No skills information available',
    'skills.subtitle': 'Expertise and proficiency levels across various technologies and domains',
    'skills.gridView': 'Grid',
    'skills.chartView': 'Chart',
    'skills.listView': 'List',
    'skills.summary': 'Skills Overview',
    'skills.totalSkills': 'Total Skills',
    'skills.categories': 'Categories',
    'skills.expertLevel': 'Expert Level',
    'skills.avgExperience': 'Avg. Years',
    'skills.levels.expert': 'Expert',
    'skills.levels.advanced': 'Advanced',
    'skills.levels.intermediate': 'Intermediate',
    'skills.levels.beginner': 'Beginner',
    
    // Education section
    'education.title': 'Education',
    'education.noData': 'No education or activities information available',
    
    // Projects section
    'projects.title': 'Projects',
    'projects.subtitle': 'projects subtitle',
    'projects.searchPlaceholder': 'projects search/file-placeholder',
    'projects.showFilters': 'Show Filters',
    'projects.hideFilters': 'Hide Filters',
    
    // Language
    'language.english': 'English',
    'language.portuguese': 'Portuguese',
    'language.switchTo': 'Switch to {language}',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.noResults': 'No results found',
  },
  pt: {
    // Navigation
    'navigation.home': 'Início',
    'navigation.summary': 'Resumo',
    'navigation.experience': 'Experiência',
    'navigation.skills': 'Habilidades',
    'navigation.education': 'Educação',
    'navigation.projects': 'Projetos',
    
    // Summary section
    'summary.title': 'Resumo Profissional',
    'summary.noData': 'Nenhuma informação de resumo disponível',
    'summary.objective': 'Objetivo',
    'summary.keyQualifications': 'Qualificações Principais',
    'summary.highlights': 'Destaques da Carreira',
    'summary.yearsExperience': 'Anos de Experiência',
    'summary.projectsCompleted': 'Projetos Concluídos',
    'summary.technologiesMastered': 'Tecnologias Dominadas',
    'summary.industriesServed': 'Setores Atendidos',
    
    // Experience section
    'experience.title': 'Experiência Profissional',
    'experience.noData': 'Nenhuma informação de experiência disponível',
    'experience.subtitle': 'Explore minha jornada profissional e principais conquistas em diferentes funções e setores',
    'experience.achievements': 'Principais Conquistas',
    'experience.responsibilities': 'Principais Responsabilidades',
    'experience.technologies': 'Tecnologias Utilizadas',
    'experience.year': 'ano',
    'experience.years': 'anos',
    
    // Skills section
    'skills.title': 'Habilidades Técnicas',
    'skills.noData': 'Nenhuma informação de habilidades disponível',
    'skills.subtitle': 'Expertise e níveis de proficiência em várias tecnologias e domínios',
    'skills.gridView': 'Grade',
    'skills.chartView': 'Gráfico',
    'skills.listView': 'Lista',
    'skills.summary': 'Visão Geral das Habilidades',
    'skills.totalSkills': 'Total de Habilidades',
    'skills.categories': 'Categorias',
    'skills.expertLevel': 'Nível Expert',
    'skills.avgExperience': 'Média de Anos',
    'skills.levels.expert': 'Expert',
    'skills.levels.advanced': 'Avançado',
    'skills.levels.intermediate': 'Intermediário',
    'skills.levels.beginner': 'Iniciante',
    
    // Education section
    'education.title': 'Educação',
    'education.noData': 'Nenhuma informação de educação ou atividades disponível',
    
    // Projects section
    'projects.title': 'Projetos',
    'projects.subtitle': 'subtítulo dos projetos',
    'projects.searchPlaceholder': 'placeholder de busca/arquivo dos projetos',
    'projects.showFilters': 'Mostrar Filtros',
    'projects.hideFilters': 'Ocultar Filtros',
    
    // Language
    'language.english': 'Inglês',
    'language.portuguese': 'Português',
    'language.switchTo': 'Mudar para {language}',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Ocorreu um erro',
    'common.noResults': 'Nenhum resultado encontrado',
  }
};

/**
 * Custom hook that provides translation functionality
 * for our bilingual resume application
 */
export function useTranslation() {
  const { language, setLanguage, isLoading } = useLanguage();

  /**
   * Get translation with fallback support
   */
  const translate = (key: string, fallback?: string | { [key: string]: any }, options?: { [key: string]: any }) => {
    let translation = translations[language]?.[key];
    
    if (!translation) {
      if (typeof fallback === 'string') {
        translation = fallback;
      } else {
        translation = key;
        if (fallback && typeof fallback === 'object') {
          options = fallback;
        }
      }
    }
    
    // Handle interpolation
    if (options && typeof translation === 'string') {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{${optionKey}}`, options[optionKey]);
      });
    }
    
    return translation;
  };

  /**
   * Get translation with HTML support (for rich text content)
   */
  const translateHTML = (key: string, fallback?: string) => {
    // Return fallback or key as fallback
    return fallback || key;
  };

  /**
   * Check if a translation key exists
   */
  const hasTranslation = (key: string): boolean => {
    return false; // No translations available in fallback mode
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
    i18n: null, // No i18n in fallback mode
  };
}