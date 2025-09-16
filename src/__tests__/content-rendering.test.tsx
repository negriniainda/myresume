import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider } from '@/components/providers/I18nProvider';
import {
  ContentRenderer,
  BilingualText,
  BilingualList,
  ConditionalContent,
  LoadingState,
  ContentPreserver,
  FallbackContent,
  MissingContent,
  ContentValidator,
  ProgressiveFallback,
} from '@/components/content';

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

describe('Content Rendering System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('BilingualText Component', () => {
    it('renders string content correctly', async () => {
      render(
        <TestWrapper>
          <BilingualText content="Hello World" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      });
    });

    it('renders localized content from object', async () => {
      const content = {
        en: 'Hello World',
        pt: 'Olá Mundo'
      };

      render(
        <TestWrapper>
          <BilingualText content={content} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      });
    });

    it('shows fallback when content is missing', async () => {
      render(
        <TestWrapper>
          <BilingualText content="" fallback="Fallback Text" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback Text')).toBeInTheDocument();
      });
    });

    it('renders with custom HTML element', async () => {
      render(
        <TestWrapper>
          <BilingualText content="Heading Text" as="h1" />
        </TestWrapper>
      );

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Heading Text');
      });
    });
  });

  describe('BilingualList Component', () => {
    it('renders array of items', async () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      render(
        <TestWrapper>
          <BilingualList items={items} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
      });
    });

    it('renders localized items from object', async () => {
      const items = {
        en: ['English Item 1', 'English Item 2'],
        pt: ['Portuguese Item 1', 'Portuguese Item 2']
      };

      render(
        <TestWrapper>
          <BilingualList items={items} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('English Item 1')).toBeInTheDocument();
        expect(screen.getByText('English Item 2')).toBeInTheDocument();
      });
    });

    it('uses custom render function', async () => {
      const items = ['Item 1', 'Item 2'];
      const renderItem = (item: string, index: number) => (
        <span data-testid={`custom-item-${index}`}>{item.toUpperCase()}</span>
      );

      render(
        <TestWrapper>
          <BilingualList items={items} renderItem={renderItem} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('custom-item-0')).toHaveTextContent('ITEM 1');
        expect(screen.getByTestId('custom-item-1')).toHaveTextContent('ITEM 2');
      });
    });

    it('shows fallback when items are empty', async () => {
      render(
        <TestWrapper>
          <BilingualList items={[]} fallback={['Fallback Item']} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback Item')).toBeInTheDocument();
      });
    });
  });

  describe('ConditionalContent Component', () => {
    it('renders children when condition is true', () => {
      render(
        <ConditionalContent condition={true}>
          <div>Conditional Content</div>
        </ConditionalContent>
      );

      expect(screen.getByText('Conditional Content')).toBeInTheDocument();
    });

    it('renders fallback when condition is false', () => {
      render(
        <ConditionalContent 
          condition={false} 
          fallback={<div>Fallback Content</div>}
        >
          <div>Conditional Content</div>
        </ConditionalContent>
      );

      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
      expect(screen.queryByText('Conditional Content')).not.toBeInTheDocument();
    });

    it('renders nothing when condition is false and no fallback', () => {
      const { container } = render(
        <ConditionalContent condition={false}>
          <div>Conditional Content</div>
        </ConditionalContent>
      );

      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('LoadingState Component', () => {
    it('shows loading spinner when isLoading is true', async () => {
      render(
        <TestWrapper>
          <LoadingState isLoading={true}>
            <div>Content</div>
          </LoadingState>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('shows error message when error exists', async () => {
      render(
        <TestWrapper>
          <LoadingState isLoading={false} error="Test error">
            <div>Content</div>
          </LoadingState>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('shows content when not loading and no error', () => {
      render(
        <TestWrapper>
          <LoadingState isLoading={false}>
            <div>Content</div>
          </LoadingState>
        </TestWrapper>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('uses custom loading component', async () => {
      const customLoading = <div>Custom Loading</div>;

      render(
        <TestWrapper>
          <LoadingState isLoading={true} loadingComponent={customLoading}>
            <div>Content</div>
          </LoadingState>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Loading')).toBeInTheDocument();
      });
    });

    it('uses custom error component', async () => {
      const customError = <div>Custom Error</div>;

      render(
        <TestWrapper>
          <LoadingState 
            isLoading={false} 
            error="Test error" 
            errorComponent={customError}
          >
            <div>Content</div>
          </LoadingState>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Error')).toBeInTheDocument();
      });
    });
  });

  describe('ContentValidator Component', () => {
    it('renders content when validation passes', () => {
      render(
        <ContentValidator content="Valid content">
          {(content) => <div>{content}</div>}
        </ContentValidator>
      );

      expect(screen.getByText('Valid content')).toBeInTheDocument();
    });

    it('shows fallback when validation fails', () => {
      render(
        <ContentValidator 
          content="" 
          fallback={<div>Fallback</div>}
        >
          {(content) => <div>{content}</div>}
        </ContentValidator>
      );

      expect(screen.getByText('Fallback')).toBeInTheDocument();
    });

    it('uses custom validator function', () => {
      const validator = (content: any) => content && content.length > 5;

      render(
        <ContentValidator 
          content="Hi" 
          validator={validator}
          fallback={<div>Too short</div>}
        >
          {(content) => <div>{content}</div>}
        </ContentValidator>
      );

      expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    it('validates arrays correctly', () => {
      render(
        <ContentValidator content={['item1', 'item2']}>
          {(content) => <div>{content.join(', ')}</div>}
        </ContentValidator>
      );

      expect(screen.getByText('item1, item2')).toBeInTheDocument();
    });

    it('validates objects correctly', () => {
      render(
        <ContentValidator content={{ key: 'value' }}>
          {(content) => <div>{content.key}</div>}
        </ContentValidator>
      );

      expect(screen.getByText('value')).toBeInTheDocument();
    });
  });

  describe('ProgressiveFallback Component', () => {
    it('selects highest priority content', () => {
      const contentSources = [
        { content: 'Low priority', priority: 1 },
        { content: 'High priority', priority: 3 },
        { content: 'Medium priority', priority: 2 },
      ];

      render(
        <ProgressiveFallback contentSources={contentSources}>
          {(content) => <div>{content}</div>}
        </ProgressiveFallback>
      );

      expect(screen.getByText('High priority')).toBeInTheDocument();
    });

    it('prefers current language content', async () => {
      const contentSources = [
        { content: 'English content', language: 'en' as const, priority: 1 },
        { content: 'Portuguese content', language: 'pt' as const, priority: 2 },
      ];

      render(
        <TestWrapper>
          <ProgressiveFallback contentSources={contentSources}>
            {(content, source) => (
              <div>
                {content} ({source.language})
              </div>
            )}
          </ProgressiveFallback>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('English content (en)')).toBeInTheDocument();
      });
    });

    it('falls back when no content available', () => {
      const contentSources = [
        { content: null, priority: 1 },
        { content: undefined, priority: 2 },
      ];

      render(
        <TestWrapper>
          <ProgressiveFallback contentSources={contentSources}>
            {(content) => <div>{content}</div>}
          </ProgressiveFallback>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('ContentPreserver Component', () => {
    it('applies transition classes during language change', async () => {
      const TestComponent = () => {
        return (
          <TestWrapper>
            <ContentPreserver>
              <div data-testid="preserved-content">Content</div>
            </ContentPreserver>
          </TestWrapper>
        );
      };

      const { rerender } = render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('preserved-content')).toBeInTheDocument();
      });

      // The component should have opacity transition classes
      const container = screen.getByTestId('preserved-content').parentElement;
      expect(container).toHaveClass('transition-opacity');
    });

    it('preserves content during transitions', async () => {
      render(
        <TestWrapper>
          <ContentPreserver>
            <div data-testid="content">Test Content</div>
          </ContentPreserver>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });
  });
});