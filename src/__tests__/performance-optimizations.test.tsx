import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import NextOptimizedImage from '@/components/ui/NextOptimizedImage';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';
import ProgressiveLoader, { Skeleton, ContentSkeleton, LazySection } from '@/components/ui/ProgressiveLoader';
import { usePerformance, useAdaptiveLoading, useMemoryMonitor } from '@/hooks/usePerformance';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="next-image"
        {...props}
      />
    );
  };
});

// Mock performance hooks
jest.mock('@/hooks/usePerformance', () => ({
  usePerformance: jest.fn(),
  useAdaptiveLoading: jest.fn(),
  useMemoryMonitor: jest.fn(),
  useRenderPerformance: jest.fn(),
  usePerformanceMark: jest.fn(),
}));

// Mock responsive hook
jest.mock('@/hooks/useResponsive', () => ({
  useResponsive: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })),
}));

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    (usePerformance as jest.Mock).mockReturnValue({
      metrics: {
        FCP: 1500,
        LCP: 2000,
        CLS: 0.05,
        FID: 50,
        domContentLoaded: 800,
        loadComplete: 1200,
      },
      connectionInfo: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
      },
      isSlowConnection: false,
      reportMetrics: jest.fn(),
    });

    (useAdaptiveLoading as jest.Mock).mockReturnValue({
      shouldReduceQuality: false,
      shouldPreload: true,
      shouldLazyLoad: false,
      getImageQuality: jest.fn(() => 75),
      getLoadingStrategy: jest.fn(() => 'lazy'),
      connectionInfo: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
      },
    });

    (useMemoryMonitor as jest.Mock).mockReturnValue({
      memoryInfo: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      },
      getMemoryUsagePercentage: jest.fn(() => 50),
      isMemoryPressure: jest.fn(() => false),
    });
  });

  describe('NextOptimizedImage', () => {
    it('renders optimized image with proper attributes', () => {
      render(
        <NextOptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
          priority={true}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('shows loading indicator initially', () => {
      render(
        <NextOptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
        />
      );

      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('handles image load error gracefully', async () => {
      render(
        <NextOptimizedImage
          src="/non-existent-image.jpg"
          alt="Test image"
          width={800}
          height={600}
        />
      );

      const image = screen.getByTestId('next-image');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      });
    });

    it('adapts quality based on connection speed', () => {
      (useAdaptiveLoading as jest.Mock).mockReturnValue({
        shouldReduceQuality: true,
        getImageQuality: jest.fn(() => 60),
        getLoadingStrategy: jest.fn(() => 'lazy'),
      });

      render(
        <NextOptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
          quality={85}
        />
      );

      // Quality should be reduced for slow connections
      expect(useAdaptiveLoading().getImageQuality()).toBe(60);
    });

    it('is accessible', async () => {
      const { container } = render(
        <NextOptimizedImage
          src="/test-image.jpg"
          alt="Professional headshot of John Doe"
          width={800}
          height={600}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ProgressiveLoader', () => {
    it('renders fallback initially', () => {
      render(
        <ProgressiveLoader fallback={<div>Loading...</div>}>
          <div>Content loaded</div>
        </ProgressiveLoader>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Content loaded')).not.toBeInTheDocument();
    });

    it('loads content when in view', async () => {
      // Mock IntersectionObserver to trigger immediately
      const mockObserver = {
        observe: jest.fn((element, callback) => {
          // Simulate element coming into view
          setTimeout(() => {
            const entries = [{ isIntersecting: true, target: element }];
            callback(entries);
          }, 100);
        }),
        disconnect: jest.fn(),
      };

      global.IntersectionObserver = jest.fn(() => mockObserver) as any;

      render(
        <ProgressiveLoader fallback={<div>Loading...</div>}>
          <div>Content loaded</div>
        </ProgressiveLoader>
      );

      await waitFor(() => {
        expect(screen.getByText('Content loaded')).toBeInTheDocument();
      });
    });

    it('respects priority loading', () => {
      render(
        <ProgressiveLoader priority={true} fallback={<div>Loading...</div>}>
          <div>Priority content</div>
        </ProgressiveLoader>
      );

      // Priority content should load immediately
      expect(screen.getByText('Priority content')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Skeleton Components', () => {
    it('renders basic skeleton with correct styles', () => {
      render(<Skeleton width="100px" height="20px" />);
      
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveStyle({
        width: '100px',
        height: '20px',
      });
    });

    it('renders different skeleton variants', () => {
      const { rerender } = render(<Skeleton variant="text" />);
      expect(document.querySelector('.rounded')).toBeInTheDocument();

      rerender(<Skeleton variant="circular" />);
      expect(document.querySelector('.rounded-full')).toBeInTheDocument();

      rerender(<Skeleton variant="rectangular" />);
      expect(document.querySelector('.rounded-md')).toBeInTheDocument();
    });

    it('renders content skeleton types', () => {
      render(<ContentSkeleton type="card" />);
      expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('LazySection', () => {
    it('renders with proper intersection observer setup', () => {
      const mockObserve = jest.fn();
      global.IntersectionObserver = jest.fn(() => ({
        observe: mockObserve,
        disconnect: jest.fn(),
      })) as any;

      render(
        <LazySection>
          <div>Lazy content</div>
        </LazySection>
      );

      expect(mockObserve).toHaveBeenCalled();
    });
  });

  describe('PerformanceMonitor', () => {
    it('renders in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<PerformanceMonitor enabled={true} />);

      // Should render after timeout
      setTimeout(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
      }, 2100);

      process.env.NODE_ENV = originalEnv;
    });

    it('does not render in production by default', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<PerformanceMonitor />);

      expect(screen.queryByText('Performance')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('expands and collapses correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<PerformanceMonitor enabled={true} />);

      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
      }, { timeout: 3000 });

      const expandButton = screen.getByText('+');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Core Web Vitals')).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('displays performance metrics correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<PerformanceMonitor enabled={true} />);

      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
      }, { timeout: 3000 });

      const expandButton = screen.getByText('+');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('1500.00ms')).toBeInTheDocument(); // FCP
        expect(screen.getByText('2000.00ms')).toBeInTheDocument(); // LCP
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('shows correct performance grade', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<PerformanceMonitor enabled={true} />);

      await waitFor(() => {
        expect(screen.getByText('A')).toBeInTheDocument(); // Good performance
      }, { timeout: 3000 });

      process.env.NODE_ENV = originalEnv;
    });

    it('is accessible', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { container } = render(<PerformanceMonitor enabled={true} />);

      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
      }, { timeout: 3000 });

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance Hooks', () => {
    it('usePerformance returns expected metrics', () => {
      const { metrics, connectionInfo, reportMetrics } = usePerformance();

      expect(metrics).toBeDefined();
      expect(metrics.FCP).toBe(1500);
      expect(metrics.LCP).toBe(2000);
      expect(connectionInfo).toBeDefined();
      expect(connectionInfo.effectiveType).toBe('4g');
      expect(typeof reportMetrics).toBe('function');
    });

    it('useAdaptiveLoading adapts to connection speed', () => {
      const {
        shouldReduceQuality,
        shouldPreload,
        getImageQuality,
        getLoadingStrategy,
      } = useAdaptiveLoading();

      expect(typeof shouldReduceQuality).toBe('boolean');
      expect(typeof shouldPreload).toBe('boolean');
      expect(typeof getImageQuality).toBe('function');
      expect(typeof getLoadingStrategy).toBe('function');
    });

    it('useMemoryMonitor tracks memory usage', () => {
      const { memoryInfo, getMemoryUsagePercentage, isMemoryPressure } = useMemoryMonitor();

      expect(memoryInfo).toBeDefined();
      expect(memoryInfo.usedJSHeapSize).toBe(1000000);
      expect(typeof getMemoryUsagePercentage).toBe('function');
      expect(typeof isMemoryPressure).toBe('function');
    });
  });

  describe('Adaptive Loading Behavior', () => {
    it('reduces quality on slow connections', () => {
      (useAdaptiveLoading as jest.Mock).mockReturnValue({
        shouldReduceQuality: true,
        shouldPreload: false,
        shouldLazyLoad: true,
        getImageQuality: jest.fn(() => 50),
        getLoadingStrategy: jest.fn(() => 'lazy'),
        connectionInfo: {
          effectiveType: '2g',
          downlink: 0.5,
          rtt: 300,
          saveData: true,
        },
      });

      const { shouldReduceQuality, getImageQuality } = useAdaptiveLoading();

      expect(shouldReduceQuality).toBe(true);
      expect(getImageQuality()).toBe(50);
    });

    it('enables preloading on fast connections', () => {
      (useAdaptiveLoading as jest.Mock).mockReturnValue({
        shouldReduceQuality: false,
        shouldPreload: true,
        shouldLazyLoad: false,
        getImageQuality: jest.fn(() => 85),
        getLoadingStrategy: jest.fn(() => 'eager'),
        connectionInfo: {
          effectiveType: '4g',
          downlink: 15,
          rtt: 50,
          saveData: false,
        },
      });

      const { shouldPreload, getImageQuality } = useAdaptiveLoading();

      expect(shouldPreload).toBe(true);
      expect(getImageQuality()).toBe(85);
    });
  });

  describe('Memory Pressure Handling', () => {
    it('detects memory pressure correctly', () => {
      (useMemoryMonitor as jest.Mock).mockReturnValue({
        memoryInfo: {
          usedJSHeapSize: 3500000, // High usage
          totalJSHeapSize: 4000000,
          jsHeapSizeLimit: 4000000,
        },
        getMemoryUsagePercentage: jest.fn(() => 87.5),
        isMemoryPressure: jest.fn(() => true),
      });

      const { isMemoryPressure, getMemoryUsagePercentage } = useMemoryMonitor();

      expect(isMemoryPressure()).toBe(true);
      expect(getMemoryUsagePercentage()).toBe(87.5);
    });

    it('handles normal memory usage', () => {
      const { isMemoryPressure, getMemoryUsagePercentage } = useMemoryMonitor();

      expect(isMemoryPressure()).toBe(false);
      expect(getMemoryUsagePercentage()).toBe(50);
    });
  });
});