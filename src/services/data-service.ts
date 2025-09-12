import { DataManager } from './data-manager';
import { enhanceExperienceItems, enhanceProjects, enhanceSkills } from '@/utils/data-transformers';
import { validateResumeData, validateProjects, validateDataConsistency, sanitizeData, normalizeData } from '@/utils/data-validators';
import type {
  ResumeData,
  Project,
  SupportedLanguage,
  DataLoadOptions,
  FilterOptions,
  SearchResult,
  TransformedData,
  ExperienceMetrics,
  ProjectMetrics,
  SkillMetrics,
  EnhancedExperienceItem,
  EnhancedProject,
  ParseResult,
} from '@/types';

/**
 * High-level data service that orchestrates data loading, validation, transformation, and caching
 */
export class DataService {
  private dataManager: DataManager;

  constructor() {
    this.dataManager = new DataManager({
      ttl: 10 * 60 * 1000, // 10 minutes cache
      maxSize: 100,
      version: '1.0.0',
    });
  }

  /**
   * Load and validate complete resume data
   */
  async loadResumeData(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<ParseResult<ResumeData>> {
    try {
      const rawData = await this.dataManager.loadResumeData(language, options);
      
      if (!rawData) {
        return {
          success: false,
          errors: [{ field: 'general', message: 'Failed to load resume data' }],
        };
      }

      // Sanitize and normalize data
      const sanitizedData = sanitizeData(rawData);
      const normalizedData = normalizeData(sanitizedData);

      // Validate data
      const validationResult = validateResumeData(normalizedData);
      
      if (!validationResult.success) {
        return validationResult;
      }

      return {
        success: true,
        data: normalizedData,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: `Error loading resume: ${error}` }],
      };
    }
  }

  /**
   * Load and validate projects data
   */
  async loadProjectsData(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<ParseResult<Project[]>> {
    try {
      const rawData = await this.dataManager.loadProjectsData(language, options);
      
      if (!rawData) {
        return {
          success: false,
          errors: [{ field: 'general', message: 'Failed to load projects data' }],
        };
      }

      // Sanitize and normalize data
      const sanitizedData = sanitizeData(rawData);
      const normalizedData = normalizeData(sanitizedData);

      // Validate data
      const validationResult = validateProjects(normalizedData);
      
      if (!validationResult.success) {
        return validationResult;
      }

      return {
        success: true,
        data: normalizedData,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: `Error loading projects: ${error}` }],
      };
    }
  }

  /**
   * Load complete dataset with cross-validation
   */
  async loadCompleteDataset(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<{
    resume: ParseResult<ResumeData>;
    projects: ParseResult<Project[]>;
    consistencyErrors: Array<{ field: string; message: string; value?: unknown }>;
  }> {
    const [resumeResult, projectsResult] = await Promise.all([
      this.loadResumeData(language, options),
      this.loadProjectsData(language, options),
    ]);

    let consistencyErrors: Array<{ field: string; message: string; value?: unknown }> = [];

    // Validate consistency if both datasets loaded successfully
    if (resumeResult.success && projectsResult.success && 
        resumeResult.data && projectsResult.data) {
      consistencyErrors = validateDataConsistency(resumeResult.data, projectsResult.data);
    }

    return {
      resume: resumeResult,
      projects: projectsResult,
      consistencyErrors,
    };
  }

  /**
   * Get enhanced resume data with metadata
   */
  async getEnhancedResumeData(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<ParseResult<{
    resume: ResumeData;
    enhancedExperience: EnhancedExperienceItem[];
    metrics: ExperienceMetrics;
  }>> {
    const resumeResult = await this.loadResumeData(language, options);
    
    if (!resumeResult.success || !resumeResult.data) {
      return resumeResult as ParseResult<any>;
    }

    try {
      const enhancedExperience = enhanceExperienceItems(resumeResult.data.experience);
      const metrics = this.dataManager.calculateExperienceMetrics(resumeResult.data.experience);

      return {
        success: true,
        data: {
          resume: resumeResult.data,
          enhancedExperience,
          metrics,
        },
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'enhancement', message: `Error enhancing resume data: ${error}` }],
      };
    }
  }

  /**
   * Get enhanced projects data with metadata
   */
  async getEnhancedProjectsData(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<ParseResult<{
    projects: Project[];
    enhancedProjects: EnhancedProject[];
    metrics: ProjectMetrics;
  }>> {
    const projectsResult = await this.loadProjectsData(language, options);
    
    if (!projectsResult.success || !projectsResult.data) {
      return projectsResult as ParseResult<any>;
    }

    try {
      const enhancedProjects = enhanceProjects(projectsResult.data);
      const metrics = this.dataManager.calculateProjectMetrics(projectsResult.data);

      return {
        success: true,
        data: {
          projects: projectsResult.data,
          enhancedProjects,
          metrics,
        },
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'enhancement', message: `Error enhancing projects data: ${error}` }],
      };
    }
  }

  /**
   * Search across all content
   */
  async searchContent(
    searchTerm: string,
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<{
    resumeResults: SearchResult<any>[];
    projectResults: SearchResult<Project>[];
    totalResults: number;
  }> {
    const [resumeResult, projectsResult] = await Promise.all([
      this.loadResumeData(language, options),
      this.loadProjectsData(language, options),
    ]);

    const resumeResults: SearchResult<any>[] = [];
    const projectResults: SearchResult<Project>[] = [];

    if (resumeResult.success && resumeResult.data) {
      // Search in experience
      const experienceResults = this.dataManager.searchContent(
        resumeResult.data.experience,
        searchTerm,
        ['position', 'company', 'description']
      );
      resumeResults.push(...experienceResults);

      // Search in skills
      const allSkills = resumeResult.data.skills.flatMap(cat => 
        cat.skills.map(skill => ({ ...skill, category: cat.name }))
      );
      const skillResults = this.dataManager.searchContent(
        allSkills,
        searchTerm,
        ['name', 'category']
      );
      resumeResults.push(...skillResults);
    }

    if (projectsResult.success && projectsResult.data) {
      const results = this.dataManager.searchContent(
        projectsResult.data,
        searchTerm,
        ['title', 'problem', 'action', 'result', 'industry']
      );
      projectResults.push(...results);
    }

    return {
      resumeResults,
      projectResults,
      totalResults: resumeResults.length + projectResults.length,
    };
  }

  /**
   * Filter and transform experience data
   */
  async getFilteredExperience(
    language: SupportedLanguage,
    filters: FilterOptions,
    options: DataLoadOptions = {}
  ): Promise<TransformedData<EnhancedExperienceItem> | null> {
    const resumeResult = await this.loadResumeData(language, options);
    
    if (!resumeResult.success || !resumeResult.data) {
      return null;
    }

    const enhancedExperience = enhanceExperienceItems(resumeResult.data.experience);
    const filteredExperience = this.dataManager.filterExperience(enhancedExperience, filters);
    
    return this.dataManager.transformData(filteredExperience, {
      sortBy: 'period.start',
      sortOrder: 'desc',
    });
  }

  /**
   * Filter and transform projects data
   */
  async getFilteredProjects(
    language: SupportedLanguage,
    filters: FilterOptions,
    options: DataLoadOptions = {}
  ): Promise<TransformedData<EnhancedProject> | null> {
    const projectsResult = await this.loadProjectsData(language, options);
    
    if (!projectsResult.success || !projectsResult.data) {
      return null;
    }

    const enhancedProjects = enhanceProjects(projectsResult.data);
    const filteredProjects = this.dataManager.filterProjects(enhancedProjects, filters);
    
    return this.dataManager.transformData(filteredProjects, {
      sortBy: 'title',
      sortOrder: 'asc',
    });
  }

  /**
   * Get comprehensive metrics for dashboard
   */
  async getComprehensiveMetrics(
    language: SupportedLanguage,
    options: DataLoadOptions = {}
  ): Promise<{
    experience: ExperienceMetrics;
    projects: ProjectMetrics;
    skills: SkillMetrics;
    summary: {
      totalYearsExperience: number;
      totalProjects: number;
      totalSkills: number;
      topTechnologies: string[];
      topIndustries: string[];
    };
  } | null> {
    const [resumeResult, projectsResult] = await Promise.all([
      this.loadResumeData(language, options),
      this.loadProjectsData(language, options),
    ]);

    if (!resumeResult.success || !resumeResult.data || 
        !projectsResult.success || !projectsResult.data) {
      return null;
    }

    const experienceMetrics = this.dataManager.calculateExperienceMetrics(resumeResult.data.experience);
    const projectMetrics = this.dataManager.calculateProjectMetrics(projectsResult.data);
    const skillMetrics = this.dataManager.calculateSkillMetrics(resumeResult.data.skills);

    // Get top technologies across all data
    const allTechnologies = this.dataManager.getAllTechnologies(
      resumeResult.data.experience,
      projectsResult.data
    );
    const topTechnologies = allTechnologies.slice(0, 10);

    // Get top industries
    const allIndustries = this.dataManager.getAllIndustries(
      resumeResult.data.experience,
      projectsResult.data
    );
    const topIndustries = allIndustries.slice(0, 5);

    return {
      experience: experienceMetrics,
      projects: projectMetrics,
      skills: skillMetrics,
      summary: {
        totalYearsExperience: experienceMetrics.totalYears,
        totalProjects: projectMetrics.totalProjects,
        totalSkills: skillMetrics.totalSkills,
        topTechnologies,
        topIndustries,
      },
    };
  }

  /**
   * Preload data for both languages
   */
  async preloadData(): Promise<{
    en: { resume: boolean; projects: boolean };
    pt: { resume: boolean; projects: boolean };
  }> {
    const results = {
      en: { resume: false, projects: false },
      pt: { resume: false, projects: false },
    };

    try {
      // Preload English data
      const [enResume, enProjects] = await Promise.all([
        this.loadResumeData('en', { useCache: true }),
        this.loadProjectsData('en', { useCache: true }),
      ]);

      results.en.resume = enResume.success;
      results.en.projects = enProjects.success;

      // Preload Portuguese data
      const [ptResume, ptProjects] = await Promise.all([
        this.loadResumeData('pt', { useCache: true }),
        this.loadProjectsData('pt', { useCache: true }),
      ]);

      results.pt.resume = ptResume.success;
      results.pt.projects = ptProjects.success;
    } catch (error) {
      console.error('Error preloading data:', error);
    }

    return results;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.dataManager.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return this.dataManager.getCacheStats();
  }

  /**
   * Refresh data for a specific language
   */
  async refreshData(language: SupportedLanguage): Promise<{
    resume: boolean;
    projects: boolean;
  }> {
    try {
      const [resumeResult, projectsResult] = await Promise.all([
        this.loadResumeData(language, { forceRefresh: true }),
        this.loadProjectsData(language, { forceRefresh: true }),
      ]);

      return {
        resume: resumeResult.success,
        projects: projectsResult.success,
      };
    } catch (error) {
      console.error(`Error refreshing data for ${language}:`, error);
      return {
        resume: false,
        projects: false,
      };
    }
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export individual functions for direct use
export {
  enhanceExperienceItems,
  enhanceProjects,
  enhanceSkills,
} from '@/utils/data-transformers';

export {
  validateResumeData,
  validateProjects,
  validateDataConsistency,
  sanitizeData,
  normalizeData,
} from '@/utils/data-validators';