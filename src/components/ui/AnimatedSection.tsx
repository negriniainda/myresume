'use client';

import React, { useEffect, useRef } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'slide-up' | 'scale-in' | 'bounce-in';
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
  id?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  stagger = false,
  staggerDelay = 100,
  id,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce,
    delay,
  });

  useEffect(() => {
    if (isIntersecting && sectionRef.current) {
      const element = sectionRef.current;
      
      if (stagger) {
        // Apply staggered animation to child elements
        const staggerItems = element.querySelectorAll('[data-stagger-item]');
        staggerItems.forEach((item, index) => {
          const htmlItem = item as HTMLElement;
          const itemDelay = delay + (index * staggerDelay);
          
          // Set initial state
          htmlItem.style.opacity = '0';
          htmlItem.style.transform = getInitialTransform(animation);
          htmlItem.style.transition = `opacity 0.6s ease-out ${itemDelay}ms, transform 0.6s ease-out ${itemDelay}ms`;
          
          // Trigger animation
          setTimeout(() => {
            htmlItem.style.opacity = '1';
            htmlItem.style.transform = 'none';
          }, itemDelay);
        });
      } else {
        // Apply animation to the section itself
        element.style.animationDelay = `${delay}ms`;
        element.classList.add(`animate-${animation}`);
      }
    }
  }, [isIntersecting, animation, delay, stagger, staggerDelay]);

  // Set initial state for non-staggered animations
  useEffect(() => {
    if (sectionRef.current && !stagger) {
      const element = sectionRef.current;
      element.style.opacity = '0';
      element.style.transform = getInitialTransform(animation);
    }
  }, [animation, stagger]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`transition-all duration-600 ease-out ${className}`}
      data-animate-section={animation}
    >
      {children}
    </section>
  );
};

// Helper function to get initial transform based on animation type
function getInitialTransform(animation: string): string {
  switch (animation) {
    case 'fade-in-up':
      return 'translateY(30px)';
    case 'fade-in-down':
      return 'translateY(-30px)';
    case 'fade-in-left':
      return 'translateX(-30px)';
    case 'fade-in-right':
      return 'translateX(30px)';
    case 'slide-up':
      return 'translateY(100%)';
    case 'scale-in':
      return 'scale(0.8)';
    case 'bounce-in':
      return 'scale(0.3)';
    default:
      return 'none';
  }
}

export default AnimatedSection;