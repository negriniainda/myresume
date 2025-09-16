import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// Test component to verify i18n functionality
function TestComponent() {
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="translated-text">{t('navigation.home')}</div>
      <button 
        data-testid="switch-to-pt" 
        onClick={() => setLanguage('pt')}
      >
        Switch to Portuguese
      </button>
      <button 
        data-testid="switch-to-en" 
        onClick={() => setLanguage('en')}
      >
        Switch to English
      </button>
    </div>
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
  value: localStorageMock,
});

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

describe('i18n Setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with English as default language', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });
  });

  it('should display translated text in English', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('translated-text')).toHaveTextContent('Home');
    });
  });

  it('should switch to Portuguese and update translations', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    // Switch to Portuguese
    fireEvent.click(screen.getByTestId('switch-to-pt'));

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('pt');
      expect(screen.getByTestId('translated-text')).toHaveTextContent('Início');
    });
  });

  it('should persist language preference in localStorage', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    // Switch to Portuguese
    fireEvent.click(screen.getByTestId('switch-to-pt'));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'pt');
    });
  });

  it('should load saved language from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('pt');

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('pt');
      expect(screen.getByTestId('translated-text')).toHaveTextContent('Início');
    });
  });

  it('should detect Portuguese browser language', async () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'pt-BR',
    });

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('pt');
    });
  });

  it('should handle translation errors gracefully', async () => {
    function TestComponentWithMissingKey() {
      const { t } = useTranslation();
      return <div data-testid="missing-key">{t('nonexistent.key')}</div>;
    }

    render(
      <I18nProvider>
        <TestComponentWithMissingKey />
      </I18nProvider>
    );

    await waitFor(() => {
      // Should return the key itself when translation is missing
      expect(screen.getByTestId('missing-key')).toHaveTextContent('nonexistent.key');
    });
  });
});

describe('useTranslation Hook', () => {
  it('should provide formatting utilities', async () => {
    function TestFormattingComponent() {
      const { formatDate, formatNumber } = useTranslation();
      const testDate = new Date('2024-01-15');
      const testNumber = 1234.56;

      return (
        <div>
          <div data-testid="formatted-date">{formatDate(testDate)}</div>
          <div data-testid="formatted-number">{formatNumber(testNumber)}</div>
        </div>
      );
    }

    render(
      <I18nProvider>
        <TestFormattingComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('formatted-date')).toBeInTheDocument();
      expect(screen.getByTestId('formatted-number')).toBeInTheDocument();
    });
  });
});