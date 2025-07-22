# Next.js SSR and SEO Optimization Techniques

## Overview

This document details the Server-Side Rendering (SSR) and Search Engine Optimization (SEO) techniques implemented in the drugfacts.wiki Next.js frontend application.

## Architecture Overview

### Next.js 15 App Router

The application uses Next.js 15 with the App Router, providing:
- Server Components by default
- Streaming SSR
- Nested layouts
- Built-in SEO optimizations
- Automatic code splitting

### Rendering Strategy

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser       │────▶│  Next.js     │────▶│   API/DB    │
│   Request       │     │  Server      │     │   Backend   │
└─────────────────┘     └──────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  SSR HTML    │
                        │  + Data      │
                        └──────────────┘
```

## SSR Implementation

### 1. Server Components with Data Fetching

```typescript
// app/drugs/[slug]/page.tsx
export default async function DrugDetailPage({ params }: Props) {
  // Server-side data fetching
  const drug = await getDrugBySlug(params.slug);
  
  if (!drug) {
    notFound();
  }

  // Component renders on server with data
  return <DrugDetail drug={drug} />;
}
```

### 2. Environment-Aware Data Service

```typescript
// lib/drugs.ts
const isServer = typeof window === 'undefined';

async function getImplementation() {
  if (isServer) {
    // Server-side implementation with direct API/file access
    const { getAllDrugsServer, getDrugBySlugServer } = await import('./drugs-server');
    return { getAllDrugs: getAllDrugsServer, getDrugBySlug: getDrugBySlugServer };
  } else {
    // Client-side implementation with fetch
    const { getAllDrugsClient, getDrugBySlugClient } = await import('./drugs-client');
    return { getAllDrugs: getAllDrugsClient, getDrugBySlug: getDrugBySlugClient };
  }
}
```

### 3. Static Generation with Dynamic Params

```typescript
// app/drugs/[slug]/page.tsx
export async function generateStaticParams() {
  const drugs = await getAllDrugs();
  
  return drugs.map((drug) => ({
    slug: drug.slug,
  }));
}

// Revalidation strategy
export const revalidate = 300; // Revalidate every 5 minutes
```

### 4. Streaming SSR for Performance

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Critical CSS inlined for instant rendering */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      <body>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
```

## SEO Optimization Techniques

### 1. Metadata API

Dynamic metadata generation for each page:

```typescript
// app/drugs/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const drug = await getDrugBySlug(params.slug);
  
  if (!drug) {
    return {
      title: 'Drug Not Found | drugfacts.wiki',
    };
  }

  const description = generateDrugDescription(drug);
  
  return {
    title: `${drug.drugName} (${drug.genericName}) - Drug Information | drugfacts.wiki`,
    description: truncateDescription(description, 155),
    keywords: generateKeywords(drug),
    openGraph: {
      title: drug.drugName,
      description,
      type: 'article',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: drug.drugName,
      description,
    },
    alternates: {
      canonical: `https://drugfacts.wiki/drugs/${drug.slug}`,
    },
  };
}
```

### 2. Structured Data (JSON-LD)

Rich snippets for search engines:

```typescript
// Drug schema
const drugStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Drug',
  name: drug.drugName,
  alternateName: drug.genericName,
  description: drug.description,
  manufacturer: {
    '@type': 'Organization',
    name: drug.manufacturer,
  },
  prescriptionStatus: 'PrescriptionOnly',
  drugClass: drug.therapeuticClass,
  clinicalPharmacology: drug.clinicalPharmacology,
  mechanismOfAction: drug.clinicalPharmacology,
};

// FAQ schema for common questions
const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `What is ${drug.drugName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: drug.description,
      },
    },
    // More Q&A pairs...
  ],
};

// Breadcrumb schema
const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://drugfacts.wiki',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Drugs',
      item: 'https://drugfacts.wiki/drugs',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: drug.drugName,
      item: `https://drugfacts.wiki/drugs/${drug.slug}`,
    },
  ],
};
```

### 3. Meta Description Optimization

```typescript
// lib/seo-utils.ts
export function truncateDescription(text: string, maxLength: number = 155): string {
  const cleanText = text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanText.length <= maxLength) return cleanText;
  
  const truncated = cleanText.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

// Optimized descriptions under 160 characters
export const staticPageDescriptions = {
  home: 'Search FDA-approved drug information, interactions, and side effects. Your trusted source for prescribing information and medical data.',
  search: 'Search our comprehensive database of FDA-approved medications. Find drug information, dosages, and prescribing details.',
  therapeuticClasses: 'Browse medications by therapeutic class. Explore drug categories and find related medications for specific conditions.',
  // More pages...
};
```

### 4. Dynamic Sitemap Generation

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://drugfacts.wiki';
  
  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/search`, priority: 0.9 },
    { url: `${baseUrl}/therapeutic-classes`, priority: 0.8 },
    // More static pages...
  ];

  // Dynamic drug pages
  const drugs = await getAllDrugs();
  const drugPages = drugs.map((drug) => ({
    url: `${baseUrl}/drugs/${drug.slug}`,
    lastModified: drug.effectiveTime ? new Date(drug.effectiveTime) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...drugPages];
}
```

### 5. Robots.txt Configuration

```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://drugfacts.wiki/sitemap.xml',
  };
}
```

## Performance Optimizations

### 1. Critical CSS Inlining

```typescript
// app/layout.tsx
<style dangerouslySetInnerHTML={{
  __html: `
    /* Critical above-the-fold styles for fastest LCP */
    body{font-family:'Inter',system-ui;margin:0;background:#fff;color:#1f2937}
    .drug-header{font-size:2rem;font-weight:700;line-height:1.2;margin:0 0 1rem 0}
    .container{max-width:1200px;margin:0 auto;padding:0 1rem}
    /* More critical styles... */
  `
}} />
```

### 2. Font Optimization

```typescript
// Self-hosted font with font-display: swap
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})
```

### 3. Image Optimization

```typescript
// Using Next.js Image component
import Image from 'next/image'

<Image
  src="/drug-image.jpg"
  alt={drug.drugName}
  width={800}
  height={400}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL={drug.imageBlurData}
/>
```

### 4. Resource Hints

```typescript
// Preconnect to external domains
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

// Prefetch popular drug pages
const popularDrugs = ['mounjaro-d2d7da5', 'emgality-33a147b'];
popularDrugs.forEach(slug => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/data/drugs/${slug}.json`;
  link.as = 'fetch';
  document.head.appendChild(link);
});
```

### 5. Build-Time Data Preparation

```typescript
// scripts/prepare-build-data.js
async function prepareBuildData() {
  // Generate index.json for static fallback
  const drugs = await fetchAllDrugs();
  await fs.writeFile(
    'public/data/drugs/index.json',
    JSON.stringify(drugs)
  );
  
  // Generate individual drug files
  for (const drug of drugs) {
    await fs.writeFile(
      `public/data/drugs/${drug.slug}.json`,
      JSON.stringify(drug)
    );
  }
}
```

## Caching Strategies

### 1. Next.js Data Cache

```typescript
// Server-side caching with revalidation
const response = await fetch(url, {
  next: { 
    revalidate: process.env.NODE_ENV === 'production' ? 300 : 0 
  }
});
```

### 2. Static File Fallback

```typescript
// lib/drugs-server.ts
async function getDrugBySlugServer(slug: string): Promise<DrugLabel | null> {
  try {
    // Try API first
    const response = await serverApiRequest(`/api/drugs/${slug}`);
    return response.data;
  } catch (error) {
    // Fallback to static file
    return await readDrugFromFile(slug);
  }
}
```

### 3. Client-Side Caching

```typescript
// Using React Query or SWR for client-side caching
const { data, error } = useSWR(
  `/api/drugs/${slug}`,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  }
);
```

## Mobile Optimization

### 1. Responsive Meta Tags

```typescript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}
```

### 2. Mobile-First CSS

```css
/* Mobile styles first */
.container { padding: 0.5rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 1rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 2rem; }
}
```

## Monitoring and Analytics

### 1. Web Vitals Tracking

```typescript
// app/performance-script.tsx
export default function PerformanceScript() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track Core Web Vitals
        if (entry.entryType === 'largest-contentful-paint') {
          // LCP tracking
        }
      }
    });
    
    observer.observe({ entryNames: ['largest-contentful-paint'] });
  }, []);
}
```

### 2. Error Tracking

```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to analytics service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## SEO Checklist Implementation

- ✅ **Server-side rendering** for all content
- ✅ **Meta tags** dynamically generated
- ✅ **Structured data** (JSON-LD) for rich snippets
- ✅ **Sitemap.xml** auto-generated
- ✅ **Robots.txt** with crawler rules
- ✅ **Canonical URLs** to avoid duplicates
- ✅ **Open Graph** tags for social sharing
- ✅ **Twitter Cards** metadata
- ✅ **Mobile-responsive** design
- ✅ **Fast loading** (optimized LCP)
- ✅ **Clean URLs** with meaningful slugs
- ✅ **Breadcrumbs** for navigation
- ✅ **Internal linking** structure
- ✅ **Alt text** for images
- ✅ **Semantic HTML** structure

## Best Practices Implemented

1. **Progressive Enhancement**: Works without JavaScript
2. **Semantic HTML**: Proper heading hierarchy (h1-h6)
3. **Accessibility**: ARIA labels, keyboard navigation
4. **Performance**: Sub-3s page loads
5. **Mobile-First**: Responsive from 320px up
6. **Error Handling**: 404 pages, error boundaries
7. **URL Structure**: Clean, descriptive URLs
8. **Content Quality**: Comprehensive, accurate information

## Areas for Future Enhancement

1. **Internationalization**: Multi-language support
2. **AMP Pages**: Accelerated Mobile Pages
3. **Schema Markup**: More detailed medical schemas
4. **Link Building**: Related drug suggestions
5. **Search Features**: Autocomplete, filters
6. **User Generated Content**: Reviews, ratings
7. **Local SEO**: Pharmacy finder integration
8. **Voice Search**: Optimize for voice queries

## Performance Metrics

Target metrics based on Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms
- **FCP** (First Contentful Paint): < 1.8s

## Conclusion

The Next.js implementation leverages modern SSR and SEO techniques to ensure drugfacts.wiki ranks well in search engines while providing an excellent user experience. The combination of server-side rendering, static generation, and comprehensive SEO optimization creates a fast, accessible, and search-engine-friendly medical information resource.