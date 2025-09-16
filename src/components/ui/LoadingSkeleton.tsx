'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'timeline' | 'skills';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  animate?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  className = '',
  count = 1,
  animate = true,
}) => {
  const getDefaultHeight = () => {
    switch (variant) {
      case 'text':
        return '1rem';
      case 'card':
        return '12rem';
      case 'avatar':
        return '3rem';
      case 'button':
        return '2.5rem';
      case 'timeline':
        return '8rem';
      case 'skills':
        return '6rem';
      default:
        return '1rem';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'rounded-md';
      case 'card':
        return 'rounded-xl';
      case 'avatar':
        return 'rounded-full';
      case 'button':
        return 'rounded-lg';
      case 'timeline':
        return 'rounded-lg';
      case 'skills':
        return 'rounded-xl';
      default:
        return 'rounded-md';
    }
  };

  const pulseVariants = {
    pulse: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const shimmerVariants = {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const skeletonHeight = height || getDefaultHeight();
  const variantClasses = getVariantClasses();

  const SkeletonElement = ({ index = 0 }: { index?: number }) => (
    <motion.div
      key={index}
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${variantClasses} ${className}`}
      style={{
        width,
        height: skeletonHeight,
        backgroundSize: '200% 100%',
      }}
      variants={animate ? shimmerVariants : undefined}
      animate={animate ? 'shimmer' : undefined}
      initial={{ opacity: 0.4 }}
    />
  );

  if (count === 1) {
    return <SkeletonElement />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonElement key={index} index={index} />
      ))}
    </div>
  );
};

// Specialized skeleton components
export const TextSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="text" {...props} />
);

export const CardSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="card" {...props} />
);

export const AvatarSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="avatar" {...props} />
);

export const ButtonSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="button" {...props} />
);

export const TimelineSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="timeline" {...props} />
);

export const SkillsSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="skills" {...props} />
);

// Complex skeleton layouts
export const ExperienceSkeletonLayout: React.FC = () => (
  <div className="space-y-8">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="flex gap-8">
        <div className="flex-shrink-0">
          <AvatarSkeleton width="1rem" height="1rem" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <TextSkeleton width="75%" height="1.5rem" />
            <TextSkeleton width="50%" height="1rem" />
          </div>
          <div className="space-y-2">
            <TextSkeleton width="100%" />
            <TextSkeleton width="85%" />
            <TextSkeleton width="60%" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkillsSkeletonLayout: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="space-y-4">
        <TextSkeleton width="60%" height="1.25rem" />
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, skillIndex) => (
            <div key={skillIndex} className="flex items-center justify-between">
              <TextSkeleton width="40%" />
              <TextSkeleton width="20%" height="0.5rem" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ProjectsSkeletonLayout: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }, (_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);

export default LoadingSkeleton;