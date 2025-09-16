/**
 * Animation utilities for smooth transitions
 */

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

/**
 * Default animation configurations
 */
export const ANIMATION_CONFIGS = {
  fast: { duration: 150, easing: 'ease-out' },
  normal: { duration: 300, easing: 'ease-in-out' },
  slow: { duration: 500, easing: 'ease-in-out' },
  bounce: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
} as const;

/**
 * Stagger animation delays for lists
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * CSS classes for common animations
 */
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const;

/**
 * Create a CSS animation string
 */
export function createAnimation(
  name: string,
  config: AnimationConfig = ANIMATION_CONFIGS.normal
): string {
  const { duration = 300, easing = 'ease-in-out', delay = 0 } = config;
  return `${name} ${duration}ms ${easing} ${delay}ms both`;
}

/**
 * Animate element entrance with stagger
 */
export function animateListEntrance(
  elements: NodeListOf<Element> | Element[],
  config: AnimationConfig & { stagger?: number } = {}
): void {
  const { stagger = 50, ...animConfig } = config;
  
  Array.from(elements).forEach((element, index) => {
    const delay = getStaggerDelay(index, stagger);
    const htmlElement = element as HTMLElement;
    
    htmlElement.style.opacity = '0';
    htmlElement.style.transform = 'translateY(20px)';
    htmlElement.style.transition = createAnimation('all', {
      ...animConfig,
      delay,
    });
    
    // Trigger animation
    requestAnimationFrame(() => {
      htmlElement.style.opacity = '1';
      htmlElement.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Animate element exit
 */
export function animateExit(
  element: HTMLElement,
  config: AnimationConfig = ANIMATION_CONFIGS.fast
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = createAnimation('all', config);
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px) scale(0.95)';
    
    setTimeout(() => {
      resolve();
    }, config.duration || 150);
  });
}

/**
 * Animate filter results update
 */
export function animateFilterUpdate(
  container: HTMLElement,
  config: AnimationConfig = ANIMATION_CONFIGS.normal
): void {
  const cards = container.querySelectorAll('[data-project-card]');
  
  // First fade out existing cards
  Array.from(cards).forEach((card, index) => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.transition = createAnimation('opacity', ANIMATION_CONFIGS.fast);
    htmlCard.style.opacity = '0.5';
  });
  
  // Then animate them back in with stagger
  setTimeout(() => {
    animateListEntrance(cards, {
      ...config,
      stagger: 30,
    });
  }, 100);
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(
  element: HTMLElement,
  options: ScrollIntoViewOptions = {}
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options,
  });
}

/**
 * Animate number counting
 */
export function animateNumber(
  element: HTMLElement,
  from: number,
  to: number,
  duration: number = 1000
): void {
  const startTime = performance.now();
  const difference = to - from;
  
  function updateNumber(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (difference * easeOut));
    
    element.textContent = current.toString();
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

/**
 * Create intersection observer for scroll animations
 */
export function createScrollAnimationObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Animate elements on scroll into view
 */
export function setupScrollAnimations(
  selector: string = '[data-animate-on-scroll]'
): () => void {
  const elements = document.querySelectorAll(selector);
  
  const observer = createScrollAnimationObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const animationType = element.dataset.animateOnScroll || 'fadeIn';
        
        element.classList.add(`animate-${animationType}`);
        observer.unobserve(element);
      }
    });
  });
  
  elements.forEach((element) => {
    observer.observe(element);
  });
  
  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Animate timeline items with staggered entrance
 */
export function animateTimelineItems(
  container: HTMLElement,
  options: {
    staggerDelay?: number;
    animationDuration?: number;
    threshold?: number;
  } = {}
): () => void {
  const { staggerDelay = 150, animationDuration = 600, threshold = 0.2 } = options;
  
  const timelineItems = container.querySelectorAll('[data-timeline-item]');
  
  const observer = createScrollAnimationObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const container = entry.target as HTMLElement;
        const items = container.querySelectorAll('[data-timeline-item]');
        
        items.forEach((item, index) => {
          const htmlItem = item as HTMLElement;
          const delay = index * staggerDelay;
          
          // Set initial state
          htmlItem.style.opacity = '0';
          htmlItem.style.transform = 'translateX(-30px)';
          htmlItem.style.transition = `opacity ${animationDuration}ms ease-out ${delay}ms, transform ${animationDuration}ms ease-out ${delay}ms`;
          
          // Trigger animation
          requestAnimationFrame(() => {
            htmlItem.style.opacity = '1';
            htmlItem.style.transform = 'translateX(0px)';
          });
        });
        
        observer.unobserve(container);
      }
    });
  }, { threshold });
  
  observer.observe(container);
  
  return () => observer.disconnect();
}

/**
 * Create scroll progress indicator
 */
export function createScrollProgressIndicator(
  container: HTMLElement,
  options: {
    height?: string;
    backgroundColor?: string;
    progressColor?: string;
    position?: 'top' | 'bottom';
  } = {}
): () => void {
  const {
    height = '3px',
    backgroundColor = 'rgba(0, 0, 0, 0.1)',
    progressColor = '#3b82f6',
    position = 'top',
  } = options;
  
  // Create progress bar element
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    ${position}: 0;
    left: 0;
    width: 100%;
    height: ${height};
    background-color: ${backgroundColor};
    z-index: 1000;
    pointer-events: none;
  `;
  
  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    height: 100%;
    background-color: ${progressColor};
    width: 0%;
    transition: width 0.1s ease-out;
  `;
  
  progressBar.appendChild(progressFill);
  container.appendChild(progressBar);
  
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
    
    progressFill.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  };
  
  // Initial update
  updateProgress();
  
  // Add scroll listener
  window.addEventListener('scroll', updateProgress, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', updateProgress);
    if (progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
    }
  };
}

/**
 * Animate section highlighting in navigation
 */
export function createSectionHighlighter(
  navSelector: string,
  sections: string[],
  options: {
    offset?: number;
    activeClass?: string;
  } = {}
): () => void {
  const { offset = 100, activeClass = 'active' } = options;
  
  const navElement = document.querySelector(navSelector);
  if (!navElement) return () => {};
  
  const updateActiveSection = () => {
    const scrollTop = window.scrollY + offset;
    let currentSection = '';
    
    // Find the current section
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        
        if (scrollTop >= elementTop) {
          currentSection = sectionId;
        }
      }
    }
    
    // Update navigation highlighting
    const navLinks = navElement.querySelectorAll('[data-section]');
    navLinks.forEach((link) => {
      const htmlLink = link as HTMLElement;
      const targetSection = htmlLink.dataset.section;
      
      if (targetSection === currentSection) {
        htmlLink.classList.add(activeClass);
      } else {
        htmlLink.classList.remove(activeClass);
      }
    });
  };
  
  // Initial update
  updateActiveSection();
  
  // Add scroll listener
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', updateActiveSection);
  };
}

/**
 * Animate elements with parallax effect
 */
export function createParallaxEffect(
  selector: string,
  options: {
    speed?: number;
    direction?: 'up' | 'down';
  } = {}
): () => void {
  const { speed = 0.5, direction = 'up' } = options;
  const elements = document.querySelectorAll(selector);
  
  const updateParallax = () => {
    const scrollTop = window.scrollY;
    
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const rect = htmlElement.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Check if element is in viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        const yPos = (scrollTop - elementTop) * speed;
        const transform = direction === 'up' 
          ? `translateY(${-yPos}px)` 
          : `translateY(${yPos}px)`;
        
        htmlElement.style.transform = transform;
      }
    });
  };
  
  // Add scroll listener
  window.addEventListener('scroll', updateParallax, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', updateParallax);
  };
}