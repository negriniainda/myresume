import { parseMarkdownSections } from '@/utils/markdown-parser';

describe('Debug Sections', () => {
  it('should parse sections correctly', () => {
    const markdown = `# Marcelo Negrini

## Contact Information
Email: marcelo.negrini@example.com
Phone: +55 11 99999-9999

## Professional Summary
• 15+ years of experience in technology leadership
• Expert in AI and machine learning implementations`;

    const result = parseMarkdownSections(markdown);

    console.log('Sections found:', result.sections.length);
    result.sections.forEach((section, index) => {
      console.log(`Section ${index}:`, {
        title: section.title,
        level: section.level,
        contentLength: section.content.length,
        contentPreview: section.content.substring(0, 100),
      });
    });

    expect(result.sections.length).toBeGreaterThan(0);
  });
});
