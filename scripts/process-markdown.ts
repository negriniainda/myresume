#!/usr/bin/env tsx

import {
  processMarkdownFiles,
  validateDataFiles,
} from '../src/utils/data-loader';

async function main() {
  console.log('🔍 Validating data files...');

  const validation = await validateDataFiles();

  if (!validation.valid) {
    console.log('❌ Missing required files:');
    validation.missingFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });

    console.log('\n💡 Recommendations:');
    validation.recommendations.forEach((rec) => {
      console.log(`   - ${rec}`);
    });

    console.log('\n📝 You can use src/data/sample-resume.md as a template');
    return;
  }

  console.log('✅ All required files found');
  console.log('\n📄 Processing markdown files...');

  const result = await processMarkdownFiles();

  if (result.errors.length > 0) {
    console.log('\n⚠️  Processing completed with warnings:');
    result.errors.forEach((error) => {
      console.log(`   - ${error}`);
    });
  }

  console.log('\n✅ Processing completed successfully!');

  if (result.resumeEN) {
    console.log(
      `   - English resume: ${result.resumeEN.experience.length} experience entries`
    );
  }

  if (result.resumePT) {
    console.log(
      `   - Portuguese resume: ${result.resumePT.experience.length} experience entries`
    );
  }

  if (result.projects) {
    console.log(`   - Projects: ${result.projects.length} project entries`);
  }

  console.log('\n🎉 JSON files generated in src/data/ directory');
  console.log('   You can now use these files in your React components!');
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
