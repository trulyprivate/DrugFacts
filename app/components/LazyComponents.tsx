import { lazy, Suspense } from 'react'

// Lazy load heavy components that aren't immediately needed
export const LazyAccordion = lazy(() => import('@radix-ui/react-accordion').then(module => ({
  default: module.Accordion
})))

export const LazyTabs = lazy(() => import('@radix-ui/react-tabs').then(module => ({
  default: module.Tabs
})))

export const LazyDialog = lazy(() => import('@radix-ui/react-dialog').then(module => ({
  default: module.Dialog
})))

// Lazy wrapper component with loading fallback
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback = <div>Loading...</div> }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Lazy load icons only when needed
export const lazyLoadIcon = (iconName: string) => {
  return lazy(() => 
    import('lucide-react').then(module => ({
      default: (module as any)[iconName]
    }))
  )
}