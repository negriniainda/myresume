#!/usr/bin/env tsx

import { parseProjectsMarkdown } from '../src/utils/translator';
import path from 'path';
import fs from 'fs/promises';

async function validateTranslation() {
  try {
    console.log('🔍 Validating translation service setup...');
    
    // Check if Projects.md exists (in parent directory)
    const projectsPath = path.join(process.cwd(), '..', 'Projects.md');
    try {
      await fs.access(projectsPath);
      console.log('✅ Projects.md file found');
    } catch {
      console.error('❌ Projects.md file not found in root directory');
      return false;
    }
    
    // Read and parse Projects.md
    const markdownContent = await fs.readFile(projectsPath, 'utf-8');
    const projects = parseProjectsMarkdown(markdownContent);
    
    console.log(`✅ Successfully parsed ${projects.length} projects from Projects.md`);
    
    // Validate project structure
    let validProjects = 0;
    for (const project of projects) {
      if (project.title && project.problem && project.action && project.result) {
        validProjects++;
      }
    }
    
    console.log(`✅ ${validProjects}/${projects.length} projects have complete structure`);
    
    // Check OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      console.log('✅ OPENAI_API_KEY environment variable is set');
    } else {
      console.log('⚠️  OPENAI_API_KEY not set - translation will not work');
      console.log('   Set it with: set OPENAI_API_KEY=your_api_key_here');
    }
    
    // Check output directory
    const outputDir = path.join(process.cwd(), 'src/data');
    try {
      await fs.access(outputDir);
      console.log('✅ Output directory src/data exists');
    } catch {
      console.error('❌ Output directory src/data not found');
      return false;
    }
    
    console.log('\n🎉 Translation service validation completed successfully!');
    console.log('\nTo run translation:');
    console.log('  1. Set OPENAI_API_KEY environment variable');
    console.log('  2. Run: npm run translate-projects');
    
    return true;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// Run validation
validateTranslation().then(success => {
  process.exit(success ? 0 : 1);
});