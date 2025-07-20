import { Metadata } from 'next'
import { getAllDrugs } from '@/lib/drugs'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Pill, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Drug Manufacturers Directory | drugfacts.wiki',
  description: 'Browse drugs organized by pharmaceutical manufacturer. Find prescribing information for medications from major pharmaceutical companies.',
  keywords: 'pharmaceutical manufacturers, drug companies, pharmaceutical directory, medication manufacturers, drug makers',
  openGraph: {
    title: 'Drug Manufacturers Directory | drugfacts.wiki',
    description: 'Browse drugs organized by pharmaceutical manufacturer. Find prescribing information for medications from major pharmaceutical companies.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function ManufacturersPage() {
  const drugs = await getAllDrugs()
  
  // Group drugs by manufacturer
  const manufacturerGroups = drugs.reduce((acc, drug) => {
    const manufacturer = drug.labeler || 'Unknown Manufacturer'
    if (!acc[manufacturer]) {
      acc[manufacturer] = []
    }
    acc[manufacturer].push(drug)
    return acc
  }, {} as Record<string, typeof drugs>)

  const manufacturerCount = Object.keys(manufacturerGroups).length
  const totalDrugs = drugs.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Drug Manufacturers Directory
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Browse pharmaceutical products organized by manufacturer
        </p>
        
        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{manufacturerCount}</div>
            <div className="text-sm text-gray-600">Manufacturers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalDrugs}</div>
            <div className="text-sm text-gray-600">Total Drugs</div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(manufacturerGroups).map(([manufacturer, manufacturerDrugs]) => (
          <Card key={manufacturer} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <div>
                  <CardTitle className="text-xl">{manufacturer}</CardTitle>
                  <CardDescription>
                    {manufacturerDrugs.length} drug{manufacturerDrugs.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {manufacturerDrugs.map((drug) => (
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
                        {drug.therapeuticClass && (
                          <Badge variant="secondary" className="mt-2">
                            {drug.therapeuticClass}
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