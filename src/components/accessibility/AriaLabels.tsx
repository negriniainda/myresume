import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface AriaLabelsProps {
  children: React.ReactNode;
  section?: string;
  role?: string;
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  controls?: string;
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  level?: number;
}

const AriaLabels: React.FC<AriaLabelsProps> = ({
  children,
  section,
  role,
  label,
  describedBy,
  expanded,
  controls,
  current,
  level,
}) => {
  const { t } = useTranslation();

  const getAriaLabel = () => {
    if (label) return label;
    
    switch (section) {
      case 'hero':
        return t('aria.hero', 'Personal introduction and contact information');
      case 'summary':
        return t('aria.summary', 'Professional summary and qualifications');
      case 'experience':
        return t('aria.experience', 'Work experience and career history');
      case 'skills':
        return t('aria.skills', 'Technical skills and competencies');
      case 'education':
        return t('aria.education', 'Educational background and certifications');
      case 'projects':
        return t('aria.projects', 'Portfolio of professional projects');
      case 'navigation':
        return t('aria.navigation', 'Main site navigation');
      case 'language-selector':
        return t('aria.languageSelector', 'Language selection');
      case 'search':
        return t('aria.search', 'Search functionality');
      case 'filters':
        return t('aria.filters', 'Content filtering options');
      default:
        return undefined;
    }
  };

  const ariaProps: Record<string, any> = {};

  if (role) ariaProps.role = role;
  if (getAriaLabel()) ariaProps['aria-label'] = getAriaLabel();
  if (describedBy) ariaProps['aria-describedby'] = describedBy;
  if (expanded !== undefined) ariaProps['aria-expanded'] = expanded;
  if (controls) ariaProps['aria-controls'] = controls;
  if (current !== undefined) ariaProps['aria-current'] = current;
  if (level) ariaProps['aria-level'] = level;

  // Add landmark roles for better navigation
  if (section === 'navigation') {
    ariaProps.role = 'navigation';
  } else if (section === 'search') {
    ariaProps.role = 'search';
  } else if (['hero', 'summary', 'experience', 'skills', 'education', 'projects'].includes(section || '')) {
    ariaProps.role = 'region';
  }

  return React.cloneElement(
    React.Children.only(children) as React.ReactElement,
    ariaProps
  );
};

// Specialized components for common patterns
export const AriaButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  describedBy?: string;
  label?: string;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  disabled, 
  pressed, 
  expanded, 
  controls, 
  describedBy, 
  label,
  className = ''
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-pressed={pressed}
    aria-expanded={expanded}
    aria-controls={controls}
    aria-describedby={describedBy}
    aria-label={label}
    className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    type="button"
  >
    {children}
  </button>
);

export const AriaLink: React.FC<{
  children: React.ReactNode;
  href: string;
  external?: boolean;
  current?: boolean;
  label?: string;
  className?: string;
}> = ({ children, href, external, current, label, className = '' }) => {
  const { t } = useTranslation();
  
  return (
    <a
      href={href}
      aria-current={current ? 'page' : undefined}
      aria-label={label}
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      {...(external && {
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${label || children} ${t('aria.opensNewWindow', '(opens in new window)')}`
      })}
    >
      {children}
    </a>
  );
};

export const AriaHeading: React.FC<{
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  id?: string;
}> = ({ children, level, className = '', id }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag
      className={className}
      id={id}
      aria-level={level}
      role="heading"
    >
      {children}
    </Tag>
  );
};

export const AriaList: React.FC<{
  children: React.ReactNode;
  ordered?: boolean;
  label?: string;
  className?: string;
}> = ({ children, ordered = false, label, className = '' }) => {
  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag
      role="list"
      aria-label={label}
      className={className}
    >
      {children}
    </Tag>
  );
};

export const AriaListItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <li role="listitem" className={className}>
    {children}
  </li>
);

export default AriaLabels;