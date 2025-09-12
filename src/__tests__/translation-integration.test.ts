/**
 * Integration test for translation service
 * This test requires OPENAI_API_KEY to be set and will make actual API calls
 * Run with: npm test -- translation-integration.test.ts --testTimeout=30000
 */

import { translateText, parseProjectsMarkdown } from '../utils/translator';

// Skip these tests if no API key is available
const hasApiKey = !!process.env.OPENAI_API_KEY;

describe('Translation Integration Tests', () => {
  // Skip all tests if no API key
  beforeAll(() => {
    if (!hasApiKey) {
      console.log('Skipping integration tests - OPENAI_API_KEY not set');
    }
  });

  it.skipIf(!hasApiKey)('should translate simple text to Portuguese', async () => {
    const englishText = 'Hello, this is a test message for translation.';
    const result = await translateText(englishText, 'Portuguese');
    
    expect(result).toBeDefined();
    expect(result).not.toBe(englishText); // Should be different from original
    expect(result.length).toBeGreaterThan(0);
    
    // Should contain Portuguese characteristics
    expect(result.toLowerCase()).toMatch(/olá|oi|esta|teste|tradução|mensagem/);
  }, 15000);

  it.skipIf(!hasApiKey)('should translate technical content accurately', async () => {
    const technicalText = 'Implemented React frontend with TypeScript, deployed on AWS with 99.9% uptime.';
    const result = await translateText(technicalText, 'Portuguese');
    
    expect(result).toBeDefined();
    expect(result).not.toBe(technicalText);
    
    // Technical terms should be preserved or appropriately translated
    expect(result).toMatch(/React|TypeScript|AWS/); // These should remain in English
    expect(result).toMatch(/99\.9%/); // Percentage should be preserved
    expect(result.toLowerCase()).toMatch(/implementado|frontend|implantado/);
  }, 15000);

  it('should parse sample project markdown correctly', () => {
    const sampleMarkdown = `# Projects Portfolio

## Test Project

**Duration:** 6 months
**Location:** São Paulo, SP
**Client Type:** Large Enterprise
**Project Type:** Digital Transformation
**Industry:** Technology
**Business Unit:** Engineering

**Problem:** The system was slow and unreliable.

**Action:** Implemented modern architecture and best practices.

**Result:** Improved performance by 50% and reduced downtime to zero.`;

    const projects = parseProjectsMarkdown(sampleMarkdown);
    
    expect(projects).toHaveLength(1);
    expect(projects[0]).toEqual({
      title: 'Test Project',
      duration: '6 months',
      location: 'São Paulo, SP',
      clientType: 'Large Enterprise',
      projectType: 'Digital Transformation',
      industry: 'Technology',
      businessUnit: 'Engineering',
      problem: 'The system was slow and unreliable.',
      action: 'Implemented modern architecture and best practices.',
      result: 'Improved performance by 50% and reduced downtime to zero.'
    });
  });
});