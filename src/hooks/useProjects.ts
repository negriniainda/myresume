import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from './useTranslation';
import type { Project, FilterOptions, SupportedLanguage } from '@/types';

// Import project data directly
import projectsEn from '@/data/projects-en.json';
import projectsPt from '@/data/projects-pt.json';

interface UseProjectsReturn {
  projects: Project[];
  filteredProjects: Project[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: ProjectFilters;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearFilters: () => void;
  availableFilters: {
    industries: string[];
    technologies: string[];
    projectTypes: string[];
    clientTypes: string[];
    businessUnits: string[];
  };
}

interface ProjectFilters {
  industries: string[];
  technologies: string[];
  projectTypes: string[];
  clientTypes: string[];
  businessUnits: string[];
}

const initialFilters: ProjectFilters = {
  industries: [],
  technologies: [],
  projectTypes: [],
  clientTypes: [],
  businessUnits: [],
};

export function useProjects(): UseProjectsReturn {
  const { language } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFiltersState] = useState<ProjectFilters>(initialFilters);

  // Load projects data based on language
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use imported JSON data based on language
        const projectsData = language === 'pt' ? projectsPt : projectsEn;
        setProjects(projectsData as Project[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [language]);

  // Calculate available filter options
  const availableFilters = useMemo(() => {
    const industries = new Set<string>();
    const technologies = new Set<string>();
    const projectTypes = new Set<string>();
    const clientTypes = new Set<string>();
    const businessUnits = new Set<string>();

    projects.forEach(project => {
      industries.add(project.industry);
      projectTypes.add(project.projectType);
      clientTypes.add(project.clientType);
      businessUnits.add(project.businessUnit);
      
      if (project.technologies) {
        project.technologies.forEach(tech => technologies.add(tech));
      }
    });

    return {
      industries: Array.from(industries).sort(),
      technologies: Array.from(technologies).sort(),
      projectTypes: Array.from(projectTypes).sort(),
      clientTypes: Array.from(clientTypes).sort(),
      businessUnits: Array.from(businessUnits).sort(),
    };
  }, [projects]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(term) ||
        project.problem.toLowerCase().includes(term) ||
        project.action.toLowerCase().includes(term) ||
        project.result.toLowerCase().includes(term) ||
        project.industry.toLowerCase().includes(term) ||
        project.projectType.toLowerCase().includes(term) ||
        (project.technologies && project.technologies.some(tech => 
          tech.toLowerCase().includes(term)
        ))
      );
    }

    // Apply filters
    if (filters.industries.length > 0) {
      filtered = filtered.filter(project => 
        filters.industries.includes(project.industry)
      );
    }

    if (filters.technologies.length > 0) {
      filtered = filtered.filter(project => 
        project.technologies && project.technologies.some(tech => 
          filters.technologies.includes(tech)
        )
      );
    }

    if (filters.projectTypes.length > 0) {
      filtered = filtered.filter(project => 
        filters.projectTypes.includes(project.projectType)
      );
    }

    if (filters.clientTypes.length > 0) {
      filtered = filtered.filter(project => 
        filters.clientTypes.includes(project.clientType)
      );
    }

    if (filters.businessUnits.length > 0) {
      filtered = filtered.filter(project => 
        filters.businessUnits.includes(project.businessUnit)
      );
    }

    return filtered;
  }, [projects, searchTerm, filters]);

  const setFilters = (newFilters: Partial<ProjectFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState(initialFilters);
    setSearchTerm('');
  };

  return {
    projects,
    filteredProjects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    clearFilters,
    availableFilters,
  };
}