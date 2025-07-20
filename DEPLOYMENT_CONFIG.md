# Deployment Configuration Guide

## Current Setup

This Next.js application is configured for **static export** with `output: 'export'` in `next.config.js`.

## Build Process

The build process works correctly:
```bash
npm run build
```

This generates static files in the `out/` directory that can be served by any static file server.

## Deployment Options

### Option 1: Static Site Deployment (Recommended)

For platforms like Vercel, Netlify, or GitHub Pages:

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `out`
- Framework: Next.js (Static Export)

**Deployment Type:** Static Site

### Option 2: Self-Hosted with Static Server

Use the provided `serve-static.js` file:

```bash
# Build the static files
npm run build

# Serve using Express
node serve-static.js
```

**Environment Variables:**
- `PORT`: Server port (default: 3000)

### Option 3: Alternative Static Servers

```bash
# Using serve package
npx serve out -p 3000

# Using http-server
npx http-server out -p 3000

# Using Python
cd out && python -m http.server 3000
```

## Troubleshooting

### Error: "Next.js configured with 'output: export' does not work with 'next start'"

**Solution:** Use static file serving instead of `next start`:
- Replace `npm run start` with `node serve-static.js`
- Or deploy as a static site instead of a web server

### Cloud Run Deployment Issues

If deploying to Cloud Run:
1. Use the provided `serve-static.js` as your entry point
2. Ensure Dockerfile serves static files, not runs `next start`
3. Or switch to static deployment type

## Files Modified for Static Export

1. `next.config.js` - Configured for static export
2. `vercel.json` - Updated for static deployment
3. `serve-static.js` - Custom static file server
4. Package scripts - Build process includes data generation

## Verification

After deployment, verify:
- [ ] Static files are accessible
- [ ] Routes work correctly (including drug pages)
- [ ] Images and assets load properly
- [ ] Search functionality works
- [ ] No server-side features are expected

The application is fully static and ready for deployment on any static hosting platform.