import { Metadata } from 'next'
import Link from 'next/link'
import { getAllDrugs } from '@/lib/drugs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SearchBar from '@/components/drug/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Pill, Search, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Drugs - drugfacts.wiki',
  description: 'Browse all available drug information, FDA labels, and prescribing guidelines. Complete database of professional medical drug data.',
  keywords: 'drug database, all drugs, medication list, FDA approved drugs, prescription drugs, drug information',
  openGraph: {
    title: 'All Drugs - drugfacts.wiki',
    description: 'Browse all available drug information, FDA labels, and prescribing guidelines.',
    type: 'website',
  },
}

export default async function DrugsPage() {
  const drugs = await getAllDrugs()
  
  // Get unique therapeutic classes for filtering
  const therapeuticClasses = Array.from(
    new Set(drugs.map(drug => drug.therapeuticClass).filter((tc): tc is string => Boolean(tc)))
  ).sort()
  
  // Get unique manufacturers for filtering
  const manufacturers = Array.from(
    new Set(drugs.map(drug => drug.manufacturer || drug.labeler).filter((m): m is string => Boolean(m)))
  ).sort()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Pill className="h-10 w-10 text-blue-600" />
          All Drugs
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Browse our complete database of {drugs.length} drugs with professional prescribing information
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drugs</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drugs.length}</div>
            <p className="text-xs text-muted-foreground">
              FDA-approved medications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Therapeutic Classes</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapeuticClasses.length}</div>
            <p className="text-xs text-muted-foreground">
              Different drug categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturers</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manufacturers.length}</div>
            <p className="text-xs text-muted-foreground">
              Pharmaceutical companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filters */}
      {therapeuticClasses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Browse by Therapeutic Class</h2>
          <div className="flex flex-wrap gap-2">
            {therapeuticClasses.slice(0, 10).map((therapeuticClass) => (
              <Link
                key={therapeuticClass}
                href={`/therapeutic-classes?class=${encodeURIComponent(therapeuticClass)}`}
                className="inline-block"
              >
                <Badge variant="outline" className="hover:bg-blue-50 hover:border-blue-300 cursor-pointer">
                  {therapeuticClass}
                </Badge>
              </Link>
            ))}
            {therapeuticClasses.length > 10 && (
              <Link href="/therapeutic-classes">
                <Badge variant="secondary" className="cursor-pointer">
                  +{therapeuticClasses.length - 10} more
                </Badge>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Drugs Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Drugs ({drugs.length})
          </h2>
          <div className="text-sm text-gray-500">
            Sorted alphabetically
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drugs.map((drug) => (
            <Link
              key={drug.slug}
              href={`/drugs/${drug.slug}`}
              className="block group h-full"
              aria-label={`View information for ${drug.drugName}${drug.genericName ? ` (${drug.genericName})` : ''}`}
            >
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <CardTitle className="group-hover:text-blue-600 transition-colors text-lg font-semibold line-clamp-2">
                    {drug.drugName}
                  </CardTitle>
                  {drug.genericName && (
                    <CardDescription className="text-gray-600 line-clamp-1">
                      {drug.genericName}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {/* Therapeutic Class */}
                    {drug.therapeuticClass && (
                      <Badge variant="secondary" className="text-xs">
                        {drug.therapeuticClass}
                      </Badge>
                    )}
                    
                    {/* Manufacturer */}
                    {(drug.manufacturer || drug.labeler) && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {drug.manufacturer || drug.labeler}
                      </div>
                    )}
                    
                    {/* Boxed Warning Indicator */}
                    {(drug.boxedWarning || drug.label?.boxedWarning) && (
                      <Badge variant="destructive" className="text-xs">
                        Boxed Warning
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Navigation */}
      <div className="border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Browse by Category
              </CardTitle>
              <CardDescription>
                Explore drugs organized by therapeutic class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href="/therapeutic-classes" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View Therapeutic Classes
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Browse by Manufacturer
              </CardTitle>
              <CardDescription>
                Find drugs by pharmaceutical company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href="/manufacturers" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View Manufacturers
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}