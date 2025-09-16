import React, { useState } from 'react';

interface FilterTagsProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  maxVisible?: number;
}

const FilterTags: React.FC<FilterTagsProps> = ({ 
  title, 
  options, 
  selectedOptions, 
  onChange, 
  maxVisible = 5 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (option: string) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelected);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const visibleOptions = isExpanded ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {selectedOptions.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {visibleOptions.map((option) => {
          const isSelected = selectedOptions.includes(option);
          return (
            <button
              key={option}
              onClick={() => handleToggle(option)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              `}
            >
              {option}
              {isSelected && (
                <span className="ml-1">×</span>
              )}
            </button>
          );
        })}
        
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {isExpanded ? 'Show less' : `+${options.length - maxVisible} more`}
          </button>
        )}
      </div>
      
      {selectedOptions.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {selectedOptions.length} selected
        </div>
      )}
    </div>
  );
};

export default FilterTags;
