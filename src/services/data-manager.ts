import type {
  ResumeData,
  Project,
  SupportedLanguage,
  DataCache,
  CacheConfig,
  DataLoadOptions,
  FilterOptions,
  SearchResult,
  SearchMatch,
  DataTransformOptions,
  TransformedData,
  ExperienceMetrics,
  ProjectMetrics,
  SkillMetrics,
  EnhancedExperienceItem,
  EnhancedProject,
  SkillWithMetadata,
  ExperienceItem,
  Skill,
  SkillCategory,
} from '@/types';

/**
 * Comprehensive data management service for the bilingual resume application
 * Handles data loading, caching, transformation, filtering, and search functionality
 */
export class DataManager {
  private cache = new Map<string, DataCache<unknown>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default TTL
      maxSize: 50, // Maximum 50 cached items
      version: '1.0.0',
      ...config,
    };
  }

  /**
   * Load resume data with caching support
   */
  async loadResumeData(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<ResumeData | null> {
    const cacheKey = `resume-${language}`;
    
    // Check cache first unless force refresh is requested
    if (options.useCache !== false && !options.forceRefresh) {
      const cached = this.getFromCache<ResumeData>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // In a real implementation, this would load from JSON files or API
      const response = await fetch(`/api/resume/${language}`);
      if (!response.ok) {
        throw new Error(`Failed to load resume data: ${response.statusText}`);
      }
      
      const data: ResumeData = await response.json();
      
      // Cache the loaded data
      if (options.useCache !== false) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Error loading resume data for ${language}:`, error);
      return null;
    }
  }

  /**
   * Load projects data with caching support
   */
  async loadProjectsData(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<Project[] | null> {
    const cacheKey = `projects-${language}`;
    
    if (options.useCache !== false && !options.forceRefresh) {
      const cached = this.getFromCache<Project[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(`/api/projects/${language}`);
      if (!response.ok) {
        throw new Error(`Failed to load projects data: ${response.statusText}`);
      }
      
      const data: Project[] = await response.json();
      
      if (options.useCache !== false) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Error loading projects data for ${language}:`, error);
      return null;
    }
  }

  /**
   * Search across all resume content
   */
  searchContent<T>(
    items: T[],
    searchTerm: string,
    searchFields: Array<keyof T>
  ): SearchResult<T>[] {
    if (!searchTerm.trim()) {
      return items.map(item => ({ item, score: 1, matches: [] }));
    }

    const results: SearchResult<T>[] = [];
    const normalizedTerm = searchTerm.toLowerCase();

    for (const item of items) {
      const matches: SearchMatch[] = [];
      let totalScore = 0;

      for (const field of searchFields) {
        const value = item[field];
        if (typeof value === 'string') {
          const normalizedValue = value.toLowerCase();
          const indices = this.findAllIndices(normalizedValue, normalizedTerm);
          
          if (indices.length > 0) {
            matches.push({
              field: String(field),
              value,
              indices,
            });
            
            // Calculate score based on match quality
            const exactMatch = normalizedValue === normalizedTerm;
            const startsWithMatch = normalizedValue.startsWith(normalizedTerm);
            const wordBoundaryMatch = new RegExp(`\\b${normalizedTerm}\\b`).test(normalizedValue);
            
            let fieldScore = indices.length;
            if (exactMatch) fieldScore *= 10;
            else if (startsWithMatch) fieldScore *= 5;
            else if (wordBoundaryMatch) fieldScore *= 3;
            
            totalScore += fieldScore;
          }
        } else if (Array.isArray(value)) {
          // Search in array fields
          for (const arrayItem of value) {
            if (typeof arrayItem === 'string') {
              const normalizedArrayItem = arrayItem.toLowerCase();
              if (normalizedArrayItem.includes(normalizedTerm)) {
                matches.push({
                  field: String(field),
                  value: arrayItem,
                  indices: this.findAllIndices(normalizedArrayItem, normalizedTerm),
                });
                totalScore += 2;
              }
            }
          }
        }
      }

      if (matches.length > 0) {
        results.push({
          item,
          score: totalScore,
          matches,
        });
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Filter experience items based on criteria
   */
  filterExperience(
    experience: ExperienceItem[],
    filters: FilterOptions
  ): ExperienceItem[] {
    return experience.filter(item => {
      // Search term filter
      if (filters.searchTerm) {
        const searchResults = this.searchContent(
          [item],
          filters.searchTerm,
          ['position', 'company', 'description']
        );
        if (searchResults.length === 0) return false;
      }

      // Technology filter
      if (filters.technologies && filters.technologies.length > 0) {
        const hasMatchingTech = filters.technologies.some(tech =>
          item.technologies.some(itemTech =>
            itemTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) return false;
      }

      // Company filter
      if (filters.companies && filters.companies.length > 0) {
        const hasMatchingCompany = filters.companies.some(company =>
          item.company.toLowerCase().includes(company.toLowerCase())
        );
        if (!hasMatchingCompany) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemStartYear = parseInt(item.period.start);
        const itemEndYear = item.period.end === 'Present' ? 
          new Date().getFullYear() : parseInt(item.period.end);

        if (filters.dateRange.start) {
          const filterStartYear = parseInt(filters.dateRange.start);
          if (itemEndYear < filterStartYear) return false;
        }

        if (filters.dateRange.end) {
          const filterEndYear = parseInt(filters.dateRange.end);
          if (itemStartYear > filterEndYear) return false;
        }
      }

      return true;
    });
  }

  /**
   * Filter projects based on criteria
   */
  filterProjects(projects: Project[], filters: FilterOptions): Project[] {
    return projects.filter(project => {
      // Search term filter
      if (filters.searchTerm) {
        const searchResults = this.searchContent(
          [project],
          filters.searchTerm,
          ['title', 'problem', 'action', 'result', 'industry']
        );
        if (searchResults.length === 0) return false;
      }

      // Technology filter
      if (filters.technologies && filters.technologies.length > 0 && project.technologies) {
        const hasMatchingTech = filters.technologies.some(tech =>
          project.technologies!.some(projectTech =>
            projectTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) return false;
      }

      // Industry filter
      if (filters.industries && filters.industries.length > 0) {
        const hasMatchingIndustry = filters.industries.some(industry =>
          project.industry.toLowerCase().includes(industry.toLowerCase())
        );
        if (!hasMatchingIndustry) return false;
      }

      // Project type filter
      if (filters.projectTypes && filters.projectTypes.length > 0) {
        const hasMatchingType = filters.projectTypes.some(type =>
          project.projectType.toLowerCase().includes(type.toLowerCase())
        );
        if (!hasMatchingType) return false;
      }

      return true;
    });
  }

  /**
   * Filter skills based on criteria
   */
  filterSkills(skills: SkillCategory[], filters: FilterOptions): SkillCategory[] {
    return skills.map(category => ({
      ...category,
      skills: category.skills.filter(skill => {
        // Search term filter
        if (filters.searchTerm) {
          const matchesName = skill.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
          const matchesCategory = category.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
          if (!matchesName && !matchesCategory) return false;
        }

        // Skill level filter
        if (filters.skillLevels && filters.skillLevels.length > 0) {
          if (!filters.skillLevels.includes(skill.level)) return false;
        }

        return true;
      }),
    })).filter(category => category.skills.length > 0);
  }

  /**
   * Transform and aggregate data based on options
   */
  transformData<T>(
    data: T[],
    options: DataTransformOptions
  ): TransformedData<T> {
    let transformedData = [...data];

    // Apply sorting
    if (options.sortBy) {
      transformedData.sort((a, b) => {
        const aValue = (a as any)[options.sortBy!];
        const bValue = (b as any)[options.sortBy!];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply limit
    const originalLength = transformedData.length;
    if (options.limit && options.limit > 0) {
      transformedData = transformedData.slice(0, options.limit);
    }

    return {
      data: transformedData,
      metadata: {
        total: originalLength,
        filtered: transformedData.length,
        transformedAt: Date.now(),
      },
    };
  }

  /**
   * Calculate experience metrics
   */
  calculateExperienceMetrics(experience: ExperienceItem[]): ExperienceMetrics {
    const totalYears = this.calculateTotalExperience(experience);
    const companies = new Set(experience.map(exp => exp.company));
    const roles = new Set(experience.map(exp => exp.position));
    const industries = new Set(
      experience
        .map(exp => (exp as EnhancedExperienceItem).industry)
        .filter(Boolean)
    );

    // Calculate technology usage
    const techCount = new Map<string, { count: number; years: number }>();
    experience.forEach(exp => {
      const expYears = this.calculateExperienceYears(exp);
      exp.technologies.forEach(tech => {
        const current = techCount.get(tech) || { count: 0, years: 0 };
        techCount.set(tech, {
          count: current.count + 1,
          years: current.years + expYears,
        });
      });
    });

    const topTechnologies = Array.from(techCount.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate career progression
    const careerProgression = experience
      .sort((a, b) => parseInt(a.period.start) - parseInt(b.period.start))
      .map(exp => ({
        year: exp.period.start,
        level: exp.position,
        company: exp.company,
      }));

    return {
      totalYears,
      companiesWorked: companies.size,
      rolesHeld: roles.size,
      industriesExperienced: Array.from(industries) as string[],
      topTechnologies,
      careerProgression,
    };
  }

  /**
   * Calculate project metrics
   */
  calculateProjectMetrics(projects: Project[]): ProjectMetrics {
    const industries = new Set(projects.map(p => p.industry));
    const clientTypes = new Map<string, number>();
    const techCount = new Map<string, number>();

    let totalDuration = 0;
    let durationCount = 0;

    projects.forEach(project => {
      // Count client types
      const current = clientTypes.get(project.clientType) || 0;
      clientTypes.set(project.clientType, current + 1);

      // Count technologies
      if (project.technologies) {
        project.technologies.forEach(tech => {
          const techCurrent = techCount.get(tech) || 0;
          techCount.set(tech, techCurrent + 1);
        });
      }

      // Calculate average duration (assuming duration is in months)
      const durationMatch = project.duration.match(/(\d+)/);
      if (durationMatch) {
        totalDuration += parseInt(durationMatch[1]);
        durationCount++;
      }
    });

    const topTechnologies = Array.from(techCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const clientTypesArray = Array.from(clientTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalProjects: projects.length,
      industriesCovered: Array.from(industries),
      averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      successRate: 100, // Assuming all projects are successful for now
      topTechnologies,
      clientTypes: clientTypesArray,
    };
  }

  /**
   * Calculate skill metrics
   */
  calculateSkillMetrics(skillCategories: SkillCategory[]): SkillMetrics {
    const allSkills = skillCategories.flatMap(cat => cat.skills);
    const expertSkills = allSkills.filter(skill => skill.level === 'Expert');
    const advancedSkills = allSkills.filter(skill => skill.level === 'Advanced');

    const skillsByCategory = skillCategories.map(cat => ({
      category: cat.name,
      count: cat.skills.length,
    }));

    const yearsOfExperience = allSkills
      .filter(skill => skill.yearsOfExperience)
      .map(skill => ({
        skill: skill.name,
        years: skill.yearsOfExperience!,
      }))
      .sort((a, b) => b.years - a.years);

    // Mock trending skills - in real implementation, this would be based on market data
    const trendingSkills = ['TypeScript', 'React', 'Node.js', 'AWS', 'Docker'];

    return {
      totalSkills: allSkills.length,
      expertSkills: expertSkills.length,
      advancedSkills: advancedSkills.length,
      skillsByCategory,
      trendingSkills,
      yearsOfExperience,
    };
  }

  /**
   * Get all unique technologies from experience and projects
   */
  getAllTechnologies(experience: ExperienceItem[], projects: Project[]): string[] {
    const technologies = new Set<string>();

    experience.forEach(exp => {
      exp.technologies.forEach(tech => technologies.add(tech));
    });

    projects.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => technologies.add(tech));
      }
    });

    return Array.from(technologies).sort();
  }

  /**
   * Get all unique industries from experience and projects
   */
  getAllIndustries(experience: ExperienceItem[], projects: Project[]): string[] {
    const industries = new Set<string>();

    experience.forEach(exp => {
      const enhancedExp = exp as EnhancedExperienceItem;
      if (enhancedExp.industry) {
        industries.add(enhancedExp.industry);
      }
    });

    projects.forEach(project => {
      industries.add(project.industry);
    });

    return Array.from(industries).sort();
  }

  // Private helper methods

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as DataCache<T> | undefined;
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Check version compatibility
    if (cached.version !== this.config.version) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      version: this.config.version,
    });
  }

  private findAllIndices(text: string, searchTerm: string): [number, number][] {
    const indices: [number, number][] = [];
    let index = text.indexOf(searchTerm);
    
    while (index !== -1) {
      indices.push([index, index + searchTerm.length]);
      index = text.indexOf(searchTerm, index + 1);
    }
    
    return indices;
  }

  private calculateTotalExperience(experience: ExperienceItem[]): number {
    let totalMonths = 0;
    
    experience.forEach(exp => {
      totalMonths += this.calculateExperienceYears(exp) * 12;
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  }

  private calculateExperienceYears(experience: ExperienceItem): number {
    const startYear = parseInt(experience.period.start);
    const endYear = experience.period.end === 'Present' ? 
      new Date().getFullYear() : parseInt(experience.period.end);
    
    return Math.max(0, endYear - startYear);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for real implementation
    };
  }
}

// Export singleton instance
export const dataManager = new DataManager();