// Type definitions for the bilingual resume project

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location: string;
  period: {
    start: string;
    end: string;
  };
  description: string;
  achievements: Achievement[];
  technologies: string[];
  teamSize?: number;
  budget?: string;
  responsibilities?: string[];
  companySize?: 'Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise';
  industry?: string;
  roleType?: 'Individual Contributor' | 'Team Lead' | 'Manager' | 'Director' | 'Executive';
}

export interface Achievement {
  metric: string;
  description: string;
  impact?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period: {
    start: string;
    end: string;
  };
  description?: string;
  gpa?: string;
  honors?: string[];
  certifications?: string[];
  type?: 'degree' | 'certification' | 'course';
}

export interface Skill {
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
  yearsOfExperience?: number;
  category?: string;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface Language {
  name: string;
  proficiency: string;
  level?: string;
}

export interface Project {
  id: string;
  title: string;
  duration: string;
  location: string;
  clientType: string;
  projectType: string;
  industry: string;
  businessUnit: string;
  problem: string;
  action: string;
  result: string;
  technologies?: string[];
  teamSize?: string;
  budget?: string;
}

export interface QualificationSummary {
  title: string;
  items: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  objective?: string;
  summary: QualificationSummary;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  languages: Language[];
  activities: string[];
}

export interface ParsedMarkdownSection {
  title: string;
  content: string;
  level: number;
}

export interface MarkdownParseResult {
  frontMatter: Record<string, unknown>;
  sections: ParsedMarkdownSection[];
  rawContent: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}

export type SupportedLanguage = 'en' | 'pt';

// Data management interfaces
export interface DataCache<T> {
  data: T;
  timestamp: number;
  version: string;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  version: string; // Data version for cache invalidation
}

export interface DataLoadOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
  language?: SupportedLanguage;
}

export interface FilterOptions {
  searchTerm?: string;
  technologies?: string[];
  industries?: string[];
  roles?: string[];
  companies?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  skillLevels?: Array<'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'>;
  projectTypes?: string[];
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
}

export interface DataTransformOptions {
  includeMetrics?: boolean;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface TransformedData<T> {
  data: T[];
  metadata: {
    total: number;
    filtered: number;
    transformedAt: number;
  };
}

// Enhanced interfaces for better data management
export interface EnhancedExperienceItem extends ExperienceItem {
  companySize?: 'Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise';
  industry?: string;
  roleType?: 'Individual Contributor' | 'Team Lead' | 'Manager' | 'Director' | 'Executive';
  remote?: boolean;
  highlights?: string[];
}

export interface EnhancedProject extends Project {
  status?: 'Completed' | 'In Progress' | 'Cancelled' | 'On Hold';
  complexity?: 'Low' | 'Medium' | 'High' | 'Very High';
  impact?: 'Low' | 'Medium' | 'High' | 'Very High';
  clientSatisfaction?: number; // 1-5 scale
  tags?: string[];
}

export interface SkillWithMetadata extends Skill {
  lastUsed?: string;
  certifications?: string[];
  projects?: string[]; // Project IDs where this skill was used
  trending?: boolean;
}

// Data aggregation interfaces
export interface ExperienceMetrics {
  totalYears: number;
  companiesWorked: number;
  rolesHeld: number;
  industriesExperienced: string[];
  topTechnologies: Array<{ name: string; count: number; years: number }>;
  careerProgression: Array<{ year: string; level: string; company: string }>;
}

export interface ProjectMetrics {
  totalProjects: number;
  industriesCovered: string[];
  averageDuration: number;
  successRate: number;
  topTechnologies: Array<{ name: string; count: number }>;
  clientTypes: Array<{ type: string; count: number }>;
}

export interface SkillMetrics {
  totalSkills: number;
  expertSkills: number;
  advancedSkills: number;
  skillsByCategory: Array<{ category: string; count: number }>;
  trendingSkills: string[];
  yearsOfExperience: Array<{ skill: string; years: number }>;
}
