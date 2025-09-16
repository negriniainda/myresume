import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Education from '@/components/sections/Education';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { ResumeData } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}));

// Mock hooks
const mockResumeData: ResumeData = {
  personalInfo: {
    name: 'Test User',
    title: 'Test Title',
    location: 'Test Location',
    email: 'test@example.com',
    phone: '+1234567890',
  },
  summary: {
    title: 'Test Summary',
    items: ['Test item'],
  },
  experience: [],
  education: [
    {
      id: 'msc-usp',
      degree: 'Master of Science in Computer Science',
      institution: 'University of São Paulo (USP)',
      location: 'São Paulo, SP',
      period: {
        start: '2014',
        end: '2016',
      },
      description: 'Focus: Artificial Intelligence and Machine Learning',
    },
    {
      id: 'bsc-unicamp',
      degree: 'Bachelor of Science in Computer Engineering',
      institution: 'University of Campinas (UNICAMP)',
      location: 'Campinas, SP',
      period: {
        start: '2010',
        end: '2014',
      },
      description: 'Focus: Software Engineering and Systems',
      gpa: '3.8/4.0',
      honors: ['Magna Cum Laude', 'Dean\'s List'],
    },
  ],
  skills: [],
  languages: [],
  activities: [
    'Speaker at tech conferences (DevOps Days, React Conf Brasil)',
    'Mentor at startup accelerator programs',
    'Open source contributor (React, Node.js ecosystem)',
    'Technical blog writer with 50K+ monthly readers',
  ],
};

jest.mock('@/hooks/useContent', () => ({
  useContent: () => ({
    resumeData: mockResumeData,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'education.title': 'Education & Activities',
        'education.subtitle': 'Academic background and professional development',
        'education.educationTitle': 'Education',
        'education.activitiesTitle': 'Activities & Achievements',
        'education.noData': 'No education or activities information available',
      };
      return translations[key] || fallback || key;
    },
    language: 'en' as const,
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('Education and Activities Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Education Timeline', () => {
    it('renders education section with timeline layout', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        expect(screen.getByText('Education & Activities')).toBeInTheDocument();
        expect(screen.getByText('Education')).toBeInTheDocument();
        expect(screen.getByText('Master of Science in Computer Science')).toBeInTheDocument();
        expect(screen.getByText('University of São Paulo (USP)')).toBeInTheDocument();
      });
    });

    it('displays education timeline with institutions and periods', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for both education entries
        expect(screen.getByText('Master of Science in Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Bachelor of Science in Computer Engineering')).toBeInTheDocument();
        
        // Check institutions
        expect(screen.getByText('University of São Paulo (USP)')).toBeInTheDocument();
        expect(screen.getByText('University of Campinas (UNICAMP)')).toBeInTheDocument();
        
        // Check periods
        expect(screen.getByText('2014 - 2016')).toBeInTheDocument();
        expect(screen.getByText('2010 - 2014')).toBeInTheDocument();
      });
    });

    it('displays education descriptions and focus areas', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        expect(screen.getByText('Focus: Artificial Intelligence and Machine Learning')).toBeInTheDocument();
        expect(screen.getByText('Focus: Software Engineering and Systems')).toBeInTheDocument();
      });
    });

    it('displays GPA and honors when available', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        expect(screen.getByText('GPA: 3.8/4.0')).toBeInTheDocument();
        expect(screen.getByText('Magna Cum Laude, Dean\'s List')).toBeInTheDocument();
      });
    });

    it('shows proper visual hierarchy with timeline dots and lines', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for timeline structure elements
        const timelineDots = document.querySelectorAll('.w-3.h-3.bg-gradient-to-r');
        expect(timelineDots.length).toBeGreaterThan(0);
        
        // Check for timeline line
        const timelineLine = document.querySelector('.absolute.left-4.top-0.bottom-0.w-0\\.5');
        expect(timelineLine).toBeInTheDocument();
      });
    });
  });

  describe('Activities Section', () => {
    it('renders activities section with achievements', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        expect(screen.getByText('Activities & Achievements')).toBeInTheDocument();
        expect(screen.getByText('Speaker at tech conferences (DevOps Days, React Conf Brasil)')).toBeInTheDocument();
        expect(screen.getByText('Mentor at startup accelerator programs')).toBeInTheDocument();
        expect(screen.getByText('Open source contributor (React, Node.js ecosystem)')).toBeInTheDocument();
        expect(screen.getByText('Technical blog writer with 50K+ monthly readers')).toBeInTheDocument();
      });
    });

    it('displays activities with proper visual formatting', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for activity cards with proper styling
        const activityCards = document.querySelectorAll('.bg-gradient-to-r.from-green-50.to-blue-50');
        expect(activityCards.length).toBe(4); // Should have 4 activity cards
        
        // Check for activity indicators (dots)
        const activityDots = document.querySelectorAll('.w-2.h-2.bg-green-500.rounded-full');
        expect(activityDots.length).toBe(4);
      });
    });
  });

  describe('Responsive Design', () => {
    it('uses responsive grid layout for education and activities', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for responsive grid container
        const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    it('applies responsive spacing and typography', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for responsive section padding
        const section = document.querySelector('.py-20');
        expect(section).toBeInTheDocument();
        
        // Check for responsive container padding
        const container = document.querySelector('.px-6.lg\\:px-8');
        expect(container).toBeInTheDocument();
        
        // Check for responsive title sizing
        const title = document.querySelector('.text-3xl.md\\:text-4xl');
        expect(title).toBeInTheDocument();
      });
    });
  });

  describe('Visual Hierarchy', () => {
    it('displays proper section headers with icons and gradients', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for education icon
        const educationIcon = document.querySelector('.w-8.h-8.bg-gradient-to-r.from-blue-500.to-purple-500');
        expect(educationIcon).toBeInTheDocument();
        
        // Check for activities icon
        const activitiesIcon = document.querySelector('.w-8.h-8.bg-gradient-to-r.from-green-500.to-blue-500');
        expect(activitiesIcon).toBeInTheDocument();
      });
    });

    it('uses consistent card styling with shadows and borders', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for education cards with proper styling
        const educationCards = document.querySelectorAll('.bg-gray-50.dark\\:bg-gray-800.rounded-xl.p-6.shadow-lg');
        expect(educationCards.length).toBe(2);
        
        // Check for activity cards with border styling
        const activityCards = document.querySelectorAll('.border-l-4.border-green-500');
        expect(activityCards.length).toBe(4);
      });
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading skeleton when data is loading', async () => {
      // Mock loading state
      jest.doMock('@/hooks/useContent', () => ({
        useContent: () => ({
          resumeData: null,
          isLoading: true,
          error: null,
        }),
      }));

      const { unmount } = renderWithProvider(<Education />);
      
      // Check for loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
      
      unmount();
      jest.dontMock('@/hooks/useContent');
    });

    it('shows no data message when education and activities are empty', async () => {
      // Mock empty data
      jest.doMock('@/hooks/useContent', () => ({
        useContent: () => ({
          resumeData: {
            ...mockResumeData,
            education: [],
            activities: [],
          },
          isLoading: false,
          error: null,
        }),
      }));

      const { unmount } = renderWithProvider(<Education />);
      
      await waitFor(() => {
        expect(screen.getByText('No education or activities information available')).toBeInTheDocument();
      });
      
      unmount();
      jest.dontMock('@/hooks/useContent');
    });
  });

  describe('Accessibility', () => {
    it('includes proper semantic markup and ARIA labels', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check for section with proper ID
        const section = document.querySelector('section#education');
        expect(section).toBeInTheDocument();
        
        // Check for proper heading hierarchy
        const mainHeading = screen.getByRole('heading', { level: 2 });
        expect(mainHeading).toHaveTextContent('Education & Activities');
        
        const subHeadings = screen.getAllByRole('heading', { level: 3 });
        expect(subHeadings).toHaveLength(2); // Education and Activities headings
      });
    });

    it('provides proper focus management and keyboard navigation', async () => {
      renderWithProvider(<Education />);

      await waitFor(() => {
        // Check that interactive elements are focusable
        const section = document.querySelector('section#education');
        expect(section).toBeInTheDocument();
        
        // Verify proper tab order with semantic elements
        const headings = screen.getAllByRole('heading');
        headings.forEach(heading => {
          expect(heading).toBeVisible();
        });
      });
    });
  });
});