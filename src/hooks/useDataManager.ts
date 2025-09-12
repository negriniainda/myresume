import { useState, useEffect, useCallback, useMemo } from 'react';
import { dataService } from '@/services/data-service';
import type {
  ResumeData,
  Project,
  SupportedLanguage,
  FilterOptions,
  SearchResult,
  ExperienceMetrics,
  ProjectMetrics,
  SkillMetrics,
  EnhancedExperienceItem,
  EnhancedProject,
  TransformedData,
  DataLoadOptions,
} from '@/types';

interface UseDataManagerOptions {
  language: SupportedLanguage;
  autoLoad?: boolean;
  enableCache?: boolean;
}

interface DataState {
  resume: ResumeData | null;
  projects: Project[] | null;
  enhancedExperience: EnhancedExperienceItem[] | null;
  enhancedProjects: EnhancedProject[] | null;
  metrics: {
    experience: ExperienceMetrics | null;
    projects: ProjectMetrics | null;
    skills: SkillMetrics | null;
  };
  loading: {
    resume: boolean;
    projects: boolean;
    search: boolean;
    metrics: boolean;
  };
  errors: {
    resume: string | null;
    projects: string | null;
    search: string | null;
    metrics: string | null;
  };
  searchResults: {
    resume: SearchResult<any>[];
    projects: SearchResult<Project>[];
    totalResults: number;
  };
  filteredData: {
    experience: TransformedData<EnhancedExperienceItem> | null;
    projects: TransformedData<EnhancedProject> | null;
  };
}

const initialState: DataState = {
  resume: null,
  projects: null,
  enhancedExperience: null,
  enhancedProjects: null,
  metrics: {
    experience: null,
    projects: null,
    skills: null,
  },
  loading: {
    resume: false,
    projects: false,
    search: false,
    metrics: false,
  },
  errors: {
    resume: null,
    projects: null,
    search: null,
    metrics: null,
  },
  searchResults: {
    resume: [],
    projects: [],
    totalResults: 0,
  },
  filteredData: {
    experience: null,
    projects: null,
  },
};

/**
 * Custom hook for managing resume and project data
 */
export function useDataManager(options: UseDataManagerOptions) {
  const [state, setState] = useState<DataState>(initialState);
  const { language, autoLoad = true, enableCache = true } = options;

  const loadOptions: DataLoadOptions = useMemo(() => ({
    useCache: enableCache,
    language,
  }), [enableCache, language]);

  /**
   * Load resume data
   */
  const loadResumeData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, resume: true },
      errors: { ...prev.errors, resume: null },
    }));

    try {
      const result = await dataService.loadResumeData(language, {
        ...loadOptions,
        forceRefresh,
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          resume: result.data!,
          loading: { ...prev.loading, resume: false },
        }));
      } else {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, resume: false },
          errors: { ...prev.errors, resume: errorMessage },
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, resume: false },
        errors: { ...prev.errors, resume: `Failed to load resume: ${error}` },
      }));
    }
  }, [language, loadOptions]);

  /**
   * Load projects data
   */
  const loadProjectsData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, projects: true },
      errors: { ...prev.errors, projects: null },
    }));

    try {
      const result = await dataService.loadProjectsData(language, {
        ...loadOptions,
        forceRefresh,
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          projects: result.data!,
          loading: { ...prev.loading, projects: false },
        }));
      } else {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, projects: false },
          errors: { ...prev.errors, projects: errorMessage },
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, projects: false },
        errors: { ...prev.errors, projects: `Failed to load projects: ${error}` },
      }));
    }
  }, [language, loadOptions]);

  /**
   * Load enhanced data with metrics
   */
  const loadEnhancedData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, metrics: true },
      errors: { ...prev.errors, metrics: null },
    }));

    try {
      const [enhancedResumeResult, enhancedProjectsResult] = await Promise.all([
        dataService.getEnhancedResumeData(language, { ...loadOptions, forceRefresh }),
        dataService.getEnhancedProjectsData(language, { ...loadOptions, forceRefresh }),
      ]);

      let enhancedExperience: EnhancedExperienceItem[] | null = null;
      let experienceMetrics: ExperienceMetrics | null = null;
      let skillsMetrics: SkillMetrics | null = null;

      if (enhancedResumeResult.success && enhancedResumeResult.data) {
        enhancedExperience = enhancedResumeResult.data.enhancedExperience;
        experienceMetrics = enhancedResumeResult.data.metrics;
        
        // Calculate skills metrics from resume data
        if (enhancedResumeResult.data.resume.skills) {
          const metricsResult = await dataService.getComprehensiveMetrics(language, loadOptions);
          if (metricsResult) {
            skillsMetrics = metricsResult.skills;
          }
        }
      }

      let enhancedProjects: EnhancedProject[] | null = null;
      let projectsMetrics: ProjectMetrics | null = null;

      if (enhancedProjectsResult.success && enhancedProjectsResult.data) {
        enhancedProjects = enhancedProjectsResult.data.enhancedProjects;
        projectsMetrics = enhancedProjectsResult.data.metrics;
      }

      setState(prev => ({
        ...prev,
        enhancedExperience,
        enhancedProjects,
        metrics: {
          experience: experienceMetrics,
          projects: projectsMetrics,
          skills: skillsMetrics,
        },
        loading: { ...prev.loading, metrics: false },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, metrics: false },
        errors: { ...prev.errors, metrics: `Failed to load enhanced data: ${error}` },
      }));
    }
  }, [language, loadOptions]);

  /**
   * Search across all content
   */
  const searchContent = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setState(prev => ({
        ...prev,
        searchResults: { resume: [], projects: [], totalResults: 0 },
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, search: true },
      errors: { ...prev.errors, search: null },
    }));

    try {
      const results = await dataService.searchContent(searchTerm, language, loadOptions);
      
      setState(prev => ({
        ...prev,
        searchResults: {
          resume: results.resumeResults,
          projects: results.projectResults,
          totalResults: results.totalResults,
        },
        loading: { ...prev.loading, search: false },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, search: false },
        errors: { ...prev.errors, search: `Search failed: ${error}` },
      }));
    }
  }, [language, loadOptions]);

  /**
   * Filter experience data
   */
  const filterExperience = useCallback(async (filters: FilterOptions) => {
    try {
      const result = await dataService.getFilteredExperience(language, filters, loadOptions);
      
      setState(prev => ({
        ...prev,
        filteredData: {
          ...prev.filteredData,
          experience: result,
        },
      }));
    } catch (error) {
      console.error('Failed to filter experience:', error);
    }
  }, [language, loadOptions]);

  /**
   * Filter projects data
   */
  const filterProjects = useCallback(async (filters: FilterOptions) => {
    try {
      const result = await dataService.getFilteredProjects(language, filters, loadOptions);
      
      setState(prev => ({
        ...prev,
        filteredData: {
          ...prev.filteredData,
          projects: result,
        },
      }));
    } catch (error) {
      console.error('Failed to filter projects:', error);
    }
  }, [language, loadOptions]);

  /**
   * Refresh all data
   */
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadResumeData(true),
      loadProjectsData(true),
      loadEnhancedData(true),
    ]);
  }, [loadResumeData, loadProjectsData, loadEnhancedData]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    dataService.clearCache();
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return dataService.getCacheStats();
  }, []);

  // Auto-load data when language changes
  useEffect(() => {
    if (autoLoad) {
      loadResumeData();
      loadProjectsData();
      loadEnhancedData();
    }
  }, [language, autoLoad, loadResumeData, loadProjectsData, loadEnhancedData]);

  // Computed values
  const isLoading = useMemo(() => {
    return Object.values(state.loading).some(loading => loading);
  }, [state.loading]);

  const hasErrors = useMemo(() => {
    return Object.values(state.errors).some(error => error !== null);
  }, [state.errors]);

  const isDataLoaded = useMemo(() => {
    return state.resume !== null && state.projects !== null;
  }, [state.resume, state.projects]);

  const allTechnologies = useMemo(() => {
    const technologies = new Set<string>();
    
    if (state.resume?.experience) {
      state.resume.experience.forEach(exp => {
        exp.technologies.forEach(tech => technologies.add(tech));
      });
    }
    
    if (state.resume?.skills) {
      state.resume.skills.forEach(category => {
        category.skills.forEach(skill => technologies.add(skill.name));
      });
    }
    
    if (state.projects) {
      state.projects.forEach(project => {
        if (project.technologies) {
          project.technologies.forEach(tech => technologies.add(tech));
        }
      });
    }
    
    return Array.from(technologies).sort();
  }, [state.resume, state.projects]);

  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    
    if (state.enhancedExperience) {
      state.enhancedExperience.forEach(exp => {
        if (exp.industry) {
          industries.add(exp.industry);
        }
      });
    }
    
    if (state.projects) {
      state.projects.forEach(project => {
        industries.add(project.industry);
      });
    }
    
    return Array.from(industries).sort();
  }, [state.enhancedExperience, state.projects]);

  return {
    // Data
    resume: state.resume,
    projects: state.projects,
    enhancedExperience: state.enhancedExperience,
    enhancedProjects: state.enhancedProjects,
    metrics: state.metrics,
    searchResults: state.searchResults,
    filteredData: state.filteredData,
    
    // Computed values
    isLoading,
    hasErrors,
    isDataLoaded,
    allTechnologies,
    allIndustries,
    
    // Loading states
    loading: state.loading,
    errors: state.errors,
    
    // Actions
    loadResumeData,
    loadProjectsData,
    loadEnhancedData,
    searchContent,
    filterExperience,
    filterProjects,
    refreshAllData,
    clearCache,
    getCacheStats,
  };
}

/**
 * Hook for managing search functionality
 */
export function useSearch(language: SupportedLanguage) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    resume: SearchResult<any>[];
    projects: SearchResult<Project>[];
    totalResults: number;
  }>({ resume: [], projects: [], totalResults: 0 });
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults({ resume: [], projects: [], totalResults: 0 });
      return;
    }

    setIsSearching(true);
    try {
      const results = await dataService.searchContent(term, language);
      setSearchResults({
        resume: results.resumeResults,
        projects: results.projectResults,
        totalResults: results.totalResults,
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [language]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults({ resume: [], projects: [], totalResults: 0 });
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
  };
}

/**
 * Hook for managing filters
 */
export function useFilters() {
  const [filters, setFilters] = useState<FilterOptions>({});

  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    });
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}