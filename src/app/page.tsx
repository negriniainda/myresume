'use client';

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/sections/Hero';
import { LazySection, ContentSkeleton } from '@/components/ui/ProgressiveLoader';
import { usePerformance, useAdaptiveLoading } from '@/hooks/usePerformance';
import { addResourceHints, registerServiceWorker, createRouteChunk } from '@/utils/bundleOptimization';
import { createAdaptiveLazyComponent, useResourcePreloader, contentPrioritizer } from '@/utils/lazyLoading';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

// Adaptive lazy load non-critical sections with enhanced code splitting
const Summary = createAdaptiveLazyComponent(
  () => import('@/components/sections/Summary'),
  { 
    priority: 'high',
    fallback: <ContentSkeleton type="card" className="py-12 sm:py-16 lg:py-20" />,
  }
);

const Experience = createAdaptiveLazyComponent(
  () => import('@/components/sections/Experience'),
  { 
    priority: 'normal',
    fallback: <ContentSkeleton type="timeline" count={3} className="py-12 sm:py-16 lg:py-20" />,
  }
);

const Skills = createAdaptiveLazyComponent(
  () => import('@/components/sections/Skills'),
  { 
    priority: 'normal',
    fallback: <ContentSkeleton type="card" count={3} className="py-12 sm:py-16 lg:py-20" />,
  }
);

const Education = createAdaptiveLazyComponent(
  () => import('@/components/sections/Education'),
  { 
    priority: 'low',
    fallback: <ContentSkeleton type="list" className="py-12 sm:py-16 lg:py-20" />,
  }
);

// Preload Projects section for better UX
const Projects = createAdaptiveLazyComponent(
  () => import('@/components/sections/Projects'),
  { 
    priority: 'normal',
    preload: true,
    fallback: <ContentSkeleton type="card" count={4} className="py-12 sm:py-16 lg:py-20" />,
  }
);

export default function Home() {
  const { reportMetrics } = usePerformance();
  const { shouldLazyLoad, shouldPreload } = useAdaptiveLoading();
  const { preloadCritical, preloadOnHover } = useResourcePreloader();

  useEffect(() => {
    // Add resource hints for better performance
    addResourceHints();

    // Register service worker for caching
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }

    // Preload critical resources
    if (shouldPreload) {
      preloadCritical([
        '/_next/static/chunks/sections-summary.js',
        '/_next/static/chunks/sections-experience.js',
      ]);
    }

    // Track page view for content prioritization
    contentPrioritizer.trackInteraction('home-page', 'view');

    // Report performance metrics after page load
    const timer = setTimeout(() => {
      reportMetrics({
        lazyLoadEnabled: shouldLazyLoad ? 1 : 0,
        preloadEnabled: shouldPreload ? 1 : 0,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [reportMetrics, shouldLazyLoad, shouldPreload, preloadCritical]);

  return (
    <Layout>
      <div id="main-content">
        {/* Hero section - critical, load immediately */}
        <Hero />
        
        {/* Progressive loading for non-critical sections */}
        {shouldLazyLoad ? (
          <>
            <LazySection
              fallback={<ContentSkeleton type="card" className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="200px"
            >
              <Suspense fallback={<ContentSkeleton type="card" className="py-12 sm:py-16 lg:py-20" />}>
                <Summary />
              </Suspense>
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="timeline" count={3} className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="300px"
            >
              <Suspense fallback={<ContentSkeleton type="timeline" count={3} className="py-12 sm:py-16 lg:py-20" />}>
                <Experience />
              </Suspense>
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="card" count={3} className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="300px"
            >
              <Suspense fallback={<ContentSkeleton type="card" count={3} className="py-12 sm:py-16 lg:py-20" />}>
                <Skills />
              </Suspense>
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="list" className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="300px"
            >
              <Suspense fallback={<ContentSkeleton type="list" className="py-12 sm:py-16 lg:py-20" />}>
                <Education />
              </Suspense>
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="card" count={4} className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="400px"
            >
              <Suspense fallback={<ContentSkeleton type="card" count={4} className="py-12 sm:py-16 lg:py-20" />}>
                <Projects />
              </Suspense>
            </LazySection>
          </>
        ) : (
          // Fast connections - load normally with suspense
          <>
            <Suspense fallback={<ContentSkeleton type="card" className="py-12 sm:py-16 lg:py-20" />}>
              <Summary />
            </Suspense>
            <Suspense fallback={<ContentSkeleton type="timeline" count={3} className="py-12 sm:py-16 lg:py-20" />}>
              <Experience />
            </Suspense>
            <Suspense fallback={<ContentSkeleton type="card" count={3} className="py-12 sm:py-16 lg:py-20" />}>
              <Skills />
            </Suspense>
            <Suspense fallback={<ContentSkeleton type="list" className="py-12 sm:py-16 lg:py-20" />}>
              <Education />
            </Suspense>
            <Suspense fallback={<ContentSkeleton type="card" count={4} className="py-12 sm:py-16 lg:py-20" />}>
              <Projects />
            </Suspense>
          </>
        )}
      </div>
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
    </Layout>
  );
}
