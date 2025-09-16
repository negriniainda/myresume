'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'tilt' | 'bounce' | 'rotate';
  intensity?: 'subtle' | 'normal' | 'strong';
  disabled?: boolean;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  intensity = 'normal',
  disabled = false,
}) => {
  const getHoverVariants = () => {
    const intensityMultiplier = {
      subtle: 0.5,
      normal: 1,
      strong: 1.5,
    }[intensity];

    switch (hoverEffect) {
      case 'lift':
        return {
          hover: {
            y: -8 * intensityMultiplier,
            boxShadow: `0 ${20 * intensityMultiplier}px ${40 * intensityMultiplier}px rgba(0, 0, 0, 0.1)`,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
        };
      case 'scale':
        return {
          hover: {
            scale: 1 + (0.05 * intensityMultiplier),
            transition: {
              duration: 0.2,
              ease: 'easeOut',
            },
          },
        };
      case 'glow':
        return {
          hover: {
            boxShadow: `0 0 ${30 * intensityMultiplier}px rgba(59, 130, 246, 0.5)`,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
        };
      case 'tilt':
        return {
          hover: {
            rotateX: 5 * intensityMultiplier,
            rotateY: 5 * intensityMultiplier,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
        };
      case 'bounce':
        return {
          hover: {
            y: [-2, -8, -2] as number[],
            transition: {
              duration: 0.6,
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            },
          },
        };
      case 'rotate':
        return {
          hover: {
            rotate: 2 * intensityMultiplier,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
        };
      default:
        return {
          hover: {
            y: -4,
            transition: {
              duration: 0.2,
              ease: 'easeOut',
            },
          },
        };
    }
  };

  const tapVariants = {
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: 'easeInOut',
      },
    },
  };

  const variants = disabled ? {} : { ...getHoverVariants(), ...tapVariants };

  return (
    <motion.div
      className={`cursor-pointer ${className}`}
      variants={variants}
      whileHover={disabled ? undefined : 'hover'}
      whileTap={disabled ? undefined : 'tap'}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
};

export default HoverCard;