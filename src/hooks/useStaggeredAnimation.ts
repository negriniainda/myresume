import { useEffect, useState, useRef } from 'react';
import useIntersectionObserver from './useIntersectionObserver';

interface StaggeredAnimationOptions {
  staggerDelay?: number;
  baseDelay?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface StaggeredAnimationReturn {
  containerRef: React.RefObject<HTMLElement>;
  isVisible: boolean;
  getItemDelay: (index: number) => number;
  getItemStyle: (index: number, isVisible?: boolean) => React.CSSProperties;
}

const useStaggeredAnimation = (
  options: StaggeredAnimationOptions = {}
): StaggeredAnimationReturn => {
  const {
    staggerDelay = 100,
    baseDelay = 0,
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const { isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isIntersecting) {
      setIsVisible(true);
    }
  }, [isIntersecting]);

  const getItemDelay = (index: number): number => {
    return baseDelay + (index * staggerDelay);
  };

  const getItemStyle = (index: number, visible = isVisible): React.CSSProperties => {
    const delay = getItemDelay(index);
    
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0px)' : 'translateY(20px)',
      transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    };
  };

  // Update container ref to use the intersection observer ref
  useEffect(() => {
    if (containerRef.current && isIntersecting) {
      const items = containerRef.current.querySelectorAll('[data-stagger-item]');
      items.forEach((item, index) => {
        const htmlItem = item as HTMLElement;
        const delay = getItemDelay(index);
        
        // Set initial state
        htmlItem.style.opacity = '0';
        htmlItem.style.transform = 'translateY(20px)';
        htmlItem.style.transition = `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`;
        
        // Trigger animation
        setTimeout(() => {
          htmlItem.style.opacity = '1';
          htmlItem.style.transform = 'translateY(0px)';
        }, delay);
      });
    }
  }, [isIntersecting, staggerDelay, baseDelay]);

  return {
    containerRef,
    isVisible,
    getItemDelay,
    getItemStyle,
  };
};

export default useStaggeredAnimation;