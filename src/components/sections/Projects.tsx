import React, { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/hooks/useTranslation';
import SearchBar from '@/components/ui/SearchBar';
import FilterTags from '@/components/ui/FilterTags';
import ProjectCard from '@/components/ui/ProjectCard';
import ProjectModal from '@/components/ui/ProjectModal';
import { animateListEntrance, animateFilterUpdate } from '@/utils/animations';
import type { Project } from '@/types';

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const {
    filteredProjects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    clearFilters,
    availableFilters,
  } = useProjects();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const previousFilteredCount = useRef(filteredProjects.length);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const hasActiveFilters = Object.values(filters).some(filterArray => filterArray.length > 0) || searchTerm.length > 0;

  // Animate projects when filters change
  useEffect(() => {
    if (gridRef.current && !loading) {
      const currentCount = filteredProjects.length;
      const previousCount = previousFilteredCount.current;

      if (currentCount !== previousCount) {
        animateFilterUpdate(gridRef.current);
        previousFilteredCount.current = currentCount;
      }
    }
  }, [filteredProjects.length, loading]);

  // Animate initial load
  useEffect(() => {
    if (gridRef.current && !loading && filteredProjects.length > 0) {
      const cards = gridRef.current.querySelectorAll('[data-project-card]');
      if (cards.length > 0) {
        animateListEntrance(cards, { stagger: 100 });
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <section id="projects" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Projects</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {String(t('projects.title') || 'Featured Projects')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {String(t('projects.subtitle') || 'Explore a selection of impactful projects showcasing expertise in digital transformation, AI implementation, and system modernization across various industries.')}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t('projects.searchPlaceholder') as string || 'Search projects by title, technology, or industry...'}
              className="max-w-md mx-auto"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out mb-6
            ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FilterTags
                  title="Industry"
                  options={availableFilters.industries}
                  selectedOptions={filters.industries}
                  onChange={(selected) => setFilters({ industries: selected })}
                />
                <FilterTags
                  title="Technologies"
                  options={availableFilters.technologies}
                  selectedOptions={filters.technologies}
                  onChange={(selected) => setFilters({ technologies: selected })}
                />
                <FilterTags
                  title="Project Type"
                  options={availableFilters.projectTypes}
                  selectedOptions={filters.projectTypes}
                  onChange={(selected) => setFilters({ projectTypes: selected })}
                />
                <FilterTags
                  title="Client Type"
                  options={availableFilters.clientTypes}
                  selectedOptions={filters.clientTypes}
                  onChange={(selected) => setFilters({ clientTypes: selected })}
                />
                <FilterTags
                  title="Business Unit"
                  options={availableFilters.businessUnits}
                  selectedOptions={filters.businessUnits}
                  onChange={(selected) => setFilters({ businessUnits: selected })}
                />
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            {filteredProjects.length === 0 ? (
              hasActiveFilters ? (
                <>No projects match your current filters. <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800">Clear filters</button> to see all projects.</>
              ) : (
                'No projects available.'
              )
            ) : (
              <>Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                data-project-card
                style={{
                  animationDelay: `${index * 50}ms`,
                  opacity: loading ? 0 : 1,
                }}
                className="transition-all duration-300 ease-in-out"
              >
                <ProjectCard
                  project={project}
                  onViewDetails={handleViewDetails}
                />
              </div>
            ))}
          </div>
        ) : hasActiveFilters ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all filters
            </button>
          </div>
        ) : null}

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  );
};

export default Projects;
