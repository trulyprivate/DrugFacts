# Next.js Static Site Migration Guide for drugfacts.wiki

## Overview

This guide outlines the complete migration strategy for converting drugfacts.wiki from a React/Vite + Express.js full-stack application to a Next.js static site. The migration will eliminate server costs, improve performance, and simplify deployment while maintaining all current functionality.

## Migration Benefits

### Cost Savings
- **Hosting**: Move from server-based hosting to free static hosting (Vercel/Netlify)
- **Database**: Eliminate PostgreSQL/Redis costs by using static JSON files
- **Infrastructure**: Remove Docker, Nginx, and server maintenance overhead

### Performance Improvements
- **Pre-rendered HTML**: Instant page loads with no server processing
- **Edge CDN**: Global distribution for faster access worldwide
- **Optimized assets**: Next.js automatic image/font optimization
- **Zero API latency**: Data embedded in static pages

### Developer Experience
- **Simplified architecture**: Single codebase without backend complexity
- **Better DX**: Hot reload, TypeScript support, built-in optimizations
- **Easy deployment**: Git push to deploy with Vercel/Netlify
- **Type safety**: End-to-end TypeScript with no API boundary

## Phase 1: Project Initialization

### 1.1 Create Next.js Project

```bash
npx create-next-app@latest drugfacts-nextjs --typescript --tailwind --app --no-src-dir
cd drugfacts-nextjs
```

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form zod @hookform/resolvers
npm install framer-motion

# shadcn/ui setup
npx shadcn-ui@latest init
```

### 1.3 Configure next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // For static export
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

## Phase 2: Project Structure

### 2.1 Directory Structure

```
drugfacts-nextjs/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── drugs/
│   │   └── [slug]/
│   │       └── page.tsx          # Drug detail pages
│   ├── search/
│   │   └── page.tsx              # Search page
│   ├── api/                      # API routes (if needed)
│   └── not-found.tsx             # 404 page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── drug/
│       ├── DrugHeader.tsx
│       ├── CollapsibleSection.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── drugs.ts                  # Drug data utilities
│   ├── utils.ts                  # Utility functions
│   └── seo.ts                    # SEO utilities
├── data/
│   └── drugs/                    # Static drug JSON files
├── public/
│   └── assets/                   # Static assets
└── types/
    └── drug.ts                   # TypeScript types
```

### 2.2 Migration Mapping

| Current File | Next.js Location |
|-------------|------------------|
| client/src/pages/Home.tsx | app/page.tsx |
| client/src/pages/DrugDetail.tsx | app/drugs/[slug]/page.tsx |
| client/src/pages/Search.tsx | app/search/page.tsx |
| client/src/components/* | components/* |
| client/src/lib/* | lib/* |
| client/src/types/* | types/* |
| server/* | Not needed (static) |

## Phase 3: Component Migration

### 3.1 Layout Components

Create `app/layout.tsx`:

```typescript
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'drugfacts.wiki - Comprehensive Drug Information',
  description: 'Professional drug information resource for healthcare providers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### 3.2 Page Migration

Convert pages to use Next.js App Router:

```typescript
// app/drugs/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDrugBySlug, getAllDrugs } from '@/lib/drugs'
import DrugHeader from '@/components/drug/DrugHeader'
import CollapsibleSection from '@/components/drug/CollapsibleSection'

export async function generateStaticParams() {
  const drugs = await getAllDrugs()
  return drugs.map((drug) => ({
    slug: drug.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const drug = await getDrugBySlug(params.slug)
  if (!drug) return {}

  return {
    title: `${drug.drugName} - Drug Information | drugfacts.wiki`,
    description: drug.description || `Professional information about ${drug.drugName}`,
    openGraph: {
      title: drug.drugName,
      description: drug.description,
    },
  }
}

export default async function DrugDetailPage({ params }: { params: { slug: string } }) {
  const drug = await getDrugBySlug(params.slug)
  
  if (!drug) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DrugHeader drug={drug} />
      {/* Drug sections */}
      {drug.boxedWarning && (
        <CollapsibleSection title="Boxed Warning" defaultOpen>
          <div className="prose">{drug.boxedWarning}</div>
        </CollapsibleSection>
      )}
      {/* More sections... */}
    </div>
  )
}
```

### 3.3 Component Updates

Update components to remove client-side data fetching:

```typescript
// Before (with TanStack Query)
const { data: drug, isLoading } = useQuery({
  queryKey: ['drug', slug],
  queryFn: () => fetchDrug(slug),
})

// After (server component)
const drug = await getDrugBySlug(slug)
```

## Phase 4: Static Data Generation

### 4.1 Data Structure

Create static JSON files for each drug:

```
data/
└── drugs/
    ├── mounjaro-d2d7da5.json
    ├── ozempic-abc123.json
    └── index.json (drug listing)
```

### 4.2 Data Utilities

Create `lib/drugs.ts`:

```typescript
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

export async function searchDrugs(query: string): Promise<DrugLabel[]> {
  const drugs = await getAllDrugs()
  const normalizedQuery = query.toLowerCase()
  
  return drugs.filter(drug => 
    drug.drugName.toLowerCase().includes(normalizedQuery) ||
    drug.genericName?.toLowerCase().includes(normalizedQuery) ||
    drug.activeIngredient?.toLowerCase().includes(normalizedQuery)
  )
}
```

### 4.3 Build-time Data Generation

Create `scripts/generate-drug-data.js`:

```javascript
import fs from 'fs/promises'
import path from 'path'

async function generateDrugData() {
  // Import existing drug data
  const drugData = await import('../client/src/data/drug-data.js')
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data', 'drugs')
  await fs.mkdir(dataDir, { recursive: true })
  
  // Generate individual drug files
  const drugs = []
  for (const drug of drugData.drugs) {
    const fileName = `${drug.slug}.json`
    await fs.writeFile(
      path.join(dataDir, fileName),
      JSON.stringify(drug, null, 2)
    )
    drugs.push({
      drugName: drug.drugName,
      genericName: drug.genericName,
      slug: drug.slug,
      therapeuticClass: drug.therapeuticClass,
      manufacturer: drug.manufacturer,
    })
  }
  
  // Generate index file
  await fs.writeFile(
    path.join(dataDir, 'index.json'),
    JSON.stringify(drugs, null, 2)
  )
  
  console.log(`Generated ${drugs.length} drug files`)
}

generateDrugData()
```

## Phase 5: Search Implementation

### 5.1 Client-Side Search

Create `app/search/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SearchBar from '@/components/drug/SearchBar'
import { searchDrugs } from '@/lib/drugs-client'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  
  useEffect(() => {
    if (query) {
      searchDrugs(query).then(setResults)
    }
  }, [query])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Drugs</h1>
      <SearchBar defaultValue={query} />
      
      <div className="mt-8 grid gap-4">
        {results.map((drug) => (
          <Link
            key={drug.slug}
            href={`/drugs/${drug.slug}`}
            className="p-4 border rounded hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{drug.drugName}</h2>
            {drug.genericName && (
              <p className="text-gray-600">{drug.genericName}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### 5.2 Search Utilities

Create `lib/drugs-client.ts` for client-side operations:

```typescript
// Client-side search implementation
export async function searchDrugs(query: string) {
  const response = await fetch('/data/drugs/index.json')
  const drugs = await response.json()
  
  const normalizedQuery = query.toLowerCase()
  return drugs.filter(drug => 
    drug.drugName.toLowerCase().includes(normalizedQuery) ||
    drug.genericName?.toLowerCase().includes(normalizedQuery)
  )
}
```

## Phase 6: SEO Optimization

### 6.1 Sitemap Generation

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'
import { getAllDrugs } from '@/lib/drugs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const drugs = await getAllDrugs()
  const baseUrl = 'https://drugfacts.wiki'
  
  const drugUrls = drugs.map((drug) => ({
    url: `${baseUrl}/drugs/${drug.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...drugUrls,
  ]
}
```

### 6.2 Robots.txt

Create `app/robots.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://drugfacts.wiki/sitemap.xml',
  }
}
```

## Phase 7: Deployment

### 7.1 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 7.2 Netlify Deployment

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/api/*"
  to = "/404"
  status = 404
```

### 7.3 GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate drug data
        run: npm run generate-data
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Phase 8: Migration Checklist

### Pre-Migration
- [ ] Backup current codebase
- [ ] Document all API endpoints
- [ ] Export all drug data to JSON
- [ ] List all environment variables

### During Migration
- [ ] Initialize Next.js project
- [ ] Install all dependencies
- [ ] Migrate components one by one
- [ ] Convert pages to App Router
- [ ] Generate static drug data
- [ ] Implement search functionality
- [ ] Test all routes locally

### Post-Migration
- [ ] Run production build
- [ ] Test static export
- [ ] Deploy to staging
- [ ] Verify all pages load
- [ ] Check SEO meta tags
- [ ] Monitor Core Web Vitals
- [ ] Update DNS records
- [ ] Decommission old infrastructure

## Performance Optimizations

### 1. Image Optimization
```typescript
import Image from 'next/image'

// Use Next.js Image component
<Image
  src="/drug-image.jpg"
  alt="Drug image"
  width={300}
  height={200}
  loading="lazy"
/>
```

### 2. Font Optimization
```typescript
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
```

### 3. Bundle Size Optimization
- Use dynamic imports for large components
- Tree-shake unused code
- Analyze bundle with `@next/bundle-analyzer`

## Maintenance & Updates

### Adding New Drugs
1. Create new JSON file in `data/drugs/`
2. Update `data/drugs/index.json`
3. Run build and deploy

### Updating Drug Information
1. Edit corresponding JSON file
2. Commit changes
3. Automatic deployment via CI/CD

### Future Enhancements
- Implement ISR for dynamic updates
- Add CMS integration for non-technical updates
- Create admin interface for drug management
- Implement A/B testing for UI improvements

## Conclusion

This migration will transform drugfacts.wiki into a highly performant, cost-effective static site while maintaining all current functionality. The simplified architecture will make future updates easier and reduce operational complexity.