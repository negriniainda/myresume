import React, { useEffect, useCallback } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';

interface KeyboardNavigationProps {
  children: React.ReactNode;
}

const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({ children }) => {
  const { keyboardNavigation, focusVisible, announceToScreenReader } = useAccessibility();
  const { t } = useTranslation();

  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    // Handle escape key to close modals/dropdowns
    if (e.key === 'Escape') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
      
      // Close any open modals or dropdowns
      const modals = document.querySelectorAll('[role="dialog"], [role="menu"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      });
    }

    // Handle arrow keys for navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const activeElement = document.activeElement;
      const isInMenu = activeElement?.closest('[role="menu"], [role="menubar"]');
      
      if (isInMenu) {
        e.preventDefault();
        const menuItems = isInMenu.querySelectorAll('[role="menuitem"]');
        const currentIndex = Array.from(menuItems).indexOf(activeElement as Element);
        
        let nextIndex = currentIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % menuItems.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }
        
        (menuItems[nextIndex] as HTMLElement).focus();
      }
    }

    // Handle Enter and Space for activation
    if (e.key === 'Enter' || e.key === ' ') {
      const activeElement = document.activeElement as HTMLElement;
      const role = activeElement?.getAttribute('role');
      
      if (role === 'button' || role === 'menuitem' || role === 'tab') {
        e.preventDefault();
        activeElement.click();
      }
    }

    // Handle Home/End keys for navigation
    if (e.key === 'Home' || e.key === 'End') {
      const activeElement = document.activeElement;
      const container = activeElement?.closest('[role="menu"], [role="tablist"], [role="listbox"]');
      
      if (container) {
        e.preventDefault();
        const items = container.querySelectorAll('[role="menuitem"], [role="tab"], [role="option"]');
        const targetItem = e.key === 'Home' ? items[0] : items[items.length - 1];
        (targetItem as HTMLElement).focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, [handleKeyboardNavigation]);

  // Add focus-visible class to body when keyboard navigation is detected
  useEffect(() => {
    if (keyboardNavigation) {
      document.body.classList.add('keyboard-navigation');
    }
    
    if (focusVisible) {
      document.body.classList.add('focus-visible');
    } else {
      document.body.classList.remove('focus-visible');
    }
  }, [keyboardNavigation, focusVisible]);

  return (
    <>
      {/* Skip links for keyboard navigation */}
      <div className="sr-only focus:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onFocus={() => announceToScreenReader(t('accessibility.skipToMain', 'Skip to main content'))}
        >
          {t('accessibility.skipToMain', 'Skip to main content')}
        </a>
        <a
          href="#navigation"
          className="absolute top-4 left-32 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onFocus={() => announceToScreenReader(t('accessibility.skipToNav', 'Skip to navigation'))}
        >
          {t('accessibility.skipToNav', 'Skip to navigation')}
        </a>
      </div>

      {/* Keyboard navigation instructions */}
      <div 
        id="keyboard-instructions" 
        className="sr-only" 
        aria-live="polite"
        aria-label={t('accessibility.keyboardInstructions', 'Keyboard navigation instructions')}
      >
        {keyboardNavigation && (
          <p>
            {t('accessibility.keyboardHelp', 
              'Use Tab to navigate, Enter or Space to activate, Escape to close dialogs, Arrow keys to navigate menus.'
            )}
          </p>
        )}
      </div>

      {children}
    </>
  );
};

export default KeyboardNavigation;