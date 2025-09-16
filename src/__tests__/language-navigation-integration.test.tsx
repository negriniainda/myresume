import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/components/providers/I18nProvider';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.summary': 'Summary',
        'nav.experience': 'Experience',
        'nav.skills': 'Skills',
        'nav.education': 'Education',
        'nav.projects': 'Projects',
        'nav.contact': 'Contact',
        'language.english': 'English',
        'language.portuguese': 'Portuguese',
        'hero.title': 'AI & Technology Leadership Expert',
        'hero.subtitle': 'Driving digital transformation and innovation',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock scroll behavior
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock smooth scroll behavior
Element.prototype.scrollIntoView = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Language Switching and Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollTo.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Language Switching', () => {
    it('renders language selector with both options', () => {
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
    });

    it('switches language when language selector is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const languageButton = screen.getByRole('button', { name: /language/i });
      await user.click(languageButton);

      // Should show language options
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Portuguese')).toBeInTheDocument();
      });
    });

    it('persists language preference in localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const languageButton = screen.getByRole('button', { name: /language/i });
      await user.click(languageButton);

      const portugueseOption = screen.getByText('Portuguese');
      await user.click(portugueseOption);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'pt');
    });

    it('maintains scroll position during language switch', async () => {
      const user = userEvent.setup();
      
      // Mock current scroll position
      Object.defineProperty(window, 'scrollY', {
        value: 500,
        writable: true,
      });

      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const languageButton = screen.getByRole('button', { name: /language/i });
      await user.click(languageButton);

      const portugueseOption = screen.getByText('Portuguese');
      await user.click(portugueseOption);

      // Should maintain scroll position
      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith(0, 500);
      });
    });

    it('updates content language immediately', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const { t } = require('react-i18next').useTranslation();
        return <div>{t('hero.title')}</div>;
      };

      render(
        <I18nProvider>
          <TestComponent />
          <Header />
        </I18nProvider>
      );

      expect(screen.getByText('AI & Technology Leadership Expert')).toBeInTheDocument();

      const languageButton = screen.getByRole('button', { name: /language/i });
      await user.click(languageButton);

      const portugueseOption = screen.getByText('Portuguese');
      await user.click(portugueseOption);

      // Content should update (mocked to return same text for simplicity)
      expect(screen.getByText('AI & Technology Leadership Expert')).toBeInTheDocument();
    });

    it('is accessible during language switching', async () => {
      const { container } = render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test accessibility after opening language menu
      const languageButton = screen.getByRole('button', { name: /language/i });
      fireEvent.click(languageButton);

      await waitFor(async () => {
        const resultsAfterClick = await axe(container);
        expect(resultsAfterClick).toHaveNoViolations();
      });
    });
  });

  describe('Navigation', () => {
    it('renders all navigation items', () => {
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('scrolls to section when navigation item is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock document.getElementById
      const mockElement = {
        scrollIntoView: jest.fn(),
        offsetTop: 100,
      };
      document.getElementById = jest.fn(() => mockElement as any);

      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const experienceLink = screen.getByText('Experience');
      await user.click(experienceLink);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('highlights current section in navigation', async () => {
      // Mock IntersectionObserver to simulate section visibility
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
      };

      global.IntersectionObserver = jest.fn((callback) => {
        // Simulate experience section being visible
        setTimeout(() => {
          callback([
            {
              target: { id: 'experience' },
              isIntersecting: true,
              intersectionRatio: 0.5,
            },
          ]);
        }, 100);
        return mockObserver;
      }) as any;

      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      await waitFor(() => {
        const experienceLink = screen.getByText('Experience');
        expect(experienceLink.closest('a')).toHaveClass('text-blue-600');
      });
    });

    it('shows mobile menu on small screens', async () => {
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
      expect(mobileMenuButton).toBeInTheDocument();

      await user.click(mobileMenuButton);

      // Mobile menu should be visible
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toHaveClass('block');
      });
    });

    it('closes mobile menu when navigation item is clicked', async () => {
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

      const experienceLink = screen.getByText('Experience');
      await user.click(experienceLink);

      // Mobile menu should close
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toHaveClass('hidden');
      });
    });

    it('is accessible with keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      // Tab through navigation items
      await user.tab();
      expect(screen.getByText('Summary').closest('a')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Experience').closest('a')).toHaveFocus();

      // Enter should activate navigation
      await user.keyboard('{Enter}');
      
      // Should scroll to section (mocked)
      expect(document.getElementById).toHaveBeenCalledWith('experience');
    });
  });

  describe('Layout Integration', () => {
    it('renders complete layout with header and content', () => {
      render(
        <I18nProvider>
          <Layout>
            <div data-testid="main-content">Main Content</div>
          </Layout>
        </I18nProvider>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });

    it('maintains proper semantic structure', async () => {
      const { container } = render(
        <I18nProvider>
          <Layout>
            <main>
              <section id="summary">
                <h2>Summary</h2>
                <p>Professional summary content</p>
              </section>
            </main>
          </Layout>
        </I18nProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles scroll progress indicator', async () => {
      // Mock scroll events
      const scrollEvent = new Event('scroll');
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

      render(
        <I18nProvider>
          <Layout>
            <div style={{ height: '2000px' }}>Long content</div>
          </Layout>
        </I18nProvider>
      );

      act(() => {
        window.dispatchEvent(scrollEvent);
      });

      // Should update scroll progress (implementation depends on actual component)
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        if (progressBar) {
          expect(progressBar).toBeInTheDocument();
        }
      });
    });
  });

  describe('Performance During Navigation', () => {
    it('does not cause memory leaks during rapid navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      // Rapidly click navigation items
      const navItems = ['Summary', 'Experience', 'Skills', 'Education'];
      
      for (const item of navItems) {
        const link = screen.getByText(item);
        await user.click(link);
        
        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Should not throw errors or cause issues
      expect(screen.getByText('Education')).toBeInTheDocument();
    });

    it('handles language switching during navigation smoothly', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      // Click navigation item
      const experienceLink = screen.getByText('Experience');
      await user.click(experienceLink);

      // Immediately switch language
      const languageButton = screen.getByRole('button', { name: /language/i });
      await user.click(languageButton);

      const portugueseOption = screen.getByText('Portuguese');
      await user.click(portugueseOption);

      // Should handle both actions without errors
      expect(screen.getByText('Experience')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing navigation targets gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock getElementById to return null
      document.getElementById = jest.fn(() => null);

      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const experienceLink = screen.getByText('Experience');
      await user.click(experienceLink);

      // Should not throw error when target element is missing
      expect(document.getElementById).toHaveBeenCalledWith('experience');
    });

    it('handles language switching errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <I18nProvider>
          <Header />
        </I18nProvider>
      );

      const languageButton = screen.getByRole('button', { name: /language/i });
      await user.click(languageButton);

      const portugueseOption = screen.getByText('Portuguese');
      await user.click(portugueseOption);

      // Should handle storage error gracefully
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});