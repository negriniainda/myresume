'use client';

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/sections/Hero';
import { LazySection, ContentSkeleton } from '@/components/ui/ProgressiveLoader';
import { usePerformance, useAdaptiveLoading } from '@/hooks/usePerformance';
import { addResourceHints, registerServiceWorker } from '@/utils/bundleOptimization';
import { contentPrioritizer } from '@/utils/lazyLoading';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

// Simple dynamic imports without problematic preloading
const Summary = dynamic(() => import('@/components/sections/Summary'), {
  loading: () => <ContentSkeleton type="card" className="py-12 sm:py-16 lg:py-20" />,
});

const Experience = dynamic(() => import('@/components/sections/Experience'), {
  loading: () => <ContentSkeleton type="timeline" count={3} className="py-12 sm:py-16 lg:py-20" />,
});

const Skills = dynamic(() => import('@/components/sections/Skills'), {
  loading: () => <ContentSkeleton type="card" count={3} className="py-12 sm:py-16 lg:py-20" />,
});

const Education = dynamic(() => import('@/components/sections/Education'), {
  loading: () => <ContentSkeleton type="list" className="py-12 sm:py-16 lg:py-20" />,
});

const Projects = dynamic(() => import('@/components/sections/Projects'), {
  loading: () => <ContentSkeleton type="card" count={4} className="py-12 sm:py-16 lg:py-20" />,
});

export default function Home() {
  const { reportMetrics } = usePerformance();
  const { shouldLazyLoad } = useAdaptiveLoading();

  useEffect(() => {
    // Add resource hints for better performance
    addResourceHints();

    // Register service worker for caching
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }

    // Track page view for content prioritization
    contentPrioritizer.trackInteraction('home-page', 'view');

    // Report performance metrics after page load
    const timer = setTimeout(() => {
      reportMetrics({
        lazyLoadEnabled: shouldLazyLoad ? 1 : 0,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [reportMetrics, shouldLazyLoad]);

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
              <Summary />
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="timeline" count={3} className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="300px"
            >
              <Experience />
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="card" count={3} className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="300px"
            >
              <Skills />
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="list" className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="300px"
            >
              <Education />
            </LazySection>

            <LazySection
              fallback={<ContentSkeleton type="card" count={4} className="py-12 sm:py-16 lg:py-20" />}
              rootMargin="400px"
            >
              <Projects />
            </LazySection>
          </>
        ) : (
          // Fast connections - load normally
          <>
            <Summary />
            <Experience />
            <Skills />
            <Education />
            <Projects />
          </>
        )}
      </div>
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
    </Layout>
  );
}
