import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up any global resources
  // For example, you might want to:
  // - Clean up test data
  // - Reset application state
  // - Generate final reports
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;