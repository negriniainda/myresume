import { useEffect, useState, useCallback } from 'react';
import { getConnectionInfo, collectPerformanceMetrics } from '@/utils/bundleOptimization';

interface PerformanceMetrics {
  FCP: number;
  LCP: number;
  CLS: number;
  FID: number;
  TTFB: number;
  domContentLoaded: number;
  loadComplete: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Hook for monitoring performance metrics and Core Web Vitals
 */
export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Measure Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lcpObserver: PerformanceObserver;
    let clsObserver: PerformanceObserver;
    let fidObserver: PerformanceObserver;

    const metricsData: Partial<PerformanceMetrics> = {};

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metricsData.LCP = lastEntry.startTime;
        updateMetrics();
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Cumulative Layout Shift (CLS)
      clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        metricsData.CLS = clsValue;
        updateMetrics();
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // First Input Delay (FID)
      fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          metricsData.FID = entry.processingStart - entry.startTime;
          updateMetrics();
          break;
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    }

    // Get initial metrics
    const updateMetrics = () => {
      const basicMetrics = collectPerformanceMetrics();
      if (basicMetrics) {
        setMetrics({
          ...basicMetrics,
          ...metricsData,
        } as PerformanceMetrics);
      }
    };

    // Initial collection
    setTimeout(updateMetrics, 1000);

    return () => {
      lcpObserver?.disconnect();
      clsObserver?.disconnect();
      fidObserver?.disconnect();
    };
  }, []);

  // Monitor connection info
  useEffect(() => {
    const updateConnectionInfo = () => {
      const info = getConnectionInfo();
      setConnectionInfo(info);
      setIsSlowConnection(
        info.saveData || 
        info.effectiveType === 'slow-2g' || 
        info.effectiveType === '2g' ||
        info.downlink < 1.5
      );
    };

    updateConnectionInfo();

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateConnectionInfo);
      
      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  // Report metrics to analytics
  const reportMetrics = useCallback((customMetrics?: Record<string, number>) => {
    if (!metrics) return;

    const reportData = {
      ...metrics,
      ...customMetrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    // Send to analytics service (replace with your analytics endpoint)
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      }).catch(() => {
        // Silently fail - don't impact user experience
      });
    } else {
      console.log('Performance Metrics:', reportData);
    }
  }, [metrics]);

  return {
    metrics,
    connectionInfo,
    isSlowConnection,
    reportMetrics,
  };
};

/**
 * Hook for measuring component render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      }
    };
  });

  return { renderTime, renderCount };
};

/**
 * Hook for measuring custom performance marks
 */
export const usePerformanceMark = () => {
  const mark = useCallback((name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }, []);

  const measure = useCallback((name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        return entries[entries.length - 1]?.duration || 0;
      } catch (e) {
        console.warn('Performance measurement failed:', e);
        return 0;
      }
    }
    return 0;
  }, []);

  const clearMarks = useCallback((name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks(name);
    }
  }, []);

  const clearMeasures = useCallback((name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures(name);
    }
  }, []);

  return { mark, measure, clearMarks, clearMeasures };
};

/**
 * Hook for monitoring memory usage
 */
export const useMemoryMonitor = (interval: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMemoryInfo = () => {
      const performance = window.performance as any;
      if (performance && performance.memory) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  const getMemoryUsagePercentage = useCallback(() => {
    if (!memoryInfo) return 0;
    return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  }, [memoryInfo]);

  const isMemoryPressure = useCallback(() => {
    return getMemoryUsagePercentage() > 80;
  }, [getMemoryUsagePercentage]);

  return {
    memoryInfo,
    getMemoryUsagePercentage,
    isMemoryPressure,
  };
};

/**
 * Hook for adaptive loading based on device capabilities
 */
export const useAdaptiveLoading = () => {
  const { connectionInfo, isSlowConnection } = usePerformance();
  const { isMemoryPressure } = useMemoryMonitor();

  const shouldReduceQuality = isSlowConnection || isMemoryPressure();
  const shouldPreload = !isSlowConnection && !isMemoryPressure();
  const shouldLazyLoad = isSlowConnection || isMemoryPressure();

  const getImageQuality = useCallback(() => {
    if (shouldReduceQuality) return 60;
    if (connectionInfo?.effectiveType === '4g') return 85;
    return 75;
  }, [shouldReduceQuality, connectionInfo]);

  const getLoadingStrategy = useCallback(() => {
    if (shouldLazyLoad) return 'lazy';
    return 'eager';
  }, [shouldLazyLoad]);

  return {
    shouldReduceQuality,
    shouldPreload,
    shouldLazyLoad,
    getImageQuality,
    getLoadingStrategy,
    connectionInfo,
  };
};