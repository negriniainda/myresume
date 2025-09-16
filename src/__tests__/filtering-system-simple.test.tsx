import { renderHook } from '@testing-library/react';
import useFilters from '../hooks/useFilters';
import { ExperienceItem, Skill } from '../types';

// Mock data for testing
const mockExperienceData: ExperienceItem[] = [
  {
    id: 'exp-1',
    position: 'Senior Developer',
    company: 'TechCorp',
    location: 'SF',
    period: { start: '2020', end: '2023' },
    description: 'Developed React applications',
    achievements: [
      { metric: '50%', description: 'performance improvement' }
    ],
    technologies: ['React', 'TypeScript'],
    roleType: 'Individual Contributor',
    industry: 'Technology',
    companySize: 'Large'
  },
  {
    id: 'exp-2',
    position: 'Team Lead',
    company: 'StartupInc',
    location: 'NYC',
    period: { start: '2018', end: '2020' },
    description: 'Led development team',
    achievements: [
      { metric: '30%', description: 'team productivity increase' }
    ],
    technologies: ['Node.js', 'MongoDB'],
    roleType: 'Team Lead',
    industry: 'Finance',
    companySize: 'Startup'
  }
];

const mockSkillsData: Skill[] = [
  {
    name: 'React',
    level: 'Expert',
    yearsOfExperience: 5,
    category: 'Frontend'
  },
  {
    name: 'Node.js',
    level: 'Advanced',
    yearsOfExperience: 3,
    category: 'Backend'
  }
];

describe('useFilters hook', () => {
  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    expect(result.current.filters.roleTypes).toEqual([]);
    expect(result.current.filters.industries).toEqual([]);
    expect(result.current.filters.technologies).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('should extract filter options from data', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    expect(result.current.filterOptions.roleTypes).toContain('Individual Contributor');
    expect(result.current.filterOptions.roleTypes).toContain('Team Lead');
    expect(result.current.filterOptions.industries).toContain('Technology');
    expect(result.current.filterOptions.industries).toContain('Finance');
    expect(result.current.filterOptions.technologies).toContain('React');
    expect(result.current.filterOptions.technologies).toContain('TypeScript');
    expect(result.current.filterOptions.technologies).toContain('Node.js');
  });

  it('should filter experience by role type', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    // Initially should show all items
    expect(result.current.filteredExperience.items).toHaveLength(2);
    
    // Apply role type filter
    result.current.updateFilter('roleTypes', ['Individual Contributor']);
    
    // Should only show items with that role type
    expect(result.current.filteredExperience.items).toHaveLength(1);
    expect(result.current.filteredExperience.items[0].roleType).toBe('Individual Contributor');
  });

  it('should filter experience by technology', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    // Apply technology filter
    result.current.updateFilter('technologies', ['React']);
    
    // Should only show items with React
    expect(result.current.filteredExperience.items).toHaveLength(1);
    expect(result.current.filteredExperience.items[0].technologies).toContain('React');
  });

  it('should filter skills by level', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    // Apply skill level filter
    result.current.updateFilter('skillLevels', ['Expert']);
    
    // Should only show expert level skills
    expect(result.current.filteredSkills.items).toHaveLength(1);
    expect(result.current.filteredSkills.items[0].level).toBe('Expert');
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    // Apply some filters
    result.current.updateFilter('roleTypes', ['Individual Contributor']);
    result.current.updateFilter('technologies', ['React']);
    
    expect(result.current.hasActiveFilters).toBe(true);
    
    // Clear all filters
    result.current.clearAllFilters();
    
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredExperience.items).toHaveLength(2);
  });

  it('should generate filter URL parameters', () => {
    const { result } = renderHook(() => useFilters(mockExperienceData, [], mockSkillsData));
    
    // Apply some filters
    result.current.updateFilter('roleTypes', ['Individual Contributor']);
    result.current.updateFilter('technologies', ['React', 'TypeScript']);
    
    const filterUrl = result.current.getFilterUrl();
    
    expect(filterUrl).toContain('roleTypes=Individual%20Contributor');
    expect(filterUrl).toContain('technologies=React%2CTypeScript');
  });
});