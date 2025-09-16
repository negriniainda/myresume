'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentPreserverProps {
  children: React.ReactNode;
  preserveScroll?: boolean;
  preserveFocus?: boolean;
  transitionDuration?: number;
}

/**
 * Component that preserves user state during language switches
 */
export function ContentPreserver({ 
  children, 
  preserveScroll = true, 
  preserveFocus = true,
  transitionDuration = 300
}: ContentPreserverProps) {
  const { language } = useLanguage();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  const focusedElementRef = useRef<Element | null>(null);
  const previousLanguageRef = useRef<string>(language);

  // Detect language changes
  useEffect(() => {
    if (previousLanguageRef.current !== language) {
      setIsTransitioning(true);
      
      // Store current state before language change
      if (preserveScroll) {
        scrollPositionRef.current = window.scrollY;
      }
      
      if (preserveFocus) {
        focusedElementRef.current = document.activeElement;
      }

      // Reset transition state after duration
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        
        // Restore state after language change
        if (preserveScroll && scrollPositionRef.current > 0) {
          window.scrollTo({
            top: scrollPositionRef.current,
            behavior: 'smooth'
          });
        }
        
        if (preserveFocus && focusedElementRef.current) {
          const element = focusedElementRef.current as HTMLElement;
          if (element && typeof element.focus === 'function') {
            try {
              element.focus();
            } catch (error) {
              // Ignore focus errors (element might not be focusable anymore)
            }
          }
        }
      }, transitionDuration);

      previousLanguageRef.current = language;
      
      return () => clearTimeout(timer);
    }
  }, [language, preserveScroll, preserveFocus, transitionDuration]);

  return (
    <div 
      className={`transition-opacity duration-${transitionDuration} ${
        isTransitioning ? 'opacity-90' : 'opacity-100'
      }`}
      data-language={language}
    >
      {children}
    </div>
  );
}

interface ScrollPreserverProps {
  children: React.ReactNode;
  sectionId?: string;
}

/**
 * Component specifically for preserving scroll position within sections
 */
export function ScrollPreserver({ children, sectionId }: ScrollPreserverProps) {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !sectionId) return;

    // Save scroll position for current language
    const saveScrollPosition = () => {
      scrollPositions.current[language] = section.scrollTop;
    };

    // Restore scroll position for new language
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.current[language];
      if (savedPosition !== undefined) {
        section.scrollTop = savedPosition;
      }
    };

    // Save current position before language might change
    saveScrollPosition();
    
    // Restore position after a short delay (to allow content to render)
    const timer = setTimeout(restoreScrollPosition, 100);

    return () => {
      clearTimeout(timer);
      saveScrollPosition(); // Save on cleanup
    };
  }, [language, sectionId]);

  return (
    <div ref={sectionRef} className="overflow-auto">
      {children}
    </div>
  );
}

interface FocusPreserverProps {
  children: React.ReactNode;
  focusKey?: string;
}

/**
 * Component for preserving focus state during language switches
 */
export function FocusPreserver({ children, focusKey }: FocusPreserverProps) {
  const { language } = useLanguage();
  const focusStates = useRef<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !focusKey) return;

    // Save focus state for current language
    const saveFocusState = () => {
      const activeElement = document.activeElement;
      if (activeElement && container.contains(activeElement)) {
        // Create a selector for the focused element
        const selector = createElementSelector(activeElement);
        if (selector) {
          focusStates.current[language] = selector;
        }
      }
    };

    // Restore focus state for new language
    const restoreFocusState = () => {
      const savedSelector = focusStates.current[language];
      if (savedSelector) {
        try {
          const element = container.querySelector(savedSelector) as HTMLElement;
          if (element && typeof element.focus === 'function') {
            element.focus();
          }
        } catch (error) {
          // Ignore errors if element can't be found or focused
        }
      }
    };

    // Save current focus before language might change
    saveFocusState();
    
    // Restore focus after a short delay
    const timer = setTimeout(restoreFocusState, 150);

    return () => {
      clearTimeout(timer);
      saveFocusState(); // Save on cleanup
    };
  }, [language, focusKey]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

/**
 * Helper function to create a CSS selector for an element
 */
function createElementSelector(element: Element): string | null {
  try {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try data attributes
    const dataTestId = element.getAttribute('data-testid');
    if (dataTestId) {
      return `[data-testid="${dataTestId}"]`;
    }

    const dataId = element.getAttribute('data-id');
    if (dataId) {
      return `[data-id="${dataId}"]`;
    }

    // Try role and aria-label combination
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    if (role && ariaLabel) {
      return `[role="${role}"][aria-label="${ariaLabel}"]`;
    }

    // Try class-based selector (use first class)
    const classList = element.classList;
    if (classList.length > 0) {
      return `.${classList[0]}`;
    }

    // Fallback to tag name with index
    const tagName = element.tagName.toLowerCase();
    const siblings = Array.from(element.parentElement?.children || []);
    const index = siblings.indexOf(element);
    return `${tagName}:nth-child(${index + 1})`;
  } catch (error) {
    return null;
  }
}