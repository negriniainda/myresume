// Analytics and error monitoring utilities for production deployment

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track language changes
export const trackLanguageChange = (language: string) => {
  trackEvent('language_change', 'user_interaction', language);
};

// Track search usage
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', 'user_interaction', searchTerm, resultsCount);
};

// Track filter usage
export const trackFilter = (filterType: string, filterValue: string) => {
  trackEvent('filter_use', 'user_interaction', `${filterType}:${filterValue}`);
};

// Track section navigation
export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', 'navigation', sectionName);
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('performance', 'core_web_vitals', metric, Math.round(value));
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  console.error('Application Error:', error, context);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      custom_map: {
        context: context || 'unknown',
        stack: error.stack?.substring(0, 500) || 'no stack trace',
      },
    });
  }
};

// Performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      trackPerformance('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        trackPerformance('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      trackPerformance('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Monitor JavaScript errors
  window.addEventListener('error', (event) => {
    trackError(new Error(event.message), `${event.filename}:${event.lineno}`);
  });

  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), 'unhandled_promise_rejection');
  });
};

// User engagement tracking
export const trackUserEngagement = () => {
  if (typeof window === 'undefined') return;

  let startTime = Date.now();
  let isActive = true;

  // Track time on page
  const trackTimeOnPage = () => {
    if (isActive) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('time_on_page', 'engagement', 'seconds', timeSpent);
    }
  };

  // Track when user becomes inactive
  const handleVisibilityChange = () => {
    if (document.hidden) {
      isActive = false;
      trackTimeOnPage();
    } else {
      isActive = true;
      startTime = Date.now();
    }
  };

  // Track scroll depth
  let maxScrollDepth = 0;
  const trackScrollDepth = () => {
    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track milestone scroll depths
      if (scrollDepth >= 25 && scrollDepth < 50) {
        trackEvent('scroll_depth', 'engagement', '25%');
      } else if (scrollDepth >= 50 && scrollDepth < 75) {
        trackEvent('scroll_depth', 'engagement', '50%');
      } else if (scrollDepth >= 75 && scrollDepth < 90) {
        trackEvent('scroll_depth', 'engagement', '75%');
      } else if (scrollDepth >= 90) {
        trackEvent('scroll_depth', 'engagement', '90%');
      }
    }
  };

  // Event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('scroll', trackScrollDepth, { passive: true });
  window.addEventListener('beforeunload', trackTimeOnPage);
};

// Initialize all analytics
export const initAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    initGA();
    initPerformanceMonitoring();
    trackUserEngagement();
  }
};