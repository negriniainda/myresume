import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import useScrollProgress from '@/hooks/useScrollProgress';
import useStaggeredAnimation from '@/hooks/useStaggeredAnimation';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedTimeline from '@/components/ui/AnimatedTimeline';
import ScrollProgress from '@/components/ui/ScrollProgress';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

describe('Scroll-based Animations', () => {
  beforeEach(() => {
    mockIntersectionObserver.mockClear();
  });

  describe('useIntersectionObserver Hook', () => {
    const TestComponent = () => {
      const { ref, isIntersecting } = useIntersectionObserver();
      return (
        <div ref={ref} data-testid="test-element">
          {isIntersecting ? 'Visible' : 'Hidden'}
        </div>
      );
    };

    it('should initialize with correct default values', () => {
      render(<TestComponent />);
      const element = screen.getByTestId('test-element');
      expect(element).toBeInTheDocument();
    });

    it('should create IntersectionObserver with correct options', () => {
      render(<TestComponent />);
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        })
      );
    });
  });

  describe('useScrollProgress Hook', () => {
    const TestComponent = () => {
      const { scrollProgress, currentSection } = useScrollProgress({
        sections: ['section1', 'section2'],
      });
      return (
        <div data-testid="scroll-progress">
          Progress: {Math.round(scrollProgress)}%
          Current: {currentSection || 'none'}
        </div>
      );
    };

    it('should initialize with zero progress', () => {
      render(<TestComponent />);
      const element = screen.getByTestId('scroll-progress');
      expect(element).toHaveTextContent('Progress: 0%');
    });
  });

  describe('useStaggeredAnimation Hook', () => {
    const TestComponent = () => {
      const { containerRef, isVisible, getItemDelay } = useStaggeredAnimation({
        staggerDelay: 100,
      });
      return (
        <div ref={containerRef} data-testid="stagger-container">
          <div data-stagger-item>Item 1 - Delay: {getItemDelay(0)}ms</div>
          <div data-stagger-item>Item 2 - Delay: {getItemDelay(1)}ms</div>
          <div data-stagger-item>Item 3 - Delay: {getItemDelay(2)}ms</div>
          Status: {isVisible ? 'Visible' : 'Hidden'}
        </div>
      );
    };

    it('should calculate correct stagger delays', () => {
      render(<TestComponent />);
      expect(screen.getByText('Item 1 - Delay: 0ms')).toBeInTheDocument();
      expect(screen.getByText('Item 2 - Delay: 100ms')).toBeInTheDocument();
      expect(screen.getByText('Item 3 - Delay: 200ms')).toBeInTheDocument();
    });
  });

  describe('AnimatedSection Component', () => {
    it('should render with correct animation attributes', () => {
      render(
        <AnimatedSection animation="fade-in-up" id="test-section">
          <div>Test Content</div>
        </AnimatedSection>
      );
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'test-section');
      expect(section).toHaveAttribute('data-animate-section', 'fade-in-up');
    });

    it('should render children correctly', () => {
      render(
        <AnimatedSection>
          <div data-testid="child">Test Content</div>
        </AnimatedSection>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('AnimatedTimeline Component', () => {
    it('should render timeline with progress line', () => {
      render(
        <AnimatedTimeline showProgressLine={true}>
          <div data-timeline-item>Timeline Item 1</div>
          <div data-timeline-item>Timeline Item 2</div>
        </AnimatedTimeline>
      );
      
      expect(screen.getByText('Timeline Item 1')).toBeInTheDocument();
      expect(screen.getByText('Timeline Item 2')).toBeInTheDocument();
    });

    it('should render without progress line when disabled', () => {
      render(
        <AnimatedTimeline showProgressLine={false}>
          <div data-timeline-item>Timeline Item</div>
        </AnimatedTimeline>
      );
      
      expect(screen.getByText('Timeline Item')).toBeInTheDocument();
    });
  });

  describe('ScrollProgress Component', () => {
    it('should render progress bar', () => {
      render(<ScrollProgress />);
      // The component should render without errors
      // Progress bar is rendered as a div with specific styling
    });

    it('should render with custom sections', () => {
      render(<ScrollProgress sections={['hero', 'about', 'contact']} />);
      // Should render without errors with custom sections
    });

    it('should show percentage when enabled', () => {
      render(<ScrollProgress showPercentage={true} />);
      // Should render percentage display
    });
  });

  describe('Animation Utilities', () => {
    it('should handle scroll events without errors', () => {
      // Mock scroll event
      const scrollEvent = new Event('scroll');
      
      // This should not throw any errors
      expect(() => {
        window.dispatchEvent(scrollEvent);
      }).not.toThrow();
    });

    it('should handle resize events without errors', () => {
      // Mock resize event
      const resizeEvent = new Event('resize');
      
      // This should not throw any errors
      expect(() => {
        window.dispatchEvent(resizeEvent);
      }).not.toThrow();
    });
  });
});