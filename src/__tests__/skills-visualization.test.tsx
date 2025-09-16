import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Skills from '@/components/sections/Skills';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock hooks
jest.mock('@/hooks/useContent', () => ({
  useContent: () => ({
    resumeData: {
      skills: [
        {
          name: 'Programming Languages',
          skills: [
            {
              name: 'JavaScript',
              level: 'Expert',
              yearsOfExperience: 10
            },
            {
              name: 'Python',
              level: 'Advanced',
              yearsOfExperience: 5
            },
            {
              name: 'Go',
              level: 'Intermediate',
              yearsOfExperience: 2
            }
          ]
        },
        {
          name: 'Frontend Technologies',
          skills: [
            {
              name: 'React',
              level: 'Expert',
              yearsOfExperience: 8
            },
            {
              name: 'Vue.js',
              level: 'Beginner',
              yearsOfExperience: 1
            }
          ]
        }
      ]
    },
    isLoading: false
  })
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('Skills Visualization Component', () => {
  beforeEach(() => {
    // Clear any previous test state
    jest.clearAllMocks();
  });

  it('renders skills section with categorized display', () => {
    renderWithProvider(<Skills />);
    
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('Frontend Technologies')).toBeInTheDocument();
  });

  it('displays skills with proficiency indicators', () => {
    renderWithProvider(<Skills />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
    expect(screen.getByText('10y')).toBeInTheDocument();
  });

  it('provides search functionality', () => {
    renderWithProvider(<Skills />);
    
    const searchInput = screen.getByPlaceholderText('Type to search...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'JavaScript' } });
    expect(searchInput).toHaveValue('JavaScript');
  });

  it('provides category filtering', () => {
    renderWithProvider(<Skills />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    expect(categorySelect).toBeInTheDocument();
    
    fireEvent.change(categorySelect, { target: { value: 'Programming Languages' } });
    expect(categorySelect).toHaveValue('Programming Languages');
  });

  it('provides level filtering', () => {
    renderWithProvider(<Skills />);
    
    const levelSelect = screen.getByDisplayValue('All Levels');
    expect(levelSelect).toBeInTheDocument();
    
    fireEvent.change(levelSelect, { target: { value: 'Expert' } });
    expect(levelSelect).toHaveValue('Expert');
  });

  it('provides view mode toggle (grid, chart, list)', () => {
    renderWithProvider(<Skills />);
    
    // Check for view mode buttons
    const viewModeButtons = screen.getAllByRole('button');
    const gridButton = viewModeButtons.find(button => 
      button.querySelector('svg') && button.classList.contains('bg-blue-500')
    );
    expect(gridButton).toBeInTheDocument();
  });

  it('displays skills summary with statistics', () => {
    renderWithProvider(<Skills />);
    
    expect(screen.getByText('Skills Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Skills')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Expert Level')).toBeInTheDocument();
    expect(screen.getByText('Avg. Years')).toBeInTheDocument();
  });

  it('shows years of experience for each skill', () => {
    renderWithProvider(<Skills />);
    
    expect(screen.getByText('10y')).toBeInTheDocument(); // JavaScript
    expect(screen.getByText('5y')).toBeInTheDocument();  // Python
    expect(screen.getByText('2y')).toBeInTheDocument();  // Go
  });

  it('displays different proficiency levels with appropriate styling', () => {
    renderWithProvider(<Skills />);
    
    expect(screen.getByText('Expert')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('filters skills by search term', async () => {
    renderWithProvider(<Skills />);
    
    const searchInput = screen.getByPlaceholderText('Type to search...');
    fireEvent.change(searchInput, { target: { value: 'React' } });
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      // JavaScript should be filtered out
      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when no skills match filters', async () => {
    renderWithProvider(<Skills />);
    
    const searchInput = screen.getByPlaceholderText('Type to search...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentSkill' } });
    
    await waitFor(() => {
      expect(screen.getByText('No skills found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search term')).toBeInTheDocument();
    });
  });

  it('displays visual progress bars for skill levels', () => {
    renderWithProvider(<Skills />);
    
    // Check for progress bar containers
    const progressBars = screen.getAllByRole('generic').filter(element => 
      element.className.includes('bg-gray-200') || element.className.includes('bg-gray-700')
    );
    expect(progressBars.length).toBeGreaterThan(0);
  });
});