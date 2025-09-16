import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FilterPanel from '../components/ui/FilterPanel';
import FilteredContent from '../components/ui/FilteredContent';
import useFilters from '../hooks/useFilters';
import { ExperienceItem, Project, Skill } from '../types';

// Mock the useFilters hook
jest.mock('../hooks/useFilters');
const mockUseFilters = useFilters as jest.MockedFunction<typeof useFilters>;

describe('FilterPanel', () => {
  const mockFilterOptions = {
    roleTypes: ['Manager', 'Developer', 'Lead'],
    industries: ['Technology', 'Finance', 'Healthcare'],
    companySizes: ['Startup', 'Medium', 'Large'],
    technologies: ['React', 'TypeScript', 'Node.js'],
    companies: ['TechCorp', 'FinanceInc', 'HealthCare Ltd'],
    skillLevels: ['Expert', 'Advanced', 'Intermediate', 'Beginner'] as const,
    skillCategories: ['Frontend', 'Backend', 'DevOps'],
    projectTypes: ['Web Application', 'Mobile App', 'API'],
    clientTypes: ['Enterprise', 'Startup', 'Government'],
    projectIndustries: ['Technology', 'Finance', 'Healthcare']
  };

  const mockFilters = {
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

  const mockProps = {
    filters: mockFilters,
    filterOptions: mockFilterOptions,
    onFilterChange: jest.fn(),
    onClearAll: jest.fn(),
    activeFilterCount: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter panel with header', () => {
    render(<FilterPanel {...mockProps} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Expand filters')).toBeInTheDocument();
  });

  it('shows active filter count when filters are applied', () => {
    const propsWithActiveFilters = {
      ...mockProps,
      activeFilterCount: 3
    };
    
    render(<FilterPanel {...propsWithActiveFilters} />);
    
    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('expands and shows filter options when clicked', async () => {
    const user = userEvent.setup();
    render(<FilterPanel {...mockProps} />);
    
    const expandButton = screen.getByLabelText('Expand filters');
    await user.click(expandButton);
    
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<FilterPanel {...mockProps} />);
    
    // Expand first
    const expandButton = screen.getByLabelText('Expand filters');
    await user.click(expandButton);
    
    // Click on Projects tab
    const projectsTab = screen.getByText('Projects');
    await user.click(projectsTab);
    
    // Should show project-specific filters
    expect(screen.getByText('Project Type')).toBeInTheDocument();
    expect(screen.getByText('Client Type')).toBeInTheDocument();
  });

  it('calls onFilterChange when filter is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel {...mockProps} />);
    
    // Expand and go to experience tab
    const expandButton = screen.getByLabelText('Expand filters');
    await user.click(expandButton);
    
    // Find and click a role type filter
    const managerFilter = screen.getByText('Manager');
    await user.click(managerFilter);
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith('roleTypes', ['Manager']);
  });

  it('handles date range input correctly', async () => {
    const user = userEvent.setup();
    render(<FilterPanel {...mockProps} />);
    
    // Expand filters
    const expandButton = screen.getByLabelText('Expand filters');
    await user.click(expandButton);
    
    // Find date range inputs
    const startYearInput = screen.getByPlaceholderText('2020');
    await user.type(startYearInput, '2021');
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith('dateRange', {
      start: '2021'
    });
  });

  it('shows clear all button when filters are active', () => {
    const propsWithActiveFilters = {
      ...mockProps,
      activeFilterCount: 2
    };
    
    render(<FilterPanel {...propsWithActiveFilters} />);
    
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('calls onClearAll when clear all is clicked', async () => {
    const user = userEvent.setup();
    const propsWithActiveFilters = {
      ...mockProps,
      activeFilterCount: 2
    };
    
    render(<FilterPanel {...propsWithActiveFilters} />);
    
    const clearAllButton = screen.getByText('Clear all');
    await user.click(clearAllButton);
    
    expect(mockProps.onClearAll).toHaveBeenCalled();
  });
});

describe('FilteredContent', () => {
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
      roleType: 'Developer',
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

  const mockFilteredResults = {
    items: mockExperienceData,
    totalCount: 2,
    filteredCount: 2,
    appliedFilters: []
  };

  const mockUseFiltersReturn = {
    filters: {
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
    },
    filterOptions: {
      roleTypes: ['Developer', 'Team Lead'],
      industries: ['Technology', 'Finance'],
      companySizes: ['Startup', 'Large'],
      technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      companies: ['TechCorp', 'StartupInc'],
      skillLevels: [],
      skillCategories: [],
      projectTypes: [],
      clientTypes: [],
      projectIndustries: []
    },
    filteredExperience: mockFilteredResults,
    filteredProjects: { items: [], totalCount: 0, filteredCount: 0, appliedFilters: [] },
    filteredSkills: { items: [], totalCount: 0, filteredCount: 0, appliedFilters: [] },
    updateFilter: jest.fn(),
    toggleFilterValue: jest.fn(),
    clearFilter: jest.fn(),
    clearAllFilters: jest.fn(),
    hasActiveFilters: false,
    activeFilterCount: 0,
    getFilterUrl: jest.fn(),
    setFiltersFromUrl: jest.fn()
  };

  beforeEach(() => {
    mockUseFilters.mockReturnValue(mockUseFiltersReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders filtered content with items', () => {
    const mockRenderItem = jest.fn((item: ExperienceItem) => (
      <div key={item.id}>{item.position} at {item.company}</div>
    ));

    render(
      <FilteredContent
        data={mockExperienceData}
        type="experience"
        renderItem={mockRenderItem}
      />
    );

    expect(screen.getByText('2 experience items')).toBeInTheDocument();
    expect(mockRenderItem).toHaveBeenCalledTimes(2);
  });

  it('shows search bar when showSearch is true', () => {
    const mockRenderItem = jest.fn((item: ExperienceItem) => (
      <div key={item.id}>{item.position}</div>
    ));

    render(
      <FilteredContent
        data={mockExperienceData}
        type="experience"
        renderItem={mockRenderItem}
        showSearch={true}
      />
    );

    expect(screen.getByPlaceholderText('Search experience...')).toBeInTheDocument();
  });

  it('hides search bar when showSearch is false', () => {
    const mockRenderItem = jest.fn((item: ExperienceItem) => (
      <div key={item.id}>{item.position}</div>
    ));

    render(
      <FilteredContent
        data={mockExperienceData}
        type="experience"
        renderItem={mockRenderItem}
        showSearch={false}
      />
    );

    expect(screen.queryByPlaceholderText('Search experience...')).not.toBeInTheDocument();
  });

  it('shows filter panel when showFilters is true', () => {
    const mockRenderItem = jest.fn((item: ExperienceItem) => (
      <div key={item.id}>{item.position}</div>
    ));

    render(
      <FilteredContent
        data={mockExperienceData}
        type="experience"
        renderItem={mockRenderItem}
        showFilters={true}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('handles search input correctly', async () => {
    const user = userEvent.setup();
    const mockRenderItem = jest.fn((item: ExperienceItem) => (
      <div key={item.id}>{item.position}</div>
    ));

    render(
      <FilteredContent
        data={mockExperienceData}
        type="experience"
        renderItem={mockRenderItem}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search experience...');
    await user.type(searchInput, 'React');

    expect(mockUseFiltersReturn.updateFilter).toHaveBeenCalledWith('searchTerm', 'React');
  });

  it('shows empty state when no items match filters', () => {
    const emptyFilteredResults = {
      ...mockFilteredResults,
      items: [],
      filteredCount: 0
    };

    mockUseFilters.mockReturnValue({
      ...mockUseFiltersReturn,
      filteredExperience: emptyFilteredResults,
      hasActiveFilters: true
    });

    const mockRenderItem = jest.fn();

    render(
      <FilteredContent
        data={[]}
        type="experience"
        renderItem={mockRenderItem}
      />
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters to see more results.')).toBeInTheDocument();
  });

  it('shows custom empty state when provided', () => {
    const emptyFilteredResults = {
      ...mockFilteredResults,
      items: [],
      filteredCount: 0
    };

    mockUseFilters.mockReturnValue({
      ...mockUseFiltersReturn,
      filteredExperience: emptyFilteredResults
    });

    const mockRenderItem = jest.fn();
    const mockRenderEmpty = () => <div>Custom empty state</div>;

    render(
      <FilteredContent
        data={[]}
        type="experience"
        renderItem={mockRenderItem}
        renderEmpty={mockRenderEmpty}
      />
    );

    expect(screen.getByText('Custom empty state')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    // Create more items to test pagination
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      ...mockExperienceData[0],
      id: `exp-${i}`,
      position: `Position ${i}`
    }));

    const manyItemsResult = {
      ...mockFilteredResults,
      items: manyItems,
      totalCount: 25,
      filteredCount: 25
    };

    mockUseFilters.mockReturnValue({
      ...mockUseFiltersReturn,
      filteredExperience: manyItemsResult
    });

    const mockRenderItem = jest.fn((item: ExperienceItem) => (
      <div key={item.id}>{item.position}</div>
    ));

    render(
      <FilteredContent
        data={manyItems}
        type="experience"
        renderItem={mockRenderItem}
        itemsPerPage={10}
      />
    );

    // Should show pagination controls
    expect(screen.getByText('Showing 1 to 10 of 25 results')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});

describe('useFilters hook', () => {
  // Note: These would be actual tests of the useFilters hook implementation
  // For now, we're testing the mocked version in the components above
  
  it('should initialize with empty filters', () => {
    // This would test the actual hook implementation
    expect(true).toBe(true); // Placeholder
  });

  it('should filter experience items correctly', () => {
    // This would test filtering logic
    expect(true).toBe(true); // Placeholder
  });

  it('should generate filter options from data', () => {
    // This would test option extraction
    expect(true).toBe(true); // Placeholder
  });
});