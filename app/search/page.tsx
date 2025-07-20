import { Metadata } from 'next'
import { getAllDrugs } from '@/lib/drugs'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SearchBar from '@/components/drug/SearchBar'
import { Search as SearchIcon, Pill } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Search Drug Information | drugfacts.wiki',
  description: 'Search comprehensive drug information including FDA labels, prescribing information, dosing guidelines, and clinical data for healthcare professionals.',
  keywords: 'drug search, medication search, FDA labels, prescribing information, drug database, pharmaceutical information',
  openGraph: {
    title: 'Search Drug Information | drugfacts.wiki',
    description: 'Search comprehensive drug information including FDA labels, prescribing information, dosing guidelines, and clinical data for healthcare professionals.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function SearchPage() {
  const drugs = await getAllDrugs()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Search Drug Information
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Find comprehensive prescribing information, FDA labels, dosing guidelines, and clinical data
        </p>
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drugs.map((drug) => (
          <Card key={drug.slug} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Pill className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <CardTitle className="text-lg">{drug.drugName}</CardTitle>
              </div>
              {drug.genericName && (
                <CardDescription className="text-sm text-gray-600">
                  Generic: {drug.genericName}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {drug.therapeuticClass && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Class:</span> {drug.therapeuticClass}
                  </p>
                )}
                {drug.labeler && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Manufacturer:</span> {drug.labeler}
                  </p>
                )}
                <Link
                  href={`/drugs/${drug.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                  <SearchIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}