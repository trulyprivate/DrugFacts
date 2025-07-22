'use client'

import { useEffect } from 'react'

export default function PerformanceScript() {
  useEffect(() => {
    // Defer performance monitoring script loading
    const loadPerformanceScript = () => {
      // Only load performance monitoring after page is fully loaded
      if ('performance' in window && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          const paint = performance.getEntriesByType('paint')
          
          // Performance metrics tracked silently
          const metrics = {
            TTFB: navigation.responseStart - navigation.requestStart,
            DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            LoadComplete: navigation.loadEventEnd - navigation.fetchStart,
            FCP: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
            LCP: paint.find(p => p.name === 'largest-contentful-paint')?.startTime,
          }
          // Could send to analytics service here if needed
        })
      }
    }

    // Defer script execution until page is loaded
    if (document.readyState === 'complete') {
      loadPerformanceScript()
    } else {
      window.addEventListener('load', loadPerformanceScript, { once: true })
    }
  }, [])

  return null
}