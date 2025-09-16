#!/usr/bin/env node

const https = require('https');
const http = require('http');

const SITE_URL = process.env.SITE_URL || 'https://marcelonegrini.netlify.app';
const TIMEOUT = 10000; // 10 seconds

console.log(`🔥 Running smoke tests against: ${SITE_URL}\n`);

const tests = [
  {
    name: 'Homepage loads',
    path: '/',
    checks: [
      (content) => content.includes('Marcelo Negrini'),
      (content) => content.includes('<!DOCTYPE html>'),
      (content) => content.includes('lang="en"')
    ]
  },
  {
    name: 'Portuguese version loads',
    path: '/pt/',
    checks: [
      (content) => content.includes('Marcelo Negrini'),
      (content) => content.includes('lang="pt"'),
      (content) => content.includes('<!DOCTYPE html>')
    ]
  },
  {
    name: 'Sitemap is accessible',
    path: '/sitemap.xml',
    checks: [
      (content) => content.includes('<?xml'),
      (content) => content.includes('urlset'),
      (content) => content.includes('marcelonegrini')
    ]
  },
  {
    name: 'Robots.txt is accessible',
    path: '/robots.txt',
    checks: [
      (content) => content.includes('User-agent:'),
      (content) => content.includes('Sitemap:')
    ]
  },
  {
    name: 'PWA manifest is accessible',
    path: '/manifest.json',
    checks: [
      (content) => content.includes('"name"'),
      (content) => content.includes('"icons"')
    ]
  }
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTest(test) {
  const url = `${SITE_URL}${test.path}`;
  console.log(`🧪 Testing: ${test.name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await makeRequest(url);
    
    // Check status code
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    // Run content checks
    for (let i = 0; i < test.checks.length; i++) {
      const check = test.checks[i];
      if (!check(response.body)) {
        throw new Error(`Content check ${i + 1} failed`);
      }
    }
    
    // Check response time (basic)
    const contentLength = response.headers['content-length'] || response.body.length;
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   ✅ Size: ${contentLength} bytes`);
    console.log(`   ✅ All content checks passed`);
    
    // Check important headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection'
    ];
    
    securityHeaders.forEach(header => {
      if (response.headers[header]) {
        console.log(`   ✅ Security header: ${header}`);
      } else {
        console.log(`   ⚠️  Missing security header: ${header}`);
      }
    });
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting smoke tests...\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push({ test: test.name, passed: result });
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('🔥 SMOKE TEST RESULTS');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
  });
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All smoke tests passed! Site is healthy.');
    
    // Additional health checks
    console.log('\n🏥 Additional Health Checks:');
    
    try {
      // Check if site loads quickly
      const start = Date.now();
      await makeRequest(SITE_URL);
      const loadTime = Date.now() - start;
      
      if (loadTime < 3000) {
        console.log(`✅ Fast load time: ${loadTime}ms`);
      } else {
        console.log(`⚠️  Slow load time: ${loadTime}ms`);
      }
      
      // Check if both languages are working
      const enResponse = await makeRequest(`${SITE_URL}/`);
      const ptResponse = await makeRequest(`${SITE_URL}/pt/`);
      
      if (enResponse.body !== ptResponse.body) {
        console.log('✅ Language versions are different');
      } else {
        console.log('⚠️  Language versions appear identical');
      }
      
    } catch (error) {
      console.log(`⚠️  Health check failed: ${error.message}`);
    }
    
    process.exit(0);
  } else {
    console.log('❌ Some smoke tests failed. Please investigate.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error.message);
  process.exit(1);
});

// Run the tests
runAllTests();