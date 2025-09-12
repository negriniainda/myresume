import { promises as fs } from 'fs';
import path from 'path';
import { parseResumeMarkdown, parseProjectsMarkdown } from './markdown-parser';
import type { ResumeData, Project, ParseResult } from '@/types';

/**
 * Load and parse resume markdown file
 */
export async function loadResumeData(
  filePath: string
): Promise<ParseResult<ResumeData>> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const markdownContent = await fs.readFile(fullPath, 'utf-8');
    return parseResumeMarkdown(markdownContent);
  } catch (error) {
    return {
      success: false,
      errors: [{ field: 'file', message: `Failed to load file: ${error}` }],
    };
  }
}

/**
 * Load and parse projects markdown file
 */
export async function loadProjectsData(
  filePath: string
): Promise<ParseResult<Project[]>> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const markdownContent = await fs.readFile(fullPath, 'utf-8');
    return parseProjectsMarkdown(markdownContent);
  } catch (error) {
    return {
      success: false,
      errors: [{ field: 'file', message: `Failed to load file: ${error}` }],
    };
  }
}

/**
 * Save parsed data as JSON
 */
export async function saveDataAsJSON<T>(
  data: T,
  outputPath: string
): Promise<void> {
  try {
    const fullPath = path.resolve(process.cwd(), outputPath);
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(fullPath, jsonContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save JSON file: ${error}`);
  }
}

/**
 * Process markdown files and generate JSON data files
 */
export async function processMarkdownFiles(): Promise<{
  resumeEN?: ResumeData;
  resumePT?: ResumeData;
  projects?: Project[];
  errors: string[];
}> {
  const errors: string[] = [];
  const result: {
    resumeEN?: ResumeData;
    resumePT?: ResumeData;
    projects?: Project[];
    errors: string[];
  } = { errors };

  // Process English resume (if exists)
  try {
    const resumeENResult = await loadResumeData('src/data/resume-en.md');
    if (resumeENResult.success && resumeENResult.data) {
      result.resumeEN = resumeENResult.data;
      await saveDataAsJSON(resumeENResult.data, 'src/data/resume-en.json');
    } else {
      errors.push(
        `English resume parsing failed: ${resumeENResult.errors.map((e) => e.message).join(', ')}`
      );
    }
  } catch (error) {
    errors.push(`English resume file not found or inaccessible: ${error}`);
  }

  // Process Portuguese resume (if exists)
  try {
    const resumePTResult = await loadResumeData('src/data/resume-pt.md');
    if (resumePTResult.success && resumePTResult.data) {
      result.resumePT = resumePTResult.data;
      await saveDataAsJSON(resumePTResult.data, 'src/data/resume-pt.json');
    } else {
      errors.push(
        `Portuguese resume parsing failed: ${resumePTResult.errors.map((e) => e.message).join(', ')}`
      );
    }
  } catch (error) {
    errors.push(`Portuguese resume file not found or inaccessible: ${error}`);
  }

  // Process projects (if exists)
  try {
    const projectsResult = await loadProjectsData('src/data/projects.md');
    if (projectsResult.success && projectsResult.data) {
      result.projects = projectsResult.data;
      await saveDataAsJSON(projectsResult.data, 'src/data/projects.json');
    } else {
      errors.push(
        `Projects parsing failed: ${projectsResult.errors.map((e) => e.message).join(', ')}`
      );
    }
  } catch (error) {
    errors.push(`Projects file not found or inaccessible: ${error}`);
  }

  return result;
}

/**
 * Validate that required data files exist
 */
export async function validateDataFiles(): Promise<{
  valid: boolean;
  missingFiles: string[];
  recommendations: string[];
}> {
  const requiredFiles = [
    'src/data/resume-en.md',
    'src/data/resume-pt.md',
    'src/data/projects.md',
  ];

  const missingFiles: string[] = [];
  const recommendations: string[] = [];

  for (const filePath of requiredFiles) {
    try {
      await fs.access(path.resolve(process.cwd(), filePath));
    } catch {
      missingFiles.push(filePath);
    }
  }

  if (missingFiles.length > 0) {
    recommendations.push(
      'Create the missing markdown files with your resume and project data'
    );
    recommendations.push(
      'Use the sample-resume.md as a template for structure'
    );
    recommendations.push(
      'Run the data processing script after creating the files'
    );
  }

  return {
    valid: missingFiles.length === 0,
    missingFiles,
    recommendations,
  };
}
