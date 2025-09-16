import React, { useState, useCallback, useMemo } from 'react';
import { ExperienceItem, Project, Skill, FilterOptions } from '../types';

export interface FilterState {
  // Experience filters
  roleTypes: string[];
  industries: string[];
  companySizes: string[];
  technologies: string[];
  companies: string[];
  
  // Skills filters
  skillLevels: Array<'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'>;
  skillCategories: string[];
  
  // Projects filters
  projectTypes: string[];
  clientTypes: string[];
  projectIndustries: string[];
  
  // Date range filter
  dateRange: {
    start?: string;
    end?: string;
  };
  
  // Search term
  searchTerm: string;
}

export interface FilteredResults<T> {
  items: T[];
  totalCount: number;
  filteredCount: number;
  appliedFilters: string[];
}

const initialFilterState: FilterState = {
  roleTypes: [],
  industries: [],
  companySizes: [],
  technologies: [],
  companies: [],
  skillLevels: [],
  skillCategories: [],
  projectTypes: [],
  clientTypes: [],
  projectIndustries: [],
  dateRange: {},
  searchTerm: ''
};

const useFilters = (
  experienceData?: ExperienceItem[],
  projectsData?: Project[],
  skillsData?: Skill[]
) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const options = {
      roleTypes: new Set<string>(),
      industries: new Set<string>(),
      companySizes: new Set<string>(),
      technologies: new Set<string>(),
      companies: new Set<string>(),
      skillLevels: new Set<'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'>(),
      skillCategories: new Set<string>(),
      projectTypes: new Set<string>(),
      clientTypes: new Set<string>(),
      projectIndustries: new Set<string>()
    };

    // Extract from experience data
    experienceData?.forEach(exp => {
      if (exp.roleType) options.roleTypes.add(exp.roleType);
      if (exp.industry) options.industries.add(exp.industry);
      if (exp.companySize) options.companySizes.add(exp.companySize);
      options.companies.add(exp.company);
      exp.technologies.forEach(tech => options.technologies.add(tech));
    });

    // Extract from projects data
    projectsData?.forEach(project => {
      options.projectTypes.add(project.projectType);
      options.clientTypes.add(project.clientType);
      options.projectIndustries.add(project.industry);
      project.technologies?.forEach(tech => options.technologies.add(tech));
    });

    // Extract from skills data
    skillsData?.forEach(skill => {
      options.skillLevels.add(skill.level);
      if (skill.category) options.skillCategories.add(skill.category);
    });

    return {
      roleTypes: Array.from(options.roleTypes).sort(),
      industries: Array.from(options.industries).sort(),
      companySizes: Array.from(options.companySizes).sort(),
      technologies: Array.from(options.technologies).sort(),
      companies: Array.from(options.companies).sort(),
      skillLevels: Array.from(options.skillLevels).sort(),
      skillCategories: Array.from(options.skillCategories).sort(),
      projectTypes: Array.from(options.projectTypes).sort(),
      clientTypes: Array.from(options.clientTypes).sort(),
      projectIndustries: Array.from(options.projectIndustries).sort()
    };
  }, [experienceData, projectsData, skillsData]);

  // Filter experience items
  const filteredExperience = useMemo((): FilteredResults<ExperienceItem> => {
    if (!experienceData) {
      return { items: [], totalCount: 0, filteredCount: 0, appliedFilters: [] };
    }

    let filtered = experienceData;
    const appliedFilters: string[] = [];

    // Apply role type filter
    if (filters.roleTypes.length > 0) {
      filtered = filtered.filter(exp => 
        exp.roleType && filters.roleTypes.includes(exp.roleType)
      );
      appliedFilters.push(`Role: ${filters.roleTypes.join(', ')}`);
    }

    // Apply industry filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(exp => 
        exp.industry && filters.industries.includes(exp.industry)
      );
      appliedFilters.push(`Industry: ${filters.industries.join(', ')}`);
    }

    // Apply company size filter
    if (filters.companySizes.length > 0) {
      filtered = filtered.filter(exp => 
        exp.companySize && filters.companySizes.includes(exp.companySize)
      );
      appliedFilters.push(`Company Size: ${filters.companySizes.join(', ')}`);
    }

    // Apply company filter
    if (filters.companies.length > 0) {
      filtered = filtered.filter(exp => 
        filters.companies.includes(exp.company)
      );
      appliedFilters.push(`Company: ${filters.companies.join(', ')}`);
    }

    // Apply technology filter
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(exp => 
        exp.technologies.some(tech => filters.technologies.includes(tech))
      );
      appliedFilters.push(`Technology: ${filters.technologies.join(', ')}`);
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(exp => {
        const startYear = parseInt(exp.period.start);
        const endYear = exp.period.end === 'Present' ? new Date().getFullYear() : parseInt(exp.period.end);
        
        if (filters.dateRange.start && startYear < parseInt(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && endYear > parseInt(filters.dateRange.end)) {
          return false;
        }
        return true;
      });
      
      const dateRangeText = `${filters.dateRange.start || 'Start'} - ${filters.dateRange.end || 'Present'}`;
      appliedFilters.push(`Date Range: ${dateRangeText}`);
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.position.toLowerCase().includes(searchLower) ||
        exp.company.toLowerCase().includes(searchLower) ||
        exp.description.toLowerCase().includes(searchLower) ||
        exp.technologies.some(tech => tech.toLowerCase().includes(searchLower)) ||
        exp.achievements.some(achievement => 
          achievement.description.toLowerCase().includes(searchLower) ||
          (achievement.impact && achievement.impact.toLowerCase().includes(searchLower))
        )
      );
      appliedFilters.push(`Search: "${filters.searchTerm}"`);
    }

    return {
      items: filtered,
      totalCount: experienceData.length,
      filteredCount: filtered.length,
      appliedFilters
    };
  }, [experienceData, filters]);

  // Filter projects
  const filteredProjects = useMemo((): FilteredResults<Project> => {
    if (!projectsData) {
      return { items: [], totalCount: 0, filteredCount: 0, appliedFilters: [] };
    }

    let filtered = projectsData;
    const appliedFilters: string[] = [];

    // Apply project type filter
    if (filters.projectTypes.length > 0) {
      filtered = filtered.filter(project => 
        filters.projectTypes.includes(project.projectType)
      );
      appliedFilters.push(`Project Type: ${filters.projectTypes.join(', ')}`);
    }

    // Apply client type filter
    if (filters.clientTypes.length > 0) {
      filtered = filtered.filter(project => 
        filters.clientTypes.includes(project.clientType)
      );
      appliedFilters.push(`Client Type: ${filters.clientTypes.join(', ')}`);
    }

    // Apply industry filter
    if (filters.projectIndustries.length > 0) {
      filtered = filtered.filter(project => 
        filters.projectIndustries.includes(project.industry)
      );
      appliedFilters.push(`Industry: ${filters.projectIndustries.join(', ')}`);
    }

    // Apply technology filter
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(project => 
        project.technologies?.some(tech => filters.technologies.includes(tech))
      );
      appliedFilters.push(`Technology: ${filters.technologies.join(', ')}`);
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.problem.toLowerCase().includes(searchLower) ||
        project.action.toLowerCase().includes(searchLower) ||
        project.result.toLowerCase().includes(searchLower) ||
        project.industry.toLowerCase().includes(searchLower) ||
        project.technologies?.some(tech => tech.toLowerCase().includes(searchLower))
      );
      appliedFilters.push(`Search: "${filters.searchTerm}"`);
    }

    return {
      items: filtered,
      totalCount: projectsData.length,
      filteredCount: filtered.length,
      appliedFilters
    };
  }, [projectsData, filters]);

  // Filter skills
  const filteredSkills = useMemo((): FilteredResults<Skill> => {
    if (!skillsData) {
      return { items: [], totalCount: 0, filteredCount: 0, appliedFilters: [] };
    }

    let filtered = skillsData;
    const appliedFilters: string[] = [];

    // Apply skill level filter
    if (filters.skillLevels.length > 0) {
      filtered = filtered.filter(skill => 
        filters.skillLevels.includes(skill.level)
      );
      appliedFilters.push(`Level: ${filters.skillLevels.join(', ')}`);
    }

    // Apply skill category filter
    if (filters.skillCategories.length > 0) {
      filtered = filtered.filter(skill => 
        skill.category && filters.skillCategories.includes(skill.category)
      );
      appliedFilters.push(`Category: ${filters.skillCategories.join(', ')}`);
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchLower) ||
        (skill.category && skill.category.toLowerCase().includes(searchLower))
      );
      appliedFilters.push(`Search: "${filters.searchTerm}"`);
    }

    return {
      items: filtered,
      totalCount: skillsData.length,
      filteredCount: filtered.length,
      appliedFilters
    };
  }, [skillsData, filters]);

  // Update filter functions
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleFilterValue = useCallback(<K extends keyof FilterState>(
    key: K,
    value: string
  ) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [key]: newValues };
    });
  }, []);

  const clearFilter = useCallback(<K extends keyof FilterState>(key: K) => {
    setFilters(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : key === 'dateRange' ? {} : ''
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'dateRange') {
        return Object.keys(value as object).length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return Boolean(value);
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'dateRange') {
        if (Object.keys(value as object).length > 0) count++;
      } else if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else if (value) {
        count++;
      }
    });
    return count;
  }, [filters]);

  // URL synchronization (for bookmarking filtered states)
  const getFilterUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'dateRange') {
        const dateRange = value as FilterState['dateRange'];
        if (dateRange.start) params.set('dateStart', dateRange.start);
        if (dateRange.end) params.set('dateEnd', dateRange.end);
      } else if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value) {
        params.set(key, String(value));
      }
    });
    
    return params.toString();
  }, [filters]);

  const setFiltersFromUrl = useCallback((urlParams: URLSearchParams) => {
    const newFilters: Partial<FilterState> = {};
    
    // Parse array filters
    const arrayKeys: Array<keyof FilterState> = [
      'roleTypes', 'industries', 'companySizes', 'technologies', 'companies',
      'skillLevels', 'skillCategories', 'projectTypes', 'clientTypes', 'projectIndustries'
    ];
    
    arrayKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        newFilters[key] = value.split(',') as any;
      }
    });
    
    // Parse date range
    const dateStart = urlParams.get('dateStart');
    const dateEnd = urlParams.get('dateEnd');
    if (dateStart || dateEnd) {
      newFilters.dateRange = {
        start: dateStart || undefined,
        end: dateEnd || undefined
      };
    }
    
    // Parse search term
    const searchTerm = urlParams.get('searchTerm');
    if (searchTerm) {
      newFilters.searchTerm = searchTerm;
    }
    
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Auto-sync with URL parameters
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFiltersFromUrl(params);
    }
  }, [setFiltersFromUrl]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const filterUrl = getFilterUrl();
      const currentParams = new URLSearchParams(window.location.search);
      
      // Only update URL if filters have changed
      if (filterUrl !== currentParams.toString()) {
        const newUrl = `${window.location.pathname}${filterUrl ? '?' + filterUrl : ''}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [getFilterUrl]);

  return {
    filters,
    filterOptions,
    filteredExperience,
    filteredProjects,
    filteredSkills,
    updateFilter,
    toggleFilterValue,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    getFilterUrl,
    setFiltersFromUrl
  };
};

export default useFilters;