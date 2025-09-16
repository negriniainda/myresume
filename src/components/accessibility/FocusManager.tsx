import React, { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

interface FocusManagerProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  className?: string;
}

const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  autoFocus = false,
  restoreFocus = false,
  trapFocus = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const { trapFocus: trapFocusUtil } = useAccessibility();

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Auto focus the first focusable element
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [autoFocus]);

  // Set up focus trap
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      const cleanup = trapFocusUtil(containerRef.current);
      return cleanup;
    }
  }, [trapFocus, trapFocusUtil]);

  // Restore focus when component unmounts
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (trapFocus && e.key === 'Tab' && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }, [trapFocus]);

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

// Specialized focus management components
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = true, className = '' }) => (
  <FocusManager
    trapFocus={active}
    autoFocus={active}
    restoreFocus={active}
    className={className}
  >
    {children}
  </FocusManager>
);

export const AutoFocus: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <FocusManager
    autoFocus
    className={className}
  >
    {children}
  </FocusManager>
);

export const RestoreFocus: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <FocusManager
    restoreFocus
    className={className}
  >
    {children}
  </FocusManager>
);

export default FocusManager;