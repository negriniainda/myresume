import {
  parseResumeMarkdown,
  parseProjectsMarkdown,
  parseMarkdownSections,
  cleanText,
  extractTechnologies,
} from '@/utils/markdown-parser';

describe('Markdown Parser', () => {
  describe('parseMarkdownSections', () => {
    it('should parse markdown into sections correctly', () => {
      const markdown = `---
title: Test Resume
---

# John Doe

## Contact Information
Email: john@example.com
Phone: (555) 123-4567

## Experience
**Senior Developer** at Tech Corp
2020 - Present
• Built scalable applications
• Led team of 5 developers

## Education
**Bachelor of Science** in Computer Science
University of Technology
2016 - 2020
`;

      const result = parseMarkdownSections(markdown);

      expect(result.frontMatter.title).toBe('Test Resume');
      expect(result.sections).toHaveLength(4);
      expect(result.sections[0].title).toBe('John Doe');
      expect(result.sections[1].title).toBe('Contact Information');
      expect(result.sections[2].title).toBe('Experience');
      expect(result.sections[3].title).toBe('Education');
    });
  });

  describe('parseResumeMarkdown', () => {
    it('should parse a basic resume markdown', () => {
      const resumeMarkdown = `# Marcelo Negrini

## Contact Information
Email: marcelo@example.com
Phone: (555) 123-4567

## Summary
• 15+ years of experience in technology leadership
• Expert in AI and machine learning implementations

## Languages
• Portuguese - Native
• English - Fluent
`;

      const result = parseResumeMarkdown(resumeMarkdown);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        // Test personal info parsing
        expect(result.data.personalInfo.name).toBe('Marcelo Negrini');
        expect(result.data.personalInfo.email).toBe('marcelo@example.com');
        expect(result.data.personalInfo.phone).toBe('(555) 123-4567');

        // Test summary parsing
        expect(result.data.summary.items.length).toBeGreaterThan(0);

        // Test languages parsing
        expect(result.data.languages.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid markdown gracefully', () => {
      const invalidMarkdown = '';
      const result = parseResumeMarkdown(invalidMarkdown);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('parseProjectsMarkdown', () => {
    it('should parse projects markdown correctly', () => {
      const projectsMarkdown = `# Projects Portfolio

## E-commerce Platform Modernization

**Duration:** 8 months
**Location:** São Paulo, SP
**Client Type:** Large Enterprise
**Project Type:** Digital Transformation
**Industry:** Retail
**Business Unit:** Technology

**Problem:** Legacy e-commerce platform couldn't handle peak traffic and had poor user experience.

**Action:** Led complete platform modernization using microservices architecture, implemented React frontend, and migrated to AWS cloud infrastructure.

**Result:** Achieved 99.9% uptime, reduced page load times by 70%, and increased conversion rates by 25%.

## AI-Powered Analytics Dashboard

**Duration:** 6 months
**Location:** Remote
**Client Type:** Mid-size Company
**Project Type:** Product Development
**Industry:** Healthcare
**Business Unit:** Data Science

**Problem:** Healthcare providers needed real-time insights from patient data but lacked analytical capabilities.

**Action:** Developed machine learning models for predictive analytics and created intuitive dashboard using React and D3.js.

**Result:** Enabled early detection of health risks, improving patient outcomes by 30% and reducing costs by $500K annually.
`;

      const result = parseProjectsMarkdown(projectsMarkdown);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data).toHaveLength(2);

        const firstProject = result.data[0];
        expect(firstProject.title).toBe('E-commerce Platform Modernization');
        expect(firstProject.duration).toBe('8 months');
        expect(firstProject.location).toBe('São Paulo, SP');
        expect(firstProject.clientType).toBe('Large Enterprise');
        expect(firstProject.projectType).toBe('Digital Transformation');
        expect(firstProject.industry).toBe('Retail');
        expect(firstProject.businessUnit).toBe('Technology');
        expect(firstProject.problem).toContain('Legacy e-commerce platform');
        expect(firstProject.action).toContain(
          'Led complete platform modernization'
        );
        expect(firstProject.result).toContain('99.9% uptime');

        const secondProject = result.data[1];
        expect(secondProject.title).toBe('AI-Powered Analytics Dashboard');
        expect(secondProject.industry).toBe('Healthcare');
        expect(secondProject.result).toContain(
          'improving patient outcomes by 30%'
        );
      }
    });
  });

  describe('cleanText', () => {
    it('should remove markdown formatting', () => {
      const text = '**Bold text** with *italic* and extra\n\n\nline breaks';
      const cleaned = cleanText(text);

      expect(cleaned).toBe('Bold text with *italic* and extra\nline breaks');
    });
  });

  describe('extractTechnologies', () => {
    it('should extract technology mentions from text', () => {
      const text =
        'Built with React and Node.js, deployed on AWS using Docker and Kubernetes. Used Python for machine learning.';
      const technologies = extractTechnologies(text);

      expect(technologies).toContain('React');
      expect(technologies).toContain('Node.js');
      expect(technologies).toContain('AWS');
      expect(technologies).toContain('Docker');
      expect(technologies).toContain('Kubernetes');
      expect(technologies).toContain('Python');
      // Note: case-insensitive matching returns lowercase
      expect(
        technologies.some((tech) => tech.toLowerCase() === 'machine learning')
      ).toBe(true);
    });

    it('should not duplicate technologies', () => {
      const text = 'React application with React components and React hooks';
      const technologies = extractTechnologies(text);

      expect(technologies.filter((tech) => tech === 'React')).toHaveLength(1);
    });
  });
});
