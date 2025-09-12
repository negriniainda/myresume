import matter from 'gray-matter';
import type {
  ResumeData,
  Project,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  Language,
  QualificationSummary,
  ParsedMarkdownSection,
  MarkdownParseResult,
  ValidationError,
  ParseResult,
} from '@/types';

/**
 * Parse markdown content into structured sections using simple regex parsing
 */
export function parseMarkdownSections(
  markdownContent: string
): MarkdownParseResult {
  const { data: frontMatter, content } = matter(markdownContent);

  console.log('Content after matter parsing:', content.substring(0, 200));

  const sections: ParsedMarkdownSection[] = [];
  const lines = content.split('\n');

  console.log('Total lines:', lines.length);
  console.log('First few lines:', lines.slice(0, 5));

  let currentSection: ParsedMarkdownSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    console.log(
      `Line ${i}: "${line}" -> heading match:`,
      headingMatch ? 'YES' : 'NO'
    );

    if (headingMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: headingMatch[2].trim(),
        content: '',
        level: headingMatch[1].length,
      };

      console.log('Started new section:', currentSection.title);
    } else if (currentSection) {
      // Add content to current section
      if (line.trim()) {
        currentSection.content += line + '\n';
      }
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  console.log('Final sections count:', sections.length);

  return {
    frontMatter,
    sections,
    rawContent: content,
  };
}

// Removed extractTextFromNode function as we're using simple string parsing now

/**
 * Parse personal information from contact section
 */
function parsePersonalInfo(sections: ParsedMarkdownSection[]): PersonalInfo {
  const personalInfo: PersonalInfo = {
    name: '',
    title: '',
    location: '',
    email: '',
    phone: '',
  };

  // First, extract name from the first heading (usually the person's name)
  const firstSection = sections[0];
  if (firstSection && firstSection.level === 1) {
    personalInfo.name = firstSection.title;
  }

  // Then find and parse the contact section
  const contactSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes('contact') ||
      s.title.toLowerCase().includes('contato') ||
      s.title.toLowerCase().includes('information') ||
      s.title.toLowerCase().includes('informações')
  );

  if (contactSection) {
    const lines = contactSection.content
      .split('\n')
      .filter((line) => line.trim());

    lines.forEach((line) => {
      const cleanLine = line.trim();

      // Extract email
      const emailMatch = cleanLine.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        personalInfo.email = emailMatch[0];
      }

      // Extract phone
      const phoneMatch = cleanLine.match(/[\+]?[\d\s\(\)\-]{10,}/);
      if (phoneMatch && !personalInfo.phone) {
        personalInfo.phone = phoneMatch[0].trim();
      }

      // Extract LinkedIn
      if (cleanLine.toLowerCase().includes('linkedin')) {
        const urlMatch = cleanLine.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          personalInfo.linkedin = urlMatch[0];
        }
      }

      // Extract GitHub
      if (cleanLine.toLowerCase().includes('github')) {
        const urlMatch = cleanLine.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          personalInfo.github = urlMatch[0];
        }
      }

      // Extract location (look for city, state patterns or Location: prefix)
      if (cleanLine.toLowerCase().startsWith('location:')) {
        personalInfo.location = cleanLine.replace(/location:/i, '').trim();
      } else if (
        cleanLine.match(/[A-Za-z\s]+,\s*[A-Z]{2}/) &&
        !personalInfo.location
      ) {
        personalInfo.location = cleanLine;
      }
    });
  }

  return personalInfo;
}

/**
 * Parse experience section into structured data
 */
function parseExperience(sections: ParsedMarkdownSection[]): ExperienceItem[] {
  const experienceSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes('experience') ||
      s.title.toLowerCase().includes('experiência') ||
      s.title.toLowerCase().includes('professional') ||
      s.title.toLowerCase().includes('profissional')
  );

  if (!experienceSection) return [];

  const experiences: ExperienceItem[] = [];
  const lines = experienceSection.content
    .split('\n')
    .filter((line) => line.trim());

  let currentExperience:
    | (Partial<ExperienceItem> & { position?: string; company?: string })
    | null = null;
  // let currentSection: 'description' | 'achievements' | 'technologies' | null = null;

  lines.forEach((line, index) => {
    const cleanLine = line.trim();

    // Detect job title and company (usually in bold or specific format)
    if (cleanLine.includes('**') || cleanLine.match(/^[A-Z][^a-z]*[A-Z]/)) {
      // Save previous experience
      if (currentExperience) {
        const exp = currentExperience as Record<string, unknown>;
        if (exp.position && exp.company) {
          experiences.push(currentExperience as ExperienceItem);
        }
      }

      // Start new experience
      currentExperience = {
        id: `exp-${index}`,
        position: '',
        company: '',
        location: '',
        period: { start: '', end: '' },
        description: '',
        achievements: [],
        technologies: [],
        responsibilities: [],
      };

      // Parse position and company from line
      const cleanedLine = cleanLine.replace(/\*\*/g, '');
      const parts = cleanedLine.split(' at ');
      if (parts.length === 2) {
        currentExperience.position = parts[0].trim();
        currentExperience.company = parts[1].trim();
      } else {
        currentExperience.position = cleanedLine.trim();
      }
    }

    // Parse date ranges
    const dateMatch = cleanLine.match(
      /(\d{4})\s*[-–]\s*(\d{4}|Present|Presente)/i
    );
    if (dateMatch && currentExperience) {
      currentExperience.period = {
        start: dateMatch[1],
        end: dateMatch[2],
      };
    }

    // Parse location
    if (
      cleanLine.match(/[A-Za-z\s]+,\s*[A-Z]{2}/) &&
      currentExperience &&
      !currentExperience.location
    ) {
      currentExperience.location = cleanLine;
    }

    // Parse bullet points for responsibilities/achievements
    if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
      if (currentExperience) {
        const bulletText = cleanLine.substring(1).trim();

        // Determine if it's an achievement (contains numbers/metrics)
        if (
          bulletText.match(
            /\d+%|\$[\d,]+|\d+\+|increased|improved|reduced|saved/i
          )
        ) {
          currentExperience.achievements?.push({
            metric: bulletText.match(/\d+%|\$[\d,]+|\d+\+/)?.[0] || '',
            description: bulletText,
          });
        } else {
          currentExperience.responsibilities?.push(bulletText);
        }
      }
    }

    // Parse technologies (look for tech keywords)
    const techKeywords = [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'AWS',
      'Docker',
      'Kubernetes',
    ];
    techKeywords.forEach((tech) => {
      if (cleanLine.includes(tech) && currentExperience) {
        if (!currentExperience.technologies?.includes(tech)) {
          currentExperience.technologies?.push(tech);
        }
      }
    });
  });

  // Don't forget the last experience
  if (currentExperience) {
    const exp = currentExperience as Record<string, unknown>;
    if (exp.position && exp.company) {
      experiences.push(currentExperience as ExperienceItem);
    }
  }

  return experiences;
}

/**
 * Parse education section
 */
function parseEducation(sections: ParsedMarkdownSection[]): EducationItem[] {
  const educationSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes('education') ||
      s.title.toLowerCase().includes('educação') ||
      s.title.toLowerCase().includes('academic') ||
      s.title.toLowerCase().includes('acadêmica')
  );

  if (!educationSection) return [];

  const education: EducationItem[] = [];
  const lines = educationSection.content
    .split('\n')
    .filter((line) => line.trim());

  let currentEducation: Partial<EducationItem> | null = null;

  lines.forEach((line, index) => {
    const cleanLine = line.trim();

    // Detect degree and institution
    if (cleanLine.includes('**') || cleanLine.match(/^[A-Z]/)) {
      if (currentEducation && currentEducation.degree) {
        education.push(currentEducation as EducationItem);
      }

      currentEducation = {
        id: `edu-${index}`,
        degree: cleanLine.replace(/\*\*/g, ''),
        institution: '',
        location: '',
        period: { start: '', end: '' },
      };
    }

    // Parse institution
    if (
      cleanLine.toLowerCase().includes('university') ||
      cleanLine.toLowerCase().includes('college') ||
      cleanLine.toLowerCase().includes('universidade') ||
      cleanLine.toLowerCase().includes('faculdade')
    ) {
      if (currentEducation) {
        currentEducation.institution = cleanLine;
      }
    }

    // Parse dates
    const dateMatch = cleanLine.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (dateMatch && currentEducation) {
      currentEducation.period = {
        start: dateMatch[1],
        end: dateMatch[2],
      };
    }
  });

  if (currentEducation) {
    const edu = currentEducation as Record<string, unknown>;
    if (edu.degree) {
      education.push(currentEducation as EducationItem);
    }
  }

  return education;
}

/**
 * Parse skills section
 */
function parseSkills(sections: ParsedMarkdownSection[]): SkillCategory[] {
  const skillsSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes('skills') ||
      s.title.toLowerCase().includes('competências') ||
      s.title.toLowerCase().includes('technical') ||
      s.title.toLowerCase().includes('técnicas')
  );

  if (!skillsSection) return [];

  const skillCategories: SkillCategory[] = [];
  const lines = skillsSection.content.split('\n').filter((line) => line.trim());

  let currentCategory: SkillCategory | null = null;

  lines.forEach((line) => {
    const cleanLine = line.trim();

    // Category headers (usually bold or capitalized)
    if (cleanLine.includes('**') || cleanLine.match(/^[A-Z][A-Za-z\s]+:$/)) {
      if (currentCategory) {
        skillCategories.push(currentCategory);
      }

      currentCategory = {
        name: cleanLine.replace(/\*\*/g, '').replace(':', ''),
        skills: [],
      };
    }

    // Skills (bullet points or comma-separated)
    if (
      (cleanLine.startsWith('•') || cleanLine.startsWith('-')) &&
      currentCategory
    ) {
      const skillText = cleanLine.substring(1).trim();
      const skills = skillText.split(',').map((s) => s.trim());

      skills.forEach((skillName) => {
        if (skillName) {
          currentCategory!.skills.push({
            name: skillName,
            level: 'Advanced', // Default level
            category: currentCategory!.name,
          });
        }
      });
    }
  });

  if (currentCategory) {
    skillCategories.push(currentCategory);
  }

  return skillCategories;
}

/**
 * Parse languages section
 */
function parseLanguages(sections: ParsedMarkdownSection[]): Language[] {
  const languagesSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes('language') ||
      s.title.toLowerCase().includes('idioma')
  );

  if (!languagesSection) return [];

  const languages: Language[] = [];
  const lines = languagesSection.content
    .split('\n')
    .filter((line) => line.trim());

  lines.forEach((line) => {
    const cleanLine = line.trim();

    if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
      const langText = cleanLine.substring(1).trim();
      const parts = langText.split(' - ');

      if (parts.length >= 2) {
        languages.push({
          name: parts[0].trim(),
          proficiency: parts[1].trim(),
        });
      } else {
        languages.push({
          name: langText,
          proficiency: 'Fluent',
        });
      }
    }
  });

  return languages;
}

/**
 * Parse summary/qualification section
 */
function parseSummary(sections: ParsedMarkdownSection[]): QualificationSummary {
  const summarySection = sections.find(
    (s) =>
      s.title.toLowerCase().includes('summary') ||
      s.title.toLowerCase().includes('qualification') ||
      s.title.toLowerCase().includes('resumo') ||
      s.title.toLowerCase().includes('qualificação') ||
      s.title.toLowerCase().includes('objective') ||
      s.title.toLowerCase().includes('objetivo')
  );

  if (!summarySection) {
    return { title: 'Summary', items: [] };
  }

  const items: string[] = [];
  const lines = summarySection.content
    .split('\n')
    .filter((line) => line.trim());

  lines.forEach((line) => {
    const cleanLine = line.trim();

    if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
      items.push(cleanLine.substring(1).trim());
    } else if (cleanLine && !cleanLine.includes('**')) {
      items.push(cleanLine);
    }
  });

  return {
    title: summarySection.title,
    items,
  };
}

/**
 * Validate parsed resume data
 */
function validateResumeData(data: ResumeData): ValidationError[] {
  const errors: ValidationError[] = [];

  // More lenient validation - just check if we have any meaningful data
  const hasPersonalInfo = data.personalInfo.name || data.personalInfo.email;
  const hasContent =
    data.experience.length > 0 ||
    data.education.length > 0 ||
    data.skills.length > 0;
  const hasSummary = data.summary.items.length > 0;

  if (!hasPersonalInfo && !hasContent && !hasSummary) {
    errors.push({ field: 'general', message: 'No valid resume data found' });
  }

  return errors;
}

/**
 * Main function to parse resume markdown into structured data
 */
export function parseResumeMarkdown(
  markdownContent: string
): ParseResult<ResumeData> {
  try {
    const { sections } = parseMarkdownSections(markdownContent);

    console.log('Sections parsed:', sections.length);
    sections.forEach((section, i) => {
      console.log(`Section ${i}: "${section.title}" (level ${section.level})`);
    });

    const personalInfo = parsePersonalInfo(sections);
    console.log('Personal info after parsing:', personalInfo);

    const resumeData: ResumeData = {
      personalInfo,
      summary: parseSummary(sections),
      experience: parseExperience(sections),
      education: parseEducation(sections),
      skills: parseSkills(sections),
      languages: parseLanguages(sections),
      activities: [], // Will be parsed from activities section if present
    };

    const errors = validateResumeData(resumeData);

    return {
      success: errors.length === 0,
      data: resumeData,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ field: 'general', message: `Parsing failed: ${error}` }],
    };
  }
}

/**
 * Parse projects markdown into structured data
 */
export function parseProjectsMarkdown(
  markdownContent: string
): ParseResult<Project[]> {
  try {
    const { sections } = parseMarkdownSections(markdownContent);
    const projects: Project[] = [];

    sections.forEach((section, index) => {
      if (section.level === 2 || section.level === 3) {
        // Project sections
        const lines = section.content.split('\n').filter((line) => line.trim());

        const project: Project = {
          id: `project-${index}`,
          title: section.title,
          duration: '',
          location: '',
          clientType: '',
          projectType: '',
          industry: '',
          businessUnit: '',
          problem: '',
          action: '',
          result: '',
          technologies: [],
        };

        let currentField: keyof Project | null = null;

        lines.forEach((line) => {
          const cleanLine = line.trim();

          // Parse structured fields
          if (
            cleanLine.startsWith('**Duration:**') ||
            cleanLine.startsWith('**Duração:**')
          ) {
            project.duration = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Location:**') ||
            cleanLine.startsWith('**Local:**')
          ) {
            project.location = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Client Type:**') ||
            cleanLine.startsWith('**Tipo de Cliente:**')
          ) {
            project.clientType = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Project Type:**') ||
            cleanLine.startsWith('**Tipo de Projeto:**')
          ) {
            project.projectType = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Industry:**') ||
            cleanLine.startsWith('**Indústria:**')
          ) {
            project.industry = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Business Unit:**') ||
            cleanLine.startsWith('**Unidade de Negócio:**')
          ) {
            project.businessUnit = cleanLine
              .replace(/\*\*[^*]+\*\*/, '')
              .trim();
          } else if (
            cleanLine.startsWith('**Problem:**') ||
            cleanLine.startsWith('**Problema:**')
          ) {
            currentField = 'problem';
            project.problem = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Action:**') ||
            cleanLine.startsWith('**Ação:**')
          ) {
            currentField = 'action';
            project.action = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (
            cleanLine.startsWith('**Result:**') ||
            cleanLine.startsWith('**Resultado:**')
          ) {
            currentField = 'result';
            project.result = cleanLine.replace(/\*\*[^*]+\*\*/, '').trim();
          } else if (currentField && cleanLine && !cleanLine.startsWith('**')) {
            // Continue adding to current field
            if (currentField === 'problem') {
              project.problem += ' ' + cleanLine;
            } else if (currentField === 'action') {
              project.action += ' ' + cleanLine;
            } else if (currentField === 'result') {
              project.result += ' ' + cleanLine;
            }
          }
        });

        projects.push(project);
      }
    });

    return {
      success: true,
      data: projects,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        { field: 'general', message: `Projects parsing failed: ${error}` },
      ],
    };
  }
}

/**
 * Utility function to clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .trim();
}

/**
 * Extract all technology mentions from text
 */
export function extractTechnologies(text: string): string[] {
  const techPatterns = [
    /JavaScript/gi,
    /TypeScript/gi,
    /React/gi,
    /Node\.js/gi,
    /Python/gi,
    /AWS/gi,
    /Docker/gi,
    /Kubernetes/gi,
    /MongoDB/gi,
    /PostgreSQL/gi,
    /GraphQL/gi,
    /REST/gi,
    /API/gi,
    /Microservices/gi,
    /DevOps/gi,
    /CI\/CD/gi,
    /Git/gi,
    /Agile/gi,
    /Scrum/gi,
    /Machine Learning/gi,
    /AI/gi,
    /Artificial Intelligence/gi,
    /Data Science/gi,
    /Analytics/gi,
  ];

  const technologies: string[] = [];

  techPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        if (!technologies.includes(match)) {
          technologies.push(match);
        }
      });
    }
  });

  return technologies;
}
