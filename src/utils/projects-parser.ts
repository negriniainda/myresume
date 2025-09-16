import type { Project } from '@/types';

/**
 * Parse projects from markdown content
 */
export function parseProjectsFromMarkdown(markdownContent: string): Project[] {
  const projects: Project[] = [];
  
  // Split content by project headers (## followed by project title)
  const projectSections = markdownContent.split(/^## (.+)$/gm);
  
  // Remove the first empty section and process pairs of title + content
  for (let i = 1; i < projectSections.length; i += 2) {
    const title = projectSections[i].trim();
    const content = projectSections[i + 1]?.trim() || '';
    
    if (title && content) {
      const project = parseProjectSection(title, content);
      if (project) {
        projects.push(project);
      }
    }
  }
  
  return projects;
}

/**
 * Parse individual project section
 */
function parseProjectSection(title: string, content: string): Project | null {
  try {
    const project: Partial<Project> = {
      id: generateProjectId(title),
      title,
    };

    // Parse metadata fields
    const metadataRegex = /\*\*([^:]+):\*\* (.+)/g;
    let match;
    
    while ((match = metadataRegex.exec(content)) !== null) {
      const key = match[1].trim();
      const value = match[2].trim();
      
      switch (key) {
        case 'Duration':
          project.duration = value;
          break;
        case 'Location':
          project.location = value;
          break;
        case 'Client Type':
          project.clientType = value;
          break;
        case 'Project Type':
          project.projectType = value;
          break;
        case 'Industry':
          project.industry = value;
          break;
        case 'Business Unit':
          project.businessUnit = value;
          break;
      }
    }

    // Parse Problem, Action, Result sections
    const problemMatch = content.match(/\*\*Problem:\*\* (.+?)(?=\*\*Action:\*\*)/s);
    if (problemMatch) {
      project.problem = problemMatch[1].trim();
    }

    const actionMatch = content.match(/\*\*Action:\*\* (.+?)(?=\*\*Result:\*\*)/s);
    if (actionMatch) {
      project.action = actionMatch[1].trim();
    }

    const resultMatch = content.match(/\*\*Result:\*\* (.+?)$/s);
    if (resultMatch) {
      project.result = resultMatch[1].trim();
    }

    // Extract technologies from action and result sections
    project.technologies = extractTechnologies(project.action || '', project.result || '');

    // Validate required fields
    if (project.title && project.duration && project.location && 
        project.clientType && project.projectType && project.industry && 
        project.businessUnit && project.problem && project.action && project.result) {
      return project as Project;
    }

    return null;
  } catch (error) {
    console.error(`Error parsing project "${title}":`, error);
    return null;
  }
}

/**
 * Generate a unique ID for a project based on its title
 */
function generateProjectId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Extract technology names from text content
 */
function extractTechnologies(action: string, result: string): string[] {
  const text = `${action} ${result}`.toLowerCase();
  const technologies = new Set<string>();
  
  // Common technology patterns
  const techPatterns = [
    // Programming languages
    /\b(javascript|typescript|python|java|c#|php|ruby|go|rust|swift|kotlin)\b/g,
    // Frameworks and libraries
    /\b(react|angular|vue|next\.js|express|django|spring|laravel|rails)\b/g,
    // Databases
    /\b(mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra)\b/g,
    // Cloud platforms
    /\b(aws|azure|gcp|google cloud|amazon web services)\b/g,
    // DevOps tools
    /\b(docker|kubernetes|jenkins|terraform|ansible|prometheus|grafana)\b/g,
    // Other technologies
    /\b(microservices|rest api|graphql|blockchain|machine learning|tensorflow|apache kafka)\b/g,
  ];

  techPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      technologies.add(capitalizeFirst(match[1]));
    }
  });

  // Additional specific technology extraction
  const specificTechs = [
    'React Native', 'Node.js', 'Spring Boot', 'Apache Kafka', 
    'TensorFlow', 'D3.js', 'CI/CD', 'REST APIs'
  ];

  specificTechs.forEach(tech => {
    if (text.includes(tech.toLowerCase())) {
      technologies.add(tech);
    }
  });

  return Array.from(technologies).sort();
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Load projects data from markdown file
 */
export async function loadProjectsFromFile(): Promise<Project[]> {
  try {
    // In a real implementation, this would read from the actual file
    // For now, we'll use a mock implementation that would be replaced with actual file reading
    const response = await fetch('/src/data/projects.md');
    const markdownContent = await response.text();
    return parseProjectsFromMarkdown(markdownContent);
  } catch (error) {
    console.error('Error loading projects from file:', error);
    return [];
  }
}