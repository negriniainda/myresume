import React, { useState, useRef, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading, responsive sizing, and WebP/AVIF support
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  blurDataURL,
  priority = false,
  sizes,
  quality = 75,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const { isMobile, isTablet } = useResponsive();

  // Intersection Observer for lazy loading
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
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string): string => {
    if (!baseSrc.includes('.')) return baseSrc;

    const [name, ext] = baseSrc.split('.');
    const widths = [320, 640, 768, 1024, 1280, 1536];
    
    return widths
      .map((w) => `${name}_${w}w.${ext} ${w}w`)
      .join(', ');
  };

  // Generate WebP/AVIF sources
  const generateModernSources = (baseSrc: string) => {
    if (!baseSrc.includes('.')) return [];

    const [name] = baseSrc.split('.');
    const sources = [];

    // AVIF support
    if (supportsAvif()) {
      sources.push({
        srcSet: generateSrcSet(`${name}.avif`),
        type: 'image/avif',
      });
    }

    // WebP support
    if (supportsWebP()) {
      sources.push({
        srcSet: generateSrcSet(`${name}.webp`),
        type: 'image/webp',
      });
    }

    return sources;
  };

  // Get responsive sizes
  const getResponsiveSizes = (): string => {
    if (sizes) return sizes;

    if (isMobile) return '100vw';
    if (isTablet) return '50vw';
    return '33vw';
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

  // Placeholder component
  const PlaceholderComponent = () => (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {placeholder ? (
        <img src={placeholder} alt="" className="opacity-50" />
      ) : (
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
      )}
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div
      className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      style={{ width, height }}
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

  if (isError) {
    return <ErrorComponent />;
  }

  if (!isInView) {
    return <PlaceholderComponent />;
  }

  const modernSources = generateModernSources(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image with modern format support */}
      <picture>
        {modernSources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            sizes={getResponsiveSizes()}
          />
        ))}
        
        <img
          ref={imgRef}
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={getResponsiveSizes()}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } w-full h-full object-cover`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />
      </picture>

      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Utility functions for format support detection
const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

const supportsAvif = (): boolean => {
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

export default OptimizedImage;