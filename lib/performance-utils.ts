// Performance optimization utilities

/**
 * Lazy load components for better performance
 */
export function createLazyComponent<T>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>
): React.ComponentType<T> {
  const React = require('react')
  return React.lazy(importFunc)
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = '/fonts/inter-var.woff2'
    document.head.appendChild(link)
  }
}

/**
 * Critical CSS for above-the-fold content
 */
export const criticalCSS = `
  :root{--font-inter:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;--background:hsl(0,0%,100%);--foreground:hsl(20,14.3%,4.1%);--primary:hsl(207,90%,54%);--border:hsl(20,5.9%,90%)}
  html{font-family:var(--font-inter);scroll-behavior:smooth}
  body{margin:0;padding:0;font-family:var(--font-inter);background-color:var(--background);color:var(--foreground);line-height:1.6;-webkit-font-smoothing:antialiased}
  header{background-color:var(--background);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
  nav{max-width:1200px;margin:0 auto;padding:1rem;display:flex;align-items:center;justify-content:space-between}
  .container{max-width:1200px;margin:0 auto;padding:1rem}
  .grid{display:grid;gap:1.5rem}
  @media(min-width:768px){.grid{grid-template-columns:repeat(2,1fr)}}
  @media(min-width:1024px){.grid{grid-template-columns:repeat(3,1fr)}}
  .card{background-color:var(--background);border:1px solid var(--border);border-radius:0.5rem;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
  h1,h2,h3{margin:0 0 1rem 0;font-weight:600;line-height:1.2}
  h1{font-size:2.25rem}
  button{font-family:inherit;background-color:var(--primary);color:white;border:none;border-radius:0.375rem;padding:0.5rem 1rem;cursor:pointer}
  *:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
  @media(max-width:640px){.container{padding:0.5rem}.grid{grid-template-columns:1fr;gap:1rem}h1{font-size:1.875rem}}
`

/**
 * Defer non-critical JavaScript
 */
export function deferNonCriticalJS() {
  if (typeof window !== 'undefined') {
    // Defer analytics and other non-critical scripts
    window.addEventListener('load', () => {
      // Load analytics after page load
      setTimeout(() => {
        // Analytics initialization would go here
      }, 100)
    })
  }
}

/**
 * Optimize image loading with WebP/AVIF support
 */
export function getOptimizedImageUrl(src: string, width?: number, quality = 85): string {
  if (!src) return ''
  
  // For static export, we'll use the original images
  // In a real deployment, you'd use a service like Cloudinary or Vercel Image Optimization
  return src
}

/**
 * Resource hints for DNS prefetching
 */
export const resourceHints = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]

/**
 * Check if browser supports modern image formats
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * Performance monitoring utilities
 */
export function measurePerformance() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        console.log('Performance Metrics:', {
          TTFB: navigation.responseStart - navigation.requestStart,
          DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          LoadComplete: navigation.loadEventEnd - navigation.fetchStart,
          FCP: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          LCP: paint.find(p => p.name === 'largest-contentful-paint')?.startTime,
        })
      }, 0)
    })
  }
}