'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animation?: 'bounce' | 'pulse' | 'shake' | 'rotate' | 'scale' | 'slide';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  animation = 'scale',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-transparent';
      case 'outline':
        return 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600 hover:border-blue-700';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-transparent';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getAnimationVariants = () => {
    switch (animation) {
      case 'bounce':
        return {
          hover: {
            y: [-2, -6, -2],
            transition: {
              duration: 0.6,
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            },
          },
          tap: { scale: 0.95 },
        };
      case 'pulse':
        return {
          hover: {
            scale: [1, 1.05, 1],
            transition: {
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
          tap: { scale: 0.95 },
        };
      case 'shake':
        return {
          hover: {
            x: [-1, 1, -1, 1, 0],
            transition: {
              duration: 0.5,
              ease: 'easeInOut',
            },
          },
          tap: { scale: 0.95 },
        };
      case 'rotate':
        return {
          hover: {
            rotate: [0, -5, 5, 0],
            transition: {
              duration: 0.6,
              ease: 'easeInOut',
            },
          },
          tap: { scale: 0.95 },
        };
      case 'scale':
        return {
          hover: { scale: 1.05 },
          tap: { scale: 0.95 },
        };
      case 'slide':
        return {
          hover: {
            x: 2,
            transition: {
              duration: 0.2,
              ease: 'easeOut',
            },
          },
          tap: { scale: 0.95 },
        };
      default:
        return {
          hover: { scale: 1.05 },
          tap: { scale: 0.95 },
        };
    }
  };

  const loadingVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const animationVariants = getAnimationVariants();

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg border
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    transition-colors duration-200
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <motion.button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      variants={disabled || loading ? {} : animationVariants}
      whileHover={disabled || loading ? undefined : 'hover'}
      whileTap={disabled || loading ? undefined : 'tap'}
      disabled={disabled || loading}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full"
          variants={loadingVariants}
          animate="spin"
        />
      )}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;