import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

import PerformanceScript from './performance-script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://drugfacts.wiki'),
  title: 'drugfacts.wiki - Comprehensive Drug Information',
  description: 'Quickly search for drug information, interactions, and side effects. Your reliable source for FDA-approved medical data and prescribing information.',
  keywords: 'drug information, FDA labels, prescribing information, medication guide, drug interactions, side effects, dosage',
  authors: [{ name: 'drugfacts.wiki' }],
  robots: 'index, follow',
  openGraph: {
    title: 'drugfacts.wiki - Comprehensive Drug Information',
    description: 'Quickly search for drug information, interactions, and side effects. Your reliable source for FDA-approved medical data.',
    type: 'website',
    locale: 'en_US',
    url: 'https://drugfacts.wiki',
    siteName: 'drugfacts.wiki',
    images: [
      {
        url: '/og-image.png',
        width: 512,
        height: 512,
        alt: 'drugfacts.wiki - Comprehensive Drug Information with Medical Pills Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'drugfacts.wiki - Comprehensive Drug Information',
    description: 'Quickly search for drug information, interactions, and side effects.',
    images: ['/og-image.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Critical above-the-fold CSS inlined for fastest LCP */}
        {/* Critical CSS for instant LCP */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical above-the-fold styles for fastest LCP */
            body{font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-display:swap;line-height:1.6;margin:0;padding:0;background:#fff;color:#1f2937}
            .drug-header{font-size:2rem;font-weight:700;line-height:1.2;color:#1f2937;margin:0 0 1rem 0;contain:layout style paint;font-display:swap;letter-spacing:-0.025em}
            .container{max-width:1200px;margin:0 auto;padding:0 1rem}
            .drug-card{background:#fff;border:1px solid #e5e7eb;border-radius:0.5rem;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
            .grid{display:grid;gap:1rem}
            .flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}.flex-col{flex-direction:column}
            .mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.p-4{padding:1rem}.p-6{padding:1.5rem}
            @media(max-width:640px){.container{padding:0.5rem}.drug-header{font-size:1.875rem}.drug-card{padding:1rem;margin-bottom:1rem}.grid{grid-template-columns:1fr;gap:0.75rem}}
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root{--font-inter:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;--background:hsl(0,0%,100%);--foreground:hsl(20,14.3%,4.1%);--primary:hsl(0,0%,40%);--border:hsl(20,5.9%,90%);--card:hsl(0,0%,100%)}
            html{font-family:var(--font-inter);scroll-behavior:smooth}
            body{margin:0;padding:0;font-family:var(--font-inter);background-color:var(--background);color:var(--foreground);line-height:1.6;-webkit-font-smoothing:antialiased}
            header{background-color:var(--background);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
            nav{max-width:1200px;margin:0 auto;padding:1rem;display:flex;align-items:center;justify-content:space-between}
            .container{max-width:1200px;margin:0 auto;padding:1rem}
            .grid{display:grid;gap:1.5rem}
            @media(min-width:768px){.grid{grid-template-columns:repeat(2,1fr)}}
            @media(min-width:1024px){.grid{grid-template-columns:repeat(3,1fr)}}
            .card{background-color:var(--card);border:1px solid var(--border);border-radius:0.5rem;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
            h1,h2,h3{margin:0 0 1rem 0;font-weight:600;line-height:1.2}
            h1{font-size:2.25rem}h2{font-size:1.875rem}
            button{font-family:inherit;background-color:transparent;color:inherit;border:none;border-radius:0.375rem;padding:0.5rem 1rem;cursor:pointer}
            *:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
            @media(max-width:640px){.container{padding:0.5rem}.grid{grid-template-columns:1fr;gap:1rem}h1{font-size:1.875rem}}
          `
        }} />
        {/* Critical resource optimization for LCP */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources for faster LCP */}
        <link rel="preload" href="/og-image.png" as="image" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        
        {/* Resource hints for better performance */}
        
        {/* Early DNS resolution for faster resource loading */}
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="//unpkg.com" />
        
        {/* Critical font loading with immediate display */}
        <link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2" crossOrigin="anonymous" />
        
        {/* Font optimization for LCP - immediate loading with swap */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 500;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
          `
        }} />
        {/* LCP Optimization: Prioritize above-the-fold content */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){
              // Mark LCP element for performance tracking
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP time:', entry.startTime);
                  }
                }
              });
              if (typeof PerformanceObserver !== 'undefined') {
                observer.observe({type: 'largest-contentful-paint', buffered: true});
              }
              
              // Defer non-critical resources until after LCP
              window.addEventListener('load', function() {
                // Track performance metrics
                const metrics = {
                  TTFB: performance.timing.responseStart - performance.timing.fetchStart,
                  DOMContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.fetchStart,
                  LoadComplete: performance.timing.loadEventEnd - performance.timing.fetchStart,
                  FCP: 0
                };
                
                // Get First Contentful Paint
                if (performance.getEntriesByType) {
                  const paintEntries = performance.getEntriesByType('paint');
                  paintEntries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                      metrics.FCP = entry.startTime;
                    }
                  });
                }
                
                console.log('Performance Metrics:', metrics);
                
                // Prefetch next pages for better navigation
                if ('requestIdleCallback' in window) {
                  window.requestIdleCallback(function() {
                    // Prefetch popular drug pages
                    const links = ['accutane', 'januvia', 'zoloft', 'methotrexate', 'nexium'];
                    links.forEach(slug => {
                      const link = document.createElement('link');
                      link.rel = 'prefetch';
                      link.href = '/drugs/' + slug + '/';
                      document.head.appendChild(link);
                    });
                  });
                }
              });
            })();
          `
        }} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/og-image.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/og-image.png" />
        <link rel="apple-touch-icon" href="/og-image.png" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1" role="main">{children}</main>
          <Footer />
        </div>

        <PerformanceScript />
      </body>
    </html>
  )
}