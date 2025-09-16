/**
 * Bundle optimization utilities for code splitting and dynamic imports
 */

import { lazy, ComponentType } from 'react';

/**
 * Dynamic import with retry logic for network failures
 */
export const dynamicImportWithRetry = <T = any>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const attemptImport = (attempt: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (attempt < retries) {
            setTimeout(() => attemptImport(attempt + 1), delay * attempt);
          } else {
            reject(error);
          }
        });
    };

    attemptImport(1);
  });
};

/**
 * Create lazy component with retry logic
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3
) => {
  return lazy(() => dynamicImportWithRetry(importFn, retries));
};

/**
 * Preload component for better UX
 */
export const preloadComponent = (importFn: () => Promise<any>) => {
  const componentImport = importFn();
  return componentImport;
};

/**
 * Critical resource hints for performance
 */
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  const head = document.head;

  // DNS prefetch for external resources
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.openai.com',
  ];

  dnsPrefetchDomains.forEach((domain) => {
    if (!document.querySelector(`link[href*="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      head.appendChild(link);
    }
  });

  // Preconnect to critical origins
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnectDomains.forEach((domain) => {
    if (!document.querySelector(`link[href="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    }
  });
};

/**
 * Lazy load non-critical CSS
 */
export const loadNonCriticalCSS = (href: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  
  document.head.appendChild(link);
};

/**
 * Service worker registration for caching
 */
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered: ', registration);
    
    // Update service worker when new version is available
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, refresh the page
            if (confirm('New version available! Refresh to update?')) {
              window.location.reload();
            }
          }
        });
      }
    });
  } catch (error) {
    console.log('SW registration failed: ', error);
  }
};

/**
 * Optimize images for different screen densities
 */
export const getOptimizedImageSrc = (
  src: string,
  width: number,
  quality: number = 75,
  format: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp'
): string => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // For Next.js Image Optimization API
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/_next/image?${params.toString()}`;
};

/**
 * Generate responsive image srcSet
 */
export const generateSrcSet = (
  src: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  quality: number = 75
): string => {
  return widths
    .map((width) => `${getOptimizedImageSrc(src, width, quality)} ${width}w`)
    .join(', ');
};

/**
 * Advanced code splitting utilities
 */
export const createChunkedImport = <T>(
  importFn: () => Promise<T>,
  chunkName?: string
): Promise<T> => {
  // Add webpack magic comment for chunk naming
  if (chunkName && process.env.NODE_ENV === 'development') {
    console.log(`Loading chunk: ${chunkName}`);
  }
  
  return importFn();
};

/**
 * Route-based code splitting
 */
export const createRouteChunk = (routeName: string) => {
  return {
    component: () => createChunkedImport(
      () => import(`@/components/sections/${routeName}`),
      `section-${routeName.toLowerCase()}`
    ),
    preload: () => createChunkedImport(
      () => import(`@/components/sections/${routeName}`),
      `section-${routeName.toLowerCase()}-preload`
    ),
  };
};

/**
 * Feature-based code splitting (commented out until features directory exists)
 */
export const createFeatureChunk = (featureName: string) => {
  // This would be used when we have a features directory structure
  // For now, return placeholder functions
  return {
    component: () => Promise.resolve({ default: () => null }),
    utils: () => Promise.resolve({ default: {} }),
    hooks: () => Promise.resolve({ default: {} }),
  };
};

/**
 * Detect connection speed and adjust loading strategy
 */
export const getConnectionInfo = () => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    };
  }

  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false,
  };
};

/**
 * Adaptive loading based on connection
 */
export const shouldLoadHighQuality = (): boolean => {
  const { effectiveType, saveData, downlink } = getConnectionInfo();
  
  if (saveData) return false;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
  if (downlink < 1.5) return false;
  
  return true;
};

/**
 * Prefetch critical routes
 */
export const prefetchRoutes = (routes: string[]) => {
  if (typeof document === 'undefined') return;

  routes.forEach((route) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

/**
 * Critical CSS inlining
 */
export const inlineCriticalCSS = (css: string) => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

/**
 * Remove unused CSS at runtime (for development)
 */
export const removeUnusedCSS = () => {
  if (typeof document === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }

  // This is a simplified version - in production, use tools like PurgeCSS
  const stylesheets = Array.from(document.styleSheets);
  const usedSelectors = new Set<string>();

  // Collect all used selectors
  const elements = document.querySelectorAll('*');
  elements.forEach((element) => {
    if (element.className) {
      element.className.split(' ').forEach((className) => {
        if (className.trim()) {
          usedSelectors.add(`.${className.trim()}`);
        }
      });
    }
    if (element.id) {
      usedSelectors.add(`#${element.id}`);
    }
  });

  console.log('Used selectors:', usedSelectors.size);
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const performance = window.performance as any;
  
  if ('memory' in performance) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }

  return null;
};

/**
 * Performance metrics collection
 */
export const collectPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const metrics = {
    // Core Web Vitals
    FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    LCP: 0, // Would need to be measured with PerformanceObserver
    CLS: 0, // Would need to be measured with PerformanceObserver
    FID: 0, // Would need to be measured with PerformanceObserver
    
    // Navigation timing
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Memory usage
    memory: monitorMemoryUsage(),
  };

  return metrics;
};