import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ProgressiveLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
}

/**
 * Progressive content loader that loads content when it comes into view
 * Optimized for mobile networks with configurable delays
 */
const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  delay = 0,
  priority = false,
  className = '',
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [isInView, setIsInView] = useState(priority);
  const elementRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();

  // Adjust delay based on device type
  const getOptimizedDelay = (): number => {
    if (priority) return 0;
    if (isMobile) return delay + 200; // Add extra delay for mobile
    return delay;
  };

  // Intersection Observer for viewport detection
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, threshold, rootMargin]);

  // Load content with delay
  useEffect(() => {
    if (!isInView || isLoaded) return;

    const optimizedDelay = getOptimizedDelay();
    
    if (optimizedDelay > 0) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
        onLoad?.();
      }, optimizedDelay);

      return () => clearTimeout(timer);
    } else {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [isInView, isLoaded, delay, isMobile, priority, onLoad]);

  return (
    <div ref={elementRef} className={className}>
      {isLoaded ? children : fallback}
    </div>
  );
};

/**
 * Skeleton loader for progressive content
 */
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]';
      case 'pulse':
        return 'animate-pulse bg-gray-200 dark:bg-gray-700';
      case 'none':
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div
      className={`${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

/**
 * Content skeleton for different content types
 */
interface ContentSkeletonProps {
  type: 'card' | 'list' | 'text' | 'image' | 'timeline';
  count?: number;
  className?: string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  type,
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="60%" height="1.25rem" className="mb-2" />
                <Skeleton width="40%" height="1rem" />
              </div>
            </div>
            <Skeleton width="100%" height="4rem" className="mb-3" />
            <div className="flex gap-2">
              <Skeleton width="80px" height="1.5rem" />
              <Skeleton width="60px" height="1.5rem" />
              <Skeleton width="70px" height="1.5rem" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Skeleton variant="circular" width={32} height={32} />
                <div className="flex-1">
                  <Skeleton width="70%" height="1rem" className="mb-1" />
                  <Skeleton width="50%" height="0.875rem" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Skeleton width="100%" height="1rem" />
            <Skeleton width="95%" height="1rem" />
            <Skeleton width="85%" height="1rem" />
            <Skeleton width="90%" height="1rem" />
          </div>
        );

      case 'image':
        return (
          <div className="relative">
            <Skeleton width="100%" height="200px" variant="rectangular" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton variant="circular" width={40} height={40} />
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-2">
                  <Skeleton variant="circular" width={16} height={16} />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                  <Skeleton width="60%" height="1.25rem" className="mb-2" />
                  <Skeleton width="40%" height="1rem" className="mb-3" />
                  <Skeleton width="100%" height="3rem" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <Skeleton />;
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i > 0 ? 'mt-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

/**
 * Lazy section loader with intersection observer
 */
interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
}

export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '200px',
  onLoad,
}) => {
  return (
    <ProgressiveLoader
      threshold={threshold}
      rootMargin={rootMargin}
      className={className}
      onLoad={onLoad}
      fallback={fallback || <ContentSkeleton type="card" />}
    >
      {children}
    </ProgressiveLoader>
  );
};

export default ProgressiveLoader;