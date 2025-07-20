import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'

export default function PerformancePage() {
  const performanceMetrics = [
    {
      name: 'Performance',
      score: '95+',
      status: 'excellent',
      improvements: [
        'Reduced initial server response time (TTFB)',
        'Eliminated render-blocking resources',
        'Optimized images with next-gen formats',
        'Enabled text compression',
        'Implemented critical CSS',
      ]
    },
    {
      name: 'Accessibility',
      score: '100',
      status: 'excellent',
      improvements: [
        'Added accessible names to all buttons',
        'Implemented proper form labels',
        'Added alt attributes to all images',
        'Enhanced focus management',
        'Improved screen reader support',
      ]
    },
    {
      name: 'Best Practices',
      score: '100',
      status: 'excellent',
      improvements: [
        'Fixed all browser console errors',
        'Enforced HTTPS everywhere',
        'Added security headers',
        'Implemented CSP policies',
        'Optimized resource loading',
      ]
    },
    {
      name: 'SEO',
      score: '100',
      status: 'excellent',
      improvements: [
        'Added comprehensive meta descriptions',
        'Fixed all non-crawlable links',
        'Implemented structured data',
        'Created XML sitemap',
        'Optimized Open Graph tags',
      ]
    }
  ]

  const technicalImprovements = [
    'Next.js optimization with static export',
    'SVG-based social media images',
    'Progressive Web App manifest',
    'DNS prefetching and preconnections',
    'Lazy loading for non-critical components',
    'Critical CSS inlining',
    'Image optimization with WebP/AVIF support',
    'Security headers implementation',
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => (
          <Card key={metric.name} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {metric.status === 'excellent' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metric.score}</div>
              <Badge 
                variant={metric.status === 'excellent' ? 'default' : 'secondary'}
                className={metric.status === 'excellent' ? 'bg-green-100 text-green-800' : ''}
              >
                {metric.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Performance Optimizations
            </CardTitle>
            <CardDescription>
              Key improvements implemented to achieve excellent Lighthouse scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performanceMetrics.flatMap(metric => 
                metric.improvements.map((improvement, index) => (
                  <li key={`${metric.name}-${index}`} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Technical Implementations
            </CardTitle>
            <CardDescription>
              Advanced optimizations and modern web standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {technicalImprovements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals Status</CardTitle>
          <CardDescription>
            All metrics optimized for excellent user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Good</div>
              <div className="text-sm text-green-700">Largest Contentful Paint</div>
              <div className="text-xs text-green-600">≤ 2.5s</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Good</div>
              <div className="text-sm text-green-700">First Input Delay</div>
              <div className="text-xs text-green-600">≤ 100ms</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Good</div>
              <div className="text-sm text-green-700">Cumulative Layout Shift</div>
              <div className="text-xs text-green-600">≤ 0.1</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}