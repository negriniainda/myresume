import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '@/components/sections/Hero';
import Summary from '@/components/sections/Summary';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
}));

// Mock hooks
jest.mock('@/hooks/useContent', () => ({
  useContent: () => ({
    resumeData: {
      personalInfo: {
        name: 'Marcelo Negrini',
        title: 'AI & Technology Leadership Expert',
        location: 'São Paulo, SP, Brazil',
        email: 'marcelo.negrini@example.com',
        phone: '+55 11 99999-9999',
        linkedin: 'https://linkedin.com/in/marcelonegrini',
        github: 'https://github.com/marcelonegrini',
        website: 'https://marcelonegrini.dev'
      },
      objective: 'Passionate technology leader with 15+ years of experience',
      summary: {
        title: 'Professional Summary',
        items: [
          '15+ years of experience in technology leadership',
          'Expert in AI, machine learning, and data-driven solutions',
          'Proven track record in scaling engineering teams'
        ]
      }
    },
    isLoading: false,
    error: null
  })
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('Hero Component', () => {
  it('renders personal information correctly', () => {
    renderWithProviders(<Hero />);
    
    expect(screen.getByText('Marcelo Negrini')).toBeInTheDocument();
    expect(screen.getByText('AI & Technology Leadership Expert')).toBeInTheDocument();
    expect(screen.getByText('São Paulo, SP, Brazil')).toBeInTheDocument();
    expect(screen.getByText('marcelo.negrini@example.com')).toBeInTheDocument();
  });

  it('renders social links when provided', () => {
    renderWithProviders(<Hero />);
    
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Website')).toBeInTheDocument();
  });

  it('renders scroll indicator', () => {
    renderWithProviders(<Hero />);
    
    expect(screen.getByText('Scroll down')).toBeInTheDocument();
  });
});

describe('Summary Component', () => {
  it('renders summary title and items', () => {
    renderWithProviders(<Summary />);
    
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText('15+ years of experience in technology leadership')).toBeInTheDocument();
    expect(screen.getByText('Expert in AI, machine learning, and data-driven solutions')).toBeInTheDocument();
  });

  it('renders objective section', () => {
    renderWithProviders(<Summary />);
    
    expect(screen.getByText('Objective')).toBeInTheDocument();
    expect(screen.getByText('Passionate technology leader with 15+ years of experience')).toBeInTheDocument();
  });

  it('renders career highlights section', () => {
    renderWithProviders(<Summary />);
    
    expect(screen.getByText('Career Highlights')).toBeInTheDocument();
    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
  });

  it('renders key qualifications section', () => {
    renderWithProviders(<Summary />);
    
    expect(screen.getByText('Key Qualifications')).toBeInTheDocument();
  });
});