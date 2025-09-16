import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import KeyboardNavigation from '@/components/accessibility/KeyboardNavigation';
import AriaLabels from '@/components/accessibility/AriaLabels';
import { useAccessibility } from '@/hooks/useAccessibility';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [isScrolling, setIsScrolling] = useState(false);

  // Track which sections are currently visible
  useEffect(() => {
    const sections = ['hero', 'summary', 'experience', 'education', 'skills', 'projects'];
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Set<string>();

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;
        
        if (entry.isIntersecting) {
          visibleSections.add(sectionId);
        } else {
          visibleSections.delete(sectionId);
        }
      });

      // Update current section based on the first visible section in order
      for (const section of sections) {
        if (visibleSections.has(section)) {
          setCurrentSection(section);
          break;
        }
      }
    };

    // Create observers for each section
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver(handleIntersection, {
          rootMargin: '-20% 0px -60% 0px', // Trigger when section is 20% from top
          threshold: 0.1
        });
        
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  // Handle scroll state for performance optimizations
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleSectionChange = useCallback((sectionId: string) => {
    setCurrentSection(sectionId);
  }, []);

  return (
    <KeyboardNavigation>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Header with navigation */}
        <AriaLabels section="navigation">
          <Header 
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
        </AriaLabels>

        {/* Main content area */}
        <main 
          className={`relative transition-all duration-300 ${
            isScrolling ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          role="main"
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
        >
          {/* Content wrapper with proper spacing for fixed header - mobile optimized */}
          <div className="pt-14 sm:pt-16">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />

        {/* Scroll to top button */}
        <ScrollToTopButton />
      </div>
    </KeyboardNavigation>
  );
};

// Scroll to top button component
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    announceToScreenReader('Scrolled to top of page', 'polite');
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 p-2.5 sm:p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 touch-manipulation opacity-100 translate-y-0"
      aria-label="Scroll to top of page"
      title="Scroll to top"
      type="button"
    >
      <svg 
        className="w-4 h-4 sm:w-5 sm:h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
        role="img"
      >
        <title>Up arrow</title>
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
};

export default Layout;
