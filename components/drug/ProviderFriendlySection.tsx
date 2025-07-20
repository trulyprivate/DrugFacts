'use client'

import { ProviderFriendlyContent } from '@/lib/content-generation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Phone, Heart, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProviderFriendlySectionProps {
  content: ProviderFriendlyContent
}

export default function ProviderFriendlySection({ content }: ProviderFriendlySectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Patient-Friendly Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What it treats */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What this medication treats:</h4>
            <p className="text-gray-700">{content.whatItTreats}</p>
          </div>

          {/* How it works */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
            <p className="text-gray-700">{content.howItWorks}</p>
          </div>

          {/* Common side effects */}
          {content.commonSideEffects.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Common side effects:</h4>
              <div className="flex flex-wrap gap-2">
                {content.commonSideEffects.map((effect, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Important safety info */}
          {content.importantSafetyInfo && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Safety Information:</strong> {content.importantSafetyInfo}
              </AlertDescription>
            </Alert>
          )}

          {/* When to call doctor */}
          {content.whenToCall.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call your doctor if you experience:
              </h4>
              <ul className="space-y-1">
                {content.whenToCall.map((reason, index) => (
                  <li key={index} className="text-red-800 text-sm flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}