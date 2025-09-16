import { useEffect, useState, useCallback } from 'react';

interface ScrollProgressOptions {
  sections?: string[];
  offset?: number;
  throttleMs?: number;
}

interface ScrollProgressReturn {
  scrollProgress: number;
  currentSection: string | null;
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | null;
}

const useScrollProgress = (options: ScrollProgressOptions = {}): ScrollProgressReturn => {
  const {
    sections = [],
    offset = 100,
    throttleMs = 16, // ~60fps
  } = options;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
    
    return Math.min(Math.max(progress, 0), 100);
  }, []);

  const findCurrentSection = useCallback(() => {
    if (sections.length === 0) return null;

    const scrollTop = window.scrollY + offset;
    let current = null;

    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        
        if (scrollTop >= elementTop) {
          current = sectionId;
        } else {
          break;
        }
      }
    }

    return current;
  }, [sections, offset]);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Update scroll direction
    if (currentScrollY > lastScrollY) {
      setScrollDirection('down');
    } else if (currentScrollY < lastScrollY) {
      setScrollDirection('up');
    }
    setLastScrollY(currentScrollY);

    // Update scroll progress
    const progress = calculateScrollProgress();
    setScrollProgress(progress);

    // Update current section
    const section = findCurrentSection();
    setCurrentSection(section);

    // Set scrolling state
    setIsScrolling(true);
  }, [lastScrollY, calculateScrollProgress, findCurrentSection]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let throttleId: NodeJS.Timeout;

    const throttledHandleScroll = () => {
      if (throttleId) return;
      
      throttleId = setTimeout(() => {
        handleScroll();
        throttleId = null as any;
      }, throttleMs);
    };

    const handleScrollEnd = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
        setScrollDirection(null);
      }, 150);
    };

    const onScroll = () => {
      throttledHandleScroll();
      handleScrollEnd();
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
      if (throttleId) clearTimeout(throttleId);
    };
  }, [handleScroll, throttleMs]);

  return {
    scrollProgress,
    currentSection,
    isScrolling,
    scrollDirection,
  };
};

export default useScrollProgress;