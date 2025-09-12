import { promises as fs } from 'fs';
import path from 'path';
import {
  parseResumeMarkdown,
  parseProjectsMarkdown,
} from '@/utils/markdown-parser';

describe('Integration Tests', () => {
  it('should parse the sample resume file', async () => {
    const filePath = path.resolve(process.cwd(), 'src/data/sample-resume.md');
    const content = await fs.readFile(filePath, 'utf-8');

    console.log('File content length:', content.length);
    console.log('First 200 chars:', content.substring(0, 200));

    const result = parseResumeMarkdown(content);

    console.log('Parsing result:', {
      success: result.success,
      errors: result.errors,
      personalInfoName: result.data?.personalInfo?.name,
      summaryItems: result.data?.summary?.items?.length,
      experienceCount: result.data?.experience?.length,
      educationCount: result.data?.education?.length,
      skillsCount: result.data?.skills?.length,
      languagesCount: result.data?.languages?.length,
    });

    expect(result.success).toBe(true);
    expect(result.data?.personalInfo?.name).toBe('Marcelo Negrini');
  });

  it('should parse the projects file', async () => {
    const filePath = path.resolve(process.cwd(), 'src/data/projects.md');
    const content = await fs.readFile(filePath, 'utf-8');

    console.log('Projects file content length:', content.length);
    console.log('First 200 chars:', content.substring(0, 200));

    const result = parseProjectsMarkdown(content);

    console.log('Projects parsing result:', {
      success: result.success,
      errors: result.errors,
      projectsCount: result.data?.length,
      firstProjectTitle: result.data?.[0]?.title,
    });

    expect(result.success).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });
});
