'use client'

import { RelatedContent } from '@/lib/content-generation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Pill, Activity, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface RelatedContentSectionProps {
  content: RelatedContent
}

export default function RelatedContentSection({ content }: RelatedContentSectionProps) {
  return (
    <div className="space-y-6">
      {/* Similar Drugs */}
      {content.similarDrugs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-blue-600" />
              Similar Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.similarDrugs.map((drug, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {drug.slug ? (
                        <Link 
                          href={`/drugs/${drug.slug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {drug.name}
                        </Link>
                      ) : (
                        drug.name
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{drug.relationship}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {drug.therapeuticClass}
                    </Badge>
                  </div>
                  {drug.slug && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Conditions */}
      {content.relatedConditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-green-600" />
              Related Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {content.relatedConditions.map((condition, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Treatments */}
      {content.alternativeTreatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-orange-600" />
              Alternative Treatment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.alternativeTreatments.map((treatment, index) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">{treatment}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Important:</strong> Discuss all treatment options with your healthcare provider to determine what's best for your specific situation.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}