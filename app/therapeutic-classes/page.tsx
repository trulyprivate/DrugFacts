import { Metadata } from 'next'
import { getAllDrugs } from '@/lib/drugs'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Pill, Activity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Therapeutic Drug Classes | drugfacts.wiki',
  description: 'Browse drugs organized by therapeutic classification. Find medications by treatment category, indication, and mechanism of action.',
  keywords: 'therapeutic classes, drug classification, medication categories, treatment types, pharmaceutical classes, drug therapy',
  openGraph: {
    title: 'Therapeutic Drug Classes | drugfacts.wiki',
    description: 'Browse drugs organized by therapeutic classification. Find medications by treatment category, indication, and mechanism of action.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function TherapeuticClassesPage() {
  const drugs = await getAllDrugs()
  
  // Group drugs by therapeutic class
  const classGroups = drugs.reduce((acc, drug) => {
    const therapeuticClass = drug.therapeuticClass || 'Unclassified'
    if (!acc[therapeuticClass]) {
      acc[therapeuticClass] = []
    }
    acc[therapeuticClass].push(drug)
    return acc
  }, {} as Record<string, typeof drugs>)

  const classCount = Object.keys(classGroups).length
  const totalDrugs = drugs.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Therapeutic Drug Classes
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Browse medications organized by therapeutic classification and treatment category
        </p>
        
        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{classCount}</div>
            <div className="text-sm text-gray-600">Therapeutic Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalDrugs}</div>
            <div className="text-sm text-gray-600">Total Medications</div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(classGroups).map(([therapeuticClass, classDrugs]) => (
          <Card key={therapeuticClass} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <div>
                  <CardTitle className="text-xl">{therapeuticClass}</CardTitle>
                  <CardDescription>
                    {classDrugs.length} medication{classDrugs.length !== 1 ? 's' : ''} in this class
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classDrugs.map((drug) => (
                  <div key={drug.slug} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <Pill className="h-5 w-5 text-blue-600 mt-1" aria-hidden="true" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          <Link 
                            href={`/drugs/${drug.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {drug.drugName}
                          </Link>
                        </h3>
                        {drug.genericName && (
                          <p className="text-sm text-gray-600 mt-1">
                            Generic: {drug.genericName}
                          </p>
                        )}
                        {drug.labeler && (
                          <Badge variant="outline" className="mt-2">
                            {drug.labeler}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}