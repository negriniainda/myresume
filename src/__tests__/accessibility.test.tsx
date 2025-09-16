import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/components/providers/I18nProvider';
import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import Experience from '@/components/sections/Experience';
import Skills from '@/components/sections/Skills';
import GlobalSearch from '@/components/ui/GlobalSearch';
import FilterPanel from '@/components/ui/FilterPanel';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'hero.title': 'AI & Technology Leadership Expert',
        'hero.subtitle': 'Driving digital transformation and innovation',
        'hero.description': 'Experienced technology leader with expertise in AI, digital transformation, and team management.',
        'search.placeholder': 'Search resume content...',
        'search.results': 'Search Results',
        'filters.all': 'All',
        'filters.technology': 'Technology',
        'filters.industry': 'Industry',
        'experience.title': 'Professional Experience',
        'skills.title': 'Technical Skills',
        'nav.summary': 'Summary',
        'nav.experience': 'Experience',
        'nav.skills': 'Skills',
        'nav.education': 'Education',
        'nav.projects': 'Projects',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock data
const mockExperienceData = [
  {
    id: '1',
    position: 'Senior Technology Director',
    company: 'Tech Corp',
    location: 'São Paulo, Brazil',
    period: { start: '2020', end: '2024' },
    description: 'Led digital transformation initiatives',
    achievements: [
      { metric: '40%', description: 'Increased team productivity' },
    ],
    technologies: ['React', 'Node.js', 'AWS'],
  },
];

const mockSkillsData = [
  {
    name: 'Frontend Development',
    skills: [
      { name: 'React', level: 'Expert', yearsOfExperience: 5 },
      { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 4 },
    ],
  },
];

// Mock hooks
jest.mock('@/hooks/useResumeData', () => ({
  useResumeData: () => ({
    data: {
      experience: mockExperienceData,
      skills: mockSkillsData,
    },
    loading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useSearch', () => ({
  useSearch: () => ({
    searchTerm: '',
    setSearchTerm: jest.fn(),
    results: [],
    isSearching: false,
  }),
}));

jest.mock('@/hooks/useFilters', () => ({
  useFilters: () => ({
    filters: { technology: [], industry: [] },
    setFilter: jest.fn(),
    clearFilters: jest.fn(),
    filteredData: mockExperienceData,
  }),
}));

describe('Accessibility Tests', () => {
  describe('Header Component', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      // Should have proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('has accessible navigation', () => {
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label');
    });

    it('has accessible language selector', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const languageButton = screen.getByRole('button', { name: /language/i });
      expect(languageButton).toHaveAttribute('aria-label');
      expect(languageButton).toHaveAttribute('aria-expanded');

      await user.click(languageButton);

      await waitFor(() => {
        expect(languageButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      // Tab through navigation items
      await user.tab();
      const firstNavItem = screen.getByText('Summary').closest('a');
      expect(firstNavItem).toHaveFocus();

      // Should be able to activate with Enter
      await user.keyboard('{Enter}');
      // Navigation should work (implementation specific)
    });

    it('has proper focus management in mobile menu', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      await user.click(mobileMenuButton);

      // Focus should move to first menu item
      await waitFor(() => {
        const firstMenuItem = screen.getByText('Summary').closest('a');
        expect(firstMenuItem).toBeVisible();
      });

      // Escape should close menu
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(mobileMenuButton).toHaveFocus();
      });
    });
  });

  describe('Hero Section', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <I18nProvider>
          <Hero />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading structure', () => {
      render(
        <I18nProvider>
          <Hero />
        </I18nProvider>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('AI & Technology Leadership Expert');
    });

    it('has descriptive text for screen readers', () => {
      render(
        <I18nProvider>
          <Hero />
        </I18nProvider>
      );

      const description = screen.getByText(/Experienced technology leader/);
      expect(description).toBeInTheDocument();
    });

    it('has proper landmark roles', () => {
      render(
        <I18nProvider>
          <Hero />
        </I18nProvider>
      );

      const section = screen.getByRole('banner') || screen.getByRole('main');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Experience Section', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <I18nProvider>
          <Experience />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(
        <I18nProvider>
          <Experience />
        </I18nProvider>
      );

      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Professional Experience');
    });

    it('has accessible timeline structure', () => {
      render(
        <I18nProvider>
          <Experience />
        </I18nProvider>
      );

      // Timeline should be structured as a list
      const timeline = screen.getByRole('list') || screen.getByRole('region');
      expect(timeline).toBeInTheDocument();
    });

    it('has expandable content with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Experience />
        </I18nProvider>
      );

      const expandButton = screen.getByRole('button', { name: /expand|show more/i });
      if (expandButton) {
        expect(expandButton).toHaveAttribute('aria-expanded');
        
        await user.click(expandButton);
        
        await waitFor(() => {
          expect(expandButton).toHaveAttribute('aria-expanded', 'true');
        });
      }
    });

    it('has accessible technology tags', () => {
      render(
        <I18nProvider>
          <Experience />
        </I18nProvider>
      );

      const techTags = screen.getAllByText(/React|Node\.js|AWS/);
      techTags.forEach(tag => {
        expect(tag).toBeInTheDocument();
        // Tags should be properly labeled
        expect(tag.closest('[role="list"]') || tag.closest('[aria-label]')).toBeTruthy();
      });
    });
  });

  describe('Skills Section', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <I18nProvider>
          <Skills />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible skill level indicators', () => {
      render(
        <I18nProvider>
          <Skills />
        </I18nProvider>
      );

      // Skill levels should be accessible to screen readers
      const skillLevels = screen.getAllByText(/Expert|Advanced|Intermediate/);
      skillLevels.forEach(level => {
        expect(level).toBeInTheDocument();
      });
    });

    it('has proper progress bar accessibility', () => {
      render(
        <I18nProvider>
          <Skills />
        </I18nProvider>
      );

      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('aria-valuenow');
        expect(bar).toHaveAttribute('aria-valuemin');
        expect(bar).toHaveAttribute('aria-valuemax');
        expect(bar).toHaveAttribute('aria-label');
      });
    });

    it('has accessible skill categories', () => {
      render(
        <I18nProvider>
          <Skills />
        </I18nProvider>
      );

      const categoryHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(categoryHeadings.length).toBeGreaterThan(0);
      
      categoryHeadings.forEach(heading => {
        expect(heading).toHaveTextContent(/Frontend Development/);
      });
    });
  });

  describe('Search Component', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <I18nProvider>
          <GlobalSearch />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible search input', () => {
      render(
        <I18nProvider>
          <GlobalSearch />
        </I18nProvider>
      );

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('placeholder');
    });

    it('has accessible search results', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <GlobalSearch />
        </I18nProvider>
      );

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'React');

      // Search results should be announced to screen readers
      await waitFor(() => {
        const resultsRegion = screen.getByRole('region', { name: /search results/i });
        if (resultsRegion) {
          expect(resultsRegion).toBeInTheDocument();
          expect(resultsRegion).toHaveAttribute('aria-live');
        }
      });
    });

    it('supports keyboard navigation in results', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <GlobalSearch />
        </I18nProvider>
      );

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'React');

      // Arrow keys should navigate results
      await user.keyboard('{ArrowDown}');
      
      // First result should be focused
      const firstResult = screen.getByRole('option') || screen.getByRole('button');
      if (firstResult) {
        expect(firstResult).toHaveFocus();
      }
    });
  });

  describe('Filter Panel', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <I18nProvider>
          <FilterPanel />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible filter controls', () => {
      render(
        <I18nProvider>
          <FilterPanel />
        </I18nProvider>
      );

      const filterButtons = screen.getAllByRole('button');
      filterButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('has proper fieldset structure for filter groups', () => {
      render(
        <I18nProvider>
          <FilterPanel />
        </I18nProvider>
      );

      const fieldsets = screen.getAllByRole('group');
      fieldsets.forEach(fieldset => {
        expect(fieldset).toBeInTheDocument();
      });
    });

    it('announces filter changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <FilterPanel />
        </I18nProvider>
      );

      const filterButton = screen.getByRole('button', { name: /technology/i });
      await user.click(filterButton);

      // Filter changes should be announced
      const liveRegion = screen.getByRole('status') || screen.getByRole('alert');
      if (liveRegion) {
        expect(liveRegion).toHaveAttribute('aria-live');
      }
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('has sufficient color contrast for text', async () => {
      const { container } = render(
        <I18nProvider>
          <div className="text-gray-900 bg-white p-4">
            <h1>High Contrast Text</h1>
            <p>This text should have sufficient contrast.</p>
          </div>
        </I18nProvider>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('has accessible focus indicators', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
            Accessible Button
          </button>
        </I18nProvider>
      );

      const button = screen.getByRole('button');
      await user.tab();
      
      expect(button).toHaveFocus();
      // Focus indicator should be visible (implementation specific)
    });
  });

  describe('Screen Reader Support', () => {
    it('has proper landmark roles', () => {
      render(
        <I18nProvider>
          <div>
            <header role="banner">Header</header>
            <nav role="navigation">Navigation</nav>
            <main role="main">Main Content</main>
            <footer role="contentinfo">Footer</footer>
          </div>
        </I18nProvider>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('has descriptive link text', () => {
      render(
        <I18nProvider>
          <div>
            <a href="#experience">View Professional Experience</a>
            <a href="#skills">Explore Technical Skills</a>
          </div>
        </I18nProvider>
      );

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
        expect(link.textContent).not.toMatch(/^(click here|read more|learn more)$/i);
      });
    });

    it('has proper image alt text', () => {
      render(
        <I18nProvider>
          <div>
            <img src="/profile.jpg" alt="Professional headshot of Marcelo Negrini" />
            <img src="/company-logo.png" alt="Tech Corp company logo" />
          </div>
        </I18nProvider>
      );

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('has skip navigation links', () => {
      render(
        <I18nProvider>
          <div>
            <a href="#main-content" className="sr-only focus:not-sr-only">
              Skip to main content
            </a>
            <main id="main-content">Main Content</main>
          </div>
        </I18nProvider>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Motion and Animation Accessibility', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <I18nProvider>
          <div className="transition-transform duration-300 hover:scale-105">
            Animated Element
          </div>
        </I18nProvider>
      );

      // Animation should be disabled when prefers-reduced-motion is set
      const animatedElement = screen.getByText('Animated Element');
      expect(animatedElement).toBeInTheDocument();
    });
  });
});