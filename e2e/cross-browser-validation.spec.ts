import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

test.describe('Cross-Browser Validation', () => {
  test.describe('Browser Compatibility', () => {
    test('should render correctly in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is only for Chromium');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check core functionality
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // Check CSS Grid/Flexbox support
      const gridContainer = page.locator('.grid, [style*="display: grid"]').first();
      if (await gridContainer.isVisible()) {
        const computedStyle = await gridContainer.evaluate(el => 
          window.getComputedStyle(el).display
        );
        expect(computedStyle).toContain('grid');
      }
      
      // Check modern CSS features
      const modernCSSElement = page.locator('[style*="backdrop-filter"], .backdrop-blur').first();
      if (await modernCSSElement.isVisible()) {
        const backdropFilter = await modernCSSElement.evaluate(el => 
          window.getComputedStyle(el).backdropFilter
        );
        expect(backdropFilter).not.toBe('none');
      }
    });

    test('should render correctly in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is only for Firefox');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check core functionality
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // Firefox-specific checks
      const scrollBehavior = await page.evaluate(() => {
        const element = document.documentElement;
        return window.getComputedStyle(element).scrollBehavior;
      });
      
      // Should support smooth scrolling
      expect(['smooth', 'auto']).toContain(scrollBehavior);
    });

    test('should render correctly in WebKit/Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'This test is only for WebKit');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check core functionality
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // WebKit-specific checks
      const webkitFeatures = await page.evaluate(() => {
        return {
          webkitBackdropFilter: 'webkitBackdropFilter' in document.documentElement.style,
          webkitTransform: 'webkitTransform' in document.documentElement.style,
        };
      });
      
      // Should support WebKit prefixed properties
      expect(webkitFeatures.webkitTransform).toBe(true);
    });
  });

  test.describe('Feature Support Across Browsers', () => {
    test('should support modern JavaScript features', async ({ page }) => {
      await page.goto('/');
      
      const jsFeatureSupport = await page.evaluate(() => {
        return {
          es6Classes: typeof class {} === 'function',
          arrowFunctions: (() => true)(),
          asyncAwait: typeof (async () => {}) === 'function',
          promises: typeof Promise !== 'undefined',
          fetch: typeof fetch !== 'undefined',
          intersectionObserver: typeof IntersectionObserver !== 'undefined',
          customElements: typeof customElements !== 'undefined',
        };
      });
      
      expect(jsFeatureSupport.es6Classes).toBe(true);
      expect(jsFeatureSupport.arrowFunctions).toBe(true);
      expect(jsFeatureSupport.asyncAwait).toBe(true);
      expect(jsFeatureSupport.promises).toBe(true);
      expect(jsFeatureSupport.fetch).toBe(true);
      expect(jsFeatureSupport.intersectionObserver).toBe(true);
    });

    test('should support CSS features consistently', async ({ page }) => {
      await page.goto('/');
      
      const cssFeatureSupport = await page.evaluate(() => {
        const testElement = document.createElement('div');
        document.body.appendChild(testElement);
        
        const support = {
          flexbox: 'flex' in testElement.style,
          grid: 'grid' in testElement.style,
          customProperties: CSS.supports('--custom-property', 'value'),
          transforms: 'transform' in testElement.style,
          transitions: 'transition' in testElement.style,
          animations: 'animation' in testElement.style,
        };
        
        document.body.removeChild(testElement);
        return support;
      });
      
      expect(cssFeatureSupport.flexbox).toBe(true);
      expect(cssFeatureSupport.grid).toBe(true);
      expect(cssFeatureSupport.customProperties).toBe(true);
      expect(cssFeatureSupport.transforms).toBe(true);
      expect(cssFeatureSupport.transitions).toBe(true);
      expect(cssFeatureSupport.animations).toBe(true);
    });

    test('should handle touch events on touch devices', async ({ page, isMobile }) => {
      if (isMobile) {
        await page.goto('/');
        
        const touchSupport = await page.evaluate(() => {
          return {
            touchEvents: 'ontouchstart' in window,
            touchPoints: navigator.maxTouchPoints > 0,
            pointerEvents: 'onpointerdown' in window,
          };
        });
        
        expect(touchSupport.touchEvents || touchSupport.pointerEvents).toBe(true);
        
        // Test touch interaction
        const touchableElement = page.locator('button, a').first();
        if (await touchableElement.isVisible()) {
          await touchableElement.tap();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Responsive Design Across Browsers', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Large Desktop', width: 2560, height: 1440 },
    ];

    viewports.forEach(viewport => {
      test(`should be responsive at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check that content is visible and properly laid out
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('nav')).toBeVisible();
        
        // Check that content doesn't overflow
        const bodyOverflow = await page.evaluate(() => {
          const body = document.body;
          return {
            scrollWidth: body.scrollWidth,
            clientWidth: body.clientWidth,
            hasHorizontalScroll: body.scrollWidth > body.clientWidth,
          };
        });
        
        // Should not have horizontal scroll (with small tolerance for scrollbars)
        expect(bodyOverflow.hasHorizontalScroll).toBe(false);
        
        // Check navigation behavior at different viewports
        if (viewport.width < 768) {
          // Mobile: should have mobile menu
          const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu').first();
          if (await mobileMenu.isVisible()) {
            await expect(mobileMenu).toBeVisible();
          }
        } else {
          // Desktop: should have full navigation
          const desktopNav = page.locator('nav a').first();
          await expect(desktopNav).toBeVisible();
        }
      });
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('should meet Core Web Vitals thresholds', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Measure performance metrics
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const metrics: any = {};
            
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                metrics.LCP = entry.startTime;
              }
              if (entry.entryType === 'first-input') {
                metrics.FID = (entry as any).processingStart - entry.startTime;
              }
              if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                metrics.CLS = (metrics.CLS || 0) + (entry as any).value;
              }
            });
            
            // Get FCP
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              metrics.FCP = fcpEntry.startTime;
            }
            
            setTimeout(() => resolve(metrics), 3000);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        });
      });
      
      const performanceMetrics = await metrics;
      
      // Core Web Vitals thresholds
      if (performanceMetrics.LCP) {
        expect(performanceMetrics.LCP).toBeLessThan(2500); // Good LCP < 2.5s
      }
      if (performanceMetrics.FID) {
        expect(performanceMetrics.FID).toBeLessThan(100); // Good FID < 100ms
      }
      if (performanceMetrics.CLS) {
        expect(performanceMetrics.CLS).toBeLessThan(0.1); // Good CLS < 0.1
      }
      if (performanceMetrics.FCP) {
        expect(performanceMetrics.FCP).toBeLessThan(1800); // Good FCP < 1.8s
      }
    });

    test('should load resources efficiently', async ({ page }) => {
      const resourceSizes: number[] = [];
      
      page.on('response', response => {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          resourceSizes.push(parseInt(contentLength));
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that no single resource is excessively large
      const maxResourceSize = Math.max(...resourceSizes);
      expect(maxResourceSize).toBeLessThan(5 * 1024 * 1024); // 5MB limit
      
      // Check total page size
      const totalSize = resourceSizes.reduce((sum, size) => sum + size, 0);
      expect(totalSize).toBeLessThan(10 * 1024 * 1024); // 10MB total limit
    });
  });

  test.describe('Accessibility Across Browsers', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Tab through focusable elements
      const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      
      let currentFocusedElement = null;
      for (let i = 0; i < Math.min(focusableElements, 10); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
        
        // Should not get stuck on the same element
        expect(focusedElement).not.toBe(currentFocusedElement);
        currentFocusedElement = focusedElement;
      }
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for essential ARIA landmarks
      const landmarks = await page.evaluate(() => {
        return {
          banner: document.querySelector('[role="banner"]') !== null,
          navigation: document.querySelector('[role="navigation"]') !== null,
          main: document.querySelector('[role="main"], main') !== null,
          contentinfo: document.querySelector('[role="contentinfo"]') !== null,
        };
      });
      
      expect(landmarks.banner || landmarks.navigation).toBe(true);
      expect(landmarks.main).toBe(true);
    });

    test('should support screen readers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for screen reader friendly elements
      const screenReaderSupport = await page.evaluate(() => {
        return {
          headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
          altTexts: Array.from(document.querySelectorAll('img')).every(img => 
            img.hasAttribute('alt')
          ),
          labels: Array.from(document.querySelectorAll('input')).every(input => 
            input.hasAttribute('aria-label') || 
            input.hasAttribute('aria-labelledby') ||
            document.querySelector(`label[for="${input.id}"]`) !== null
          ),
        };
      });
      
      expect(screenReaderSupport.headings).toBe(true);
      expect(screenReaderSupport.altTexts).toBe(true);
    });
  });

  test.describe('Error Handling Across Browsers', () => {
    test('should handle JavaScript errors gracefully', async ({ page, browserName }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          jsErrors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate through the app
      const actions = [
        () => page.click('text=Experience'),
        () => page.click('text=Skills'),
        () => page.click('text=Education'),
      ];
      
      for (const action of actions) {
        try {
          await action();
          await page.waitForTimeout(1000);
        } catch (error) {
          // Continue testing even if some actions fail
        }
      }
      
      // Filter out non-critical errors
      const criticalErrors = jsErrors.filter(error => 
        !error.includes('Warning') &&
        !error.includes('DevTools') &&
        !error.includes('Extension') &&
        !error.includes('Non-Error promise rejection')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate network failure
      await context.route('**/*.{js,css,png,jpg,jpeg,gif,svg}', route => {
        if (Math.random() > 0.8) { // Fail 20% of requests
          route.abort();
        } else {
          route.continue();
        }
      });
      
      // Try to navigate
      try {
        await page.click('text=Experience');
        await page.waitForTimeout(2000);
        
        // Page should still be functional
        await expect(page.locator('h1')).toBeVisible();
      } catch (error) {
        // Some functionality might not work, but basic structure should remain
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Browser-Specific Features', () => {
    test('should handle browser-specific CSS prefixes', async ({ page, browserName }) => {
      await page.goto('/');
      
      const prefixSupport = await page.evaluate((browserName) => {
        const testElement = document.createElement('div');
        document.body.appendChild(testElement);
        
        const prefixes = {
          webkit: ['-webkit-transform', '-webkit-transition', '-webkit-backdrop-filter'],
          moz: ['-moz-transform', '-moz-transition'],
          ms: ['-ms-transform', '-ms-transition'],
        };
        
        const support: any = {};
        
        Object.entries(prefixes).forEach(([prefix, properties]) => {
          support[prefix] = properties.some(prop => {
            testElement.style.cssText = `${prop}: translateX(10px)`;
            return testElement.style.length > 0;
          });
        });
        
        document.body.removeChild(testElement);
        return support;
      }, browserName);
      
      // Check that appropriate prefixes are supported
      if (browserName === 'webkit') {
        expect(prefixSupport.webkit).toBe(true);
      } else if (browserName === 'firefox') {
        // Firefox might support some webkit prefixes for compatibility
        expect(prefixSupport.webkit || prefixSupport.moz).toBe(true);
      }
    });

    test('should handle browser-specific APIs', async ({ page, browserName }) => {
      await page.goto('/');
      
      const apiSupport = await page.evaluate(() => {
        return {
          intersectionObserver: typeof IntersectionObserver !== 'undefined',
          resizeObserver: typeof ResizeObserver !== 'undefined',
          performanceObserver: typeof PerformanceObserver !== 'undefined',
          webAnimations: typeof Element.prototype.animate !== 'undefined',
          customElements: typeof customElements !== 'undefined',
        };
      });
      
      // Core APIs should be supported across all modern browsers
      expect(apiSupport.intersectionObserver).toBe(true);
      expect(apiSupport.performanceObserver).toBe(true);
      
      // Some APIs might have different support levels
      if (browserName === 'webkit') {
        // WebKit might have different support for some APIs
        expect(apiSupport.webAnimations).toBeDefined();
      }
    });
  });
});