import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto(config.webServer?.url || 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    // Verify the page loads correctly
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Development server is ready');
    
    // Pre-warm the application
    console.log('🔥 Pre-warming application...');
    
    // Navigate to key sections to trigger lazy loading
    const sections = ['#summary', '#experience', '#skills', '#education'];
    for (const section of sections) {
      try {
        await page.click(`a[href="${section}"]`, { timeout: 5000 });
        await page.waitForTimeout(1000); // Allow content to load
      } catch (error) {
        console.warn(`Could not navigate to ${section}:`, error);
      }
    }
    
    // Test language switching
    try {
      const languageButton = page.locator('[aria-label*="language"], [data-testid="language-selector"]').first();
      if (await languageButton.isVisible({ timeout: 5000 })) {
        await languageButton.click();
        await page.waitForTimeout(1000);
        
        // Switch to Portuguese
        const portugueseOption = page.locator('text=Portuguese, text=Português').first();
        if (await portugueseOption.isVisible({ timeout: 3000 })) {
          await portugueseOption.click();
          await page.waitForTimeout(2000);
        }
        
        // Switch back to English
        await languageButton.click();
        const englishOption = page.locator('text=English, text=Inglês').first();
        if (await englishOption.isVisible({ timeout: 3000 })) {
          await englishOption.click();
          await page.waitForTimeout(2000);
        }
      }
    } catch (error) {
      console.warn('Could not test language switching:', error);
    }
    
    console.log('✅ Application pre-warming complete');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;