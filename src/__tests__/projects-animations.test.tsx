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

// Mock animation utilities
jest.mock('@/utils/animations', () => ({
  animateListEntrance: jest.fn(),
  animateFilterUpdate: jest.fn(),
}));

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

describe('Projects Animations', () => {
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
      availableFilters: {
        industries: ['Retail', 'Healthcare'],
        technologies: ['React', 'AWS', 'Python', 'TensorFlow'],
        projectTypes: ['Digital Transformation', 'Product Development'],
        clientTypes: ['Large Enterprise', 'Mid-size Company'],
        businessUnits: ['Technology', 'Data Science'],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('applies stagger animation delays to project cards', () => {
    render(<Projects />);
    
    const projectCards = screen.getAllByRole('button', { name: /View details for/ });
    
    projectCards.forEach((card, index) => {
      const cardContainer = card.closest('[data-project-card]') as HTMLElement;
      expect(cardContainer).toHaveStyle(`animation-delay: ${index * 50}ms`);
    });
  });

  it('shows smooth filter panel transition', async () => {
    render(<Projects />);
    
    const filterButton = screen.getByText('Show Filters');
    
    // Initially filters should be hidden
    const filterPanel = document.querySelector('.transition-all');
    expect(filterPanel).toHaveClass('max-h-0', 'opacity-0');
    
    // Show filters
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(filterPanel).toHaveClass('max-h-96', 'opacity-100');
    });
  });

  it('applies project card hover effects', () => {
    render(<Projects />);
    
    const projectCards = screen.getAllByRole('button', { name: /View details for/ });
    const firstCard = projectCards[0];
    
    expect(firstCard).toHaveClass('project-card', 'transition-smooth');
  });

  it('maintains animation state during loading', () => {
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      loading: true,
      filteredProjects: [],
    });

    render(<Projects />);
    
    // Should show loading spinner with animation
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('handles filter animation transitions', async () => {
    const mockSetFilters = jest.fn();
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      setFilters: mockSetFilters,
    });

    render(<Projects />);
    
    // Show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    await waitFor(() => {
      expect(screen.getByText('Industry')).toBeInTheDocument();
    });
    
    // The filter panel should have transition classes
    const filterPanel = document.querySelector('.transition-all');
    expect(filterPanel).toHaveClass('duration-300', 'ease-in-out');
  });

  it('applies focus ring styles for accessibility', () => {
    render(<Projects />);
    
    const projectCards = screen.getAllByRole('button', { name: /View details for/ });
    const firstCard = projectCards[0];
    
    expect(firstCard).toHaveClass('focus-ring');
  });

  it('shows smooth modal transitions', async () => {
    render(<Projects />);
    
    const projectCard = screen.getAllByText('E-commerce Platform Modernization')[0].closest('[role="button"]');
    fireEvent.click(projectCard!);
    
    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      
      // Modal content should have proper styling
      const modalContent = modal.querySelector('.bg-white.rounded-lg.shadow-xl');
      expect(modalContent).toBeInTheDocument();
    });
  });

  it('handles empty state animations', () => {
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      filteredProjects: [],
      searchTerm: 'nonexistent',
    });

    render(<Projects />);
    
    // Should show empty state with proper styling
    const emptyState = screen.getByText('No projects found');
    expect(emptyState).toBeInTheDocument();
    
    // Get the specific clear button in the empty state
    const clearButtons = screen.getAllByText('Clear all filters');
    const emptyStateClearButton = clearButtons.find(button => 
      button.closest('.text-center')?.querySelector('h3')?.textContent === 'No projects found'
    );
    expect(emptyStateClearButton).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
  });

  it('maintains responsive animation behavior', () => {
    render(<Projects />);
    
    const grid = document.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    
    // Cards should maintain their animation properties across breakpoints
    const projectCards = screen.getAllByRole('button', { name: /View details for/ });
    projectCards.forEach(card => {
      expect(card).toHaveClass('transition-smooth');
    });
  });

  it('handles search animation updates', async () => {
    const mockSetSearchTerm = jest.fn();
    mockUseProjects.mockReturnValue({
      ...mockUseProjects(),
      setSearchTerm: mockSetSearchTerm,
    });

    render(<Projects />);
    
    const searchInput = screen.getByPlaceholderText(/Search projects by title/);
    
    // Search input should have smooth transitions
    expect(searchInput).toHaveClass('focus:ring-1', 'focus:ring-blue-500');
    
    fireEvent.change(searchInput, { target: { value: 'react' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('react');
  });
});