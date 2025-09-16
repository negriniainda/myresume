/**
 * Touch and mobile interaction utilities
 */

export interface TouchConfig {
  threshold?: number;
  timeout?: number;
  preventScroll?: boolean;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

/**
 * Detect swipe gestures on touch devices
 */
export const useSwipeGesture = (
  element: HTMLElement | null,
  onSwipe: (direction: SwipeDirection) => void,
  config: TouchConfig = {}
) => {
  const { threshold = 50, timeout = 300, preventScroll = false } = config;
  
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isTracking = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isTracking = true;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isTracking) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    
    if (distance > threshold && deltaTime < timeout) {
      let direction: 'left' | 'right' | 'up' | 'down';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      onSwipe({ direction, distance, velocity });
    }
    
    isTracking = false;
  };

  if (element) {
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
  
  return () => {};
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get device viewport information
 */
export const getViewportInfo = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    orientation: width > height ? 'landscape' : 'portrait'
  };
};

/**
 * Optimize touch targets for mobile
 */
export const getTouchTargetSize = (baseSize: number): number => {
  const { isMobile } = getViewportInfo();
  const minTouchTarget = 44; // iOS HIG minimum
  
  if (isMobile) {
    return Math.max(baseSize, minTouchTarget);
  }
  
  return baseSize;
};

/**
 * Handle safe area insets for devices with notches
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
};

/**
 * Prevent zoom on double tap for specific elements
 */
export const preventZoom = (element: HTMLElement) => {
  let lastTouchEnd = 0;
  
  const handleTouchEnd = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  };
  
  element.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  return () => {
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

/**
 * Smooth scroll with momentum for mobile
 */
export const smoothScrollTo = (
  element: HTMLElement,
  target: number,
  duration: number = 300
) => {
  const start = element.scrollTop;
  const distance = target - start;
  const startTime = Date.now();
  
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };
  
  const animateScroll = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    
    element.scrollTop = start + distance * easedProgress;
    
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };
  
  requestAnimationFrame(animateScroll);
};