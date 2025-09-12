import type {
  ResumeData,
  Project,
  ExperienceItem,
  EducationItem,
  PersonalInfo,
  Skill,
  SkillCategory,
  Language,
  ValidationError,
  ParseResult,
} from '@/types';

/**
 * Comprehensive data validation utilities
 */

/**
 * Validate personal information
 */
export function validatePersonalInfo(personalInfo: PersonalInfo): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!personalInfo.name || personalInfo.name.trim().length === 0) {
    errors.push({
      field: 'personalInfo.name',
      message: 'Name is required',
      value: personalInfo.name,
    });
  }

  if (!personalInfo.email || !isValidEmail(personalInfo.email)) {
    errors.push({
      field: 'personalInfo.email',
      message: 'Valid email address is required',
      value: personalInfo.email,
    });
  }

  if (personalInfo.phone && !isValidPhone(personalInfo.phone)) {
    errors.push({
      field: 'personalInfo.phone',
      message: 'Invalid phone number format',
      value: personalInfo.phone,
    });
  }

  if (personalInfo.linkedin && !isValidUrl(personalInfo.linkedin)) {
    errors.push({
      field: 'personalInfo.linkedin',
      message: 'Invalid LinkedIn URL format',
      value: personalInfo.linkedin,
    });
  }

  if (personalInfo.github && !isValidUrl(personalInfo.github)) {
    errors.push({
      field: 'personalInfo.github',
      message: 'Invalid GitHub URL format',
      value: personalInfo.github,
    });
  }

  if (personalInfo.website && !isValidUrl(personalInfo.website)) {
    errors.push({
      field: 'personalInfo.website',
      message: 'Invalid website URL format',
      value: personalInfo.website,
    });
  }

  return errors;
}

/**
 * Validate experience item
 */
export function validateExperienceItem(
  experience: ExperienceItem,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `experience[${index}]`;

  if (!experience.position || experience.position.trim().length === 0) {
    errors.push({
      field: `${prefix}.position`,
      message: 'Position title is required',
      value: experience.position,
    });
  }

  if (!experience.company || experience.company.trim().length === 0) {
    errors.push({
      field: `${prefix}.company`,
      message: 'Company name is required',
      value: experience.company,
    });
  }

  if (!experience.period.start || !isValidYear(experience.period.start)) {
    errors.push({
      field: `${prefix}.period.start`,
      message: 'Valid start year is required',
      value: experience.period.start,
    });
  }

  if (!experience.period.end || 
      (experience.period.end !== 'Present' && !isValidYear(experience.period.end))) {
    errors.push({
      field: `${prefix}.period.end`,
      message: 'Valid end year or "Present" is required',
      value: experience.period.end,
    });
  }

  // Validate date logic
  if (experience.period.start && experience.period.end && 
      experience.period.end !== 'Present') {
    const startYear = parseInt(experience.period.start);
    const endYear = parseInt(experience.period.end);
    
    if (endYear < startYear) {
      errors.push({
        field: `${prefix}.period`,
        message: 'End year cannot be before start year',
        value: `${experience.period.start} - ${experience.period.end}`,
      });
    }
  }

  // Validate future dates
  const currentYear = new Date().getFullYear();
  if (experience.period.start && parseInt(experience.period.start) > currentYear) {
    errors.push({
      field: `${prefix}.period.start`,
      message: 'Start year cannot be in the future',
      value: experience.period.start,
    });
  }

  if (experience.period.end && experience.period.end !== 'Present' && 
      parseInt(experience.period.end) > currentYear) {
    errors.push({
      field: `${prefix}.period.end`,
      message: 'End year cannot be in the future',
      value: experience.period.end,
    });
  }

  // Validate achievements
  if (experience.achievements) {
    experience.achievements.forEach((achievement, achIndex) => {
      if (!achievement.description || achievement.description.trim().length === 0) {
        errors.push({
          field: `${prefix}.achievements[${achIndex}].description`,
          message: 'Achievement description is required',
          value: achievement.description,
        });
      }
    });
  }

  // Validate technologies array
  if (experience.technologies && experience.technologies.length === 0) {
    errors.push({
      field: `${prefix}.technologies`,
      message: 'At least one technology should be specified',
      value: experience.technologies,
    });
  }

  return errors;
}

/**
 * Validate education item
 */
export function validateEducationItem(
  education: EducationItem,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `education[${index}]`;

  if (!education.degree || education.degree.trim().length === 0) {
    errors.push({
      field: `${prefix}.degree`,
      message: 'Degree is required',
      value: education.degree,
    });
  }

  if (!education.institution || education.institution.trim().length === 0) {
    errors.push({
      field: `${prefix}.institution`,
      message: 'Institution name is required',
      value: education.institution,
    });
  }

  if (!education.period.start || !isValidYear(education.period.start)) {
    errors.push({
      field: `${prefix}.period.start`,
      message: 'Valid start year is required',
      value: education.period.start,
    });
  }

  if (!education.period.end || !isValidYear(education.period.end)) {
    errors.push({
      field: `${prefix}.period.end`,
      message: 'Valid end year is required',
      value: education.period.end,
    });
  }

  // Validate date logic
  if (education.period.start && education.period.end) {
    const startYear = parseInt(education.period.start);
    const endYear = parseInt(education.period.end);
    
    if (endYear < startYear) {
      errors.push({
        field: `${prefix}.period`,
        message: 'End year cannot be before start year',
        value: `${education.period.start} - ${education.period.end}`,
      });
    }
  }

  return errors;
}

/**
 * Validate skill category
 */
export function validateSkillCategory(
  category: SkillCategory,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `skills[${index}]`;

  if (!category.name || category.name.trim().length === 0) {
    errors.push({
      field: `${prefix}.name`,
      message: 'Skill category name is required',
      value: category.name,
    });
  }

  if (!category.skills || category.skills.length === 0) {
    errors.push({
      field: `${prefix}.skills`,
      message: 'At least one skill is required in each category',
      value: category.skills,
    });
  }

  // Validate individual skills
  category.skills.forEach((skill, skillIndex) => {
    const skillErrors = validateSkill(skill, `${prefix}.skills[${skillIndex}]`);
    errors.push(...skillErrors);
  });

  return errors;
}

/**
 * Validate individual skill
 */
export function validateSkill(skill: Skill, prefix: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!skill.name || skill.name.trim().length === 0) {
    errors.push({
      field: `${prefix}.name`,
      message: 'Skill name is required',
      value: skill.name,
    });
  }

  const validLevels = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
  if (!validLevels.includes(skill.level)) {
    errors.push({
      field: `${prefix}.level`,
      message: `Skill level must be one of: ${validLevels.join(', ')}`,
      value: skill.level,
    });
  }

  if (skill.yearsOfExperience !== undefined) {
    if (skill.yearsOfExperience < 0 || skill.yearsOfExperience > 50) {
      errors.push({
        field: `${prefix}.yearsOfExperience`,
        message: 'Years of experience must be between 0 and 50',
        value: skill.yearsOfExperience,
      });
    }
  }

  return errors;
}

/**
 * Validate language
 */
export function validateLanguage(language: Language, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `languages[${index}]`;

  if (!language.name || language.name.trim().length === 0) {
    errors.push({
      field: `${prefix}.name`,
      message: 'Language name is required',
      value: language.name,
    });
  }

  if (!language.proficiency || language.proficiency.trim().length === 0) {
    errors.push({
      field: `${prefix}.proficiency`,
      message: 'Language proficiency is required',
      value: language.proficiency,
    });
  }

  return errors;
}

/**
 * Validate project
 */
export function validateProject(project: Project, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `projects[${index}]`;

  if (!project.title || project.title.trim().length === 0) {
    errors.push({
      field: `${prefix}.title`,
      message: 'Project title is required',
      value: project.title,
    });
  }

  if (!project.duration || project.duration.trim().length === 0) {
    errors.push({
      field: `${prefix}.duration`,
      message: 'Project duration is required',
      value: project.duration,
    });
  }

  if (!project.clientType || project.clientType.trim().length === 0) {
    errors.push({
      field: `${prefix}.clientType`,
      message: 'Client type is required',
      value: project.clientType,
    });
  }

  if (!project.projectType || project.projectType.trim().length === 0) {
    errors.push({
      field: `${prefix}.projectType`,
      message: 'Project type is required',
      value: project.projectType,
    });
  }

  if (!project.industry || project.industry.trim().length === 0) {
    errors.push({
      field: `${prefix}.industry`,
      message: 'Industry is required',
      value: project.industry,
    });
  }

  if (!project.problem || project.problem.trim().length === 0) {
    errors.push({
      field: `${prefix}.problem`,
      message: 'Problem description is required',
      value: project.problem,
    });
  }

  if (!project.action || project.action.trim().length === 0) {
    errors.push({
      field: `${prefix}.action`,
      message: 'Action description is required',
      value: project.action,
    });
  }

  if (!project.result || project.result.trim().length === 0) {
    errors.push({
      field: `${prefix}.result`,
      message: 'Result description is required',
      value: project.result,
    });
  }

  return errors;
}

/**
 * Validate complete resume data
 */
export function validateResumeData(resume: ResumeData): ParseResult<ResumeData> {
  const errors: ValidationError[] = [];

  // Validate personal info
  errors.push(...validatePersonalInfo(resume.personalInfo));

  // Validate summary
  if (!resume.summary || !resume.summary.items || resume.summary.items.length === 0) {
    errors.push({
      field: 'summary',
      message: 'Summary with at least one item is required',
      value: resume.summary,
    });
  }

  // Validate experience
  if (!resume.experience || resume.experience.length === 0) {
    errors.push({
      field: 'experience',
      message: 'At least one experience item is required',
      value: resume.experience,
    });
  } else {
    resume.experience.forEach((exp, index) => {
      errors.push(...validateExperienceItem(exp, index));
    });
  }

  // Validate education
  if (resume.education && resume.education.length > 0) {
    resume.education.forEach((edu, index) => {
      errors.push(...validateEducationItem(edu, index));
    });
  }

  // Validate skills
  if (!resume.skills || resume.skills.length === 0) {
    errors.push({
      field: 'skills',
      message: 'At least one skill category is required',
      value: resume.skills,
    });
  } else {
    resume.skills.forEach((category, index) => {
      errors.push(...validateSkillCategory(category, index));
    });
  }

  // Validate languages
  if (resume.languages && resume.languages.length > 0) {
    resume.languages.forEach((lang, index) => {
      errors.push(...validateLanguage(lang, index));
    });
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? resume : undefined,
    errors,
  };
}

/**
 * Validate projects array
 */
export function validateProjects(projects: Project[]): ParseResult<Project[]> {
  const errors: ValidationError[] = [];

  if (!projects || projects.length === 0) {
    errors.push({
      field: 'projects',
      message: 'At least one project is required',
      value: projects,
    });
  } else {
    projects.forEach((project, index) => {
      errors.push(...validateProject(project, index));
    });
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? projects : undefined,
    errors,
  };
}

/**
 * Validate data consistency across resume and projects
 */
export function validateDataConsistency(
  resume: ResumeData,
  projects: Project[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for technology consistency
  const resumeTechnologies = new Set<string>();
  resume.experience.forEach(exp => {
    exp.technologies.forEach(tech => resumeTechnologies.add(tech.toLowerCase()));
  });

  resume.skills.forEach(category => {
    category.skills.forEach(skill => {
      resumeTechnologies.add(skill.name.toLowerCase());
    });
  });

  const projectTechnologies = new Set<string>();
  projects.forEach(project => {
    if (project.technologies) {
      project.technologies.forEach(tech => {
        projectTechnologies.add(tech.toLowerCase());
      });
    }
  });

  // Find technologies mentioned in projects but not in resume
  const missingInResume: string[] = [];
  projectTechnologies.forEach(tech => {
    if (!resumeTechnologies.has(tech)) {
      missingInResume.push(tech);
    }
  });

  if (missingInResume.length > 0) {
    errors.push({
      field: 'consistency.technologies',
      message: `Technologies mentioned in projects but not in resume: ${missingInResume.join(', ')}`,
      value: missingInResume,
    });
  }

  // Check for timeline consistency
  const experienceYears = new Set<number>();
  resume.experience.forEach(exp => {
    const startYear = parseInt(exp.period.start);
    const endYear = exp.period.end === 'Present' ? 
      new Date().getFullYear() : parseInt(exp.period.end);
    
    for (let year = startYear; year <= endYear; year++) {
      experienceYears.add(year);
    }
  });

  // Validate project years against experience timeline
  projects.forEach((project, index) => {
    const yearMatch = project.duration.match(/\((\d{4})\)/);
    if (yearMatch) {
      const projectYear = parseInt(yearMatch[1]);
      if (!experienceYears.has(projectYear)) {
        errors.push({
          field: `projects[${index}].duration`,
          message: `Project year ${projectYear} does not align with experience timeline`,
          value: project.duration,
        });
      }
    }
  });

  return errors;
}

// Helper functions

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\+]?[\d\s\(\)\-]{10,}$/;
  return phoneRegex.test(phone);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidYear(year: string): boolean {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  return !isNaN(yearNum) && yearNum >= 1950 && yearNum <= currentYear + 1;
}

/**
 * Sanitize data by removing potentially harmful content
 */
export function sanitizeData<T>(data: T): T {
  if (typeof data === 'string') {
    // Remove potentially harmful HTML/script tags
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .trim() as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item)) as T;
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Normalize data for consistent formatting
 */
export function normalizeData<T>(data: T): T {
  if (typeof data === 'string') {
    return (data
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    ) as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item)) as T;
  }

  if (data && typeof data === 'object') {
    const normalized: any = {};
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = normalizeData(value);
    }
    return normalized;
  }

  return data;
}