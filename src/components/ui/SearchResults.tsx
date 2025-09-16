import React from 'react';
import { GlobalSearchResult } from '../../hooks/useSearch';

interface SearchResultsProps {
  results: GlobalSearchResult[];
  searchTerm: string;
  onResultClick?: (result: GlobalSearchResult) => void;
  highlightText: (text: string, matches: any[]) => string;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchTerm,
  onResultClick,
  highlightText,
  className = ''
}) => {
  const getSectionIcon = (type: GlobalSearchResult['type']) => {
    switch (type) {
      case 'experience':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        );
      case 'education':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case 'skills':
        return (
          <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'projects':
        return (
          <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'summary':
        return (
          <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'activities':
        return (
          <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 10) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleResultClick = (result: GlobalSearchResult) => {
    onResultClick?.(result);
    
    // Scroll to the section if it exists
    const sectionId = result.type === 'experience' ? 'experience' :
                     result.type === 'education' ? 'education' :
                     result.type === 'skills' ? 'skills' :
                     result.type === 'projects' ? 'projects' :
                     result.type === 'summary' ? 'summary' :
                     result.type === 'activities' ? 'activities' : null;
    
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search terms or browse the sections directly.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Search Results
        </h3>
        <span className="text-sm text-gray-500">
          {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchTerm}"
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={`${result.type}-${result.id}-${index}`}
            onClick={() => handleResultClick(result)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getSectionIcon(result.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {result.section}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(result.score)}`}>
                      Score: {result.score}
                    </span>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <h4 
                  className="text-base font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.title, result.matches) 
                  }}
                />
                
                <p 
                  className="text-sm text-gray-600 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.content, result.matches) 
                  }}
                />
                
                {result.matches.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.matches.slice(0, 3).map((match, matchIndex) => (
                      <span
                        key={matchIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                      >
                        {match.field === 'title' ? 'Title' : 'Content'} match
                      </span>
                    ))}
                    {result.matches.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-600">
                        +{result.matches.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;