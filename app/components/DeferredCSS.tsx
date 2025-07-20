"use client"

import { useEffect } from 'react';

interface DeferredCSSProps {
  href: string;
  media?: string;
}

export default function DeferredCSS({ href, media = "all" }: DeferredCSSProps) {
  useEffect(() => {
    // Defer non-critical CSS loading after page load
    const loadCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = media;
      document.head.appendChild(link);
    };

    // Load after initial render is complete
    if (document.readyState === 'complete') {
      loadCSS();
    } else {
      window.addEventListener('load', loadCSS);
      return () => window.removeEventListener('load', loadCSS);
    }
  }, [href, media]);

  return null;
}