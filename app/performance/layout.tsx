import { Metadata } from 'next'
import { staticPageDescriptions } from '@/lib/seo-utils'

export const metadata: Metadata = {
  title: 'Performance Optimization | drugfacts.wiki',
  description: staticPageDescriptions.performance,
  robots: 'noindex, nofollow',
}

export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>
      {children}
    </div>
  )
}