import { test, expect, Page } from '@playwright/test';

test.describe('Responsive Design Validation', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667, name: 'Mobile' },
    mobileLarge: { width: 414, height: 896, name: 'Mobile Large' },
    tablet: { width: 768, height: 1024, name: 'Tablet' },
    tabletLarge: { width: 1024, height: 768, name: 'Tablet Large' },
    desktop: { width: 1280, height: 720, name: 'Desktop' },
    desktopLarge: { width: 1920, height: 1080, name: 'Desktop Large' },
    ultraWide: { width: 2560, height: 1440, name: 'Ultra Wide' },
  };

  Object.entries(breakpoints).forEach(([key, viewport]) => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      });

      test('should display content without horizontal scroll', async ({ page }) => {
        const scrollInfo = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          bodyScrollWidth: document.body.scrollWidth,
          bodyClientWidth: document.body.clientWidth,
        }));

        // Allow small tolerance for scrollbars
        const tolerance = 20;
        expect(scrollInfo.scrollWidth).toBeLessThanOrEqual(scrollInfo.clientWidth + tolerance);
        expect(scrollInfo.bodyScrollWidth).toBeLessThanOrEqual(scrollInfo.bodyClientWidth + tolerance);
      });

      test('should have readable text sizes', async ({ page }) => {
        const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6').all();
        
        for (const element of textElements.slice(0, 10)) { // Check first 10 elements
          if (await element.isVisible()) {
            const fontSize = await element.evaluate(el => {
              const style = window.getComputedStyle(el);
              return parseFloat(style.fontSize);
            });
            
            // Minimum font size should be 14px on mobile, 16px on desktop
            const minFontSize = viewport.width < 768 ? 14 : 16;
            expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
          }
        }
      });

      test('should have appropriate touch targets on mobile', async ({ page }) => {
        if (viewport.width < 768) {
          const interactiveElements = await page.locator('button, a, input, select, [role="button"]').all();
          
          for (const element of interactiveElements.slice(0, 10)) {
            if (await element.isVisible()) {
              const boundingBox = await element.boundingBox();
              if (boundingBox) {
                // Touch targets should be at least 44x44px
                expect(boundingBox.width).toBeGreaterThanOrEqual(44);
                expect(boundingBox.height).toBeGreaterThanOrEqual(44);
              }
            }
          }
        }
      });

      test('should display navigation appropriately', async ({ page }) => {
        if (viewport.width < 768) {
          // Mobile: should have mobile menu
          const mobileMenuButton = page.locator('[aria-label*="menu"], .mobile-menu-button, button:has-text("Menu")').first();
          
          if (await mobileMenuButton.isVisible()) {
            await expect(mobileMenuButton).toBeVisible();
            
            // Test mobile menu functionality
            await mobileMenuButton.click();
            await page.waitForTimeout(500);
            
            const mobileNav = page.locator('nav, .mobile-nav').first();
            await expect(mobileNav).toBeVisible();
            
            // Close menu
            await mobileMenuButton.click();
            await page.waitForTimeout(500);
          }
        } else {
          // Desktop: should have full navigation visible
          const desktopNav = page.locator('nav a').first();
          await expect(desktopNav).toBeVisible();
        }
      });

      test('should layout content appropriately', async ({ page }) => {
        // Check main content areas
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
        
        // Check that content sections are properly spaced
        const sections = await page.locator('section, [data-section]').all();
        
        for (const section of sections.slice(0, 5)) {
          if (await section.isVisible()) {
            const boundingBox = await section.boundingBox();
            if (boundingBox) {
              // Sections should not be too narrow
              const minWidth = viewport.width < 768 ? viewport.width * 0.9 : 300;
              expect(boundingBox.width).toBeGreaterThanOrEqual(minWidth);
            }
          }
        }
      });

      test('should handle images responsively', async ({ page }) => {
        const images = await page.locator('img').all();
        
        for (const image of images.slice(0, 5)) {
          if (await image.isVisible()) {
            const imageInfo = await image.evaluate(img => ({
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              displayWidth: img.offsetWidth,
              displayHeight: img.offsetHeight,
              maxWidth: window.getComputedStyle(img).maxWidth,
            }));
            
            // Images should not exceed container width
            expect(imageInfo.displayWidth).toBeLessThanOrEqual(viewport.width);
            
            // Images should have responsive styling
            expect(['100%', 'auto', `${imageInfo.displayWidth}px`]).toContain(imageInfo.maxWidth);
          }
        }
      });

      test('should maintain proper spacing and margins', async ({ page }) => {
        const containerElements = await page.locator('.container, .max-w-', '[class*="mx-auto"]').all();
        
        for (const container of containerElements.slice(0, 3)) {
          if (await container.isVisible()) {
            const spacing = await container.evaluate(el => {
              const style = window.getComputedStyle(el);
              return {
                marginLeft: parseFloat(style.marginLeft),
                marginRight: parseFloat(style.marginRight),
                paddingLeft: parseFloat(style.paddingLeft),
                paddingRight: parseFloat(style.paddingRight),
                width: el.offsetWidth,
              };
            });
            
            // Should have appropriate margins/padding
            const minSpacing = viewport.width < 768 ? 16 : 24;
            expect(spacing.paddingLeft + spacing.paddingRight).toBeGreaterThanOrEqual(minSpacing);
          }
        }
      });
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle portrait to landscape transition', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify portrait layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(1000);
      
      // Verify landscape layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Check that content is still accessible
      const scrollInfo = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      
      expect(scrollInfo.scrollWidth).toBeLessThanOrEqual(scrollInfo.clientWidth + 20);
    });

    test('should handle landscape to portrait transition', async ({ page }) => {
      // Start in landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify landscape layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Switch to portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Verify portrait layout
      await expect(page.locator('h1')).toBeVisible();
      
      // Check mobile navigation if applicable
      const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu-button').first();
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
    });
  });

  test.describe('Dynamic Content Resizing', () => {
    test('should handle content expansion at different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1280, height: 720 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Find expandable content
        const expandButton = page.locator('[aria-expanded], button:has-text("Show more"), .expand-button').first();
        
        if (await expandButton.isVisible()) {
          // Get initial height
          const initialHeight = await page.evaluate(() => document.body.scrollHeight);
          
          // Expand content
          await expandButton.click();
          await page.waitForTimeout(1000);
          
          // Check that content expanded properly
          const expandedHeight = await page.evaluate(() => document.body.scrollHeight);
          expect(expandedHeight).toBeGreaterThan(initialHeight);
          
          // Check that expanded content doesn't cause horizontal scroll
          const scrollInfo = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          
          expect(scrollInfo.scrollWidth).toBeLessThanOrEqual(scrollInfo.clientWidth + 20);
        }
      }
    });

    test('should handle search results at different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 1280, height: 720 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Find search input
        const searchInput = page.locator('input[type="search"], [role="searchbox"]').first();
        
        if (await searchInput.isVisible()) {
          // Perform search
          await searchInput.fill('React');
          await page.waitForTimeout(1000);
          
          // Check search results layout
          const searchResults = page.locator('[data-testid="search-results"], .search-results').first();
          
          if (await searchResults.isVisible()) {
            const resultsBox = await searchResults.boundingBox();
            if (resultsBox) {
              // Results should not exceed viewport width
              expect(resultsBox.width).toBeLessThanOrEqual(viewport.width);
              expect(resultsBox.x + resultsBox.width).toBeLessThanOrEqual(viewport.width);
            }
          }
        }
      }
    });
  });

  test.describe('Accessibility at Different Screen Sizes', () => {
    test('should maintain focus visibility across screen sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 1280, height: 720 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Tab to first focusable element
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        
        // Check that focused element is visible
        const focusedElement = await page.evaluate(() => {
          const focused = document.activeElement;
          if (focused) {
            const rect = focused.getBoundingClientRect();
            return {
              tag: focused.tagName,
              visible: rect.width > 0 && rect.height > 0,
              inViewport: rect.top >= 0 && rect.left >= 0 && 
                         rect.bottom <= window.innerHeight && 
                         rect.right <= window.innerWidth,
            };
          }
          return null;
        });
        
        if (focusedElement) {
          expect(focusedElement.visible).toBe(true);
          expect(focusedElement.inViewport).toBe(true);
        }
      }
    });

    test('should maintain proper heading hierarchy at all sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1280, height: 720 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const headings = await page.evaluate(() => {
          const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          return headingElements.map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent?.trim(),
            visible: h.offsetWidth > 0 && h.offsetHeight > 0,
          }));
        });
        
        // Should have at least one h1
        const h1Count = headings.filter(h => h.level === 1 && h.visible).length;
        expect(h1Count).toBeGreaterThanOrEqual(1);
        
        // Heading levels should be logical (no skipping levels)
        const visibleHeadings = headings.filter(h => h.visible);
        for (let i = 1; i < visibleHeadings.length; i++) {
          const currentLevel = visibleHeadings[i].level;
          const previousLevel = visibleHeadings[i - 1].level;
          
          // Should not skip more than one level
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  test.describe('Performance at Different Screen Sizes', () => {
    test('should load efficiently on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 6 seconds (allowing for slower connections)
      expect(loadTime).toBeLessThan(6000);
      
      // Check that critical content is visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    });

    test('should load efficiently on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Desktop should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      
      // Check that all main sections are visible
      const sections = ['summary', 'experience', 'skills', 'education'];
      for (const section of sections) {
        const sectionElement = page.locator(`#${section}, [data-section="${section}"]`).first();
        await expect(sectionElement).toBeVisible({ timeout: 5000 });
      }
    });

    test('should handle image loading responsively', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 1280, height: 720, name: 'Desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const images = await page.locator('img').all();
        
        for (const image of images.slice(0, 3)) {
          if (await image.isVisible()) {
            // Check that image has loaded
            const imageLoaded = await image.evaluate(img => img.complete && img.naturalHeight !== 0);
            expect(imageLoaded).toBe(true);
            
            // Check that image size is appropriate for viewport
            const imageSize = await image.boundingBox();
            if (imageSize) {
              expect(imageSize.width).toBeLessThanOrEqual(viewport.width);
            }
          }
        }
      }
    });
  });
});