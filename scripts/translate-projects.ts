#!/usr/bin/env tsx

import { translateProjectsToPortuguese } from '../src/utils/translator';
import path from 'path';

async function main() {
  try {
    console.log('Starting Portuguese translation of Projects.md...');
    
    // Define paths
    const projectsMarkdownPath = path.join(process.cwd(), '..', 'Projects.md');
    const outputJsonPath = path.join(process.cwd(), 'src/data/projects-pt.json');
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable is not set');
      console.log('Please set your OpenAI API key:');
      console.log('  Windows: set OPENAI_API_KEY=your_api_key_here');
      console.log('  Linux/Mac: export OPENAI_API_KEY=your_api_key_here');
      process.exit(1);
    }
    
    // Run translation
    await translateProjectsToPortuguese(projectsMarkdownPath, outputJsonPath);
    
    console.log('✅ Translation completed successfully!');
    console.log(`📄 Portuguese projects saved to: ${outputJsonPath}`);
    console.log(`📄 Portuguese markdown saved to: ${outputJsonPath.replace('.json', '.md')}`);
    
  } catch (error) {
    console.error('❌ Translation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();