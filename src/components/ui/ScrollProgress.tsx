'use client';

import React from 'react';
import useScrollProgress from '@/hooks/useScrollProgress';

interface ScrollProgressProps {
  sections?: string[];
  className?: string;
  showPercentage?: boolean;
  height?: string;
  backgroundColor?: string;
  progressColor?: string;
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({
  sections = ['hero', 'summary', 'experience', 'skills', 'education', 'projects'],
  className = '',
  showPercentage = false,
  height = '3px',
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  progressColor = '#3b82f6',
}) => {
  const { scrollProgress, currentSection } = useScrollProgress({
    sections,
    offset: 100,
  });

  return (
    <div className={`relative ${className}`}>
      {/* Progress bar */}
      <div 
        className="w-full transition-all duration-200 ease-out"
        style={{ 
          height,
          backgroundColor,
        }}
      >
        <div
          className="h-full transition-all duration-100 ease-out"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      {/* Optional percentage display */}
      {showPercentage && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
          {Math.round(scrollProgress)}%
        </div>
      )}

      {/* Current section indicator (hidden by default, can be styled) */}
      <div 
        className="sr-only"
        aria-live="polite"
        aria-label={`Currently viewing: ${currentSection || 'top'}`}
      >
        {currentSection}
      </div>
    </div>
  );
};

export default ScrollProgress;