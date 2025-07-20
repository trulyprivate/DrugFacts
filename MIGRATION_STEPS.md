# Next.js Migration Steps - Quick Reference

## Step 1: Create New Next.js Project

```bash
# Create new project directory
mkdir drugfacts-nextjs && cd drugfacts-nextjs

# Initialize Next.js with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Copy essential configuration files
cp ../drugfacts.wiki/tailwind.config.ts .
cp ../drugfacts.wiki/postcss.config.js .
cp ../drugfacts.wiki/tsconfig.json .
cp -r ../drugfacts.wiki/client/src/types .
```

## Step 2: Install Dependencies

```bash
# Core dependencies from original project
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form zod @hookform/resolvers
npm install framer-motion @radix-ui/react-icons

# Install shadcn/ui CLI
npx shadcn-ui@latest init -y

# Install all shadcn components used in the project
npx shadcn-ui@latest add accordion alert badge button card collapsible dialog dropdown-menu form input label scroll-area separator sheet tabs toast
```

## Step 3: Configure Next.js for Static Export

```bash
# Update next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
EOF
```

## Step 4: Create Directory Structure

```bash
# Create necessary directories
mkdir -p app/drugs/\[slug\]
mkdir -p app/search
mkdir -p components/{ui,layout,drug}
mkdir -p lib
mkdir -p data/drugs
mkdir -p public/assets
mkdir -p scripts
```

## Step 5: Copy and Convert Components

```bash
# Copy UI components
cp -r ../drugfacts.wiki/client/src/components/ui/* components/ui/

# Copy and update layout components
cp ../drugfacts.wiki/client/src/components/Header.tsx components/layout/
cp ../drugfacts.wiki/client/src/components/Footer.tsx components/layout/
cp ../drugfacts.wiki/client/src/components/Sidebar.tsx components/layout/

# Copy drug-specific components
cp ../drugfacts.wiki/client/src/components/DrugHeader.tsx components/drug/
cp ../drugfacts.wiki/client/src/components/CollapsibleSection.tsx components/drug/
cp ../drugfacts.wiki/client/src/components/SearchBar.tsx components/drug/

# Copy utilities and libraries
cp ../drugfacts.wiki/client/src/lib/utils.ts lib/
cp ../drugfacts.wiki/client/src/lib/seo.ts lib/
cp ../drugfacts.wiki/client/src/lib/drug-utils.ts lib/

# Copy styles
cp ../drugfacts.wiki/client/src/index.css app/globals.css
```

## Step 6: Convert Pages to App Router

```bash
# Create layout.tsx
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'drugfacts.wiki - Comprehensive Drug Information',
  description: 'Professional drug information for healthcare providers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
EOF

# Create home page
cat > app/page.tsx << 'EOF'
import Link from 'next/link'
import SearchBar from '@/components/drug/SearchBar'
import { getAllDrugs } from '@/lib/drugs'

export default async function HomePage() {
  const drugs = await getAllDrugs()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Drug Information Database
      </h1>
      <div className="max-w-2xl mx-auto mb-12">
        <SearchBar />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drugs.map((drug) => (
          <Link
            key={drug.slug}
            href={`/drugs/${drug.slug}`}
            className="p-6 border rounded-lg hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{drug.drugName}</h2>
            {drug.genericName && (
              <p className="text-gray-600 mt-2">{drug.genericName}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
EOF
```

## Step 7: Create Drug Data Utilities

```bash
# Create drugs.ts utility
cat > lib/drugs.ts << 'EOF'
import fs from 'fs/promises'
import path from 'path'
import { DrugLabel } from '@/types/drug'

const DRUGS_DIR = path.join(process.cwd(), 'data', 'drugs')

export async function getAllDrugs(): Promise<DrugLabel[]> {
  const indexPath = path.join(DRUGS_DIR, 'index.json')
  const data = await fs.readFile(indexPath, 'utf-8')
  return JSON.parse(data)
}

export async function getDrugBySlug(slug: string): Promise<DrugLabel | null> {
  try {
    const filePath = path.join(DRUGS_DIR, `${slug}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}
EOF
```

## Step 8: Generate Static Drug Data

```bash
# Create data generation script
cat > scripts/generate-drug-data.mjs << 'EOF'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import the Mounjaro data from the original project
const drugData = {
  drugName: "Mounjaro",
  genericName: "tirzepatide",
  slug: "mounjaro-d2d7da5",
  // ... copy full drug data from original project
}

async function generateDrugData() {
  const dataDir = path.join(__dirname, '..', 'data', 'drugs')
  await fs.mkdir(dataDir, { recursive: true })
  
  // Save individual drug file
  await fs.writeFile(
    path.join(dataDir, `${drugData.slug}.json`),
    JSON.stringify(drugData, null, 2)
  )
  
  // Create index file
  const index = [{
    drugName: drugData.drugName,
    genericName: drugData.genericName,
    slug: drugData.slug,
    therapeuticClass: drugData.therapeuticClass,
    manufacturer: drugData.manufacturer,
  }]
  
  await fs.writeFile(
    path.join(dataDir, 'index.json'),
    JSON.stringify(index, null, 2)
  )
  
  console.log('Drug data generated successfully')
}

generateDrugData()
EOF

# Run the generation script
node scripts/generate-drug-data.mjs
```

## Step 9: Update Package.json Scripts

```bash
# Add build and export scripts
npm pkg set scripts.build="next build"
npm pkg set scripts.export="next export"
npm pkg set scripts.start="next start"
npm pkg set scripts.dev="next dev"
npm pkg set scripts.generate-data="node scripts/generate-drug-data.mjs"
```

## Step 10: Build and Test

```bash
# Generate drug data
npm run generate-data

# Run development server
npm run dev

# Test the build
npm run build

# The static site will be in the 'out' directory
ls -la out/
```

## Step 11: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel --prod

# Or use GitHub integration
# 1. Push code to GitHub
# 2. Import project in Vercel dashboard
# 3. Automatic deployments on push
```

## Step 12: Alternative Netlify Deployment

```bash
# Create netlify.toml
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = "out"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
EOF

# Deploy with Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

## Migration Validation Checklist

```bash
# Test all routes work
curl http://localhost:3000/
curl http://localhost:3000/drugs/mounjaro-d2d7da5/
curl http://localhost:3000/search/

# Check static export
npm run build
ls -la out/
ls -la out/drugs/

# Verify no server dependencies
grep -r "express" package.json
grep -r "passport" package.json
grep -r "@tanstack/react-query" package.json

# Check bundle size
npm run build
# Look for "Route (app)" section in build output
```

## Common Issues and Fixes

### Issue: Dynamic imports not working in static export
```javascript
// Replace dynamic imports
const Component = dynamic(() => import('./Component'))

// With regular imports
import Component from './Component'
```

### Issue: Client-side only features
```javascript
// Wrap in useEffect or use 'use client' directive
'use client'
import { useState, useEffect } from 'react'
```

### Issue: Environment variables
```javascript
// Use public env vars for client-side
NEXT_PUBLIC_SITE_URL=https://drugfacts.wiki
```

## Post-Migration Cleanup

```bash
# Remove old dependencies
npm uninstall express passport drizzle-orm @neondatabase/serverless
npm uninstall @tanstack/react-query wouter

# Remove Docker files (no longer needed)
rm -f Dockerfile* docker-compose*.yml

# Remove server directory
rm -rf server/

# Update CI/CD pipelines
# Update DNS records
# Monitor Core Web Vitals
```