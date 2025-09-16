import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Projects from '@/components/sections/Projects';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/hooks/useTranslation';

// Mock the hooks
jest.mock('@/hooks/useProjects');
jest.mock('@/hooks/useTranslation');

const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

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
    problem: 'Legacy platform with performance issues',
    action: 'Implemented modern architecture with React and AWS',
    result: 'Achieved 99.9% uptime and 70% faster load times',
    technologies: ['React', 'AWS', 'Microservices'],
  },
  {
    id: 'project-2',
    title: 'AI-Powered Analytics Dashboard',
    duration: '6 months',
    location: 'Remote',
    clientType: 'Mid-size Company',
    projectType: 'Product Development',
    industry: 'Healthcare',
    businessUnit: 'Data Science',
    problem: 'Manual reporting taking days to generate',
    action: 'Built ML models with Python and TensorFlow',
    result: 'Reduced report time from days to minutes',
    technologies: ['Python', 'TensorFlow', 'React'],
  },
];

const mockAvailableFilters = {
  industries: ['Retail', 'Healthcare'],
  technologies: ['React', 'AWS', 'Python', 'TensorFlow'],
  projectTypes: ['Digital Transformation', 'Product Development'],
  clientTypes: ['Large Enterprise', 'Mid-size Company'],
  businessUnits: ['Technology', 'Data Science'],
};

describe('Projects Component', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'projects.title': 'Featured Projects',
          'projects.subtitle': 'Explore a selection of impactful projects showcasing expertise in digital transformation, AI implementation, and system modernization across various industries.',
          'projects.searchPlaceholder': 'Search projects by title, technology, or industry...',
        };
        return translations[key] || key;
      },
      language: 'en',
      setLanguage: jest.fn(),
    });

    mockUseProjects.mockReturnValue({
      projects: mockProjects,
      filteredProjects: mockProjects,
      loading: false,
      error: null,
      searchTerm: '',
      setSearchTerm: jest.fn(),
      filters: {
        industries: [],
        technologies: [],
        projectTypes: [],
        clientTypes: [],
        businessUnits: [],
      },
      setFilters: jest.fn(),
      clearFilters: jest.fn(),
      availableFilters: mockAvailableFilters,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders projects gallery with header', () => {
    render(<Projects />);
    
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    expect(screen.getByText(/Explore a selection of impactful projects/)).toBeInTheDocument();
  });

  it('displays project cards', () => {
    render(<Projects />);
    
    const projectTitles = screen.getAllByText('E-commerce Platform Modernization');
    const dashboardTitles = screen.getAllByText('AI-Powered Analytics Dashboard');
    
    expect(projectTitles.length).toBeGreaterThan(0);
    expect(dashboardTitles.length).toBeGreaterThan(0);
    
    // Check for industry tags in project cards (not filter buttons)
    const retailTags = screen.getAllByText('Retail');
    const healthcareTags = screen.getAllByText('Healthcare');
    expect(retailTags.length).toBeGreaterThan(0);
    expect(healthcareTags.length).toBeGreaterThan(0);
  });

  it('shows search bar', () => {
    render(<Projects />);
    
    const searchInput = screen.getByPlaceholderText(/Search projects by title/);
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search input', () => {
    const mockSetSearchTerm = jest.fn();
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      setSearchTerm: mockSetSearchTerm,
    });

    render(<Projects />);
    
    const searchInput = screen.getByPlaceholderText(/Search projects by title/);
    fireEvent.change(searchInput, { target: { value: 'e-commerce' } });
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith('e-commerce');
  });

  it('shows and hides filters', () => {
    render(<Projects />);
    
    const filterButton = screen.getByText('Show Filters');
    expect(filterButton).toBeInTheDocument();
    
    // Filters should be hidden initially (check CSS classes)
    const filterPanel = document.querySelector('.max-h-0.opacity-0');
    expect(filterPanel).toBeInTheDocument();
    
    // Show filters
    fireEvent.click(filterButton);
    const visibleFilterPanel = document.querySelector('.max-h-96.opacity-100');
    expect(visibleFilterPanel).toBeInTheDocument();
    
    // Hide filters
    const hideButton = screen.getByText('Hide Filters');
    fireEvent.click(hideButton);
    const hiddenFilterPanel = document.querySelector('.max-h-0.opacity-0');
    expect(hiddenFilterPanel).toBeInTheDocument();
  });

  it('opens project modal when card is clicked', async () => {
    render(<Projects />);
    
    const projectCard = screen.getAllByText('E-commerce Platform Modernization')[0].closest('[role="button"]');
    expect(projectCard).toBeInTheDocument();
    
    fireEvent.click(projectCard!);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Challenge')).toBeInTheDocument();
      expect(screen.getByText('Solution')).toBeInTheDocument();
      expect(screen.getByText('Results & Impact')).toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    render(<Projects />);
    
    // Open modal
    const projectCard = screen.getAllByText('E-commerce Platform Modernization')[0].closest('[role="button"]');
    fireEvent.click(projectCard!);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      loading: true,
    });

    render(<Projects />);
    
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    expect(screen.getByText('Loading projects...').previousElementSibling).toHaveClass('animate-spin');
  });

  it('shows error state', () => {
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      loading: false,
      error: 'Failed to load projects',
    });

    render(<Projects />);
    
    expect(screen.getByText('Error Loading Projects')).toBeInTheDocument();
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
  });

  it('shows no results message when filtered projects is empty', () => {
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      filteredProjects: [],
      searchTerm: 'nonexistent',
    });

    render(<Projects />);
    
    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms or filters')).toBeInTheDocument();
  });

  it('shows results count', () => {
    render(<Projects />);
    
    expect(screen.getByText('Showing 2 projects')).toBeInTheDocument();
  });

  it('handles filter selection', () => {
    const mockSetFilters = jest.fn();
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      setFilters: mockSetFilters,
    });

    render(<Projects />);
    
    // Show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Click on a filter option - get the button specifically
    const retailFilterButton = screen.getAllByText('Retail').find(el => el.tagName === 'BUTTON');
    expect(retailFilterButton).toBeInTheDocument();
    fireEvent.click(retailFilterButton!);
    
    expect(mockSetFilters).toHaveBeenCalledWith({ industries: ['Retail'] });
  });

  it('clears all filters', () => {
    const mockClearFilters = jest.fn();
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      clearFilters: mockClearFilters,
      filters: {
        industries: ['Retail'],
        technologies: [],
        projectTypes: [],
        clientTypes: [],
        businessUnits: [],
      },
    });

    render(<Projects />);
    
    // Show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Clear filters
    const clearButton = screen.getByText('Clear all filters');
    fireEvent.click(clearButton);
    
    expect(mockClearFilters).toHaveBeenCalled();
  });

  it('handles keyboard navigation for project cards', () => {
    render(<Projects />);
    
    const projectCard = screen.getAllByText('E-commerce Platform Modernization')[0].closest('[role="button"]');
    expect(projectCard).toBeInTheDocument();
    
    // Focus the card
    projectCard!.focus();
    expect(projectCard).toHaveFocus();
    
    // Press Enter to open modal
    fireEvent.keyDown(projectCard!, { key: 'Enter' });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal with Escape key', async () => {
    render(<Projects />);
    
    // Open modal
    const projectCard = screen.getAllByText('E-commerce Platform Modernization')[0].closest('[role="button"]');
    fireEvent.click(projectCard!);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});