import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SearchBar from '@/components/drug/SearchBar'
import { getAllDrugs } from '@/lib/drugs'
import { Pill, FileText, Search, Shield } from 'lucide-react'

export default async function HomePage() {
  const drugs = await getAllDrugs()
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Comprehensive Drug Information Database
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Access detailed FDA drug labeling information for healthcare professionals
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Pill className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Drug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete prescribing information, dosing guidelines, and clinical data
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>FDA Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Official FDA-approved drug labeling and package inserts
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Easy Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Search by drug name, generic name, or therapeutic class
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Safety Info</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Warnings, contraindications, and drug interaction information
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Drug List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Drugs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drugs.map((drug) => (
                <Link
                  key={drug.slug}
                  href={`/drugs/${drug.slug}`}
                  className="block group"
                >
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {drug.drugName}
                      </CardTitle>
                      {drug.genericName && (
                        <CardDescription>{drug.genericName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {drug.therapeuticClass && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {drug.therapeuticClass}
                          </span>
                        )}
                        {drug.manufacturer && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {drug.manufacturer}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}