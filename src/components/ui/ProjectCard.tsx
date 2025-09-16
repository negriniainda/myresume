import React, { useState } from 'react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onViewDetails(project);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onViewDetails(project);
    }
  };

  return (
    <div
      className={`
        project-card bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer
        transition-smooth focus-ring relative overflow-hidden
        hover:shadow-lg hover:border-blue-300
        ${isHovered ? 'shadow-lg border-blue-300' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${project.title}`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 overflow-hidden" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical' 
        }}>
          {project.title}
        </h3>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {project.industry}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {project.projectType}
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            {project.duration}
          </span>
        </div>
      </div>

      {/* Problem Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Challenge:</h4>
        <p className="text-sm text-gray-600 overflow-hidden" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical' 
        }}>
          {project.problem}
        </p>
      </div>

      {/* Key Results */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Impact:</h4>
        <p className="text-sm text-gray-600 overflow-hidden" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical' 
        }}>
          {project.result}
        </p>
      </div>

      {/* Technologies */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies:</h4>
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
        <span>{project.clientType}</span>
        <span>{project.location}</span>
      </div>

      {/* Hover indicator */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500
        transition-opacity duration-300 rounded-b-lg
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};

export default ProjectCard;