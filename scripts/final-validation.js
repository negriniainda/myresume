#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting final validation process...\n');

const results = {
  build: false,
  tests: false,
  e2e: false,
  lighthouse: false,
  accessibility: false,
  seo: false,
  performance: false,
  languages: false
};

let hasErrors = false;

// Helper function to run command and capture result
function runTest(name, command, options = {}) {
  console.log(`🧪 Running ${name}...`);
  try {
    execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    console.log(`✅ ${name} passed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} failed\n`);
    if (options.critical !== false) {
      hasErrors = true;
    }
    return false;
  }
}

// Helper function to check file exists
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists`);
    return true;
  } else {
    console.error(`❌ ${description} missing: ${filePath}`);
    hasErrors = true;
    return false;
  }
}

try {
  // 1. Build validation
  console.log('🏗️  STEP 1: Build Validation');
  console.log('=' .repeat(50));
  
  results.build = runTest('Production build', 'npm run build');
  
  if (results.build) {
    // Check build output
    const outDir = path.join(process.cwd(), 'out');
    checkFile(path.join(outDir, 'index.html'), 'Main index.html');
    checkFile(path.join(outDir, 'sitemap.xml'), 'Sitemap');
    checkFile(path.join(outDir, 'robots.txt'), 'Robots.txt');
    checkFile(path.join(outDir, 'manifest.json'), 'PWA manifest');
    
    // Check language versions
    checkFile(path.join(outDir, 'pt', 'index.html'), 'Portuguese version');
    checkFile(path.join(outDir, 'en', 'index.html'), 'English version');
  }

  // 2. Unit and Integration Tests
  console.log('\n🧪 STEP 2: Unit and Integration Tests');
  console.log('=' .repeat(50));
  
  results.tests = runTest(
    'Unit tests with coverage', 
    'npm test -- --coverage --watchAll=false --passWithNoTests',
    { env: { ...process.env, CI: 'true' } }
  );

  // 3. Accessibility Testing
  console.log('\n♿ STEP 3: Accessibility Testing');
  console.log('=' .repeat(50));
  
  results.accessibility = runTest(
    'Accessibility tests',
    'npm test -- --testPathPattern=accessibility --watchAll=false',
    { env: { ...process.env, CI: 'true' }, critical: false }
  );

  // 4. SEO Validation
  console.log('\n🔍 STEP 4: SEO Validation');
  console.log('=' .repeat(50));
  
  results.seo = runTest(
    'SEO components tests',
    'npm test -- --testPathPattern=seo-components --watchAll=false',
    { env: { ...process.env, CI: 'true' } }
  );

  // Validate SEO files content
  if (fs.existsSync('out/sitemap.xml')) {
    const sitemap = fs.readFileSync('out/sitemap.xml', 'utf8');
    if (sitemap.includes('marcelonegrini.com') && sitemap.includes('hreflang')) {
      console.log('✅ Sitemap contains required URLs and hreflang');
    } else {
      console.error('❌ Sitemap missing required content');
      hasErrors = true;
    }
  }

  if (fs.existsSync('out/robots.txt')) {
    const robots = fs.readFileSync('out/robots.txt', 'utf8');
    if (robots.includes('Sitemap:') && robots.includes('User-agent:')) {
      console.log('✅ Robots.txt properly configured');
    } else {
      console.error('❌ Robots.txt missing required directives');
      hasErrors = true;
    }
  }

  // 5. Language Switching Validation
  console.log('\n🌐 STEP 5: Language Switching Validation');
  console.log('=' .repeat(50));
  
  // Check if both language versions exist and have different content
  if (fs.existsSync('out/index.html') && fs.existsSync('out/pt/index.html')) {
    const enContent = fs.readFileSync('out/index.html', 'utf8');
    const ptContent = fs.readFileSync('out/pt/index.html', 'utf8');
    
    if (enContent !== ptContent) {
      console.log('✅ Language versions have different content');
      results.languages = true;
    } else {
      console.error('❌ Language versions are identical');
      hasErrors = true;
    }
    
    // Check for language-specific meta tags
    if (enContent.includes('lang="en"') && ptContent.includes('lang="pt"')) {
      console.log('✅ Language meta tags correctly set');
    } else {
      console.error('❌ Language meta tags missing or incorrect');
      hasErrors = true;
    }
  }

  // 6. Performance Validation (Lighthouse)
  console.log('\n⚡ STEP 6: Performance Validation');
  console.log('=' .repeat(50));
  
  results.lighthouse = runTest(
    'Lighthouse performance audit',
    'npm run lighthouse:local',
    { critical: false }
  );

  // 7. E2E Tests (if available)
  console.log('\n🎭 STEP 7: End-to-End Tests');
  console.log('=' .repeat(50));
  
  if (fs.existsSync('playwright.config.ts')) {
    results.e2e = runTest(
      'E2E tests',
      'npm run test:e2e',
      { critical: false }
    );
  } else {
    console.log('⚠️  E2E tests not configured, skipping...');
  }

  // 8. Bundle Analysis
  console.log('\n📦 STEP 8: Bundle Analysis');
  console.log('=' .repeat(50));
  
  if (fs.existsSync('out/_next/static')) {
    const staticDir = path.join('out', '_next', 'static');
    const files = fs.readdirSync(staticDir, { recursive: true });
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    console.log(`📊 JavaScript files: ${jsFiles.length}`);
    console.log(`🎨 CSS files: ${cssFiles.length}`);
    
    // Check for large files
    let hasLargeFiles = false;
    files.forEach(file => {
      const filePath = path.join(staticDir, file);
      if (fs.statSync(filePath).isFile()) {
        const size = fs.statSync(filePath).size;
        if (size > 500 * 1024) { // 500KB
          console.warn(`⚠️  Large file detected: ${file} (${Math.round(size / 1024)}KB)`);
          hasLargeFiles = true;
        }
      }
    });
    
    if (!hasLargeFiles) {
      console.log('✅ No excessively large files detected');
    }
  }

  // Generate final report
  console.log('\n📋 FINAL VALIDATION REPORT');
  console.log('=' .repeat(50));
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} test suites`);
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  if (hasErrors) {
    console.log('\n❌ VALIDATION FAILED - Please fix the issues above before deploying');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL VALIDATIONS PASSED - Ready for deployment!');
    
    // Generate deployment checklist
    const checklist = {
      timestamp: new Date().toISOString(),
      buildId: process.env.GITHUB_SHA || 'local-build',
      validationResults: results,
      deploymentReady: true,
      nextSteps: [
        '1. Commit and push changes to trigger CI/CD',
        '2. Monitor deployment in Netlify dashboard',
        '3. Run post-deployment smoke tests',
        '4. Update DNS if needed',
        '5. Monitor Core Web Vitals and error rates'
      ]
    };
    
    fs.writeFileSync('deployment-checklist.json', JSON.stringify(checklist, null, 2));
    console.log('📋 Deployment checklist saved to deployment-checklist.json');
  }

} catch (error) {
  console.error('\n💥 Validation process failed:', error.message);
  process.exit(1);
}