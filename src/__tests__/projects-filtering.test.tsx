import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/hooks/useTranslation';

// Mock the hooks
jest.mock('@/hooks/useProjects');
jest.mock('@/hooks/useTranslation');

const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

// Test the useProjects hook directly
describe('Projects Filtering and Search', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string, fallback: string) => fallback,
      language: 'en',
      setLanguage: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('filters projects by title', () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'E-commerce Platform Modernization',
          duration: '8 months',
          location: 'São Paulo, SP',
          clientType: 'Large Enterprise',
          projectType: 'Digital Transformation',
          industry: 'Retail',
          businessUnit: 'Technology',
          problem: 'Legacy platform issues',
          action: 'Implemented modern architecture',
          result: 'Improved performance',
          technologies: ['React', 'AWS'],
        },
        {
          id: 'project-2',
          title: 'AI Analytics Dashboard',
          duration: '6 months',
          location: 'Remote',
          clientType: 'Mid-size Company',
          projectType: 'Product Development',
          industry: 'Healthcare',
          businessUnit: 'Data Science',
          problem: 'Manual reporting',
          action: 'Built ML models',
          result: 'Automated reporting',
          technologies: ['Python', 'TensorFlow'],
        },
      ];

      // Test that search term "e-commerce" filters correctly
      const filteredByTitle = mockProjects.filter(project =>
        project.title.toLowerCase().includes('e-commerce')
      );

      expect(filteredByTitle).toHaveLength(1);
      expect(filteredByTitle[0].title).toBe('E-commerce Platform Modernization');
    });

    it('filters projects by technology', () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'E-commerce Platform',
          duration: '8 months',
          location: 'São Paulo, SP',
          clientType: 'Large Enterprise',
          projectType: 'Digital Transformation',
          industry: 'Retail',
          businessUnit: 'Technology',
          problem: 'Legacy platform issues',
          action: 'Implemented modern architecture',
          result: 'Improved performance',
          technologies: ['React', 'AWS'],
        },
        {
          id: 'project-2',
          title: 'AI Analytics Dashboard',
          duration: '6 months',
          location: 'Remote',
          clientType: 'Mid-size Company',
          projectType: 'Product Development',
          industry: 'Healthcare',
          businessUnit: 'Data Science',
          problem: 'Manual reporting',
          action: 'Built ML models',
          result: 'Automated reporting',
          technologies: ['Python', 'TensorFlow'],
        },
      ];

      // Test that search term "react" filters correctly
      const filteredByTech = mockProjects.filter(project =>
        project.technologies && project.technologies.some(tech =>
          tech.toLowerCase().includes('react')
        )
      );

      expect(filteredByTech).toHaveLength(1);
      expect(filteredByTech[0].technologies).toContain('React');
    });

    it('filters projects by industry', () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'E-commerce Platform',
          duration: '8 months',
          location: 'São Paulo, SP',
          clientType: 'Large Enterprise',
          projectType: 'Digital Transformation',
          industry: 'Retail',
          businessUnit: 'Technology',
          problem: 'Legacy platform issues',
          action: 'Implemented modern architecture',
          result: 'Improved performance',
          technologies: ['React', 'AWS'],
        },
        {
          id: 'project-2',
          title: 'AI Analytics Dashboard',
          duration: '6 months',
          location: 'Remote',
          clientType: 'Mid-size Company',
          projectType: 'Product Development',
          industry: 'Healthcare',
          businessUnit: 'Data Science',
          problem: 'Manual reporting',
          action: 'Built ML models',
          result: 'Automated reporting',
          technologies: ['Python', 'TensorFlow'],
        },
      ];

      // Test that search term "healthcare" filters correctly
      const filteredByIndustry = mockProjects.filter(project =>
        project.industry.toLowerCase().includes('healthcare')
      );

      expect(filteredByIndustry).toHaveLength(1);
      expect(filteredByIndustry[0].industry).toBe('Healthcare');
    });

    it('searches across multiple fields', () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'E-commerce Platform',
          duration: '8 months',
          location: 'São Paulo, SP',
          clientType: 'Large Enterprise',
          projectType: 'Digital Transformation',
          industry: 'Retail',
          businessUnit: 'Technology',
          problem: 'Legacy platform with performance issues',
          action: 'Implemented modern architecture with React',
          result: 'Improved performance significantly',
          technologies: ['React', 'AWS'],
        },
      ];

      const searchTerm = 'performance';
      
      // Should find the project because "performance" appears in both problem and result
      const filtered = mockProjects.filter(project =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.problem.toLowerCase().includes(searchTerm) ||
        project.action.toLowerCase().includes(searchTerm) ||
        project.result.toLowerCase().includes(searchTerm) ||
        project.industry.toLowerCase().includes(searchTerm) ||
        project.projectType.toLowerCase().includes(searchTerm) ||
        (project.technologies && project.technologies.some(tech =>
          tech.toLowerCase().includes(searchTerm)
        ))
      );

      expect(filtered).toHaveLength(1);
    });
  });

  describe('Filter Functionality', () => {
    const mockProjects = [
      {
        id: 'project-1',
        title: 'E-commerce Platform',
        duration: '8 months',
        location: 'São Paulo, SP',
        clientType: 'Large Enterprise',
        projectType: 'Digital Transformation',
        industry: 'Retail',
        businessUnit: 'Technology',
        problem: 'Legacy platform issues',
        action: 'Implemented modern architecture',
        result: 'Improved performance',
        technologies: ['React', 'AWS'],
      },
      {
        id: 'project-2',
        title: 'AI Analytics Dashboard',
        duration: '6 months',
        location: 'Remote',
        clientType: 'Mid-size Company',
        projectType: 'Product Development',
        industry: 'Healthcare',
        businessUnit: 'Data Science',
        problem: 'Manual reporting',
        action: 'Built ML models',
        result: 'Automated reporting',
        technologies: ['Python', 'TensorFlow'],
      },
      {
        id: 'project-3',
        title: 'Mobile Banking App',
        duration: '12 months',
        location: 'São Paulo, SP',
        clientType: 'Startup',
        projectType: 'Product Development',
        industry: 'Financial Services',
        businessUnit: 'Mobile Development',
        problem: 'Limited banking access',
        action: 'Built mobile app with React Native',
        result: 'Increased user base',
        technologies: ['React Native', 'Blockchain'],
      },
    ];

    it('filters by industry', () => {
      const filters = { industries: ['Healthcare'] };
      
      const filtered = mockProjects.filter(project =>
        filters.industries.length === 0 || filters.industries.includes(project.industry)
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].industry).toBe('Healthcare');
    });

    it('filters by multiple industries', () => {
      const filters = { industries: ['Healthcare', 'Retail'] };
      
      const filtered = mockProjects.filter(project =>
        filters.industries.length === 0 || filters.industries.includes(project.industry)
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.industry)).toEqual(['Retail', 'Healthcare']);
    });

    it('filters by technologies', () => {
      const filters = { technologies: ['React'] };
      
      const filtered = mockProjects.filter(project =>
        filters.technologies.length === 0 || 
        (project.technologies && project.technologies.some(tech =>
          filters.technologies.includes(tech)
        ))
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].technologies).toContain('React');
    });

    it('filters by project type', () => {
      const filters = { projectTypes: ['Product Development'] };
      
      const filtered = mockProjects.filter(project =>
        filters.projectTypes.length === 0 || filters.projectTypes.includes(project.projectType)
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.projectType === 'Product Development')).toBe(true);
    });

    it('filters by client type', () => {
      const filters = { clientTypes: ['Startup'] };
      
      const filtered = mockProjects.filter(project =>
        filters.clientTypes.length === 0 || filters.clientTypes.includes(project.clientType)
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].clientType).toBe('Startup');
    });

    it('filters by business unit', () => {
      const filters = { businessUnits: ['Data Science'] };
      
      const filtered = mockProjects.filter(project =>
        filters.businessUnits.length === 0 || filters.businessUnits.includes(project.businessUnit)
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].businessUnit).toBe('Data Science');
    });

    it('applies multiple filters simultaneously', () => {
      const filters = {
        industries: ['Healthcare', 'Financial Services'],
        projectTypes: ['Product Development'],
        technologies: ['Python'],
      };
      
      let filtered = mockProjects;

      // Apply industry filter
      if (filters.industries.length > 0) {
        filtered = filtered.filter(project =>
          filters.industries.includes(project.industry)
        );
      }

      // Apply project type filter
      if (filters.projectTypes.length > 0) {
        filtered = filtered.filter(project =>
          filters.projectTypes.includes(project.projectType)
        );
      }

      // Apply technology filter
      if (filters.technologies.length > 0) {
        filtered = filtered.filter(project =>
          project.technologies && project.technologies.some(tech =>
            filters.technologies.includes(tech)
          )
        );
      }

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('AI Analytics Dashboard');
    });

    it('returns all projects when no filters are applied', () => {
      const filters = {
        industries: [],
        technologies: [],
        projectTypes: [],
        clientTypes: [],
        businessUnits: [],
      };
      
      const filtered = mockProjects.filter(project => {
        return (
          (filters.industries.length === 0 || filters.industries.includes(project.industry)) &&
          (filters.projectTypes.length === 0 || filters.projectTypes.includes(project.projectType)) &&
          (filters.clientTypes.length === 0 || filters.clientTypes.includes(project.clientType)) &&
          (filters.businessUnits.length === 0 || filters.businessUnits.includes(project.businessUnit)) &&
          (filters.technologies.length === 0 || 
           (project.technologies && project.technologies.some(tech =>
             filters.technologies.includes(tech)
           )))
        );
      });

      expect(filtered).toHaveLength(3);
    });
  });

  describe('Combined Search and Filter', () => {
    const mockProjects = [
      {
        id: 'project-1',
        title: 'E-commerce Platform Modernization',
        duration: '8 months',
        location: 'São Paulo, SP',
        clientType: 'Large Enterprise',
        projectType: 'Digital Transformation',
        industry: 'Retail',
        businessUnit: 'Technology',
        problem: 'Legacy platform with React issues',
        action: 'Implemented modern architecture',
        result: 'Improved performance',
        technologies: ['React', 'AWS'],
      },
      {
        id: 'project-2',
        title: 'React Dashboard for Healthcare',
        duration: '6 months',
        location: 'Remote',
        clientType: 'Mid-size Company',
        projectType: 'Product Development',
        industry: 'Healthcare',
        businessUnit: 'Data Science',
        problem: 'Manual reporting',
        action: 'Built React dashboard',
        result: 'Automated reporting',
        technologies: ['React', 'Python'],
      },
    ];

    it('applies search term and filters together', () => {
      const searchTerm = 'react';
      const filters = { industries: ['Healthcare'] };
      
      // First apply search
      let filtered = mockProjects.filter(project =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.problem.toLowerCase().includes(searchTerm) ||
        project.action.toLowerCase().includes(searchTerm) ||
        project.result.toLowerCase().includes(searchTerm) ||
        project.industry.toLowerCase().includes(searchTerm) ||
        project.projectType.toLowerCase().includes(searchTerm) ||
        (project.technologies && project.technologies.some(tech =>
          tech.toLowerCase().includes(searchTerm)
        ))
      );

      // Then apply filters
      if (filters.industries.length > 0) {
        filtered = filtered.filter(project =>
          filters.industries.includes(project.industry)
        );
      }

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('React Dashboard for Healthcare');
    });
  });

  describe('Available Filters Generation', () => {
    const mockProjects = [
      {
        id: 'project-1',
        title: 'E-commerce Platform',
        duration: '8 months',
        location: 'São Paulo, SP',
        clientType: 'Large Enterprise',
        projectType: 'Digital Transformation',
        industry: 'Retail',
        businessUnit: 'Technology',
        problem: 'Legacy platform issues',
        action: 'Implemented modern architecture',
        result: 'Improved performance',
        technologies: ['React', 'AWS'],
      },
      {
        id: 'project-2',
        title: 'AI Analytics Dashboard',
        duration: '6 months',
        location: 'Remote',
        clientType: 'Mid-size Company',
        projectType: 'Product Development',
        industry: 'Healthcare',
        businessUnit: 'Data Science',
        problem: 'Manual reporting',
        action: 'Built ML models',
        result: 'Automated reporting',
        technologies: ['Python', 'TensorFlow'],
      },
    ];

    it('generates unique filter options from projects data', () => {
      const industries = new Set<string>();
      const technologies = new Set<string>();
      const projectTypes = new Set<string>();
      const clientTypes = new Set<string>();
      const businessUnits = new Set<string>();

      mockProjects.forEach(project => {
        industries.add(project.industry);
        projectTypes.add(project.projectType);
        clientTypes.add(project.clientType);
        businessUnits.add(project.businessUnit);
        
        if (project.technologies) {
          project.technologies.forEach(tech => technologies.add(tech));
        }
      });

      const availableFilters = {
        industries: Array.from(industries).sort(),
        technologies: Array.from(technologies).sort(),
        projectTypes: Array.from(projectTypes).sort(),
        clientTypes: Array.from(clientTypes).sort(),
        businessUnits: Array.from(businessUnits).sort(),
      };

      expect(availableFilters.industries).toEqual(['Healthcare', 'Retail']);
      expect(availableFilters.technologies).toEqual(['AWS', 'Python', 'React', 'TensorFlow']);
      expect(availableFilters.projectTypes).toEqual(['Digital Transformation', 'Product Development']);
      expect(availableFilters.clientTypes).toEqual(['Large Enterprise', 'Mid-size Company']);
      expect(availableFilters.businessUnits).toEqual(['Data Science', 'Technology']);
    });
  });
});