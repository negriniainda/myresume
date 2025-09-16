import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAdaptiveLoading } from '@/hooks/usePerformance';

interface NextOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

/**
 * Enhanced Next.js Image component with adaptive loading and performance optimizations
 */
const NextOptimizedImage: React.FC<NextOptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'empty',
  blurDataURL,
  priority = false,
  sizes,
  fill = false,
  quality,
  loading = 'lazy',
  onLoad,
  onError,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);
  const { getImageQuality, getLoadingStrategy, shouldReduceQuality } = useAdaptiveLoading();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView || loading === 'eager') return;

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
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, loading]);

  // Get adaptive quality based on connection
  const adaptiveQuality = quality || getImageQuality();
  const adaptiveLoading = getLoadingStrategy() as 'lazy' | 'eager';

  // Generate responsive sizes
  const getResponsiveSizes = (): string => {
    if (sizes) return sizes;
    
    // Default responsive sizes based on common breakpoints
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Generate blur data URL if not provided
  const generateBlurDataURL = (width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient blur placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  };

  // Error component
  const ErrorComponent = () => (
    <div
      className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
    >
      <div className="text-center text-gray-500 dark:text-gray-400">
        <svg
          className="w-8 h-8 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">Failed to load image</p>
      </div>
    </div>
  );

  // Placeholder component for lazy loading
  const PlaceholderComponent = () => (
    <div
      ref={imgRef}
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  if (isError) {
    return <ErrorComponent />;
  }

  if (!isInView && !priority && loading === 'lazy') {
    return <PlaceholderComponent />;
  }

  // Prepare blur data URL
  const finalBlurDataURL = blurDataURL || 
    (placeholder === 'blur' && width && height ? generateBlurDataURL(width, height) : undefined);

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={fill ? { position: 'relative', ...style } : style}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={fill || !width ? getResponsiveSizes() : undefined}
        quality={shouldReduceQuality ? Math.min(adaptiveQuality, 60) : adaptiveQuality}
        priority={priority}
        loading={priority ? 'eager' : adaptiveLoading}
        placeholder={placeholder}
        blurDataURL={finalBlurDataURL}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${fill ? 'object-cover' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        style={fill ? { objectFit: 'cover' } : undefined}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default NextOptimizedImage;