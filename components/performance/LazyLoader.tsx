'use client'

import { useEffect, useState } from 'react'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
}

export function LazyLoader({ children, fallback = null, delay = 100 }: LazyLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!isLoaded) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default LazyLoader