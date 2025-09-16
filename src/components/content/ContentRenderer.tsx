'use client';

import React from 'react';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';
import type { ResumeData, Project } from '@/types';

interface ContentRendererProps {
  children: (data: {
    resumeData: ResumeData | null;
    projectsData: Project[];
    isLoading: boolean;
    error: string | null;
    language: 'en' | 'pt';
  }) => React.ReactNode;
}

/**
 * Content renderer that provides bilingual data to child components
 */
export function ContentRenderer({ children }: ContentRendererProps) {
  const { resumeData, projectsData, isLoading, error, language } = useContent();

  return (
    <>
      {children({
        resumeData,
        projectsData,
        isLoading,
        error,
        language,
      })}
    </>
  );
}

interface BilingualTextProps {
  content: string | Record<string, string>;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Component for rendering bilingual text with fallback support
 */
export function BilingualText({ 
  content, 
  fallback = '', 
  className = '',
  as: Component = 'span'
}: BilingualTextProps) {
  const { getLocalizedText } = useContent();
  
  const text = getLocalizedText(content, fallback);
  
  return (
    <Component className={className}>
      {text}
    </Component>
  );
}

interface BilingualListProps {
  items: string[] | Record<string, string[]>;
  fallback?: string[];
  className?: string;
  itemClassName?: string;
  renderItem?: (item: string, index: number) => React.ReactNode;
}

/**
 * Component for rendering bilingual lists with fallback support
 */
export function BilingualList({ 
  items, 
  fallback = [], 
  className = '',
  itemClassName = '',
  renderItem
}: BilingualListProps) {
  const { getContentWithFallback, language } = useContent();
  
  const listItems = React.useMemo(() => {
    if (Array.isArray(items)) {
      return items;
    }
    
    if (typeof items === 'object' && items !== null) {
      return getContentWithFallback(items) || fallback;
    }
    
    return fallback;
  }, [items, fallback, getContentWithFallback]);

  if (!listItems || listItems.length === 0) {
    return null;
  }

  return (
    <ul className={className}>
      {listItems.map((item, index) => (
        <li key={index} className={itemClassName}>
          {renderItem ? renderItem(item, index) : item}
        </li>
      ))}
    </ul>
  );
}

interface ConditionalContentProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component for conditionally rendering content with fallback
 */
export function ConditionalContent({ 
  condition, 
  children, 
  fallback = null 
}: ConditionalContentProps) {
  return condition ? <>{children}</> : <>{fallback}</>;
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

/**
 * Component for handling loading and error states
 */
export function LoadingState({ 
  isLoading, 
  error, 
  children,
  loadingComponent,
  errorComponent
}: LoadingStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t('common.loading')}</span>
          </div>
        )}
      </>
    );
  }

  if (error) {
    return (
      <>
        {errorComponent || (
          <div className="flex items-center justify-center p-8 text-red-600">
            <div className="text-center">
              <p className="mb-2">{t('common.error')}</p>
              <p className="text-sm text-gray-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                {t('common.retry')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}