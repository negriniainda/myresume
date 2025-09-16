import { useEffect, useState, useCallback } from 'react';

interface AccessibilityState {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

export const useAccessibility = () => {
  const [state, setState] = useState<AccessibilityState>({
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardNavigation: false,
    focusVisible: false,
  });

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    setState(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, highContrast: e.matches }));
    };

    setState(prev => ({ ...prev, highContrast: highContrastQuery.matches }));
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Detect screen reader usage
    const detectScreenReader = () => {
      const hasScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis?.getVoices().length > 0;
      
      setState(prev => ({ ...prev, screenReader: hasScreenReader }));
    };

    detectScreenReader();

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setState(prev => ({ ...prev, keyboardNavigation: true, focusVisible: true }));
      }
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, focusVisible: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    ...state,
    announceToScreenReader,
    skipToContent,
    trapFocus,
  };
};