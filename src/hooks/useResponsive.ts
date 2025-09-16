import { useState, useEffect } from 'react';

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: keyof BreakpointConfig;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isTouchDevice: boolean;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook for responsive design and device detection
 */
export const useResponsive = (breakpoints: BreakpointConfig = defaultBreakpoints): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLandscape: true,
        isPortrait: false,
        isTouchDevice: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      breakpoint: getBreakpoint(width, breakpoints),
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      isLandscape: width > height,
      isPortrait: height >= width,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        setState({
          width,
          height,
          breakpoint: getBreakpoint(width, breakpoints),
          isMobile: width < breakpoints.md,
          isTablet: width >= breakpoints.md && width < breakpoints.lg,
          isDesktop: width >= breakpoints.lg,
          isLandscape: width > height,
          isPortrait: height >= width,
          isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoints]);

  return state;
};

/**
 * Get current breakpoint based on width
 */
const getBreakpoint = (width: number, breakpoints: BreakpointConfig): keyof BreakpointConfig => {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Hook for media query matching
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

/**
 * Hook for detecting device capabilities
 */
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        hasHover: true,
        hasPointer: true,
        prefersReducedMotion: false,
        supportsWebP: false,
        supportsAvif: false,
      };
    }

    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasPointer: window.matchMedia('(pointer: fine)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      supportsWebP: checkWebPSupport(),
      supportsAvif: checkAvifSupport(),
    };
  });

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities({
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
        hasPointer: window.matchMedia('(pointer: fine)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        supportsWebP: checkWebPSupport(),
        supportsAvif: checkAvifSupport(),
      });
    };

    // Listen for changes in media queries
    const hoverQuery = window.matchMedia('(hover: hover)');
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    hoverQuery.addEventListener('change', updateCapabilities);
    pointerQuery.addEventListener('change', updateCapabilities);
    motionQuery.addEventListener('change', updateCapabilities);

    return () => {
      hoverQuery.removeEventListener('change', updateCapabilities);
      pointerQuery.removeEventListener('change', updateCapabilities);
      motionQuery.removeEventListener('change', updateCapabilities);
    };
  }, []);

  return capabilities;
};

/**
 * Check WebP support
 */
const checkWebPSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Check AVIF support
 */
const checkAvifSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
};

/**
 * Hook for container queries (when supported)
 */
export const useContainerQuery = (containerRef: React.RefObject<HTMLElement>, query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const element = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Simple container query parsing (extend as needed)
        if (query.includes('min-width')) {
          const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0');
          setMatches(width >= minWidth);
        } else if (query.includes('max-width')) {
          const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '0');
          setMatches(width <= maxWidth);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, query]);

  return matches;
};