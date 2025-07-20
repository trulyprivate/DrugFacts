import { Metadata } from 'next'
import Link from 'next/link'
import { getAllDrugs } from '@/lib/drugs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Drug Manufacturers | drugfacts.wiki',
  description: 'Browse prescription drugs organized by pharmaceutical manufacturer. Find medications by drug company, labeler, and pharmaceutical producer.',
  keywords: ['drug manufacturers', 'pharmaceutical companies', 'drug companies', 'medication producers', 'pharma manufacturers'],
  openGraph: {
    title: 'Drug Manufacturers - Medications by Pharmaceutical Company',
    description: 'Explore prescription drugs organized by manufacturer. Find medications from specific pharmaceutical companies.',
    type: 'website',
  },
}

interface ManufacturerGroup {
  manufacturerName: string
  drugs: Array<{
    drugName: string
    genericName: string
    slug: string
    therapeuticClass: string
    indicationsAndUsage?: string
  }>
}

export default async function ManufacturersPage() {
  const drugs = await getAllDrugs()
  
  // Group drugs by manufacturer
  const manufacturerGroups: Record<string, ManufacturerGroup> = {}
  
  drugs.forEach(drug => {
    const manufacturer = drug.manufacturer || drug.labeler || 'Unknown Manufacturer'
    
    if (!manufacturerGroups[manufacturer]) {
      manufacturerGroups[manufacturer] = {
        manufacturerName: manufacturer,
        drugs: []
      }
    }
    
    manufacturerGroups[manufacturer].drugs.push({
      drugName: drug.drugName,
      genericName: drug.genericName || '',
      slug: drug.slug,
      therapeuticClass: drug.therapeuticClass || '',
      indicationsAndUsage: drug.indicationsAndUsage
    })
  })
  
  // Convert to array and sort by manufacturer name
  const sortedManufacturers = Object.values(manufacturerGroups).sort((a, b) => 
    a.manufacturerName.localeCompare(b.manufacturerName)
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Drug Manufacturers
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Browse prescription drugs organized by pharmaceutical manufacturer. 
          Find medications from specific companies and explore their drug portfolios.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sortedManufacturers.length}</div>
              <p className="text-sm text-gray-600">Manufacturers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{drugs.length}</div>
              <p className="text-sm text-gray-600">Total Drugs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(drugs.length / sortedManufacturers.length)}
              </div>
              <p className="text-sm text-gray-600">Avg Drugs per Manufacturer</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturers List */}
      <div className="space-y-6">
        {sortedManufacturers.map((manufacturerGroup) => (
          <Card key={manufacturerGroup.manufacturerName} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {manufacturerGroup.manufacturerName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {manufacturerGroup.drugs.length} medication{manufacturerGroup.drugs.length !== 1 ? 's' : ''} from this manufacturer
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {manufacturerGroup.drugs.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {manufacturerGroup.drugs.map((drug, index) => (
                  <div key={drug.slug}>
                    <Link 
                      href={`/drugs/${drug.slug}`}
                      className="block group hover:bg-gray-50 rounded-lg p-4 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {drug.drugName}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-1">
                            {drug.genericName && (
                              <p className="text-sm text-gray-600">
                                Generic: {drug.genericName}
                              </p>
                            )}
                            {drug.therapeuticClass && (
                              <p className="text-sm text-gray-500">
                                Class: {drug.therapeuticClass}
                              </p>
                            )}
                          </div>
                          {drug.indicationsAndUsage && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {drug.indicationsAndUsage.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {index < manufacturerGroup.drugs.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Manufacturer information is based on FDA labeling data. 
          Always verify current product information with healthcare professionals.
        </p>
      </div>
    </div>
  )
}