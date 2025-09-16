import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Experience from '@/components/sections/Experience';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { ResumeData } from '@/types';

// Mock the hooks
jest.mock('@/hooks/useContent');
jest.mock('@/hooks/useTranslation');

const mockResumeData: ResumeData = {
  personalInfo: {
    name: 'Test User',
    title: 'Test Title',
    location: 'Test Location',
    email: 'test@example.com',
    phone: '+1234567890'
  },
  objective: 'Test objective',
  summary: {
    title: 'Test Summary',
    items: ['Item 1', 'Item 2']
  },
  experience: [
    {
      id: 'test-1',
      position: 'Senior Developer',
      company: 'Tech Corp',
      location: 'São Paulo, SP',
      period: { start: '2020', end: 'Present' },
      description: 'Leading development initiatives',
      achievements: [
        {
          metric: '40%',
          description: 'performance improvement',
          impact: 'Reduced load times significantly'
        },
        {
          metric: '$1M',
          description: 'cost savings',
          impact: 'Optimized infrastructure costs'
        }
      ],
      responsibilities: [
        'Lead development team',
        'Architect scalable solutions',
        'Mentor junior developers'
      ],
      technologies: ['React', 'Node.js', 'AWS', 'TypeScript'],
      teamSize: 15,
      budget: '$500K',
      companySize: 'Large',
      industry: 'Technology',
      roleType: 'Team Lead'
    },
    {
      id: 'test-2',
      position: 'Full Stack Developer',
      company: 'Startup Inc',
      location: 'São Paulo, SP',
      period: { start: '2018', end: '2020' },
      description: 'Full-stack development for SaaS platform',
      achievements: [
        {
          metric: '200%',
          description: 'user growth',
          impact: 'Scaled platform to handle increased traffic'
        }
      ],
      responsibilities: [
        'Develop web applications',
        'Design APIs',
        'Write tests'
      ],
      technologies: ['JavaScript', 'Python', 'PostgreSQL'],
      teamSize: 5,
      budget: '$100K',
      companySize: 'Startup',
      industry: 'SaaS',
      roleType: 'Individual Contributor'
    }
  ],
  education: [],
  skills: [],
  languages: [],
  activities: []
};

const mockUseContent = {
  resumeData: mockResumeData,
  isLoading: false
};

const mockUseTranslation = {
  t: (key: string, defaultValue?: string, options?: any) => {
    const translations: Record<string, string> = {
      'experience.title': 'Professional Experience',
      'experience.filters': 'Filter Experience',
      'experience.roleType': 'Role Type',
      'experience.companySize': 'Company Size',
      'experience.industry': 'Industry',
      'experience.technology': 'Technology',
      'experience.allRoles': 'All Roles',
      'experience.allSizes': 'All Sizes',
      'experience.allIndustries': 'All Industries',
      'experience.allTechnologies': 'All Technologies',
      'experience.clearFilters': 'Clear All Filters',
      'experience.showingResults': `Showing ${options?.count || 0} of ${options?.total || 0} positions`,
      'experience.noResults': 'No positions match your filters',
      'experience.tryDifferentFilters': 'Try adjusting your filter criteria',
      'experience.achievements': 'Key Achievements',
      'experience.responsibilities': 'Key Responsibilities',
      'experience.technologies': 'Technologies Used',
      'experience.year': 'year',
      'experience.years': 'years'
    };
    return translations[key] || defaultValue || key;
  }
};

// Apply mocks
beforeEach(() => {
  const { useContent } = require('@/hooks/useContent');
  const { useTranslation } = require('@/hooks/useTranslation');
  
  useContent.mockReturnValue(mockUseContent);
  useTranslation.mockReturnValue(mockUseTranslation);
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('Experience Timeline Component', () => {
  it('renders experience section with timeline layout', () => {
    renderWithProvider(<Experience />);
    
    expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('Startup Inc')).toBeInTheDocument();
  });

  it('displays filter button and shows active filter count', async () => {
    renderWithProvider(<Experience />);
    
    const filterButton = screen.getByText('Filter Experience');
    expect(filterButton).toBeInTheDocument();
    
    // Click to open filters
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Role Type')).toBeInTheDocument();
      expect(screen.getByText('Company Size')).toBeInTheDocument();
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('filters experience items by role type', async () => {
    renderWithProvider(<Experience />);
    
    // Open filters
    fireEvent.click(screen.getByText('Filter Experience'));
    
    await waitFor(() => {
      const roleTypeSelect = screen.getByDisplayValue('All Roles');
      fireEvent.change(roleTypeSelect, { target: { value: 'Team Lead' } });
    });
    
    // Should show only the Team Lead position
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.queryByText('Full Stack Developer')).not.toBeInTheDocument();
  });

  it('filters experience items by company size', async () => {
    renderWithProvider(<Experience />);
    
    // Open filters
    fireEvent.click(screen.getByText('Filter Experience'));
    
    await waitFor(() => {
      const companySizeSelect = screen.getByDisplayValue('All Sizes');
      fireEvent.change(companySizeSelect, { target: { value: 'Startup' } });
    });
    
    // Should show only the Startup position
    expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
  });

  it('filters experience items by technology', async () => {
    renderWithProvider(<Experience />);
    
    // Open filters
    fireEvent.click(screen.getByText('Filter Experience'));
    
    await waitFor(() => {
      const technologySelect = screen.getByDisplayValue('All Technologies');
      fireEvent.change(technologySelect, { target: { value: 'Python' } });
    });
    
    // Should show only positions that use Python
    expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
  });

  it('expands and collapses experience cards', async () => {
    renderWithProvider(<Experience />);
    
    // Find the first experience card
    const firstCard = screen.getByText('Senior Developer').closest('.cursor-pointer');
    expect(firstCard).toBeInTheDocument();
    
    // Initially, detailed content should not be visible
    expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(firstCard!);
    
    await waitFor(() => {
      expect(screen.getByText('Key Achievements')).toBeInTheDocument();
      expect(screen.getByText('Key Responsibilities')).toBeInTheDocument();
      expect(screen.getByText('Technologies Used')).toBeInTheDocument();
    });
  });

  it('displays achievement metrics in visual cards', async () => {
    renderWithProvider(<Experience />);
    
    // Expand the first card
    const firstCard = screen.getByText('Senior Developer').closest('.cursor-pointer');
    fireEvent.click(firstCard!);
    
    await waitFor(() => {
      // Check for achievement metrics
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('performance improvement')).toBeInTheDocument();
      expect(screen.getByText('Reduced load times significantly')).toBeInTheDocument();
      
      expect(screen.getByText('$1M')).toBeInTheDocument();
      expect(screen.getByText('cost savings')).toBeInTheDocument();
      expect(screen.getByText('Optimized infrastructure costs')).toBeInTheDocument();
    });
  });

  it('displays additional metadata (team size, budget, company info)', async () => {
    renderWithProvider(<Experience />);
    
    // Expand the first card
    const firstCard = screen.getByText('Senior Developer').closest('.cursor-pointer');
    fireEvent.click(firstCard!);
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // team size
      expect(screen.getByText('$500K')).toBeInTheDocument(); // budget
      expect(screen.getByText('Large')).toBeInTheDocument(); // company size
      expect(screen.getByText('Technology')).toBeInTheDocument(); // industry
      expect(screen.getByText('Team Lead')).toBeInTheDocument(); // role type
    });
  });

  it('shows no results message when filters match no items', async () => {
    renderWithProvider(<Experience />);
    
    // Open filters
    fireEvent.click(screen.getByText('Filter Experience'));
    
    await waitFor(() => {
      // Set a filter that won't match any items
      const technologySelect = screen.getByDisplayValue('All Technologies');
      fireEvent.change(technologySelect, { target: { value: 'NonExistentTech' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('No positions match your filters')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filter criteria')).toBeInTheDocument();
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    renderWithProvider(<Experience />);
    
    // Open filters
    fireEvent.click(screen.getByText('Filter Experience'));
    
    await waitFor(() => {
      // Set a filter
      const roleTypeSelect = screen.getByDisplayValue('All Roles');
      fireEvent.change(roleTypeSelect, { target: { value: 'Team Lead' } });
    });
    
    // Clear filters button should appear
    await waitFor(() => {
      const clearButton = screen.getByText('Clear All Filters');
      expect(clearButton).toBeInTheDocument();
      fireEvent.click(clearButton);
    });
    
    // All items should be visible again
    await waitFor(() => {
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    });
  });

  it('displays technology tags for each position', () => {
    renderWithProvider(<Experience />);
    
    // Technology tags should be visible in the collapsed state
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });
});