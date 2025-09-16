#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...\n');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_BUILD_TIME = new Date().toISOString();
process.env.NEXT_PUBLIC_BUILD_ID = process.env.GITHUB_SHA || 'local-build';

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Run linting (non-blocking)
  console.log('🔍 Running linting...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Linting warnings found, continuing build...');
  }

  // Run type checking (non-blocking)
  console.log('🔧 Running type checking...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Type checking issues found, continuing build...');
  }

  // Run tests (non-blocking)
  console.log('🧪 Running tests...');
  try {
    execSync('npm test -- --coverage --watchAll=false --passWithNoTests', { 
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
  } catch (error) {
    console.warn('⚠️  Some tests failed, continuing build...');
  }

  // Build the application
  console.log('🏗️  Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify build output
  console.log('✅ Verifying build output...');
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    throw new Error('Build output directory not found');
  }

  const indexFile = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    throw new Error('Main index.html file not found in build output');
  }

  // Check for required files
  const requiredFiles = [
    'sitemap.xml',
    'robots.txt',
    'manifest.json',
    '_next/static'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(outDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${file} not found in build output`);
    } else {
      console.log(`✅ Found: ${file}`);
    }
  }

  // Generate build report
  console.log('📊 Generating build report...');
  const buildReport = {
    buildTime: new Date().toISOString(),
    buildId: process.env.NEXT_PUBLIC_BUILD_ID,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://marcelonegrini.netlify.app',
    files: fs.readdirSync(outDir, { recursive: true }).length,
    size: getDirSize(outDir)
  };

  fs.writeFileSync(
    path.join(outDir, 'build-report.json'),
    JSON.stringify(buildReport, null, 2)
  );

  console.log('\n🎉 Production build completed successfully!');
  console.log(`📁 Output directory: ${outDir}`);
  console.log(`📊 Total files: ${buildReport.files}`);
  console.log(`💾 Total size: ${formatBytes(buildReport.size)}`);
  console.log(`🌐 Site URL: ${buildReport.siteUrl}`);

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}

function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  }
  
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}