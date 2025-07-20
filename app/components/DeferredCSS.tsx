'use client'

import { useEffect } from 'react'

export default function DeferredCSS() {
  useEffect(() => {
    // Load non-critical CSS after component mounts to improve LCP
    const loadDeferredCSS = () => {
      const cssFiles = [
        '/globals-deferred.css'
      ]
      
      cssFiles.forEach(href => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        link.media = 'all'
        document.head.appendChild(link)
      })
    }

    // Use requestIdleCallback to defer until browser is idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadDeferredCSS)
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadDeferredCSS, 100)
    }
  }, [])

  return null
}