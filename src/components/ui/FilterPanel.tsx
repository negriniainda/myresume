import React, { useState } from 'react';
import FilterTags from './FilterTags';
import useFilters, { FilterState } from '../../hooks/useFilters';

interface FilterPanelProps {
  filters: FilterState;
  filterOptions: {
    roleTypes: string[];
    industries: string[];
    companySizes: string[];
    technologies: string[];
    companies: string[];
    skillLevels: Array<'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'>;
    skillCategories: string[];
    projectTypes: string[];
    clientTypes: string[];
    projectIndustries: string[];
  };
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  className?: string;
  mode?: 'experience' | 'projects' | 'skills' | 'all';
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearAll,
  activeFilterCount,
  className = '',
  mode = 'all'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'experience' | 'projects' | 'skills'>('experience');

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFilterChange('dateRange', {
      ...filters.dateRange,
      [field]: value || undefined
    });
  };

  const renderExperienceFilters = () => (
    <div className="space-y-4">
      <FilterTags
        title="Role Type"
        options={filterOptions.roleTypes}
        selectedOptions={filters.roleTypes}
        onChange={(selected) => onFilterChange('roleTypes', selected)}
      />
      
      <FilterTags
        title="Industry"
        options={filterOptions.industries}
        selectedOptions={filters.industries}
        onChange={(selected) => onFilterChange('industries', selected)}
      />
      
      <FilterTags
        title="Company Size"
        options={filterOptions.companySizes}
        selectedOptions={filters.companySizes}
        onChange={(selected) => onFilterChange('companySizes', selected)}
      />
      
      <FilterTags
        title="Company"
        options={filterOptions.companies}
        selectedOptions={filters.companies}
        onChange={(selected) => onFilterChange('companies', selected)}
        maxVisible={3}
      />
      
      <FilterTags
        title="Technologies"
        options={filterOptions.technologies}
        selectedOptions={filters.technologies}
        onChange={(selected) => onFilterChange('technologies', selected)}
        maxVisible={8}
      />
      
      {/* Date Range Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="number"
              placeholder="2020"
              value={filters.dateRange.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="number"
              placeholder="2023"
              value={filters.dateRange.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectsFilters = () => (
    <div className="space-y-4">
      <FilterTags
        title="Project Type"
        options={filterOptions.projectTypes}
        selectedOptions={filters.projectTypes}
        onChange={(selected) => onFilterChange('projectTypes', selected)}
      />
      
      <FilterTags
        title="Client Type"
        options={filterOptions.clientTypes}
        selectedOptions={filters.clientTypes}
        onChange={(selected) => onFilterChange('clientTypes', selected)}
      />
      
      <FilterTags
        title="Industry"
        options={filterOptions.projectIndustries}
        selectedOptions={filters.projectIndustries}
        onChange={(selected) => onFilterChange('projectIndustries', selected)}
      />
      
      <FilterTags
        title="Technologies"
        options={filterOptions.technologies}
        selectedOptions={filters.technologies}
        onChange={(selected) => onFilterChange('technologies', selected)}
        maxVisible={8}
      />
    </div>
  );

  const renderSkillsFilters = () => (
    <div className="space-y-4">
      <FilterTags
        title="Skill Level"
        options={filterOptions.skillLevels}
        selectedOptions={filters.skillLevels}
        onChange={(selected) => onFilterChange('skillLevels', selected)}
      />
      
      <FilterTags
        title="Category"
        options={filterOptions.skillCategories}
        selectedOptions={filters.skillCategories}
        onChange={(selected) => onFilterChange('skillCategories', selected)}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'experience':
        return renderExperienceFilters();
      case 'projects':
        return renderProjectsFilters();
      case 'skills':
        return renderSkillsFilters();
      default:
        return null;
    }
  };

  const getTabCount = (tab: 'experience' | 'projects' | 'skills') => {
    switch (tab) {
      case 'experience':
        return filters.roleTypes.length + filters.industries.length + 
               filters.companySizes.length + filters.companies.length +
               (Object.keys(filters.dateRange).length > 0 ? 1 : 0);
      case 'projects':
        return filters.projectTypes.length + filters.clientTypes.length + 
               filters.projectIndustries.length;
      case 'skills':
        return filters.skillLevels.length + filters.skillCategories.length;
      default:
        return 0;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                {activeFilterCount} active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 focus:outline-none touch-manipulation px-1"
              >
                Clear all
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none touch-manipulation"
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <svg 
                className={`h-4 w-4 sm:h-5 sm:w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4">
          {mode === 'all' ? (
            <>
              {/* Tabs */}
              <div className="flex space-x-0.5 sm:space-x-1 mb-3 sm:mb-4 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                {(['experience', 'projects', 'skills'] as const).map((tab) => {
                  const count = getTabCount(tab);
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 touch-manipulation ${
                        activeTab === tab
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="capitalize truncate">{tab}</span>
                      {count > 0 && (
                        <span className={`ml-1 inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </>
          ) : (
            // Single mode content
            <div>
              {mode === 'experience' && renderExperienceFilters()}
              {mode === 'projects' && renderProjectsFilters()}
              {mode === 'skills' && renderSkillsFilters()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;