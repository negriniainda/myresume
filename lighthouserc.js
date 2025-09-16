module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      numberOfRuns: 3,
      url: [
        'http://localhost/index.html',
        'http://localhost/pt/index.html',
      ],
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:pwa': ['warn', { minScore: 0.80 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'hreflang': 'error',
        'canonical': 'error',
        
        // Performance
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-webp-images': 'warn',
        'efficient-animated-content': 'warn',
        'preload-lcp-image': 'warn',
        
        // Best Practices
        'uses-https': 'error',
        'is-on-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      command: 'npx http-server ./out -p 8080 -s',
      port: 8080,
    },
  },
};