'use client';

import React, { useEffect, useRef } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface AnimatedTimelineProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animationDuration?: number;
  threshold?: number;
  showProgressLine?: boolean;
}

const AnimatedTimeline: React.FC<AnimatedTimelineProps> = ({
  children,
  className = '',
  staggerDelay = 150,
  animationDuration = 600,
  threshold = 0.1,
  showProgressLine = true,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver({
    threshold,
    triggerOnce: true,
  });

  useEffect(() => {
    if (isIntersecting && timelineRef.current) {
      const timelineItems = timelineRef.current.querySelectorAll('[data-timeline-item]');
      
      // Animate timeline items with stagger
      timelineItems.forEach((item, index) => {
        const htmlItem = item as HTMLElement;
        const delay = index * staggerDelay;
        
        // Set initial state
        htmlItem.style.opacity = '0';
        htmlItem.style.transform = 'translateX(-30px) scale(0.95)';
        htmlItem.style.transition = `opacity ${animationDuration}ms ease-out ${delay}ms, transform ${animationDuration}ms ease-out ${delay}ms`;
        
        // Trigger animation
        setTimeout(() => {
          htmlItem.style.opacity = '1';
          htmlItem.style.transform = 'translateX(0px) scale(1)';
        }, delay);
      });

      // Animate progress line if enabled
      if (showProgressLine && progressLineRef.current) {
        const progressLine = progressLineRef.current;
        const totalDuration = (timelineItems.length * staggerDelay) + animationDuration;
        
        progressLine.style.height = '0%';
        progressLine.style.transition = `height ${totalDuration}ms ease-out`;
        
        setTimeout(() => {
          progressLine.style.height = '100%';
        }, 100);
      }
    }
  }, [isIntersecting, staggerDelay, animationDuration, showProgressLine]);

  return (
    <div 
      ref={timelineRef}
      className={`relative ${className}`}
      data-animated-timeline
    >
      {/* Progress line */}
      {showProgressLine && (
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
          <div
            ref={progressLineRef}
            className="w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
            style={{ height: '0%' }}
          />
        </div>
      )}
      
      {/* Timeline content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedTimeline;