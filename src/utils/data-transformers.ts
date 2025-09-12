import type {
  ResumeData,
  Project,
  ExperienceItem,
  SkillCategory,
  Skill,
  EnhancedExperienceItem,
  EnhancedProject,
  SkillWithMetadata,
  SupportedLanguage,
} from '@/types';

/**
 * Utility functions for transforming and enhancing data structures
 */

/**
 * Enhance experience items with additional metadata
 */
export function enhanceExperienceItems(
  experience: ExperienceItem[]
): EnhancedExperienceItem[] {
  return experience.map(exp => {
    const enhanced: EnhancedExperienceItem = {
      ...exp,
      companySize: inferCompanySize(exp.company, exp.teamSize),
      industry: inferIndustry(exp.company, exp.description),
      roleType: inferRoleType(exp.position, exp.description),
      remote: inferRemoteWork(exp.location, exp.description),
      highlights: extractHighlights(exp.achievements, exp.description),
    };

    return enhanced;
  });
}

/**
 * Enhance projects with additional metadata
 */
export function enhanceProjects(projects: Project[]): EnhancedProject[] {
  return projects.map(project => {
    const enhanced: EnhancedProject = {
      ...project,
      status: 'Completed', // Default to completed for historical projects
      complexity: inferComplexity(project.action, project.technologies),
      impact: inferImpact(project.result),
      clientSatisfaction: inferSatisfaction(project.result),
      tags: generateProjectTags(project),
    };

    return enhanced;
  });
}

/**
 * Enhance skills with metadata
 */
export function enhanceSkills(
  skillCategories: SkillCategory[],
  experience: ExperienceItem[],
  projects: Project[]
): SkillCategory[] {
  const skillUsage = calculateSkillUsage(experience, projects);
  
  return skillCategories.map(category => ({
    ...category,
    skills: category.skills.map(skill => {
      const usage = skillUsage.get(skill.name) || { projects: [], lastUsed: undefined };
      
      const enhanced: SkillWithMetadata = {
        ...skill,
        lastUsed: usage.lastUsed,
        projects: usage.projects,
        trending: isTrendingSkill(skill.name),
        certifications: [], // Would be populated from external data
      };

      return enhanced;
    }),
  }));
}

/**
 * Transform resume data for different display contexts
 */
export function transformResumeForContext(
  resume: ResumeData,
  context: 'summary' | 'detailed' | 'technical' | 'executive'
): Partial<ResumeData> {
  switch (context) {
    case 'summary':
      return {
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        experience: resume.experience.slice(0, 3), // Top 3 experiences
        skills: resume.skills.slice(0, 2), // Top 2 skill categories
      };

    case 'technical':
      return {
        personalInfo: resume.personalInfo,
        skills: resume.skills,
        experience: resume.experience.filter(exp => 
          exp.technologies.length > 0
        ),
        education: resume.education.filter(edu => 
          edu.degree.toLowerCase().includes('computer') ||
          edu.degree.toLowerCase().includes('engineering') ||
          edu.degree.toLowerCase().includes('science')
        ),
      };

    case 'executive':
      return {
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        experience: resume.experience.filter(exp => {
          const enhanced = exp as EnhancedExperienceItem;
          return enhanced.roleType === 'Manager' || 
                 enhanced.roleType === 'Director' || 
                 enhanced.roleType === 'Executive';
        }),
      };

    case 'detailed':
    default:
      return resume;
  }
}

/**
 * Group projects by various criteria
 */
export function groupProjects(
  projects: Project[],
  groupBy: 'industry' | 'clientType' | 'projectType' | 'year'
): Record<string, Project[]> {
  const groups: Record<string, Project[]> = {};

  projects.forEach(project => {
    let key: string;

    switch (groupBy) {
      case 'industry':
        key = project.industry;
        break;
      case 'clientType':
        key = project.clientType;
        break;
      case 'projectType':
        key = project.projectType;
        break;
      case 'year':
        key = extractYearFromDuration(project.duration);
        break;
      default:
        key = 'Other';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(project);
  });

  return groups;
}

/**
 * Create timeline data from experience
 */
export function createExperienceTimeline(experience: ExperienceItem[]): Array<{
  year: number;
  events: Array<{
    type: 'start' | 'end';
    position: string;
    company: string;
    experience: ExperienceItem;
  }>;
}> {
  const timeline: Map<number, Array<{
    type: 'start' | 'end';
    position: string;
    company: string;
    experience: ExperienceItem;
  }>> = new Map();

  experience.forEach(exp => {
    const startYear = parseInt(exp.period.start);
    const endYear = exp.period.end === 'Present' ? 
      new Date().getFullYear() : parseInt(exp.period.end);

    // Add start event
    if (!timeline.has(startYear)) {
      timeline.set(startYear, []);
    }
    timeline.get(startYear)!.push({
      type: 'start',
      position: exp.position,
      company: exp.company,
      experience: exp,
    });

    // Add end event (if not current)
    if (exp.period.end !== 'Present') {
      if (!timeline.has(endYear)) {
        timeline.set(endYear, []);
      }
      timeline.get(endYear)!.push({
        type: 'end',
        position: exp.position,
        company: exp.company,
        experience: exp,
      });
    }
  });

  return Array.from(timeline.entries())
    .map(([year, events]) => ({ year, events }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Calculate skill progression over time
 */
export function calculateSkillProgression(
  skills: Skill[],
  experience: ExperienceItem[]
): Array<{
  skill: string;
  progression: Array<{ year: number; level: string; context: string }>;
}> {
  const progressions: Map<string, Array<{ year: number; level: string; context: string }>> = new Map();

  skills.forEach(skill => {
    const skillProgression: Array<{ year: number; level: string; context: string }> = [];

    // Find experiences that mention this skill
    experience.forEach(exp => {
      if (exp.technologies.includes(skill.name)) {
        const year = parseInt(exp.period.start);
        skillProgression.push({
          year,
          level: skill.level,
          context: `${exp.position} at ${exp.company}`,
        });
      }
    });

    if (skillProgression.length > 0) {
      progressions.set(skill.name, skillProgression.sort((a, b) => a.year - b.year));
    }
  });

  return Array.from(progressions.entries()).map(([skill, progression]) => ({
    skill,
    progression,
  }));
}

/**
 * Generate content for different languages
 */
export function adaptContentForLanguage(
  content: string,
  targetLanguage: SupportedLanguage
): string {
  if (targetLanguage === 'pt') {
    // Apply Portuguese-specific formatting and terminology
    return content
      .replace(/\bCEO\b/g, 'Diretor Executivo')
      .replace(/\bCTO\b/g, 'Diretor de Tecnologia')
      .replace(/\bManager\b/g, 'Gerente')
      .replace(/\bSenior\b/g, 'Sênior')
      .replace(/\bJunior\b/g, 'Júnior')
      .replace(/\bLead\b/g, 'Líder')
      .replace(/\bDeveloper\b/g, 'Desenvolvedor')
      .replace(/\bEngineer\b/g, 'Engenheiro')
      .replace(/\bAnalyst\b/g, 'Analista')
      .replace(/\bConsultant\b/g, 'Consultor');
  }

  return content;
}

// Helper functions

function inferCompanySize(
  company: string,
  teamSize?: number
): EnhancedExperienceItem['companySize'] {
  // Known large companies
  const largeCompanies = ['Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'IBM'];
  const enterpriseCompanies = ['Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG'];

  if (enterpriseCompanies.some(name => company.includes(name))) {
    return 'Enterprise';
  }

  if (largeCompanies.some(name => company.includes(name))) {
    return 'Large';
  }

  if (teamSize) {
    if (teamSize > 1000) return 'Enterprise';
    if (teamSize > 250) return 'Large';
    if (teamSize > 50) return 'Medium';
    if (teamSize > 10) return 'Small';
    return 'Startup';
  }

  // Default inference based on company name patterns
  if (company.toLowerCase().includes('startup') || 
      company.toLowerCase().includes('inc.')) {
    return 'Startup';
  }

  return 'Medium'; // Default assumption
}

function inferIndustry(company: string, description: string): string {
  const industryKeywords = {
    'Technology': ['software', 'tech', 'digital', 'AI', 'machine learning', 'cloud'],
    'Finance': ['bank', 'financial', 'investment', 'trading', 'fintech'],
    'Healthcare': ['health', 'medical', 'hospital', 'pharmaceutical', 'biotech'],
    'Retail': ['retail', 'e-commerce', 'shopping', 'consumer'],
    'Manufacturing': ['manufacturing', 'production', 'industrial', 'automotive'],
    'Consulting': ['consulting', 'advisory', 'strategy', 'transformation'],
    'Education': ['education', 'university', 'school', 'learning', 'training'],
    'Media': ['media', 'entertainment', 'publishing', 'broadcasting'],
  };

  const combinedText = `${company} ${description}`.toLowerCase();

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return industry;
    }
  }

  return 'Other';
}

function inferRoleType(
  position: string,
  description: string
): EnhancedExperienceItem['roleType'] {
  const positionLower = position.toLowerCase();
  const descriptionLower = description.toLowerCase();

  if (positionLower.includes('ceo') || positionLower.includes('president') ||
      positionLower.includes('founder')) {
    return 'Executive';
  }

  if (positionLower.includes('director') || positionLower.includes('vp') ||
      positionLower.includes('vice president')) {
    return 'Director';
  }

  if (positionLower.includes('manager') || positionLower.includes('head of') ||
      descriptionLower.includes('managing team') || 
      descriptionLower.includes('leading team')) {
    return 'Manager';
  }

  if (positionLower.includes('lead') || positionLower.includes('senior') ||
      descriptionLower.includes('mentoring') || 
      descriptionLower.includes('technical leadership')) {
    return 'Team Lead';
  }

  return 'Individual Contributor';
}

function inferRemoteWork(location: string, description: string): boolean {
  const remoteKeywords = ['remote', 'distributed', 'home office', 'virtual'];
  const combinedText = `${location} ${description}`.toLowerCase();
  
  return remoteKeywords.some(keyword => combinedText.includes(keyword));
}

function extractHighlights(achievements: any[], description: string): string[] {
  const highlights: string[] = [];

  // Extract from achievements
  if (achievements && Array.isArray(achievements)) {
    achievements.forEach(achievement => {
      if (typeof achievement === 'object' && achievement.description) {
        highlights.push(achievement.description);
      } else if (typeof achievement === 'string') {
        highlights.push(achievement);
      }
    });
  }

  // Extract quantifiable results from description
  const quantifiablePatterns = [
    /\d+%\s+\w+/g,
    /\$[\d,]+/g,
    /\d+\+\s+\w+/g,
    /increased.*by.*\d+/gi,
    /reduced.*by.*\d+/gi,
    /improved.*by.*\d+/gi,
  ];

  quantifiablePatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      highlights.push(...matches);
    }
  });

  return [...new Set(highlights)]; // Remove duplicates
}

function inferComplexity(
  action: string,
  technologies?: string[]
): EnhancedProject['complexity'] {
  const complexityIndicators = {
    'Very High': ['architecture', 'enterprise', 'scalable', 'distributed', 'microservices'],
    'High': ['integration', 'migration', 'transformation', 'optimization'],
    'Medium': ['development', 'implementation', 'enhancement', 'automation'],
    'Low': ['maintenance', 'support', 'configuration', 'documentation'],
  };

  const actionLower = action.toLowerCase();
  const techCount = technologies?.length || 0;

  // Check for complexity indicators in action description
  for (const [level, indicators] of Object.entries(complexityIndicators)) {
    if (indicators.some(indicator => actionLower.includes(indicator))) {
      return level as EnhancedProject['complexity'];
    }
  }

  // Infer from technology count
  if (techCount > 8) return 'Very High';
  if (techCount > 5) return 'High';
  if (techCount > 2) return 'Medium';
  return 'Low';
}

function inferImpact(result: string): EnhancedProject['impact'] {
  const impactKeywords = {
    'Very High': ['transformed', 'revolutionized', 'breakthrough', 'game-changing'],
    'High': ['significant', 'substantial', 'major', 'dramatic'],
    'Medium': ['improved', 'enhanced', 'increased', 'optimized'],
    'Low': ['maintained', 'supported', 'assisted', 'contributed'],
  };

  const resultLower = result.toLowerCase();

  for (const [level, keywords] of Object.entries(impactKeywords)) {
    if (keywords.some(keyword => resultLower.includes(keyword))) {
      return level as EnhancedProject['impact'];
    }
  }

  // Check for quantifiable metrics
  if (result.match(/\d+%/) || result.match(/\$[\d,]+/)) {
    return 'High';
  }

  return 'Medium';
}

function inferSatisfaction(result: string): number {
  // Simple satisfaction inference based on result description
  const positiveKeywords = ['successful', 'exceeded', 'outstanding', 'excellent'];
  const negativeKeywords = ['challenges', 'issues', 'problems', 'difficulties'];

  const resultLower = result.toLowerCase();
  let score = 3; // Default neutral score

  positiveKeywords.forEach(keyword => {
    if (resultLower.includes(keyword)) score += 0.5;
  });

  negativeKeywords.forEach(keyword => {
    if (resultLower.includes(keyword)) score -= 0.5;
  });

  return Math.max(1, Math.min(5, Math.round(score * 2) / 2)); // Round to nearest 0.5
}

function generateProjectTags(project: Project): string[] {
  const tags: string[] = [];

  // Add industry tag
  tags.push(project.industry);

  // Add client type tag
  tags.push(project.clientType);

  // Add project type tag
  tags.push(project.projectType);

  // Add technology tags
  if (project.technologies) {
    tags.push(...project.technologies);
  }

  // Add duration-based tags
  const durationMatch = project.duration.match(/(\d+)/);
  if (durationMatch) {
    const months = parseInt(durationMatch[1]);
    if (months <= 3) tags.push('Short-term');
    else if (months <= 12) tags.push('Medium-term');
    else tags.push('Long-term');
  }

  return [...new Set(tags)]; // Remove duplicates
}

function calculateSkillUsage(
  experience: ExperienceItem[],
  projects: Project[]
): Map<string, { projects: string[]; lastUsed?: string }> {
  const skillUsage = new Map<string, { projects: string[]; lastUsed?: string }>();

  // Track skill usage in experience
  experience.forEach(exp => {
    exp.technologies.forEach(tech => {
      const current = skillUsage.get(tech) || { projects: [] };
      skillUsage.set(tech, {
        ...current,
        lastUsed: exp.period.end === 'Present' ? 'Current' : exp.period.end,
      });
    });
  });

  // Track skill usage in projects
  projects.forEach(project => {
    if (project.technologies) {
      project.technologies.forEach(tech => {
        const current = skillUsage.get(tech) || { projects: [] };
        current.projects.push(project.id);
        skillUsage.set(tech, current);
      });
    }
  });

  return skillUsage;
}

function isTrendingSkill(skillName: string): boolean {
  // Mock trending skills - in real implementation, this would be based on market data
  const trendingSkills = [
    'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'GraphQL', 'Next.js', 'Tailwind CSS', 'Prisma', 'Supabase',
    'Machine Learning', 'AI', 'Python', 'Go', 'Rust'
  ];

  return trendingSkills.includes(skillName);
}

function extractYearFromDuration(duration: string): string {
  // Extract year from duration string (e.g., "6 months (2023)" -> "2023")
  const yearMatch = duration.match(/\((\d{4})\)/);
  if (yearMatch) {
    return yearMatch[1];
  }

  // If no year in parentheses, try to infer from current date
  const currentYear = new Date().getFullYear();
  return currentYear.toString();
}