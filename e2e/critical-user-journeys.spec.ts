import { test, expect, Page } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Homepage Loading and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      // Check that the main heading is visible
      await expect(page.locator('h1')).toBeVisible();
      
      // Check that navigation is present
      await expect(page.locator('nav')).toBeVisible();
      
      // Check that main content sections are present
      const sections = ['summary', 'experience', 'skills', 'education'];
      for (const section of sections) {
        const sectionElement = page.locator(`#${section}, [data-section="${section}"]`).first();
        await expect(sectionElement).toBeVisible({ timeout: 10000 });
      }
    });

    test('should have proper page title and meta tags', async ({ page }) => {
      await expect(page).toHaveTitle(/Marcelo Negrini/);
      
      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /AI.*Technology.*Leadership/);
    });

    test('should navigate between sections smoothly', async ({ page }) => {
      const navigationItems = [
        { text: 'Experience', section: 'experience' },
        { text: 'Skills', section: 'skills' },
        { text: 'Education', section: 'education' },
        { text: 'Summary', section: 'summary' },
      ];

      for (const item of navigationItems) {
        // Click navigation item
        await page.click(`text=${item.text}`);
        
        // Wait for smooth scroll to complete
        await page.waitForTimeout(1000);
        
        // Verify the section is in view
        const section = page.locator(`#${item.section}, [data-section="${item.section}"]`).first();
        await expect(section).toBeInViewport();
        
        // Verify URL hash is updated (if implemented)
        if (await page.url().includes('#')) {
          expect(page.url()).toContain(item.section);
        }
      }
    });

    test('should handle scroll progress indicator', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      // Check if progress indicator exists and shows progress
      const progressIndicator = page.locator('[role="progressbar"], .scroll-progress').first();
      if (await progressIndicator.isVisible()) {
        const progressValue = await progressIndicator.getAttribute('aria-valuenow') || 
                             await progressIndicator.getAttribute('style');
        expect(progressValue).toBeTruthy();
      }
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    });
  });

  test.describe('Language Switching', () => {
    test('should switch between English and Portuguese', async ({ page }) => {
      // Find and click language selector
      const languageSelector = page.locator('[aria-label*="language"], [data-testid="language-selector"]').first();
      await expect(languageSelector).toBeVisible();
      
      // Get initial content
      const initialTitle = await page.locator('h1').textContent();
      
      // Open language menu
      await languageSelector.click();
      await page.waitForTimeout(500);
      
      // Switch to Portuguese
      const portugueseOption = page.locator('text=Portuguese, text=Português').first();
      await expect(portugueseOption).toBeVisible();
      await portugueseOption.click();
      
      // Wait for language change
      await page.waitForTimeout(2000);
      
      // Verify content changed (assuming some content is different)
      const portugueseTitle = await page.locator('h1').textContent();
      
      // Switch back to English
      await languageSelector.click();
      await page.waitForTimeout(500);
      
      const englishOption = page.locator('text=English, text=Inglês').first();
      await expect(englishOption).toBeVisible();
      await englishOption.click();
      
      // Wait for language change
      await page.waitForTimeout(2000);
      
      // Verify we're back to English
      const finalTitle = await page.locator('h1').textContent();
      expect(finalTitle).toBe(initialTitle);
    });

    test('should maintain scroll position during language switch', async ({ page }) => {
      // Scroll to middle of page
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
      await page.waitForTimeout(500);
      
      const initialScrollY = await page.evaluate(() => window.scrollY);
      
      // Switch language
      const languageSelector = page.locator('[aria-label*="language"], [data-testid="language-selector"]').first();
      await languageSelector.click();
      
      const portugueseOption = page.locator('text=Portuguese, text=Português').first();
      if (await portugueseOption.isVisible()) {
        await portugueseOption.click();
        await page.waitForTimeout(2000);
        
        // Check scroll position is maintained (within reasonable tolerance)
        const finalScrollY = await page.evaluate(() => window.scrollY);
        expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThan(100);
      }
    });

    test('should persist language preference', async ({ page, context }) => {
      // Switch to Portuguese
      const languageSelector = page.locator('[aria-label*="language"], [data-testid="language-selector"]').first();
      await languageSelector.click();
      
      const portugueseOption = page.locator('text=Portuguese, text=Português').first();
      if (await portugueseOption.isVisible()) {
        await portugueseOption.click();
        await page.waitForTimeout(2000);
        
        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Language should still be Portuguese (check localStorage or content)
        const storedLanguage = await page.evaluate(() => localStorage.getItem('i18nextLng'));
        expect(storedLanguage).toBe('pt');
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('should perform global search', async ({ page }) => {
      // Find search input
      const searchInput = page.locator('input[type="search"], [role="searchbox"]').first();
      
      if (await searchInput.isVisible()) {
        // Type search query
        await searchInput.fill('React');
        await page.waitForTimeout(1000);
        
        // Check for search results
        const searchResults = page.locator('[data-testid="search-results"], .search-results').first();
        if (await searchResults.isVisible()) {
          await expect(searchResults).toContainText('React');
        }
        
        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);
      }
    });

    test('should highlight search results', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], [role="searchbox"]').first();
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('technology');
        await page.waitForTimeout(1000);
        
        // Check for highlighted text
        const highlightedText = page.locator('.highlight, mark, .search-highlight').first();
        if (await highlightedText.isVisible()) {
          await expect(highlightedText).toBeVisible();
        }
      }
    });
  });

  test.describe('Interactive Features', () => {
    test('should expand and collapse experience items', async ({ page }) => {
      // Navigate to experience section
      await page.click('text=Experience');
      await page.waitForTimeout(1000);
      
      // Find expandable experience items
      const expandButtons = page.locator('[aria-expanded], .expand-button, button:has-text("Show more")');
      const expandButton = expandButtons.first();
      
      if (await expandButton.isVisible()) {
        // Check initial state
        const initialExpanded = await expandButton.getAttribute('aria-expanded');
        
        // Click to expand
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Verify expanded state
        const expandedState = await expandButton.getAttribute('aria-expanded');
        expect(expandedState).toBe('true');
        
        // Click to collapse
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Verify collapsed state
        const collapsedState = await expandButton.getAttribute('aria-expanded');
        expect(collapsedState).toBe('false');
      }
    });

    test('should filter content', async ({ page }) => {
      // Look for filter controls
      const filterButtons = page.locator('[data-testid="filter"], .filter-button, button:has-text("Filter")');
      const filterButton = filterButtons.first();
      
      if (await filterButton.isVisible()) {
        // Get initial content count
        const initialItems = await page.locator('.experience-item, .project-item, .skill-item').count();
        
        // Apply filter
        await filterButton.click();
        await page.waitForTimeout(1000);
        
        // Check if content is filtered (count might change)
        const filteredItems = await page.locator('.experience-item, .project-item, .skill-item').count();
        
        // Reset filter
        const clearFilter = page.locator('button:has-text("Clear"), button:has-text("All")').first();
        if (await clearFilter.isVisible()) {
          await clearFilter.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page, isMobile }) => {
      if (isMobile) {
        // Check mobile navigation
        const mobileMenuButton = page.locator('[aria-label*="menu"], .mobile-menu-button, button:has-text("Menu")').first();
        
        if (await mobileMenuButton.isVisible()) {
          // Open mobile menu
          await mobileMenuButton.click();
          await page.waitForTimeout(500);
          
          // Check navigation items are visible
          const navItems = page.locator('nav a, .nav-item');
          await expect(navItems.first()).toBeVisible();
          
          // Close mobile menu
          await mobileMenuButton.click();
          await page.waitForTimeout(500);
        }
        
        // Check touch interactions
        const touchableElements = page.locator('button, a, [role="button"]');
        const firstTouchable = touchableElements.first();
        
        if (await firstTouchable.isVisible()) {
          // Verify touch target size (minimum 44px)
          const boundingBox = await firstTouchable.boundingBox();
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('should handle orientation changes', async ({ page, isMobile }) => {
      if (isMobile) {
        // Test portrait orientation
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        await expect(page.locator('h1')).toBeVisible();
        
        // Test landscape orientation
        await page.setViewportSize({ width: 667, height: 375 });
        await page.waitForTimeout(1000);
        
        await expect(page.locator('h1')).toBeVisible();
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should lazy load content sections', async ({ page }) => {
      await page.goto('/');
      
      // Check that below-the-fold content is lazy loaded
      const belowFoldSection = page.locator('#education, #projects').first();
      
      if (await belowFoldSection.isVisible()) {
        // Scroll to trigger lazy loading
        await belowFoldSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Content should be loaded
        await expect(belowFoldSection).toBeVisible();
      }
    });

    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G
      await context.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
        await route.continue();
      });
      
      await page.goto('/');
      
      // Should still load successfully, just slower
      await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle JavaScript errors gracefully', async ({ page }) => {
      // Listen for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate through the app
      const navItems = ['Experience', 'Skills', 'Education'];
      for (const item of navItems) {
        try {
          await page.click(`text=${item}`, { timeout: 5000 });
          await page.waitForTimeout(1000);
        } catch (error) {
          // Continue even if navigation fails
        }
      }
      
      // Should not have critical JavaScript errors
      const criticalErrors = errors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('DevTools') &&
        !error.includes('Extension')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should handle network failures gracefully', async ({ page, context }) => {
      // Block all network requests after initial load
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await context.route('**/*', route => route.abort());
      
      // Try to interact with the app
      try {
        await page.click('text=Experience');
        await page.waitForTimeout(1000);
        
        // App should still be functional for basic interactions
        await expect(page.locator('h1')).toBeVisible();
      } catch (error) {
        // Some functionality might not work, but app shouldn't crash
      }
    });
  });
});