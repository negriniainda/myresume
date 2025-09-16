'use client';

import React from 'react';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';

interface FallbackContentProps {
  primaryContent: any;
  fallbackContent?: any;
  fallbackLanguage?: 'en' | 'pt';
  showFallbackIndicator?: boolean;
  children?: (content: any, isFallback: boolean) => React.ReactNode;
}

/**
 * Component that provides fallback content when primary content is missing
 */
export function FallbackContent({ 
  primaryContent, 
  fallbackContent, 
  fallbackLanguage = 'en',
  showFallbackIndicator = false,
  children
}: FallbackContentProps) {
  const { getContentWithFallback, language } = useContent();
  const { t } = useTranslation();

  const content = React.useMemo(() => {
    // If we have primary content, use it
    if (primaryContent !== null && primaryContent !== undefined) {
      return { data: primaryContent, isFallback: false };
    }

    // Try fallback content
    if (fallbackContent !== null && fallbackContent !== undefined) {
      return { data: fallbackContent, isFallback: true };
    }

    // Try getting content with fallback mechanism
    const fallbackData = getContentWithFallback(
      { [language]: primaryContent, [fallbackLanguage]: fallbackContent },
      fallbackLanguage
    );

    return { 
      data: fallbackData, 
      isFallback: fallbackData !== primaryContent 
    };
  }, [primaryContent, fallbackContent, fallbackLanguage, getContentWithFallback, language]);

  if (!content.data) {
    return (
      <div className="text-gray-500 italic">
        {t('common.error')}
      </div>
    );
  }

  return (
    <div className="relative">
      {children ? children(content.data, content.isFallback) : content.data}
      
      {showFallbackIndicator && content.isFallback && (
        <FallbackIndicator fallbackLanguage={fallbackLanguage} />
      )}
    </div>
  );
}

interface FallbackIndicatorProps {
  fallbackLanguage: 'en' | 'pt';
  className?: string;
}

/**
 * Visual indicator that content is being displayed in fallback language
 */
function FallbackIndicator({ fallbackLanguage, className = '' }: FallbackIndicatorProps) {
  const { t } = useTranslation();
  
  const languageNames = {
    en: t('language.english'),
    pt: t('language.portuguese')
  };

  return (
    <div className={`absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl ${className}`}>
      <span title={`Content shown in ${languageNames[fallbackLanguage]}`}>
        {fallbackLanguage.toUpperCase()}
      </span>
    </div>
  );
}

interface MissingContentProps {
  contentKey: string;
  fallback?: React.ReactNode;
  showError?: boolean;
}

/**
 * Component for handling missing content gracefully
 */
export function MissingContent({ 
  contentKey, 
  fallback, 
  showError = false 
}: MissingContentProps) {
  const { t } = useTranslation();

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <div className="text-red-500 text-sm italic">
        Missing content: {contentKey}
      </div>
    );
  }

  return (
    <div className="text-gray-400 text-sm italic">
      {t('common.loading')}
    </div>
  );
}

interface ContentValidatorProps {
  content: any;
  validator?: (content: any) => boolean;
  children: (content: any) => React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that validates content before rendering
 */
export function ContentValidator({ 
  content, 
  validator, 
  children, 
  fallback 
}: ContentValidatorProps) {
  const isValid = React.useMemo(() => {
    if (validator) {
      return validator(content);
    }
    
    // Default validation: check if content exists and is not empty
    if (content === null || content === undefined) {
      return false;
    }
    
    if (typeof content === 'string') {
      return content.trim().length > 0;
    }
    
    if (Array.isArray(content)) {
      return content.length > 0;
    }
    
    if (typeof content === 'object') {
      return Object.keys(content).length > 0;
    }
    
    return true;
  }, [content, validator]);

  if (!isValid) {
    return fallback ? <>{fallback}</> : <MissingContent contentKey="unknown" />;
  }

  return <>{children(content)}</>;
}

interface ProgressiveFallbackProps {
  contentSources: Array<{
    content: any;
    language?: 'en' | 'pt';
    priority: number;
  }>;
  children: (content: any, source: { language?: string; priority: number }) => React.ReactNode;
}

/**
 * Component that tries multiple content sources in order of priority
 */
export function ProgressiveFallback({ contentSources, children }: ProgressiveFallbackProps) {
  const { language } = useContent();

  const selectedContent = React.useMemo(() => {
    // Sort by priority (higher priority first)
    const sortedSources = [...contentSources].sort((a, b) => b.priority - a.priority);
    
    // First, try to find content in current language
    const currentLanguageContent = sortedSources.find(
      source => source.language === language && 
      source.content !== null && 
      source.content !== undefined
    );
    
    if (currentLanguageContent) {
      return currentLanguageContent;
    }
    
    // Then, try any available content by priority
    const availableContent = sortedSources.find(
      source => source.content !== null && source.content !== undefined
    );
    
    return availableContent || { content: null, priority: 0 };
  }, [contentSources, language]);

  if (!selectedContent.content) {
    return <MissingContent contentKey="progressive-fallback" />;
  }

  return <>{children(selectedContent.content, selectedContent)}</>;
}