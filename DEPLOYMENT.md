# Next.js Static Site Deployment Guide

## Migration Complete! 🎉

The drugfacts.wiki has been successfully converted from a React/Express full-stack application to a Next.js static site.

## What Was Done

1. **Converted to Next.js 15** with App Router and static export
2. **Migrated all components** from React/Wouter to Next.js
3. **Created static data generation** - drug data is now in JSON files
4. **Implemented SEO optimization** with sitemap and robots.txt
5. **Configured for static hosting** - no server required!

## Build Output

```
✓ Successfully built static site
✓ Output directory: /out
✓ All pages pre-rendered as static HTML
✓ Ready for deployment to any static host
```

## Quick Deploy Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Your site will be live at: https://drugfacts-wiki.vercel.app
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=out

# Your site will be live at: https://drugfacts-wiki.netlify.app
```

### Option 3: GitHub Pages
```bash
# Add to package.json scripts
"deploy": "next build && touch out/.nojekyll && gh-pages -d out"

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

### Option 4: AWS S3 + CloudFront
```bash
# Upload to S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Local Testing

```bash
# Build the static site
npm run build

# Serve locally (install serve first: npm i -g serve)
serve out -p 3000

# Visit http://localhost:3000
```

## Adding New Drugs

1. Create a new JSON file in `data/drugs/[drug-slug].json`
2. Update `data/drugs/index.json` with the drug summary
3. Run `npm run build`
4. Deploy the updated `out` directory

## Environment Variables

No environment variables needed! Everything is static.

## File Structure

```
out/
├── index.html              # Home page
├── drugs/
│   └── mounjaro-d2d7da5/
│       └── index.html      # Drug detail page
├── search/
│   └── index.html          # Search page
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots file
└── _next/                  # Static assets (JS, CSS)
```

## Benefits Achieved

✅ **Zero hosting costs** - Use free tiers of Vercel/Netlify
✅ **Instant page loads** - Pre-rendered HTML
✅ **Global CDN** - Automatic with most static hosts
✅ **No server maintenance** - It's just HTML/JS/CSS
✅ **Easy updates** - Edit JSON, rebuild, deploy
✅ **Better SEO** - Static HTML is search engine friendly

## Next Steps

1. Choose a hosting provider (Vercel recommended)
2. Set up a custom domain (drugfacts.wiki)
3. Configure DNS records
4. Deploy and celebrate! 🚀

## Rollback Plan

If you need to go back to the old stack:
- The original code is preserved in `/client` and `/server` directories
- Use `npm run old:dev` to run the Express server
- All original functionality remains intact