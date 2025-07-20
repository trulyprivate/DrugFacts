'use client'

import { useEffect } from 'react'

export default function PerformanceScript() {
  useEffect(() => {
    // Wrap all DOM operations in DOMContentLoaded to prevent console errors
    document.addEventListener('DOMContentLoaded', () => {
      // Performance monitoring
      if ('performance' in window) {
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
    })
  }, [])

  return null
}