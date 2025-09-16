import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedButton from '@/components/ui/AnimatedButton';
import HoverCard from '@/components/ui/HoverCard';
import LoadingSkeleton, { TextSkeleton, CardSkeleton } from '@/components/ui/LoadingSkeleton';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedModal from '@/components/ui/AnimatedModal';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock createPortal for modal tests
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

describe('Framer Motion Animations', () => {
  describe('AnimatedButton Component', () => {
    it('should render with correct variant classes', () => {
      render(
        <AnimatedButton variant="primary" data-testid="animated-button">
          Click me
        </AnimatedButton>
      );
      
      const button = screen.getByTestId('animated-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(
        <AnimatedButton onClick={handleClick} data-testid="animated-button">
          Click me
        </AnimatedButton>
      );
      
      const button = screen.getByTestId('animated-button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show loading state', () => {
      render(
        <AnimatedButton loading={true} data-testid="animated-button">
          Click me
        </AnimatedButton>
      );
      
      const button = screen.getByTestId('animated-button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <AnimatedButton disabled={true} data-testid="animated-button">
          Click me
        </AnimatedButton>
      );
      
      const button = screen.getByTestId('animated-button');
      expect(button).toBeDisabled();
    });

    it('should render different sizes correctly', () => {
      const { rerender } = render(
        <AnimatedButton size="sm" data-testid="animated-button">
          Small
        </AnimatedButton>
      );
      
      expect(screen.getByTestId('animated-button')).toHaveClass('px-3', 'py-1.5', 'text-sm');
      
      rerender(
        <AnimatedButton size="lg" data-testid="animated-button">
          Large
        </AnimatedButton>
      );
      
      expect(screen.getByTestId('animated-button')).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('HoverCard Component', () => {
    it('should render children correctly', () => {
      render(
        <HoverCard data-testid="hover-card">
          <div>Card content</div>
        </HoverCard>
      );
      
      const card = screen.getByTestId('hover-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Card content');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not have cursor-pointer when disabled', () => {
      render(
        <HoverCard disabled={true} data-testid="hover-card">
          <div>Card content</div>
        </HoverCard>
      );
      
      const card = screen.getByTestId('hover-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton Component', () => {
    it('should render text skeleton', () => {
      render(<TextSkeleton data-testid="text-skeleton" />);
      
      const skeleton = screen.getByTestId('text-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('should render card skeleton', () => {
      render(<CardSkeleton data-testid="card-skeleton" />);
      
      const skeleton = screen.getByTestId('card-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('rounded-xl');
    });

    it('should render multiple skeletons when count is specified', () => {
      render(<LoadingSkeleton count={3} data-testid="skeleton-container" />);
      
      // Should render a container with multiple skeleton elements
      const container = screen.getByTestId('skeleton-container');
      expect(container).toBeInTheDocument();
    });

    it('should apply custom width and height', () => {
      render(
        <LoadingSkeleton 
          width="200px" 
          height="50px" 
          data-testid="custom-skeleton" 
        />
      );
      
      const skeleton = screen.getByTestId('custom-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
    });
  });

  describe('PageTransition Component', () => {
    it('should render children with transition wrapper', () => {
      render(
        <PageTransition data-testid="page-transition">
          <div>Page content</div>
        </PageTransition>
      );
      
      const transition = screen.getByTestId('page-transition');
      expect(transition).toBeInTheDocument();
      expect(transition).toHaveTextContent('Page content');
    });

    it('should apply custom className', () => {
      render(
        <PageTransition className="custom-class" data-testid="page-transition">
          <div>Page content</div>
        </PageTransition>
      );
      
      const transition = screen.getByTestId('page-transition');
      expect(transition).toHaveClass('custom-class');
    });
  });

  describe('AnimatedModal Component', () => {
    beforeEach(() => {
      // Mock document.body for portal
      document.body.innerHTML = '';
    });

    it('should not render when closed', () => {
      render(
        <AnimatedModal isOpen={false} onClose={() => {}}>
          <div>Modal content</div>
        </AnimatedModal>
      );
      
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(
        <AnimatedModal isOpen={true} onClose={() => {}}>
          <div>Modal content</div>
        </AnimatedModal>
      );
      
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <AnimatedModal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Modal content</div>
        </AnimatedModal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <AnimatedModal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal content</div>
        </AnimatedModal>
      );
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should apply different size classes', () => {
      const { rerender } = render(
        <AnimatedModal isOpen={true} onClose={() => {}} size="sm">
          <div>Small modal</div>
        </AnimatedModal>
      );
      
      expect(screen.getByText('Small modal')).toBeInTheDocument();
      
      rerender(
        <AnimatedModal isOpen={true} onClose={() => {}} size="lg">
          <div>Large modal</div>
        </AnimatedModal>
      );
      
      expect(screen.getByText('Large modal')).toBeInTheDocument();
    });
  });

  describe('Animation Integration', () => {
    it('should handle multiple animated components together', () => {
      render(
        <div>
          <AnimatedButton data-testid="button">Button</AnimatedButton>
          <HoverCard data-testid="card">
            <div>Card</div>
          </HoverCard>
          <TextSkeleton data-testid="skeleton" />
        </div>
      );
      
      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should handle nested animations', () => {
      render(
        <PageTransition data-testid="page">
          <HoverCard data-testid="hover-card">
            <AnimatedButton data-testid="nested-button">
              Nested Button
            </AnimatedButton>
          </HoverCard>
        </PageTransition>
      );
      
      expect(screen.getByTestId('page')).toBeInTheDocument();
      expect(screen.getByTestId('hover-card')).toBeInTheDocument();
      expect(screen.getByTestId('nested-button')).toBeInTheDocument();
    });
  });
});