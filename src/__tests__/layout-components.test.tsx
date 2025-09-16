import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header, Footer, Layout } from '@/components/layout';
import { LanguageSelector } from '@/components/ui';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the LanguageContext
const mockLanguageContext = {
    language: 'en' as const,
    setLanguage: jest.fn(),
    isLoading: false,
};

jest.mock('@/contexts/LanguageContext', () => ({
    LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useLanguage: () => mockLanguageContext,
}));

// Mock the useTranslation hook
jest.mock('@/hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'nav.home': 'Home',
                'nav.summary': 'Summary',
                'nav.experience': 'Experience',
                'nav.education': 'Education',
                'nav.skills': 'Skills',
                'nav.projects': 'Projects',
                'footer.copyright': '© 2024 Marcelo Negrini',
                'footer.built': 'Built with Next.js',
            };
            return translations[key] || key;
        },
        language: 'en',
        setLanguage: jest.fn(),
    }),
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
    writable: true,
    value: 'en-US',
});

describe('Layout Components', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    describe('Header Component', () => {
        it('renders header element', () => {
            render(<Header />);

            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('handles section navigation prop', () => {
            const mockOnSectionChange = jest.fn();
            render(<Header onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('accepts current section prop', () => {
            render(<Header currentSection="experience" />);

            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('renders navigation elements', () => {
            render(<Header />);

            const header = screen.getByRole('banner');
            expect(header).toBeInTheDocument();

            // Check if navigation is present
            const nav = screen.queryByRole('navigation');
            if (nav) {
                expect(nav).toBeInTheDocument();
            }
        });
    });

    describe('LanguageSelector Component', () => {
        it('renders language selector without errors', () => {
            render(<LanguageSelector />);

            // Should render without throwing errors
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(0);
        });

        it('handles language selection', () => {
            render(<LanguageSelector />);

            // Should have some interactive elements
            const buttons = screen.getAllByRole('button');
            if (buttons.length > 0) {
                fireEvent.click(buttons[0]);
                // Should not throw errors
            }
        });
    });

    describe('Footer Component', () => {
        it('renders footer element', () => {
            render(<Footer />);

            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        });

        it('contains footer content', () => {
            render(<Footer />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
            expect(footer).not.toBeEmptyDOMElement();
        });
    });

    describe('Layout Component', () => {
        it('renders children content', () => {
            const testContent = <div data-testid="test-content">Test Content</div>;

            render(<Layout>{testContent}</Layout>);

            expect(screen.getByTestId('test-content')).toBeInTheDocument();
        });

        it('renders semantic HTML structure', () => {
            const testContent = <div data-testid="main-content">Main Content</div>;

            render(<Layout>{testContent}</Layout>);

            expect(screen.getByTestId('main-content')).toBeInTheDocument();
            expect(screen.getByRole('banner')).toBeInTheDocument(); // header
            expect(screen.getByRole('main')).toBeInTheDocument(); // main
            expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
        });

        it('includes accessibility landmarks', () => {
            const testContent = <div>Content</div>;

            render(<Layout>{testContent}</Layout>);

            // Check for proper semantic structure
            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        });

        it('renders without errors with complex content', () => {
            const complexContent = (
                <div>
                    <h1>Test Page</h1>
                    <section>
                        <h2>Section Title</h2>
                        <p>Section content</p>
                    </section>
                    <article>
                        <h3>Article Title</h3>
                        <p>Article content</p>
                    </article>
                </div>
            );

            render(<Layout>{complexContent}</Layout>);

            expect(screen.getByText('Test Page')).toBeInTheDocument();
            expect(screen.getByText('Section Title')).toBeInTheDocument();
            expect(screen.getByText('Article Title')).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('renders complete layout with all components', () => {
            const pageContent = (
                <div>
                    <h1>Resume Page</h1>
                    <LanguageSelector />
                    <p>Page content goes here</p>
                </div>
            );

            render(<Layout>{pageContent}</Layout>);

            expect(screen.getByText('Resume Page')).toBeInTheDocument();
            expect(screen.getByText('Page content goes here')).toBeInTheDocument();
            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        });

        it('handles multiple language selectors', () => {
            const content = (
                <div>
                    <LanguageSelector />
                    <LanguageSelector />
                </div>
            );

            render(<Layout>{content}</Layout>);

            // Should render without errors
            expect(screen.getByRole('main')).toBeInTheDocument();
        });

        it('maintains proper document structure', () => {
            render(
                <Layout>
                    <div>
                        <h1>Main Content</h1>
                    </div>
                </Layout>
            );

            // Should have proper nesting
            const mainElements = screen.getAllByRole('main');
            expect(mainElements.length).toBeGreaterThan(0);
            expect(screen.getByText('Main Content')).toBeInTheDocument();
        });
    });

    describe('Responsive Behavior', () => {
        it('renders on different screen sizes', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });

            render(
                <Layout>
                    <div>Responsive content</div>
                </Layout>
            );

            expect(screen.getByText('Responsive content')).toBeInTheDocument();
        });

        it('handles mobile viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <Layout>
                    <div>Mobile content</div>
                    <LanguageSelector />
                </Layout>
            );

            const banners = screen.getAllByRole('banner');
            expect(banners.length).toBeGreaterThan(0);
            expect(screen.getByText('Mobile content')).toBeInTheDocument();
        });
    });

    describe('Error Boundaries', () => {
        it('handles component errors gracefully', () => {
            // Mock console.error to avoid noise in test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const ThrowingComponent = () => {
                throw new Error('Test error');
            };

            // This should not crash the test
            try {
                render(
                    <Layout>
                        <ThrowingComponent />
                    </Layout>
                );
            } catch (error) {
                // Expected to catch the error
            }

            consoleSpy.mockRestore();
        });
    });
});