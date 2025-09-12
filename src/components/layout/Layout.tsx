import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

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
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header with navigation */}
      <Header 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main content area */}
      <main 
        className={`relative transition-all duration-300 ${
          isScrolling ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        role="main"
      >
        {/* Content wrapper with proper spacing for fixed header */}
        <div className="pt-16">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </div>
  );
};

// Scroll to top button component
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
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
