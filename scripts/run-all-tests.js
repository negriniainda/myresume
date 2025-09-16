#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Comprehensive test runner for the bilingual resume project
 * Runs unit tests, integration tests, accessibility tests, and e2e tests
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}Running: ${command} ${args.join(' ')}${colors.reset}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  const startTime = Date.now();
  const results = {
    unit: null,
    accessibility: null,
    e2e: null,
  };

  log(`${colors.bright}${colors.blue}🚀 Starting Comprehensive Test Suite${colors.reset}`);
  log(`${colors.yellow}This will run unit tests, accessibility tests, and e2e tests${colors.reset}\n`);

  try {
    // 1. Run unit tests with coverage
    log(`${colors.bright}${colors.magenta}📋 Step 1: Running Unit Tests with Coverage${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'test:coverage']);
      results.unit = 'PASSED';
      log(`${colors.green}✅ Unit tests passed${colors.reset}`);
    } catch (error) {
      results.unit = 'FAILED';
      log(`${colors.red}❌ Unit tests failed${colors.reset}`);
      if (process.env.CI !== 'true') {
        log(`${colors.yellow}⚠️  Continuing with other tests...${colors.reset}`);
      } else {
        throw error;
      }
    }

    // 2. Run accessibility tests specifically
    log(`\n${colors.bright}${colors.magenta}♿ Step 2: Running Accessibility Tests${colors.reset}`);
    try {
      await runCommand('npx', ['jest', 'accessibility.test.tsx', '--verbose']);
      results.accessibility = 'PASSED';
      log(`${colors.green}✅ Accessibility tests passed${colors.reset}`);
    } catch (error) {
      results.accessibility = 'FAILED';
      log(`${colors.red}❌ Accessibility tests failed${colors.reset}`);
      if (process.env.CI !== 'true') {
        log(`${colors.yellow}⚠️  Continuing with other tests...${colors.reset}`);
      } else {
        throw error;
      }
    }

    // 3. Run e2e tests
    log(`\n${colors.bright}${colors.magenta}🌐 Step 3: Running End-to-End Tests${colors.reset}`);
    try {
      // Run e2e tests with different configurations based on environment
      const e2eArgs = process.env.CI === 'true' 
        ? ['test', '--project=chromium', '--project=firefox', '--project=webkit']
        : ['test', '--project=chromium'];
      
      await runCommand('npx', ['playwright', ...e2eArgs]);
      results.e2e = 'PASSED';
      log(`${colors.green}✅ End-to-end tests passed${colors.reset}`);
    } catch (error) {
      results.e2e = 'FAILED';
      log(`${colors.red}❌ End-to-end tests failed${colors.reset}`);
      if (process.env.CI !== 'true') {
        log(`${colors.yellow}⚠️  Check the Playwright report for details${colors.reset}`);
      } else {
        throw error;
      }
    }

    // Generate summary report
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    log(`\n${colors.bright}${colors.blue}📊 Test Summary Report${colors.reset}`);
    log(`${colors.cyan}Total Duration: ${duration}s${colors.reset}\n`);

    const testTypes = [
      { name: 'Unit Tests', result: results.unit },
      { name: 'Accessibility Tests', result: results.accessibility },
      { name: 'End-to-End Tests', result: results.e2e },
    ];

    testTypes.forEach(({ name, result }) => {
      const status = result === 'PASSED' 
        ? `${colors.green}✅ PASSED${colors.reset}`
        : result === 'FAILED'
        ? `${colors.red}❌ FAILED${colors.reset}`
        : `${colors.yellow}⏭️  SKIPPED${colors.reset}`;
      
      log(`${name.padEnd(20)} ${status}`);
    });

    const allPassed = Object.values(results).every(result => result === 'PASSED');
    
    if (allPassed) {
      log(`\n${colors.bright}${colors.green}🎉 All tests passed successfully!${colors.reset}`);
      process.exit(0);
    } else {
      const failedCount = Object.values(results).filter(result => result === 'FAILED').length;
      log(`\n${colors.bright}${colors.red}💥 ${failedCount} test suite(s) failed${colors.reset}`);
      
      if (process.env.CI === 'true') {
        process.exit(1);
      } else {
        log(`${colors.yellow}Run individual test commands to debug issues:${colors.reset}`);
        log(`${colors.cyan}  npm run test:coverage${colors.reset}`);
        log(`${colors.cyan}  npx jest accessibility.test.tsx${colors.reset}`);
        log(`${colors.cyan}  npm run test:e2e${colors.reset}`);
        process.exit(1);
      }
    }

  } catch (error) {
    log(`\n${colors.red}💥 Test suite failed with error:${colors.reset}`);
    log(`${colors.red}${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Comprehensive Test Runner${colors.reset}`);
  log(`\nUsage: node scripts/run-all-tests.js [options]\n`);
  log(`Options:`);
  log(`  --help, -h     Show this help message`);
  log(`  --unit-only    Run only unit tests`);
  log(`  --e2e-only     Run only e2e tests`);
  log(`  --a11y-only    Run only accessibility tests`);
  log(`\nEnvironment Variables:`);
  log(`  CI=true        Run in CI mode (fail fast, all browsers)`);
  process.exit(0);
}

if (args.includes('--unit-only')) {
  runCommand('npm', ['run', 'test:coverage']).then(() => process.exit(0)).catch(() => process.exit(1));
} else if (args.includes('--e2e-only')) {
  runCommand('npx', ['playwright', 'test']).then(() => process.exit(0)).catch(() => process.exit(1));
} else if (args.includes('--a11y-only')) {
  runCommand('npx', ['jest', 'accessibility.test.tsx', '--verbose']).then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  runTests();
}