# Deployment Guide

## Netlify Deployment

This project is configured for automatic deployment to Netlify.

### Automatic Deployment Setup

1. **Connect Repository**: Your GitHub repository `https://github.com/negriniainda/myresume` should be connected to Netlify
2. **Build Settings**: Netlify will automatically use the settings from `netlify.toml`
3. **Deploy**: Push to main branch to trigger automatic deployment

### Build Configuration

- **Build Command**: `npm run build`
- **Publish Directory**: `out`
- **Node Version**: 18

### Manual Deployment

If you need to deploy manually:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The 'out' directory contains the static files ready for deployment
```

### Environment Variables

If you need to add environment variables later:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add your variables (e.g., `NEXT_PUBLIC_API_URL`)

### Performance Optimizations

The deployment includes:
- Static file caching (1 year for immutable assets)
- Security headers
- Gzip compression (automatic on Netlify)
- CDN distribution

### Custom Domain

To use a custom domain:
1. Go to Netlify Dashboard → Domain Settings
2. Add your custom domain
3. Configure DNS settings as instructed

### Troubleshooting

**Build Fails?**
- Check Node version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Netlify dashboard

**404 Errors?**
- The `netlify.toml` includes SPA redirect rules
- All routes should redirect to index.html

**Slow Loading?**
- Static assets are cached for 1 year
- Images are optimized for web
- Consider adding a service worker for offline support

## Local Development

```bash
# Development server
npm run dev

# Production build test
npm run build
npm run start
```

## Repository Structure

```
bilingual-resume/
├── src/                 # Source code
├── public/             # Static assets
├── out/                # Build output (generated)
├── netlify.toml        # Netlify configuration
├── next.config.ts      # Next.js configuration
└── package.json        # Dependencies and scripts
```