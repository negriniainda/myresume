import React, { useState, useEffect } from 'react';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';
import useFilters from '../../hooks/useFilters';
import { ExperienceItem, Project, Skill } from '../../types';

interface FilteredContentProps<T> {
  data: T[];
  type: 'experience' | 'projects' | 'skills';
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  itemsPerPage?: number;
  sortOptions?: Array<{
    label: string;
    value: string;
    sortFn: (a: T, b: T) => number;
  }>;
}

const FilteredContent = <T extends ExperienceItem | Project | Skill>({
  data,
  type,
  renderItem,
  renderEmpty,
  className = '',
  showSearch = true,
  showFilters = true,
  itemsPerPage = 10,
  sortOptions = []
}: FilteredContentProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(sortOptions[0]?.value || '');

  // Prepare data for the filters hook based on type
  const experienceData = type === 'experience' ? (data as ExperienceItem[]) : undefined;
  const projectsData = type === 'projects' ? (data as Project[]) : undefined;
  const skillsData = type === 'skills' ? (data as Skill[]) : undefined;

  const {
    filters,
    filterOptions,
    filteredExperience,
    filteredProjects,
    filteredSkills,
    updateFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount
  } = useFilters(experienceData, projectsData, skillsData);

  // Get filtered results based on type
  const getFilteredResults = () => {
    switch (type) {
      case 'experience':
        return filteredExperience;
      case 'projects':
        return filteredProjects;
      case 'skills':
        return filteredSkills;
      default:
        return { items: [], totalCount: 0, filteredCount: 0, appliedFilters: [] };
    }
  };

  const filteredResults = getFilteredResults();
  const { items, totalCount, filteredCount, appliedFilters } = filteredResults;

  // Apply sorting
  const sortedItems = React.useMemo(() => {
    if (!sortBy || sortOptions.length === 0) return items;
    
    const sortOption = sortOptions.find(option => option.value === sortBy);
    if (!sortOption) return items;
    
    return [...items].sort(sortOption.sortFn);
  }, [items, sortBy, sortOptions]);

  // Apply pagination
  const paginatedItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    updateFilter('searchTerm', searchTerm);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of content
    const element = document.getElementById(`filtered-content-${type}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 ${
            i === currentPage
              ? 'bg-blue-50 text-blue-600 border-blue-500'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} results
        </div>
        <div className="flex">{pages}</div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (renderEmpty) {
      return renderEmpty();
    }

    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {hasActiveFilters ? 'No results found' : `No ${type} available`}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {hasActiveFilters 
            ? 'Try adjusting your filters to see more results.'
            : `There are no ${type} items to display.`
          }
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  };

  return (
    <div id={`filtered-content-${type}`} className={`space-y-6 ${className}`}>
      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {showSearch && (
          <div className="flex-1 max-w-md">
            <SearchBar
              value={filters.searchTerm}
              onChange={handleSearch}
              placeholder={`Search ${type}...`}
            />
          </div>
        )}
        
        {sortOptions.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={updateFilter}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
          mode={type}
        />
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {filteredCount === totalCount ? (
            `${totalCount} ${type} ${totalCount === 1 ? 'item' : 'items'}`
          ) : (
            `${filteredCount} of ${totalCount} ${type} ${totalCount === 1 ? 'item' : 'items'}`
          )}
        </div>
        
        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {appliedFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {filter}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {paginatedItems.length > 0 ? (
        <div className="space-y-4">
          {paginatedItems.map((item, index) => renderItem(item, index))}
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default FilteredContent;