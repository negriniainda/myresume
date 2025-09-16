/**
 * Advanced lazy loading utilities for heavy content sections
 */

import { lazy, ComponentType, ReactNode } from 'react';
import { getConnectionInfo } from './bundleOptimization';

/**
 * Enhanced lazy loading with adaptive strategies
 */
export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  retries?: number;
  fallback?: ReactNode;
  preload?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Create adaptive lazy component based on connection speed
 */
export const createAdaptiveLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) => {
  const {
    retries = 3,
    delay = 0,
    priority = 'normal',
  } = options;

  return lazy(() => {
    const connectionInfo = getConnectionInfo();
    const adaptiveDelay = getAdaptiveDelay(connectionInfo, delay, priority);

    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (attempt: number) => {
        setTimeout(() => {
          importFn()
            .then(resolve)
            .catch((error) => {
              if (attempt < retries) {
                attemptImport(attempt + 1);
              } else {
                reject(error);
              }
            });
        }, adaptiveDelay * attempt);
      };

      attemptImport(1);
    });
  });
};

/**
 * Get adaptive delay based on connection speed
 */
const getAdaptiveDelay = (
  connectionInfo: ReturnType<typeof getConnectionInfo>,
  baseDelay: number,
  priority: 'low' | 'normal' | 'high'
): number => {
  const { effectiveType, saveData, downlink } = connectionInfo;
  
  let multiplier = 1;
  
  // Adjust based on connection speed
  if (saveData) multiplier *= 2;
  if (effectiveType === 'slow-2g') multiplier *= 3;
  if (effectiveType === '2g') multiplier *= 2;
  if (effectiveType === '3g') multiplier *= 1.5;
  if (downlink < 1) multiplier *= 2;
  
  // Adjust based on priority
  switch (priority) {
    case 'high':
      multiplier *= 0.5;
      break;
    case 'low':
      multiplier *= 2;
      break;
    default:
      // normal priority, no change
      break;
  }
  
  return Math.max(baseDelay * multiplier, 0);
};

/**
 * Intersection Observer with adaptive thresholds
 */
export class AdaptiveIntersectionObserver {
  private observer: IntersectionObserver | null = null;
  private callbacks = new Map<Element, () => void>();

  constructor(private options: LazyLoadOptions = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const connectionInfo = getConnectionInfo();
      const adaptiveOptions = this.getAdaptiveObserverOptions(connectionInfo);
      
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        adaptiveOptions
      );
    }
  }

  private getAdaptiveObserverOptions(connectionInfo: ReturnType<typeof getConnectionInfo>) {
    const { effectiveType, saveData } = connectionInfo;
    const { threshold = 0.1, rootMargin = '50px' } = this.options;
    
    let adaptiveThreshold = threshold;
    let adaptiveRootMargin = rootMargin;
    
    // Adjust for slow connections
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      adaptiveThreshold = Math.max(threshold * 2, 0.3); // Require more visibility
      adaptiveRootMargin = '20px'; // Smaller margin
    } else if (effectiveType === '4g') {
      adaptiveRootMargin = '100px'; // Larger margin for fast connections
    }
    
    return {
      threshold: adaptiveThreshold,
      rootMargin: adaptiveRootMargin,
    };
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const callback = this.callbacks.get(entry.target);
        if (callback) {
          callback();
          this.unobserve(entry.target);
        }
      }
    });
  }

  observe(element: Element, callback: () => void) {
    if (this.observer) {
      this.callbacks.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      callback();
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.callbacks.delete(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

/**
 * Preload critical resources based on user behavior
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preloadQueue: Array<{ url: string; priority: number }> = [];
  private isProcessing = false;

  /**
   * Add resource to preload queue
   */
  addToQueue(url: string, priority: number = 1) {
    if (this.preloadedResources.has(url)) return;
    
    this.preloadQueue.push({ url, priority });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process preload queue with connection-aware throttling
   */
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) return;
    
    this.isProcessing = true;
    const connectionInfo = getConnectionInfo();
    const maxConcurrent = this.getMaxConcurrentPreloads(connectionInfo);
    
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, maxConcurrent);
      
      await Promise.allSettled(
        batch.map(({ url }) => this.preloadResource(url))
      );
      
      // Add delay between batches for slow connections
      if (connectionInfo.saveData || connectionInfo.effectiveType === '2g') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    this.isProcessing = false;
  }

  private getMaxConcurrentPreloads(connectionInfo: ReturnType<typeof getConnectionInfo>): number {
    if (connectionInfo.saveData) return 1;
    if (connectionInfo.effectiveType === 'slow-2g') return 1;
    if (connectionInfo.effectiveType === '2g') return 2;
    if (connectionInfo.effectiveType === '3g') return 3;
    return 4; // 4g and above
  }

  private async preloadResource(url: string): Promise<void> {
    if (this.preloadedResources.has(url)) return;
    
    try {
      if (url.endsWith('.js') || url.endsWith('.mjs')) {
        await this.preloadScript(url);
      } else if (url.endsWith('.css')) {
        await this.preloadStylesheet(url);
      } else if (this.isImageUrl(url)) {
        await this.preloadImage(url);
      } else {
        await this.preloadGeneric(url);
      }
      
      this.preloadedResources.add(url);
    } catch (error) {
      console.warn('Failed to preload resource:', url, error);
    }
  }

  private preloadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload script: ${url}`));
      document.head.appendChild(link);
    });
  }

  private preloadStylesheet(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload stylesheet: ${url}`));
      document.head.appendChild(link);
    });
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    });
  }

  private preloadGeneric(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch: ${url}`));
      document.head.appendChild(link);
    });
  }

  private isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url);
  }
}

/**
 * Global resource preloader instance
 */
export const resourcePreloader = new ResourcePreloader();

/**
 * Hook for component-level resource preloading
 */
export const useResourcePreloader = () => {
  const preload = (url: string, priority: number = 1) => {
    resourcePreloader.addToQueue(url, priority);
  };

  const preloadCritical = (urls: string[]) => {
    urls.forEach(url => preload(url, 10));
  };

  const preloadOnHover = (urls: string[]) => {
    urls.forEach(url => preload(url, 5));
  };

  const preloadLazy = (urls: string[]) => {
    urls.forEach(url => preload(url, 1));
  };

  return {
    preload,
    preloadCritical,
    preloadOnHover,
    preloadLazy,
  };
};

/**
 * Viewport-based content loading
 */
export class ViewportLoader {
  private observer: AdaptiveIntersectionObserver;
  private loadedSections = new Set<string>();

  constructor(options: LazyLoadOptions = {}) {
    this.observer = new AdaptiveIntersectionObserver(options);
  }

  loadSection(element: Element, sectionId: string, loadFn: () => void) {
    if (this.loadedSections.has(sectionId)) return;

    this.observer.observe(element, () => {
      loadFn();
      this.loadedSections.add(sectionId);
    });
  }

  isLoaded(sectionId: string): boolean {
    return this.loadedSections.has(sectionId);
  }

  destroy() {
    this.observer.disconnect();
    this.loadedSections.clear();
  }
}

/**
 * Content prioritization based on user behavior
 */
export class ContentPrioritizer {
  private priorities = new Map<string, number>();
  private userInteractions = new Map<string, number>();

  /**
   * Track user interaction with content
   */
  trackInteraction(contentId: string, interactionType: 'view' | 'click' | 'hover' = 'view') {
    const weight = this.getInteractionWeight(interactionType);
    const current = this.userInteractions.get(contentId) || 0;
    this.userInteractions.set(contentId, current + weight);
    this.updatePriority(contentId);
  }

  private getInteractionWeight(type: 'view' | 'click' | 'hover'): number {
    switch (type) {
      case 'click': return 10;
      case 'hover': return 3;
      case 'view': return 1;
      default: return 1;
    }
  }

  private updatePriority(contentId: string) {
    const interactions = this.userInteractions.get(contentId) || 0;
    const priority = Math.min(interactions, 100); // Cap at 100
    this.priorities.set(contentId, priority);
  }

  /**
   * Get content priority for loading decisions
   */
  getPriority(contentId: string): number {
    return this.priorities.get(contentId) || 0;
  }

  /**
   * Get sorted content by priority
   */
  getSortedContent(contentIds: string[]): string[] {
    return contentIds.sort((a, b) => {
      const priorityA = this.getPriority(a);
      const priorityB = this.getPriority(b);
      return priorityB - priorityA;
    });
  }
}

/**
 * Global content prioritizer instance
 */
export const contentPrioritizer = new ContentPrioritizer();