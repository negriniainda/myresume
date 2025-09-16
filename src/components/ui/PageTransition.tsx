'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip';
  duration?: number;
  delay?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  variant = 'fade',
  duration = 0.5,
  delay = 0,
}) => {
  const getVariants = () => {
    switch (variant) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
        };
      case 'rotate':
        return {
          initial: { opacity: 0, rotate: -10 },
          animate: { opacity: 1, rotate: 0 },
          exit: { opacity: 0, rotate: 10 },
        };
      case 'flip':
        return {
          initial: { opacity: 0, rotateY: -90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: 90 },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;