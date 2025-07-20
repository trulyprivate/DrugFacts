import { Metadata } from 'next'
import Link from 'next/link'
import { getAllDrugs } from '@/lib/drugs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Therapeutic Classes | drugfacts.wiki',
  description: 'Browse prescription drugs organized by therapeutic classification. Find medications by drug class, mechanism of action, and therapeutic use.',
  keywords: ['therapeutic classes', 'drug classification', 'medication classes', 'pharmacological classes', 'drug categories'],
  openGraph: {
    title: 'Therapeutic Classes - Drug Information by Classification',
    description: 'Explore prescription drugs organized by therapeutic class. Find similar medications and understand drug classifications.',
    type: 'website',
  },
}

interface TherapeuticClassGroup {
  className: string
  drugs: Array<{
    drugName: string
    genericName: string
    slug: string
    manufacturer: string
    indicationsAndUsage?: string
  }>
}

export default async function TherapeuticClassesPage() {
  const drugs = await getAllDrugs()
  
  // Group drugs by therapeutic class
  const classGroups: Record<string, TherapeuticClassGroup> = {}
  
  drugs.forEach(drug => {
    const therapeuticClass = drug.therapeuticClass || 'Other'
    
    if (!classGroups[therapeuticClass]) {
      classGroups[therapeuticClass] = {
        className: therapeuticClass,
        drugs: []
      }
    }
    
    classGroups[therapeuticClass].drugs.push({
      drugName: drug.drugName,
      genericName: drug.genericName || '',
      slug: drug.slug,
      manufacturer: drug.manufacturer || '',
      indicationsAndUsage: drug.indicationsAndUsage
    })
  })
  
  // Convert to array and sort by class name
  const sortedClasses = Object.values(classGroups).sort((a, b) => 
    a.className.localeCompare(b.className)
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Therapeutic Classes
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Browse prescription drugs organized by therapeutic classification. 
          Each class contains medications that work in similar ways or treat similar conditions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sortedClasses.length}</div>
              <p className="text-sm text-gray-600">Therapeutic Classes</p>
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
                {Math.round(drugs.length / sortedClasses.length)}
              </div>
              <p className="text-sm text-gray-600">Avg Drugs per Class</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Therapeutic Classes List */}
      <div className="space-y-6">
        {sortedClasses.map((classGroup) => (
          <Card key={classGroup.className} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {classGroup.className}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {classGroup.drugs.length} medication{classGroup.drugs.length !== 1 ? 's' : ''} in this class
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {classGroup.drugs.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {classGroup.drugs.map((drug, index) => (
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
                          {drug.genericName && (
                            <p className="text-sm text-gray-600 mt-1">
                              Generic: {drug.genericName}
                            </p>
                          )}
                          {drug.manufacturer && (
                            <p className="text-sm text-gray-500 mt-1">
                              Manufacturer: {drug.manufacturer}
                            </p>
                          )}
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
                    {index < classGroup.drugs.length - 1 && (
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
          Drug classifications are based on therapeutic use and mechanism of action. 
          Always consult healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
  )
}