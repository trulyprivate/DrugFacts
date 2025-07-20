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
        
        {/* Font optimization for LCP - deferred loading */}
        <script dangerouslySetInnerHTML={{
          __html: `
            const fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            fontLink.rel = 'stylesheet';
            fontLink.media = 'print';
            fontLink.onload = function() { this.media = 'all'; };
            document.head.appendChild(fontLink);
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
                if ('requestIdleCallback' in window) {
                  window.requestIdleCallback(function() {
                    // Load non-critical CSS after LCP
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/_next/static/css/app/layout.css';
                    link.media = 'all';
                    document.head.appendChild(link);
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