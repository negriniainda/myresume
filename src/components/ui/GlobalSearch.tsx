import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import useSearch, { GlobalSearchResult } from '../../hooks/useSearch';
import { useContent } from '../../hooks/useContent';
import { useProjects } from '../../hooks/useProjects';

interface GlobalSearchProps {
  className?: string;
  onResultSelect?: (result: GlobalSearchResult) => void;
  placeholder?: string;
  showResultsInModal?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = '',
  onResultSelect,
  placeholder = "Search across all sections...",
  showResultsInModal = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Get data from hooks
  const { resumeData } = useContent();
  const { projects } = useProjects();
  
  // Initialize search hook with data
  const {
    searchTerm,
    results,
    suggestions,
    isSearching,
    search,
    clearSearch,
    highlightText,
    hasResults,
    resultCount
  } = useSearch(resumeData, projects);

  // Handle search input
  const handleSearch = (term: string) => {
    search(term);
    setShowResults(term.length > 0);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    search(suggestion);
    setShowResults(true);
    setIsExpanded(true);
  };

  // Handle result click
  const handleResultClick = (result: GlobalSearchResult) => {
    onResultSelect?.(result);
    
    // Close search if in modal mode
    if (showResultsInModal) {
      setShowResults(false);
      setIsExpanded(false);
    }
  };

  // Handle clear search
  const handleClear = () => {
    clearSearch();
    setShowResults(false);
    setIsExpanded(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsExpanded(true);
        
        // Focus the search input
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to close search
      if (event.key === 'Escape' && (isExpanded || showResults)) {
        event.preventDefault();
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, showResults]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('global-search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        if (showResults && !showResultsInModal) {
          setShowResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResults, showResultsInModal]);

  return (
    <div id="global-search-container" className={`relative ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          onSearch={handleSearch}
          placeholder={placeholder}
          suggestions={suggestions}
          isSearching={isSearching}
          showSuggestions={!showResults}
          onSuggestionSelect={handleSuggestionSelect}
          className="w-full"
        />
        
        {/* Search shortcut hint */}
        {!isExpanded && !searchTerm && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center space-x-1 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">K</kbd>
          </div>
        )}
      </div>

      {/* Results Count */}
      {hasResults && (
        <div className="mt-2 text-xs sm:text-sm text-gray-600 px-1">
          Found {resultCount} {resultCount === 1 ? 'result' : 'results'}
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className={`mt-3 sm:mt-4 ${showResultsInModal ? 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4' : ''}`}>
          {showResultsInModal ? (
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Search Results</h2>
                  <button
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 touch-manipulation"
                    aria-label="Close search"
                  >
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[65vh] sm:max-h-[60vh]">
                <SearchResults
                  results={results}
                  searchTerm={searchTerm}
                  onResultClick={handleResultClick}
                  highlightText={highlightText}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
              <SearchResults
                results={results}
                searchTerm={searchTerm}
                onResultClick={handleResultClick}
                highlightText={highlightText}
              />
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;